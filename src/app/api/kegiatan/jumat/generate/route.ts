import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tahun = body.tahun ? parseInt(body.tahun, 10) : new Date().getFullYear();

    if (isNaN(tahun) || tahun < 2000 || tahun > 2100) {
      return NextResponse.json({ error: "Tahun tidak valid." }, { status: 400 });
    }

    // Find all existing fridays for that year
    const existing = await prisma.jadwalJumat.findMany({
      where: { tahun },
      select: { tanggal: true },
    });

    const existingDates = new Set(
      existing.map((item) => new Date(item.tanggal).toISOString().split("T")[0])
    );

    // Calculate all Friday dates in that year
    const fridaysToCreate: Date[] = [];
    const d = new Date(tahun, 0, 1);
    while (d.getFullYear() === tahun) {
      if (d.getDay() === 5) {
        // Friday
        const ymd = d.toISOString().split("T")[0];
        if (!existingDates.has(ymd)) {
          fridaysToCreate.push(new Date(d));
        }
      }
      d.setDate(d.getDate() + 1);
    }

    let createdCount = 0;
    for (const fDate of fridaysToCreate) {
      await prisma.jadwalJumat.create({
        data: {
          tanggal: fDate,
          tahun,
        },
      });
      createdCount++;
    }

    const totalCount = await prisma.jadwalJumat.count({ where: { tahun } });

    return NextResponse.json({
      success: true,
      tahun,
      createdCount,
      totalFridays: totalCount,
      message: `Berhasil menghasilkan ${createdCount} tanggal Jum'at baru untuk tahun ${tahun}. Total sekarang: ${totalCount} jadwal.`,
    });
  } catch (error) {
    console.error("Error generating friday schedules:", error);
    return NextResponse.json({ error: "Gagal generate jadwal Jum'at" }, { status: 500 });
  }
}
