import "server-only";

import fs from "fs";
import path from "path";
import { locales, type LocaleCopy } from "@/content/locales";
import type { Lang } from "@/lib/i18n";
import { SUPPORTED_LANGS } from "@/lib/i18n";
import {
  getStorePrefix,
  redisCommand,
  requireRemoteStoreOnVercel,
} from "@/lib/redis";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");
const CONTENT_KEY = `${getStorePrefix()}:content:v1`;

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T> | undefined): T {
  if (!override || typeof override !== "object") return base;
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = base[key as keyof T];
    const overVal = override[key as keyof T];
    if (
      baseVal &&
      overVal &&
      typeof baseVal === "object" &&
      typeof overVal === "object" &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overVal as Record<string, unknown>
      );
    } else if (overVal !== undefined) {
      result[key] = overVal;
    }
  }
  return result as T;
}

function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(locales, null, 2), "utf8");
  }
}

function mergeDbData(data: unknown): Record<Lang, LocaleCopy> {
  const parsed =
    data && typeof data === "object"
      ? (data as Partial<Record<Lang, Partial<LocaleCopy>>>)
      : {};
  const merged = {} as Record<Lang, LocaleCopy>;

  for (const lang of SUPPORTED_LANGS) {
    merged[lang] = deepMerge(
      locales[lang] as unknown as Record<string, unknown>,
      parsed[lang] as unknown as Record<string, unknown>
    ) as unknown as LocaleCopy;
  }

  return merged;
}

function readLocalDb(): Record<Lang, LocaleCopy> {
  if (!fs.existsSync(DB_FILE)) return locales;

  try {
    return mergeDbData(JSON.parse(fs.readFileSync(DB_FILE, "utf8")));
  } catch (error) {
    console.error("Error reading local content, returning static locales:", error);
    return locales;
  }
}

function writeLocalDb(data: Record<Lang, LocaleCopy>) {
  initDb();
  const tempFile = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tempFile, DB_FILE);
}

export async function getDbData(): Promise<Record<Lang, LocaleCopy>> {
  const fallback = readLocalDb();
  let remoteConfig;

  try {
    remoteConfig = requireRemoteStoreOnVercel();
  } catch (error) {
    console.error(
      "Persistent content storage is not configured, returning bundled content:",
      error
    );
    return fallback;
  }

  if (!remoteConfig) return fallback;

  try {
    const raw = await redisCommand<string | null>(["GET", CONTENT_KEY]);
    if (raw) return mergeDbData(JSON.parse(raw));

    await redisCommand<string | null>([
      "SET",
      CONTENT_KEY,
      JSON.stringify(fallback),
      "NX",
    ]);
    return fallback;
  } catch (error) {
    console.error("Error reading remote content, returning bundled content:", error);
    return fallback;
  }
}

export async function saveDbData(data: unknown) {
  const normalized = mergeDbData(data);
  const remoteConfig = requireRemoteStoreOnVercel();

  if (remoteConfig) {
    await redisCommand<string>(["SET", CONTENT_KEY, JSON.stringify(normalized)]);
    return normalized;
  }

  writeLocalDb(normalized);
  return normalized;
}
