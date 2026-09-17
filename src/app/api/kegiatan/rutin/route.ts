import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipe = searchParams.get("tipe"); // "MINGGUAN" | "BULANAN" | null

    const whereClause: any = {};
    if (tipe && tipe !== "ALL") {
      whereClause.tipe = tipe;
    }

    const items = await prisma.kegiatanMasjid.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching kegiatan rutin:", error);
    return NextResponse.json({ error: "Gagal mengambil kegiatan rutin" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tipe,
      namaKegiatan,
      hari,
      waktu,
      tempat,
      pengisi,
      penanggungJawab,
      siklusBulanan,
      sasaranPeserta,
      keterangan,
      isActive,
    } = body;

    if (!tipe || !namaKegiatan || !hari || !waktu) {
      return NextResponse.json(
        { error: "Tipe, Nama Kegiatan, Hari, dan Waktu wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.kegiatanMasjid.create({
      data: {
        tipe,
        namaKegiatan: namaKegiatan.trim(),
        hari: hari.trim(),
        waktu: waktu.trim(),
        tempat: tempat?.trim() || "Ruang Utama Masjid Baitul Maghfirah",
        pengisi: pengisi?.trim() || null,
        penanggungJawab: penanggungJawab?.trim() || null,
        siklusBulanan: siklusBulanan?.trim() || null,
        sasaranPeserta: sasaranPeserta?.trim() || null,
        keterangan: keterangan?.trim() || null,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating kegiatan rutin:", error);
    return NextResponse.json({ error: "Gagal membuat kegiatan" }, { status: 500 });
  }
}
