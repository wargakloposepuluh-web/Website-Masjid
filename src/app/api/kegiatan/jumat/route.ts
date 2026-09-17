import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahunParam = searchParams.get("tahun");
    const bulanParam = searchParams.get("bulan"); // 1 - 12

    const tahun = tahunParam ? parseInt(tahunParam, 10) : new Date().getFullYear();

    const whereClause: any = { tahun };

    if (bulanParam && bulanParam !== "all") {
      const bulan = parseInt(bulanParam, 10);
      const startOfMonth = new Date(tahun, bulan - 1, 1);
      const endOfMonth = new Date(tahun, bulan, 0, 23, 59, 59, 999);
      whereClause.tanggal = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const items = await prisma.jadwalJumat.findMany({
      where: whereClause,
      orderBy: { tanggal: "asc" },
    });

    return NextResponse.json({ tahun, items });
  } catch (error) {
    console.error("Error fetching jadwal jumat:", error);
    return NextResponse.json({ error: "Gagal mengambil jadwal Jum'at" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, tahun, khotib, imam, bilal, pembacaPengumuman, temaKhutbah, keterangan } = body;

    if (!tanggal) {
      return NextResponse.json({ error: "Tanggal hari Jum'at wajib diisi" }, { status: 400 });
    }

    const tgl = new Date(tanggal);
    const thn = tahun || tgl.getFullYear();

    const created = await prisma.jadwalJumat.create({
      data: {
        tanggal: tgl,
        tahun: thn,
        khotib: khotib?.trim() || null,
        imam: imam?.trim() || null,
        bilal: bilal?.trim() || null,
        pembacaPengumuman: pembacaPengumuman?.trim() || null,
        temaKhutbah: temaKhutbah?.trim() || null,
        keterangan: keterangan?.trim() || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating jadwal jumat:", error);
    return NextResponse.json({ error: "Gagal membuat jadwal Jum'at" }, { status: 500 });
  }
}
