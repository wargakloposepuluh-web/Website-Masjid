import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const item = await prisma.jadwalJumat.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat jadwal" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { khotib, imam, bilal, pembacaPengumuman, temaKhutbah, keterangan } = body;

    const updated = await prisma.jadwalJumat.update({
      where: { id },
      data: {
        khotib: khotib !== undefined ? (khotib?.trim() || null) : undefined,
        imam: imam !== undefined ? (imam?.trim() || null) : undefined,
        bilal: bilal !== undefined ? (bilal?.trim() || null) : undefined,
        pembacaPengumuman: pembacaPengumuman !== undefined ? (pembacaPengumuman?.trim() || null) : undefined,
        temaKhutbah: temaKhutbah !== undefined ? (temaKhutbah?.trim() || null) : undefined,
        keterangan: keterangan !== undefined ? (keterangan?.trim() || null) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating jadwal jumat:", error);
    return NextResponse.json({ error: "Gagal memperbarui jadwal Jum'at" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.jadwalJumat.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus jadwal" }, { status: 500 });
  }
}
