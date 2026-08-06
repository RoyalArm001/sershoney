import "server-only";

import { createECDH, createHash } from "crypto";
import webpush from "web-push";
import {
  getStorePrefix,
  redisCommand,
  redisTransaction,
  requireRemoteStoreOnVercel,
} from "@/lib/redis";

export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const PREFIX = getStorePrefix();
const INDEX_KEY = `${PREFIX}:admin-push:index:v1`;

function toBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function subscriptionId(endpoint: string) {
  return createHash("sha256").update(endpoint).digest("hex").slice(0, 32);
}

function subscriptionKey(endpoint: string) {
  return `${PREFIX}:admin-push:sub:${subscriptionId(endpoint)}`;
}

function getJwtSeed() {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
    return "sers-honey-local-development-secret-key-123456";
  }
  throw new Error("JWT_SECRET is not configured.");
}

export function getVapidPublicKey() {
  const fromEnv = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (fromEnv) return fromEnv;
  return getVapidKeys().publicKey;
}

function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (publicKey && privateKey) {
    return { publicKey, privateKey };
  }

  const seed = createHash("sha256")
    .update(`sers-honey-web-push-v1:${getJwtSeed()}`)
    .digest();
  const ecdh = createECDH("prime256v1");
  ecdh.setPrivateKey(seed);

  return {
    publicKey: toBase64Url(ecdh.getPublicKey()),
    privateKey: toBase64Url(ecdh.getPrivateKey()),
  };
}

function configureWebPush() {
  const { publicKey, privateKey } = getVapidKeys();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:hello@sershoney.com";
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey, privateKey };
}

function isValidSubscription(value: unknown): value is PushSubscriptionJSON {
  if (!value || typeof value !== "object") return false;
  const item = value as PushSubscriptionJSON;
  return (
    typeof item.endpoint === "string" &&
    item.endpoint.startsWith("https://") &&
    typeof item.keys?.p256dh === "string" &&
    typeof item.keys?.auth === "string"
  );
}

async function listSubscriptions() {
  const remote = requireRemoteStoreOnVercel();
  if (!remote) return [] as PushSubscriptionJSON[];

  const ids = await redisCommand<string[]>(["SMEMBERS", INDEX_KEY]);
  if (ids.length === 0) return [];

  const values = await redisCommand<Array<string | null>>([
    "MGET",
    ...ids.map((id) => `${PREFIX}:admin-push:sub:${id}`),
  ]);

  return values
    .map((value) => {
      if (!value) return null;
      try {
        const parsed: unknown = JSON.parse(value);
        return isValidSubscription(parsed) ? parsed : null;
      } catch {
        return null;
      }
    })
    .filter((item): item is PushSubscriptionJSON => item !== null);
}

export async function saveAdminPushSubscription(
  subscription: PushSubscriptionJSON,
) {
  if (!isValidSubscription(subscription)) {
    throw new Error("Invalid push subscription");
  }

  const remote = requireRemoteStoreOnVercel();
  if (!remote) return { ok: true as const, mode: "local" as const };

  const hash = subscriptionId(subscription.endpoint);
  const key = subscriptionKey(subscription.endpoint);

  await redisTransaction<[string, number]>([
    ["SET", key, JSON.stringify(subscription)],
    ["SADD", INDEX_KEY, hash],
  ]);

  return { ok: true as const, mode: "redis" as const };
}

export async function removeAdminPushSubscription(endpoint: string) {
  const remote = requireRemoteStoreOnVercel();
  if (!remote) return;

  const hash = subscriptionId(endpoint);
  await redisTransaction<[number, number]>([
    ["DEL", subscriptionKey(endpoint)],
    ["SREM", INDEX_KEY, hash],
  ]);
}

export async function notifyAdminsNewOrder(input: {
  title: string;
  body: string;
  url?: string;
}) {
  try {
    configureWebPush();
  } catch (error) {
    console.warn("Web Push is not configured:", error);
    return { sent: 0, removed: 0 };
  }

  const subscriptions = await listSubscriptions();
  if (subscriptions.length === 0) {
    return { sent: 0, removed: 0 };
  }

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.url || "/admin",
    tag: `sers-admin-order-${Date.now()}`,
    requireInteraction: true,
  });

  let sent = 0;
  let removed = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload, {
          TTL: 60 * 60,
          urgency: "high",
        });
        sent += 1;
      } catch (error) {
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          await removeAdminPushSubscription(subscription.endpoint);
          removed += 1;
          return;
        }

        console.warn("Failed to send admin push:", error);
      }
    }),
  );

  return { sent, removed };
}
