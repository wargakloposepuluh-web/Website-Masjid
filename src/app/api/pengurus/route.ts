import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bidang = searchParams.get("bidang");
    const search = searchParams.get("search");

    const where: any = {};
    if (bidang && bidang !== "all") {
      where.bidang = bidang;
    }
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { jabatan: { contains: search } },
        { nomorWa: { contains: search } },
      ];
    }

    const pengurus = await prisma.pengurus.findMany({
      where,
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(pengurus);
  } catch (error: any) {
    console.error("Error fetching pengurus:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data pengurus" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, jabatan, bidang, nomorWa, keterangan } = body;

    if (!nama || !jabatan || !bidang) {
      return NextResponse.json(
        { error: "Nama, jabatan, dan bidang wajib diisi" },
        { status: 400 }
      );
    }

    const count = await prisma.pengurus.count();

    const newPengurus = await prisma.pengurus.create({
      data: {
        nama,
        jabatan,
        bidang,
        nomorWa: nomorWa || null,
        keterangan: keterangan || null,
        urutan: count + 1,
      },
    });

    return NextResponse.json(newPengurus);
  } catch (error: any) {
    console.error("Error creating pengurus:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menambah data pengurus" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nama, jabatan, bidang, nomorWa, keterangan } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID pengurus wajib disertakan" },
        { status: 400 }
      );
    }

    const updated = await prisma.pengurus.update({
      where: { id: Number(id) },
      data: {
        ...(nama !== undefined && { nama }),
        ...(jabatan !== undefined && { jabatan }),
        ...(bidang !== undefined && { bidang }),
        ...(nomorWa !== undefined && { nomorWa }),
        ...(keterangan !== undefined && { keterangan }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating pengurus:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui data pengurus" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID pengurus wajib disertakan" },
        { status: 400 }
      );
    }

    await prisma.pengurus.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting pengurus:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus pengurus" },
      { status: 500 }
    );
  }
}
