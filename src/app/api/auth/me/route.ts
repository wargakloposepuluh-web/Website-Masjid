import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function createNoCacheResponse(data: any, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return createNoCacheResponse({ authenticated: false, user: null });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return createNoCacheResponse({ authenticated: false, user: null });
    }

    return createNoCacheResponse({
      authenticated: true,
      user: {
        id: payload.userId,
        username: payload.username,
        nama: payload.nama,
        role: payload.role,
      },
    });
  } catch (error) {
    return createNoCacheResponse({ authenticated: false, user: null });
  }
}
