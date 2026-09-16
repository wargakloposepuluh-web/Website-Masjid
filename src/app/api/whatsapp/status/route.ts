import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp/waClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = waClient.getStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil status WhatsApp" },
      { status: 500 }
    );
  }
}
