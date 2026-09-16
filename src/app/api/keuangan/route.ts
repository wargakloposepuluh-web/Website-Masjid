import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori");
    const jenis = searchParams.get("jenis");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const whereClause: any = {};

    if (kategori && kategori !== "all") {
      whereClause.kategoriKas = kategori;
    }

    if (jenis && jenis !== "all") {
      whereClause.jenis = jenis;
    }

    if (startDate || endDate) {
      whereClause.tanggal = {};
      if (startDate) {
        whereClause.tanggal.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.tanggal.lte = end;
      }
    }

    if (search && search.trim()) {
      whereClause.keterangan = {
        contains: search.trim(),
      };
    }

    const items = await prisma.transaksiKeuangan.findMany({
      where: whereClause,
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    const body = await request.json();
    const { tanggal, jenis, kategoriKas, nominal, keterangan, buktiFotoUrl } = body;

    if (!tanggal || !jenis || !kategoriKas || !nominal || !keterangan) {
      return NextResponse.json(
        { error: "Semua kolom utama wajib diisi." },
        { status: 400 }
      );
    }

    const cleanNominal = parseFloat(nominal);
    if (isNaN(cleanNominal) || cleanNominal <= 0) {
      return NextResponse.json(
        { error: "Nominal harus berupa angka lebih dari 0." },
        { status: 400 }
      );
    }

    const created = await prisma.transaksiKeuangan.create({
      data: {
        tanggal: new Date(tanggal),
        jenis,
        kategoriKas,
        nominal: cleanNominal,
        keterangan: keterangan.trim(),
        buktiFotoUrl: buktiFotoUrl || null,
        dicatatOleh: session?.nama || "Bendahara",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan transaksi" },
      { status: 500 }
    );
  }
}
