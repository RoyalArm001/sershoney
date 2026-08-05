import { NextResponse } from "next/server";

export async function GET() {
  // If the request passes the middleware, it is authenticated.
  return NextResponse.json({ authenticated: true });
}
