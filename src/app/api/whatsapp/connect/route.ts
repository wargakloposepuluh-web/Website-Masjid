import { NextResponse } from "next/server";
import { goWaClient } from "@/lib/whatsapp/goWaClient";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await goWaClient.getLoginQr();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memulai sesi WhatsApp" },
      { status: 500 }
    );
  }
}
