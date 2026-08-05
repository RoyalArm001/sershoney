import { NextResponse } from "next/server";
import {
  deleteOrder,
  getOrders,
  updateOrderStatus,
} from "@/lib/orders";
import { isStorageError } from "@/lib/redis";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

function orderErrorResponse(error: unknown, fallbackMessage: string) {
  const storageUnavailable = isStorageError(error);
  return NextResponse.json(
    {
      error: storageUnavailable
        ? "Order storage is temporarily unavailable"
        : fallbackMessage,
    },
    {
      status: storageUnavailable ? 503 : 500,
      headers: storageUnavailable ? { "Retry-After": "10" } : undefined,
    }
  );
}

export async function GET() {
  try {
    return NextResponse.json(
      {
        orders: await getOrders(),
        checkedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to read orders:", error);
    return orderErrorResponse(error, "Failed to read orders");
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown };

    if (typeof body.id !== "string" || body.id.length === 0) {
      return NextResponse.json(
        { error: "Invalid order reference" },
        { status: 400 }
      );
    }

    const order = await deleteOrder(body.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: order.id });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return orderErrorResponse(error, "Failed to delete order");
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: unknown;
      status?: unknown;
    };

    if (
      typeof body.id !== "string" ||
      typeof body.status !== "string" ||
      !ORDER_STATUSES.includes(body.status as OrderStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid order update" },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(body.id, body.status as OrderStatus);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to update order:", error);
    return orderErrorResponse(error, "Failed to update order");
  }
}
