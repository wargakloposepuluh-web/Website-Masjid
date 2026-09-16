import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp/waClient";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await waClient.disconnect();
    return NextResponse.json({ success: true, message: "Koneksi WhatsApp berhasil diputuskan" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memutuskan koneksi WhatsApp" },
      { status: 500 }
    );
  }
}
