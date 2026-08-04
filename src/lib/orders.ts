import "server-only";

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  CreateOrderInput,
  OrderRecord,
  OrderStatus,
  OrderStatusSnapshot,
} from "@/types/order";
import {
  getStorePrefix,
  redisCommand,
  redisTransaction,
  requireRemoteStoreOnVercel,
} from "@/lib/redis";

const ORDERS_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(ORDERS_DIR, "orders.json");
const STORE_PREFIX = getStorePrefix();
const ORDERS_INDEX_KEY = `${STORE_PREFIX}:orders:index:v1`;

function getOrderKey(id: string) {
  return `${STORE_PREFIX}:orders:item:${id}`;
}

function initOrdersDb() {
  if (!fs.existsSync(ORDERS_DIR)) {
    fs.mkdirSync(ORDERS_DIR, { recursive: true });
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]\n", "utf8");
  }
}

function readOrders(): OrderRecord[] {
  initOrdersDb();

  const raw = fs.readFileSync(ORDERS_FILE, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Orders database must contain a JSON array");
  }

  return parsed as OrderRecord[];
}

function writeOrders(orders: OrderRecord[]) {
  initOrdersDb();
  const tempFile = `${ORDERS_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
  fs.renameSync(tempFile, ORDERS_FILE);
}

function parseOrder(value: string | null) {
  if (!value) return null;
  const parsed = JSON.parse(value) as OrderRecord;
  return parsed && typeof parsed.id === "string" ? parsed : null;
}

export async function getOrders() {
  const remoteConfig = requireRemoteStoreOnVercel();
  if (!remoteConfig) {
    return readOrders().sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
  }

  const ids = await redisCommand<string[]>([
    "ZREVRANGE",
    ORDERS_INDEX_KEY,
    0,
    -1,
  ]);
  if (ids.length === 0) return [];

  const values = await redisCommand<Array<string | null>>([
    "MGET",
    ...ids.map(getOrderKey),
  ]);

  return values
    .map(parseOrder)
    .filter((order): order is OrderRecord => order !== null);
}

export async function getOrderStatuses(
  ids: string[]
): Promise<OrderStatusSnapshot[]> {
  const requestedIds = new Set(ids);
  const remoteConfig = requireRemoteStoreOnVercel();

  if (remoteConfig) {
    if (ids.length === 0) return [];
    const values = await redisCommand<Array<string | null>>([
      "MGET",
      ...ids.map(getOrderKey),
    ]);

    return values
      .map(parseOrder)
      .filter((order): order is OrderRecord => order !== null)
      .map(({ id, status, updatedAt }) => ({ id, status, updatedAt }));
  }

  return readOrders()
    .filter((order) => requestedIds.has(order.id))
    .map(({ id, status, updatedAt }) => ({ id, status, updatedAt }));
}

export async function createOrder(
  input: CreateOrderInput & { region: string; totalAmd: number }
) {
  const now = new Date().toISOString();
  const order: OrderRecord = {
    ...input,
    id: randomUUID(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  const remoteConfig = requireRemoteStoreOnVercel();
  if (remoteConfig) {
    await redisTransaction<[string, number]>([
      ["SET", getOrderKey(order.id), JSON.stringify(order)],
      ["ZADD", ORDERS_INDEX_KEY, Date.parse(order.createdAt), order.id],
    ]);
    return order;
  }

  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);

  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const remoteConfig = requireRemoteStoreOnVercel();

  if (remoteConfig) {
    const raw = await redisCommand<string | null>(["GET", getOrderKey(id)]);
    const order = parseOrder(raw);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    await redisCommand<string>([
      "SET",
      getOrderKey(order.id),
      JSON.stringify(order),
    ]);
    return order;
  }

  const orders = readOrders();
  const order = orders.find((item) => item.id === id);

  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();
  writeOrders(orders);

  return order;
}

export async function deleteOrder(id: string) {
  const remoteConfig = requireRemoteStoreOnVercel();

  if (remoteConfig) {
    const raw = await redisCommand<string | null>(["GET", getOrderKey(id)]);
    const order = parseOrder(raw);
    if (!order) return null;

    await redisTransaction<[number, number]>([
      ["DEL", getOrderKey(id)],
      ["ZREM", ORDERS_INDEX_KEY, id],
    ]);
    return order;
  }

  const orders = readOrders();
  const orderIndex = orders.findIndex((item) => item.id === id);

  if (orderIndex === -1) return null;

  const [deletedOrder] = orders.splice(orderIndex, 1);
  writeOrders(orders);

  return deletedOrder;
}
