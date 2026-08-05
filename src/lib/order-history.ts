import type {
  CustomerOrderSummary,
  OrderStatus,
  OrderStatusSnapshot,
} from "@/types/order";

export const ORDER_HISTORY_EVENT = "sers-honey:orders-updated";

const ORDER_HISTORY_KEY = "sers-honey.orders.v1";
const MAX_STORED_ORDERS = 24;
const VALID_STATUSES = new Set<OrderStatus>(["new", "seen", "completed"]);

function isCustomerOrderSummary(value: unknown): value is CustomerOrderSummary {
  if (!value || typeof value !== "object") return false;

  const order = value as Partial<CustomerOrderSummary>;
  return (
    typeof order.id === "string" &&
    order.id.length > 0 &&
    (order.lang === "hy" || order.lang === "en" || order.lang === "ru") &&
    typeof order.region === "string" &&
    typeof order.city === "string" &&
    typeof order.weightG === "number" &&
    Number.isFinite(order.weightG) &&
    typeof order.quantity === "number" &&
    Number.isInteger(order.quantity) &&
    (order.fulfillment === "delivery" || order.fulfillment === "pickup") &&
    typeof order.totalAmd === "number" &&
    Number.isFinite(order.totalAmd) &&
    typeof order.status === "string" &&
    VALID_STATUSES.has(order.status as OrderStatus) &&
    typeof order.createdAt === "string" &&
    typeof order.updatedAt === "string"
  );
}

function normalizeOrders(orders: CustomerOrderSummary[]) {
  const unique = new Map<string, CustomerOrderSummary>();

  for (const order of orders) {
    if (isCustomerOrderSummary(order) && !unique.has(order.id)) {
      unique.set(order.id, {
        ...order,
        comboId: typeof order.comboId === "string" ? order.comboId : null,
      });
    }
  }

  return [...unique.values()]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, MAX_STORED_ORDERS);
}

function notifyHistoryChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ORDER_HISTORY_EVENT));
  }
}

export function readOrderHistory(): CustomerOrderSummary[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ORDER_HISTORY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? normalizeOrders(parsed.filter(isCustomerOrderSummary))
      : [];
  } catch (error) {
    console.warn("Could not read the local order history:", error);
    return [];
  }
}

export function writeOrderHistory(
  orders: CustomerOrderSummary[],
  options: { notify?: boolean } = {}
) {
  if (typeof window === "undefined") return [];

  const normalized = normalizeOrders(orders);

  try {
    window.localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(normalized));
    if (options.notify !== false) notifyHistoryChanged();
  } catch (error) {
    console.warn("Could not save the local order history:", error);
  }

  return normalized;
}

export function rememberOrder(order: CustomerOrderSummary) {
  return writeOrderHistory([order, ...readOrderHistory()]);
}

export function mergeOrderStatuses(statuses: OrderStatusSnapshot[]) {
  const statusById = new Map(statuses.map((item) => [item.id, item]));
  let changed = false;

  const merged = readOrderHistory().map((order) => {
    const snapshot = statusById.get(order.id);
    if (
      !snapshot ||
      (snapshot.status === order.status &&
        snapshot.updatedAt === order.updatedAt)
    ) {
      return order;
    }

    changed = true;
    return {
      ...order,
      status: snapshot.status,
      updatedAt: snapshot.updatedAt,
    };
  });

  return changed
    ? writeOrderHistory(merged, { notify: false })
    : merged;
}
