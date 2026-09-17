import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    const item = await prisma.transaksiKeuangan.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil transaksi" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    const body = await request.json();
    const { tanggal, jenis, kategoriKas, nominal, keterangan, buktiFotoUrl } = body;

    const dataToUpdate: any = {};
    if (tanggal) dataToUpdate.tanggal = new Date(tanggal);
    if (jenis) dataToUpdate.jenis = jenis;
    if (kategoriKas) dataToUpdate.kategoriKas = kategoriKas;
    if (nominal !== undefined) dataToUpdate.nominal = parseFloat(nominal);
    if (keterangan) dataToUpdate.keterangan = keterangan.trim();
    if (buktiFotoUrl !== undefined) dataToUpdate.buktiFotoUrl = buktiFotoUrl || null;

    const updated = await prisma.transaksiKeuangan.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui transaksi" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    await prisma.transaksiKeuangan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}
