import "server-only";

type RedisArgument = string | number;
export type RedisCommand = [string, ...RedisArgument[]];

type RedisConfig = {
  url: string;
  token: string;
};

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

const REQUEST_TIMEOUT_MS = 8_000;

export class StorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageConfigurationError";
  }
}

export class PersistentStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersistentStorageError";
  }
}

export function isStorageError(error: unknown) {
  return (
    error instanceof StorageConfigurationError ||
    error instanceof PersistentStorageError
  );
}

function readRedisConfig(): RedisConfig | null {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ""
  ).trim();

  if (!url && !token) return null;

  if (!url || !token) {
    throw new StorageConfigurationError(
      "The Redis REST URL and token must be configured together."
    );
  }

  return { url, token };
}

export function isVercelRuntime() {
  return process.env.VERCEL === "1";
}

export function getStorePrefix() {
  const explicitPrefix = process.env.SERS_STORE_PREFIX?.trim();
  if (explicitPrefix) return explicitPrefix;

  const environment =
    process.env.VERCEL_ENV ||
    (process.env.NODE_ENV === "production" ? "production" : "development");
  return `sers-honey:${environment}`;
}

export function hasRemoteStore() {
  try {
    return readRedisConfig() !== null;
  } catch {
    return false;
  }
}

export function requireRemoteStoreOnVercel() {
  const config = readRedisConfig();
  if (config) return config;

  if (isVercelRuntime()) {
    throw new StorageConfigurationError(
      "Persistent Redis storage is required on Vercel."
    );
  }

  return null;
}

async function requestRedis<T>(
  endpoint: string,
  body: RedisCommand | RedisCommand[]
): Promise<T> {
  const config = readRedisConfig();
  if (!config) {
    throw new StorageConfigurationError("Persistent Redis storage is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.url}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as
      | RedisResponse<T>
      | Array<RedisResponse<unknown>>
      | null;

    if (!response.ok || !payload) {
      throw new Error(`Redis request failed with status ${response.status}.`);
    }

    if (Array.isArray(payload)) {
      const failedCommand = payload.find((item) => item.error);
      if (failedCommand?.error) {
        throw new Error(`Redis command failed: ${failedCommand.error}`);
      }
      return payload.map((item) => item.result) as T;
    }

    if (payload.error) {
      throw new Error(`Redis command failed: ${payload.error}`);
    }

    return payload.result as T;
  } catch (error) {
    if (error instanceof PersistentStorageError) throw error;

    const reason =
      error instanceof Error && error.name === "AbortError"
        ? "Persistent storage request timed out."
        : "Persistent storage request failed.";
    throw new PersistentStorageError(reason);
  } finally {
    clearTimeout(timeout);
  }
}

export function redisCommand<T>(command: RedisCommand) {
  return requestRedis<T>("", command);
}

export function redisPipeline<T extends unknown[]>(commands: RedisCommand[]) {
  return requestRedis<T>("/pipeline", commands);
}

export function redisTransaction<T extends unknown[]>(commands: RedisCommand[]) {
  return requestRedis<T>("/multi-exec", commands);
}

export async function getStorageHealth() {
  try {
    const config = requireRemoteStoreOnVercel();

    if (!config) {
      return {
        ok: true,
        mode: "local" as const,
        namespace: getStorePrefix(),
      };
    }

    const pong = await redisCommand<string>(["PING"]);
    return {
      ok: pong === "PONG",
      mode: "redis" as const,
      namespace: getStorePrefix(),
    };
  } catch (error) {
    console.error("Persistent storage health check failed:", error);
    return {
      ok: false,
      mode: hasRemoteStore() ? ("redis" as const) : ("unconfigured" as const),
      namespace: getStorePrefix(),
    };
  }
}
