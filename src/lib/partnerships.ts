import "server-only";

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  PartnershipRequest,
  PartnershipStatus,
} from "@/types/partnership";
import {
  getStorePrefix,
  redisCommand,
  redisTransaction,
  requireRemoteStoreOnVercel,
} from "@/lib/redis";

const FILE = path.join(process.cwd(), "data", "partnerships.json");
const PREFIX = getStorePrefix();
const INDEX_KEY = `${PREFIX}:partnerships:index:v1`;

function itemKey(id: string) {
  return `${PREFIX}:partnerships:item:${id}`;
}

function readLocal() {
  try {
    if (!fs.existsSync(FILE)) return [] as PartnershipRequest[];
    const parsed: unknown = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(parsed) ? (parsed as PartnershipRequest[]) : [];
  } catch {
    return [] as PartnershipRequest[];
  }
}

function writeLocal(items: PartnershipRequest[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

function parse(value: string | null) {
  if (!value) return null;
  try {
    const item = JSON.parse(value) as PartnershipRequest;
    return typeof item.id === "string" ? item : null;
  } catch {
    return null;
  }
}

export async function getPartnerships() {
  const remote = requireRemoteStoreOnVercel();
  if (!remote) {
    return readLocal().sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  }

  const ids = await redisCommand<string[]>(["ZREVRANGE", INDEX_KEY, 0, -1]);
  if (ids.length === 0) return [];
  const values = await redisCommand<Array<string | null>>([
    "MGET",
    ...ids.map(itemKey),
  ]);
  return values
    .map(parse)
    .filter((item): item is PartnershipRequest => item !== null);
}

export async function createPartnership(
  input: Omit<PartnershipRequest, "id" | "status" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const request: PartnershipRequest = {
    ...input,
    id: randomUUID(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  const remote = requireRemoteStoreOnVercel();
  if (remote) {
    await redisTransaction<[string, number]>([
      ["SET", itemKey(request.id), JSON.stringify(request)],
      ["ZADD", INDEX_KEY, Date.parse(now), request.id],
    ]);
    return request;
  }

  const items = readLocal();
  items.unshift(request);
  writeLocal(items);
  return request;
}

export async function updatePartnershipStatus(
  id: string,
  status: PartnershipStatus,
) {
  const remote = requireRemoteStoreOnVercel();
  if (remote) {
    const request = parse(await redisCommand<string | null>(["GET", itemKey(id)]));
    if (!request) return null;
    request.status = status;
    request.updatedAt = new Date().toISOString();
    await redisCommand(["SET", itemKey(id), JSON.stringify(request)]);
    return request;
  }

  const items = readLocal();
  const request = items.find((item) => item.id === id);
  if (!request) return null;
  request.status = status;
  request.updatedAt = new Date().toISOString();
  writeLocal(items);
  return request;
}
