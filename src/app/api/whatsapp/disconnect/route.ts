import { NextResponse } from "next/server";
import { goWaClient } from "@/lib/whatsapp/goWaClient";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await goWaClient.disconnect();
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Gagal memutuskan koneksi WhatsApp" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: result.message || "Koneksi WhatsApp berhasil diputuskan" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memutuskan koneksi WhatsApp" },
      { status: 500 }
    );
  }
}
