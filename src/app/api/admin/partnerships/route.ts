import { NextResponse } from "next/server";
import {
  getPartnerships,
  updatePartnershipStatus,
} from "@/lib/partnerships";
import { isStorageError } from "@/lib/redis";
import {
  PARTNERSHIP_STATUSES,
  type PartnershipStatus,
} from "@/types/partnership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(error: unknown) {
  return NextResponse.json(
    {
      error: isStorageError(error)
        ? "Partnership storage is temporarily unavailable"
        : "Failed to process partnership requests",
    },
    { status: isStorageError(error) ? 503 : 500 },
  );
}

export async function GET() {
  try {
    return NextResponse.json(
      { partnerships: await getPartnerships(), checkedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown; status?: unknown };
    if (
      typeof body.id !== "string" ||
      typeof body.status !== "string" ||
      !PARTNERSHIP_STATUSES.includes(body.status as PartnershipStatus)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const partnership = await updatePartnershipStatus(
      body.id,
      body.status as PartnershipStatus,
    );
    if (!partnership) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    return NextResponse.json({ partnership });
  } catch (error) {
    return failure(error);
  }
}
