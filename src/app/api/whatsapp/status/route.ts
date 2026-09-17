import { NextResponse } from "next/server";
import { goWaClient } from "@/lib/whatsapp/goWaClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await goWaClient.getStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil status WhatsApp" },
      { status: 500 }
    );
  }
}
