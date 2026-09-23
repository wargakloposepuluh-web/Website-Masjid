import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractNomorUrut } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const item = await prisma.suratKeluar.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Surat keluar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Gagal mengambil detail surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data surat" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();

    const updated = await prisma.suratKeluar.update({
      where: { id },
      data: {
        nomorSurat: body.nomorSurat,
        tanggalSurat: body.tanggalSurat ? new Date(body.tanggalSurat) : undefined,
        lampiran: body.lampiran,
        perihal: body.perihal,
        tujuan: body.tujuan,
        alamatTujuan: body.alamatTujuan,
        salamPembuka: body.salamPembuka,
        kalimatPembuka: body.kalimatPembuka,
        isiSurat: body.isiSurat,
        adaAcara: Boolean(body.adaAcara),
        acaraHariTanggal: body.acaraHariTanggal,
        acaraWaktu: body.acaraWaktu,
        acaraTempat: body.acaraTempat,
        acaraAgenda: body.acaraAgenda,
        kalimatPenutup: body.kalimatPenutup,
        salamPenutup: body.salamPenutup,
        tempatSurat: body.tempatSurat,
        namaPenandatangan: body.namaPenandatangan,
        jabatanPenandatangan: body.jabatanPenandatangan,
        namaPenandatangan2: body.namaPenandatangan2,
        jabatanPenandatangan2: body.jabatanPenandatangan2,
        penandatanganList: body.penandatanganList !== undefined ? (typeof body.penandatanganList === "string" ? body.penandatanganList : JSON.stringify(body.penandatanganList)) : undefined,
        pakaiTtd: body.pakaiTtd !== undefined ? Boolean(body.pakaiTtd) : undefined,
        pakaiTtd2: body.pakaiTtd2 !== undefined ? Boolean(body.pakaiTtd2) : undefined,
        pakaiStempel: body.pakaiStempel !== undefined ? Boolean(body.pakaiStempel) : undefined,
        tembusan: body.tembusan,
        status: body.status,
        catatan: body.catatan,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal memperbarui surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data surat keluar" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const item = await prisma.suratKeluar.findUnique({
      where: { id },
      select: { id: true, tanggalSurat: true },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Surat tidak ditemukan" },
        { status: 404 }
      );
    }

    const itemYear = new Date(item.tanggalSurat).getFullYear();

    await prisma.suratKeluar.delete({
      where: { id },
    });

    // Sinkronkan kembali counter dengan arsip surat keluar setelah penghapusan
    const startOfYear = new Date(itemYear, 0, 1);
    const endOfYear = new Date(itemYear, 11, 31, 23, 59, 59, 999);
    const remaining = await prisma.suratKeluar.findMany({
      where: {
        OR: [
          { tanggalSurat: { gte: startOfYear, lte: endOfYear } },
          { nomorSurat: { contains: String(itemYear) } },
        ],
      },
      select: { nomorSurat: true },
    });

    let newMax = 0;
    for (const s of remaining) {
      const num = extractNomorUrut(s.nomorSurat);
      if (num !== null && num > newMax) {
        newMax = num;
      }
    }

    await prisma.counter.upsert({
      where: {
        tipe_tahun: {
          tipe: "SURAT_KELUAR",
          tahun: itemYear,
        },
      },
      update: {
        lastNumber: newMax,
      },
      create: {
        tipe: "SURAT_KELUAR",
        tahun: itemYear,
        lastNumber: newMax,
      },
    });

    return NextResponse.json({ success: true, message: "Surat berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal menghapus surat keluar" },
      { status: 500 }
    );
  }
}
