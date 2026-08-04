import { NextResponse } from "next/server";
import { getStorageHealth } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

export async function GET() {
  const storage = await getStorageHealth();
  const ok = storage.ok;

  return NextResponse.json(
    {
      status: ok ? "ok" : "unavailable",
      storage: {
        connected: ok,
        mode: storage.mode,
      },
      environment:
        process.env.VERCEL_ENV ||
        (process.env.NODE_ENV === "production" ? "production" : "development"),
      checkedAt: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        ...(ok ? {} : { "Retry-After": "10" }),
      },
    }
  );
}
