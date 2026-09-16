import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const item = await prisma.suratMasuk.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Surat masuk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Gagal mengambil data surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data surat masuk" },
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

    const updated = await prisma.suratMasuk.update({
      where: { id },
      data: {
        nomorAgenda: body.nomorAgenda,
        nomorSurat: body.nomorSurat,
        tanggalSurat: body.tanggalSurat ? new Date(body.tanggalSurat) : undefined,
        tanggalTerima: body.tanggalTerima ? new Date(body.tanggalTerima) : undefined,
        pengirim: body.pengirim,
        perihal: body.perihal,
        disposisi: body.disposisi,
        status: body.status,
        fileUrl: body.fileUrl,
        fileName: body.fileName,
        fileSize: body.fileSize ? Number(body.fileSize) : undefined,
        keterangan: body.keterangan,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal memperbarui data surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui surat masuk" },
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
    await prisma.suratMasuk.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Surat masuk berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal menghapus surat masuk" },
      { status: 500 }
    );
  }
}
