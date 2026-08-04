import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDbData, saveDbData } from "@/lib/db";
import { SUPPORTED_LANGS } from "@/lib/i18n";
import { isStorageError } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

function contentErrorResponse(error: unknown, fallbackMessage: string) {
  const storageUnavailable = isStorageError(error);
  return NextResponse.json(
    {
      error: storageUnavailable
        ? "Content storage is temporarily unavailable"
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
    const data = await getDbData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read database:", error);
    return contentErrorResponse(error, "Failed to read database");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await saveDbData(body);
    for (const lang of SUPPORTED_LANGS) {
      revalidatePath(`/${lang}`);
      revalidatePath(`/${lang}/order`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save database:", error);
    return contentErrorResponse(error, "Failed to save database");
  }
}
