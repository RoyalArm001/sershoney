import { NextResponse } from "next/server";
import {
  WEIGHT_OPTIONS_G,
  calcOrderTotal,
  getRegionById,
} from "@/content/regions";
import { getComboById } from "@/content/pickup";
import { isLang } from "@/lib/i18n";
import { createOrder, getOrderStatuses } from "@/lib/orders";
import { isStorageError } from "@/lib/redis";
import type {
  CreateOrderInput,
  CustomerOrderSummary,
  OrderRecord,
} from "@/types/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

const MAX_BODY_BYTES = 12_000;
const MAX_STATUS_IDS = 24;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function toCustomerOrderSummary(order: OrderRecord): CustomerOrderSummary {
  return {
    id: order.id,
    lang: order.lang,
    region: order.region,
    city: order.city,
    weightG: order.weightG,
    quantity: order.quantity,
    fulfillment: order.fulfillment,
    comboId: order.comboId ?? null,
    totalAmd: order.totalAmd,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const requestedIds = new URL(request.url).searchParams
      .getAll("id")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);
    const ids = [...new Set(requestedIds)];

    if (
      ids.length > MAX_STATUS_IDS ||
      ids.some((id) => !UUID_PATTERN.test(id))
    ) {
      return NextResponse.json(
        { error: "Invalid order references" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        orders: ids.length > 0 ? await getOrderStatuses(ids) : [],
        checkedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to read order statuses:", error);
    const storageUnavailable = isStorageError(error);
    return NextResponse.json(
      {
        error: storageUnavailable
          ? "Order service is temporarily unavailable"
          : "Failed to read order statuses",
      },
      {
        status: storageUnavailable ? 503 : 500,
        headers: storageUnavailable ? { "Retry-After": "10" } : undefined,
      }
    );
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  }

  try {
    const body = (await request.json()) as Partial<CreateOrderInput>;
    const lang = typeof body.lang === "string" && isLang(body.lang) ? body.lang : null;
    const name = cleanText(body.name, 80);
    const surname = cleanText(body.surname, 80);
    const phone = cleanText(body.phone, 32);
    const fulfillment =
      body.fulfillment === "pickup" || body.fulfillment === "delivery"
        ? body.fulfillment
        : null;
    const comboId =
      typeof body.comboId === "string" && body.comboId.length > 0 ? body.comboId : null;
    const regionId = cleanText(body.regionId, 40);
    const city = cleanText(body.city, 100);
    const address = cleanText(body.address, 240);
    const weightG = Number(body.weightG);
    const quantity = Number(body.quantity);
    const region = getRegionById(regionId);
    const combo = getComboById(comboId);

    const validWeight = WEIGHT_OPTIONS_G.some((weight) => weight === weightG);
    const validQuantity = Number.isInteger(quantity) && quantity >= 1 && quantity <= 99;
    const validPhone = /^[+()\d\s-]{6,32}$/.test(phone);
    const validCombo =
      !comboId ||
      (Boolean(combo) && combo!.weightG === weightG && combo!.quantity === quantity);

    const validDeliveryLocation =
      fulfillment === "delivery" &&
      Boolean(lang && region) &&
      region!.cities.some((item) => item[lang!] === city) &&
      address.length >= 3;

    const validPickupLocation =
      fulfillment === "pickup" &&
      Boolean(region) &&
      address.length >= 3;

    if (
      !lang ||
      !fulfillment ||
      name.length < 2 ||
      surname.length < 2 ||
      !validPhone ||
      !region ||
      !validWeight ||
      !validQuantity ||
      !validCombo ||
      !(validDeliveryLocation || validPickupLocation)
    ) {
      return NextResponse.json(
        { error: "Please check the submitted order details" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      lang,
      name,
      surname,
      phone,
      regionId,
      region: region.name[lang],
      city,
      address,
      weightG,
      quantity,
      fulfillment,
      comboId,
      totalAmd: calcOrderTotal(weightG, quantity, fulfillment === "delivery"),
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        order: toCustomerOrderSummary(order),
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    const storageUnavailable = isStorageError(error);
    return NextResponse.json(
      {
        error: storageUnavailable
          ? "Order service is temporarily unavailable"
          : "Failed to submit order",
      },
      {
        status: storageUnavailable ? 503 : 500,
        headers: storageUnavailable ? { "Retry-After": "10" } : undefined,
      }
    );
  }
}
