import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

const DEVELOPMENT_ADMIN_PASSWORD = "sershoneyadmin";

class AdminConfigurationError extends Error {
  constructor() {
    super("ADMIN_PASSWORD is not configured.");
    this.name = "AdminConfigurationError";
  }
}

function getAdminPassword() {
  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();
  if (configuredPassword) return configuredPassword;

  if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
    return DEVELOPMENT_ADMIN_PASSWORD;
  }

  throw new AdminConfigurationError();
}

function passwordsMatch(value: unknown, expected: string) {
  if (typeof value !== "string") return false;

  const submitted = Buffer.from(value);
  const configured = Buffer.from(expected);
  return (
    submitted.length === configured.length &&
    timingSafeEqual(submitted, configured)
  );
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = getAdminPassword();

    if (passwordsMatch(password, adminPassword)) {
      // Create session payload with 24 hour expiry
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      const token = await signToken({ admin: true, exp: expiry });

      const response = NextResponse.json({ success: true });
      response.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours in seconds
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    console.error("Login API error:", error);
    if (error instanceof AdminConfigurationError) {
      return NextResponse.json(
        { error: "Admin login is not configured" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
