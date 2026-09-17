import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const item = await prisma.kegiatanMasjid.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data kegiatan" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
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

    const updated = await prisma.kegiatanMasjid.update({
      where: { id },
      data: {
        tipe: tipe || undefined,
        namaKegiatan: namaKegiatan ? namaKegiatan.trim() : undefined,
        hari: hari ? hari.trim() : undefined,
        waktu: waktu ? waktu.trim() : undefined,
        tempat: tempat !== undefined ? tempat.trim() : undefined,
        pengisi: pengisi !== undefined ? (pengisi?.trim() || null) : undefined,
        penanggungJawab: penanggungJawab !== undefined ? (penanggungJawab?.trim() || null) : undefined,
        siklusBulanan: siklusBulanan !== undefined ? (siklusBulanan?.trim() || null) : undefined,
        sasaranPeserta: sasaranPeserta !== undefined ? (sasaranPeserta?.trim() || null) : undefined,
        keterangan: keterangan !== undefined ? (keterangan?.trim() || null) : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating kegiatan rutin:", error);
    return NextResponse.json({ error: "Gagal memperbarui kegiatan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.kegiatanMasjid.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kegiatan" }, { status: 500 });
  }
}
