import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const totalSuratKeluar = await prisma.suratKeluar.count();
    const totalSuratMasuk = await prisma.suratMasuk.count();

    // Hitung surat masuk yang masih berstatus Diterima atau Diproses (perlu tindak lanjut/disposisi)
    const pendingDisposisi = await prisma.suratMasuk.count({
      where: {
        status: { in: ["Diterima", "Diproses"] },
      },
    });

    // 5 Surat Keluar Terbaru
    const recentSuratKeluar = await prisma.suratKeluar.findMany({
      orderBy: { id: "desc" },
      take: 5,
      select: {
        id: true,
        nomorSurat: true,
        perihal: true,
        tujuan: true,
        tanggalSurat: true,
        status: true,
      },
    });

    // 5 Surat Masuk Terbaru
    const recentSuratMasuk = await prisma.suratMasuk.findMany({
      orderBy: { id: "desc" },
      take: 5,
      select: {
        id: true,
        nomorAgenda: true,
        nomorSurat: true,
        pengirim: true,
        perihal: true,
        tanggalTerima: true,
        status: true,
        fileUrl: true,
      },
    });

    return NextResponse.json({
      totalSuratKeluar,
      totalSuratMasuk,
      pendingDisposisi,
      recentSuratKeluar,
      recentSuratMasuk,
    });
  } catch (error) {
    console.error("Gagal mengambil statistik dashboard:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}
