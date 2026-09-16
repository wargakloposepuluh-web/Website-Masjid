import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp/waClient";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientPhone, caption, pdfBase64, fileName } = body;

    if (!recipientPhone) {
      return NextResponse.json(
        { error: "Nomor WhatsApp penerima wajib diisi" },
        { status: 400 }
      );
    }

    if (!pdfBase64) {
      return NextResponse.json(
        { error: "File dokumen PDF wajib disertakan" },
        { status: 400 }
      );
    }

    // Bersihkan data URI prefix jika ada (contoh: data:application/pdf;filename=generated.pdf;base64,...)
    const base64Part = pdfBase64.includes(",")
      ? pdfBase64.split(",")[1]
      : pdfBase64;
    const pdfBuffer = Buffer.from(base64Part, "base64");

    // Verifikasi validitas buffer PDF
    if (pdfBuffer.length === 0) {
      return NextResponse.json(
        { error: "Isi file PDF kosong atau korup" },
        { status: 400 }
      );
    }

    const result = await waClient.sendPdfDocument({
      recipientPhone,
      caption: caption || "",
      pdfBuffer,
      fileName: fileName || "Surat_Resmi_Masjid_Baitul_Maghfirah.pdf",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Gagal mengirim pesan WhatsApp" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      recipientPhone,
    });
  } catch (error: any) {
    console.error("Error pada api/whatsapp/send:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server saat mengirim WhatsApp" },
      { status: 500 }
    );
  }
}
