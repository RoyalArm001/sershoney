import { NextResponse } from "next/server";
import {
  getVapidPublicKey,
  removeAdminPushSubscription,
  saveAdminPushSubscription,
  type PushSubscriptionJSON,
} from "@/lib/admin-push";
import { isStorageError } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

export async function GET() {
  try {
    return NextResponse.json(
      { publicKey: getVapidPublicKey() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to read VAPID public key:", error);
    return NextResponse.json(
      { error: "Push notifications are not configured" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { subscription?: unknown };
    const subscription = body.subscription as PushSubscriptionJSON | undefined;

    if (
      !subscription ||
      typeof subscription.endpoint !== "string" ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Invalid push subscription" },
        { status: 400 },
      );
    }

    await saveAdminPushSubscription(subscription);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    const storageUnavailable = isStorageError(error);
    return NextResponse.json(
      {
        error: storageUnavailable
          ? "Push storage is temporarily unavailable"
          : "Failed to save push subscription",
      },
      { status: storageUnavailable ? 503 : 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { endpoint?: unknown };
    if (typeof body.endpoint !== "string" || body.endpoint.length === 0) {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    await removeAdminPushSubscription(body.endpoint);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return NextResponse.json(
      { error: "Failed to remove push subscription" },
      { status: 500 },
    );
  }
}
