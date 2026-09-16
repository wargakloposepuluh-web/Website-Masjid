import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp/waClient";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await waClient.connect();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memulai sesi WhatsApp" },
      { status: 500 }
    );
  }
}
