import type { Lang } from "@/lib/i18n";

export const ORDER_STATUSES = ["new", "seen", "completed"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type CreateOrderInput = {
  lang: Lang;
  name: string;
  surname: string;
  phone: string;
  regionId: string;
  city: string;
  address: string;
  weightG: number;
  quantity: number;
  fulfillment: "delivery" | "pickup";
  comboId?: string | null;
};

export type OrderRecord = CreateOrderInput & {
  id: string;
  region: string;
  totalAmd: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrderSummary = {
  id: string;
  lang: Lang;
  region: string;
  city: string;
  weightG: number;
  quantity: number;
  fulfillment: CreateOrderInput["fulfillment"];
  comboId: string | null;
  totalAmd: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatusSnapshot = Pick<
  OrderRecord,
  "id" | "status" | "updatedAt"
>;
