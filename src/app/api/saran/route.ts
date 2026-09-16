import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: Publik mengirim saran/masukan (tanpa perlu login)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, kontak, kategori, judul, pesan } = body;

    if (!pesan || !pesan.trim()) {
      return NextResponse.json(
        { error: "Pesan / saran wajib diisi." },
        { status: 400 }
      );
    }

    const validKategori = ["SURAT", "IBADAH", "KEUANGAN", "UMUM"];
    const kat = validKategori.includes(kategori) ? kategori : "UMUM";

    const newSaran = await prisma.kritikSaran.create({
      data: {
        nama: nama && nama.trim() ? nama.trim() : "Hamba Allah",
        kontak: kontak ? kontak.trim() : null,
        kategori: kat,
        judul: judul ? judul.trim() : null,
        pesan: pesan.trim(),
        status: "BARU",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Terima kasih atas aspirasi dan saran Anda. Masukan telah dicatat.",
        data: newSaran,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating saran:", error);
    return NextResponse.json(
      { error: "Gagal mengirim masukan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

// GET: Admin mengambil daftar saran
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kategoriParam = searchParams.get("kategori");
    const statusParam = searchParams.get("status");

    let whereClause: any = {};

    // Filter berdasarkan role bila role bukan SUPER_ADMIN
    if (session.role === "ADMIN_SURAT") {
      whereClause.kategori = { in: ["SURAT", "UMUM"] };
    } else if (session.role === "ADMIN_IBADAH") {
      whereClause.kategori = { in: ["IBADAH", "UMUM"] };
    } else if (session.role === "ADMIN_KEUANGAN") {
      whereClause.kategori = { in: ["KEUANGAN", "UMUM"] };
    }

    // Jika ada parameter spesifik kategori
    if (kategoriParam && kategoriParam !== "ALL") {
      whereClause.kategori = kategoriParam;
    }

    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam;
    }

    const list = await prisma.kritikSaran.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: list,
      userRole: session.role,
    });
  } catch (error: any) {
    console.error("Error fetching saran:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data aspirasi dan saran." },
      { status: 500 }
    );
  }
}
