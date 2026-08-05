import { NextResponse } from "next/server";
import { isLang } from "@/lib/i18n";
import { createPartnership } from "@/lib/partnerships";
import { isStorageError } from "@/lib/redis";
import type { PartnershipRequest } from "@/types/partnership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, max)
    : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PartnershipRequest>;
    const lang = typeof body.lang === "string" && isLang(body.lang) ? body.lang : null;
    const name = clean(body.name, 100);
    const businessName = clean(body.businessName, 120);
    const phone = clean(body.phone, 32);
    const email = clean(body.email, 120).toLowerCase();
    const message = clean(body.message, 1_000);
    const partnershipType =
      body.partnershipType === "retail" ||
      body.partnershipType === "wholesale" ||
      body.partnershipType === "restaurant" ||
      body.partnershipType === "gift" ||
      body.partnershipType === "other"
        ? body.partnershipType
        : null;

    if (
      !lang ||
      !partnershipType ||
      name.length < 2 ||
      businessName.length < 2 ||
      !/^[+()\d\s-]{6,32}$/.test(phone) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      message.length < 10
    ) {
      return NextResponse.json(
        { error: "Please check the submitted details" },
        { status: 400 },
      );
    }

    const partnership = await createPartnership({
      lang,
      name,
      businessName,
      phone,
      email,
      partnershipType,
      message,
    });
    return NextResponse.json({ success: true, partnership }, { status: 201 });
  } catch (error) {
    console.error("Failed to create partnership request:", error);
    return NextResponse.json(
      {
        error: isStorageError(error)
          ? "Service is temporarily unavailable"
          : "Failed to send request",
      },
      { status: isStorageError(error) ? 503 : 500 },
    );
  }
}
