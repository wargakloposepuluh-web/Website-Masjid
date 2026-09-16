import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFormattedNomorSurat, extractNomorUrut } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kode = searchParams.get("kode") || "UND";
    const tanggalParam = searchParams.get("tanggal");
    const date = tanggalParam ? new Date(tanggalParam) : new Date();
    const validDate = isNaN(date.getTime()) ? new Date() : date;

    const setting = await prisma.setting.findUnique({
      where: { id: 1 },
    });

    const format = setting?.formatNomorSurat || "{nomor}/PM-BM/{kode}/{bulan}/{tahun}";
    const currentYear = validDate.getFullYear();

    // 1. Ambil seluruh data surat keluar tahun ini dari Arsip Surat Keluar
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const suratTahunIni = await prisma.suratKeluar.findMany({
      where: {
        OR: [
          {
            tanggalSurat: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
          {
            nomorSurat: {
              contains: String(currentYear),
            },
          },
        ],
      },
      select: {
        id: true,
        nomorSurat: true,
        tanggalSurat: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    // 2. Cari nomor urut terbesar dari arsip surat keluar tahun ini
    let maxNumber = 0;
    for (const surat of suratTahunIni) {
      const extracted = extractNomorUrut(surat.nomorSurat, format);
      if (extracted !== null && extracted > maxNumber) {
        maxNumber = extracted;
      }
    }

    // 3. Fallback: Jika arsip tahun ini kosong, periksa seluruh arsip surat keluar
    if (maxNumber === 0 && suratTahunIni.length === 0) {
      const allSurat = await prisma.suratKeluar.findMany({
        select: { id: true, nomorSurat: true },
        orderBy: { id: "desc" },
      });
      for (const surat of allSurat) {
        const extracted = extractNomorUrut(surat.nomorSurat, format);
        if (extracted !== null && extracted > maxNumber) {
          maxNumber = extracted;
        }
      }
    }

    // Nomor urut berikutnya adalah lanjutan dari nomor arsip terakhir (+ 1)
    const nextCount = maxNumber + 1;

    // Sinkronkan tabel counter dengan data arsip terkini
    await prisma.counter.upsert({
      where: {
        tipe_tahun: {
          tipe: "SURAT_KELUAR",
          tahun: currentYear,
        },
      },
      update: {
        lastNumber: maxNumber,
      },
      create: {
        tipe: "SURAT_KELUAR",
        tahun: currentYear,
        lastNumber: maxNumber,
      },
    });

    const formattedNumber = generateFormattedNomorSurat(format, nextCount, validDate, kode);

    return NextResponse.json({
      nextNumber: nextCount,
      formattedNomorSurat: formattedNumber,
      format,
    });
  } catch (error) {
    console.error("Gagal generate next nomor surat:", error);
    return NextResponse.json(
      { error: "Gagal menghitung nomor surat berikutnya" },
      { status: 500 }
    );
  }
}
