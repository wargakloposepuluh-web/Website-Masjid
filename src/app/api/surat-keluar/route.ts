import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractNomorUrut } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const limit = Number(searchParams.get("limit")) || 50;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { nomorSurat: { contains: search } },
        { perihal: { contains: search } },
        { tujuan: { contains: search } },
      ];
    }

    if (status && status !== "Semua") {
      whereClause.status = status;
    }

    const suratKeluarList = await prisma.suratKeluar.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
      take: limit,
    });

    const total = await prisma.suratKeluar.count({ where: whereClause });

    return NextResponse.json({ items: suratKeluarList, total });
  } catch (error) {
    console.error("Gagal mengambil daftar surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar surat keluar" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const currentYear = new Date().getFullYear();

    // Simpan surat keluar baru
    const baru = await prisma.suratKeluar.create({
      data: {
        nomorSurat: body.nomorSurat,
        tanggalSurat: body.tanggalSurat ? new Date(body.tanggalSurat) : new Date(),
        lampiran: body.lampiran || "-",
        perihal: body.perihal,
        tujuan: body.tujuan,
        alamatTujuan: body.alamatTujuan || "di Tempat",
        salamPembuka: body.salamPembuka || "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
        kalimatPembuka: body.kalimatPembuka || "",
        isiSurat: body.isiSurat,
        adaAcara: Boolean(body.adaAcara),
        acaraHariTanggal: body.acaraHariTanggal || null,
        acaraWaktu: body.acaraWaktu || null,
        acaraTempat: body.acaraTempat || null,
        acaraAgenda: body.acaraAgenda || null,
        kalimatPenutup: body.kalimatPenutup || "",
        salamPenutup: body.salamPenutup || "Wassalamu'alaikum Warahmatullahi Wabarakatuh,",
        tempatSurat: body.tempatSurat || "Jakarta",
        namaPenandatangan: body.namaPenandatangan,
        jabatanPenandatangan: body.jabatanPenandatangan,
        namaPenandatangan2: body.namaPenandatangan2 || null,
        jabatanPenandatangan2: body.jabatanPenandatangan2 || null,
        pakaiTtd: body.pakaiTtd !== undefined ? Boolean(body.pakaiTtd) : true,
        pakaiTtd2: body.pakaiTtd2 !== undefined ? Boolean(body.pakaiTtd2) : false,
        pakaiStempel: body.pakaiStempel !== undefined ? Boolean(body.pakaiStempel) : true,
        tembusan: body.tembusan || null,
        status: body.status || "Final",
        catatan: body.catatan || null,
      },
    });

    // Perbarui counter agar selalu selaras dengan nomor surat yang baru dibuat di arsip
    const suratYear = body.tanggalSurat ? new Date(body.tanggalSurat).getFullYear() : currentYear;
    const extractedNum = extractNomorUrut(body.nomorSurat);
    if (extractedNum) {
      const existingCounter = await prisma.counter.findUnique({
        where: {
          tipe_tahun: {
            tipe: "SURAT_KELUAR",
            tahun: suratYear,
          },
        },
      });
      const newLast = Math.max(existingCounter?.lastNumber || 0, extractedNum);
      await prisma.counter.upsert({
        where: {
          tipe_tahun: {
            tipe: "SURAT_KELUAR",
            tahun: suratYear,
          },
        },
        update: {
          lastNumber: newLast,
        },
        create: {
          tipe: "SURAT_KELUAR",
          tahun: suratYear,
          lastNumber: newLast,
        },
      });
    }

    return NextResponse.json(baru);
  } catch (error) {
    console.error("Gagal membuat surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal membuat surat keluar" },
      { status: 500 }
    );
  }
}
