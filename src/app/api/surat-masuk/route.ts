import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number(searchParams.get("limit")) || 100;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { nomorAgenda: { contains: search } },
        { nomorSurat: { contains: search } },
        { pengirim: { contains: search } },
        { perihal: { contains: search } },
      ];
    }

    if (status && status !== "Semua") {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.tanggalTerima = {};
      if (startDate) {
        whereClause.tanggalTerima.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.tanggalTerima.lte = end;
      }
    }

    const items = await prisma.suratMasuk.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
      take: limit,
    });

    const total = await prisma.suratMasuk.count({ where: whereClause });

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("Gagal mengambil surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar surat masuk" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentYear = new Date().getFullYear();

    let nomorAgenda = body.nomorAgenda;

    // Jika nomor agenda belum diisi, generate otomatis: AG-001/2026
    if (!nomorAgenda) {
      const counter = await prisma.counter.findUnique({
        where: {
          tipe_tahun: {
            tipe: "AGENDA_MASUK",
            tahun: currentYear,
          },
        },
      });

      const nextNo = (counter?.lastNumber || 0) + 1;
      nomorAgenda = `AG-${String(nextNo).padStart(3, "0")}/${currentYear}`;

      await prisma.counter.upsert({
        where: {
          tipe_tahun: {
            tipe: "AGENDA_MASUK",
            tahun: currentYear,
          },
        },
        update: { lastNumber: nextNo },
        create: {
          tipe: "AGENDA_MASUK",
          tahun: currentYear,
          lastNumber: nextNo,
        },
      });
    }

    const baru = await prisma.suratMasuk.create({
      data: {
        nomorAgenda,
        nomorSurat: body.nomorSurat,
        tanggalSurat: body.tanggalSurat ? new Date(body.tanggalSurat) : new Date(),
        tanggalTerima: body.tanggalTerima ? new Date(body.tanggalTerima) : new Date(),
        pengirim: body.pengirim,
        perihal: body.perihal,
        disposisi: body.disposisi || null,
        status: body.status || "Diterima",
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
        fileSize: body.fileSize ? Number(body.fileSize) : null,
        keterangan: body.keterangan || null,
      },
    });

    return NextResponse.json(baru);
  } catch (error) {
    console.error("Gagal menyimpan surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan surat masuk" },
      { status: 500 }
    );
  }
}
