import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const currentYear = new Date().getFullYear();
    const selectedYear = yearParam ? parseInt(yearParam, 10) : currentYear;

    const all = await prisma.transaksiKeuangan.findMany({
      select: {
        jenis: true,
        kategoriKas: true,
        nominal: true,
        tanggal: true,
      },
      orderBy: { tanggal: "asc" },
    });

    let totalMasukJariyah = 0;
    let totalKeluarJariyah = 0;
    let totalMasukInfaq = 0;
    let totalKeluarInfaq = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let masukBulanIni = 0;
    let keluarBulanIni = 0;

    const distinctYears = new Set<number>([currentYear]);

    const MONTH_NAMES = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const MONTH_SHORT = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
    ];

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      bulanIndex: i,
      namaBulan: MONTH_NAMES[i],
      singkat: MONTH_SHORT[i],
      masukJariyah: 0,
      keluarJariyah: 0,
      masukInfaq: 0,
      keluarInfaq: 0,
      totalMasuk: 0,
      totalKeluar: 0,
      surplus: 0,
    }));

    let totalMasukTahunan = 0;
    let totalKeluarTahunan = 0;
    let totalMasukJariyahTahunan = 0;
    let totalKeluarJariyahTahunan = 0;
    let totalMasukInfaqTahunan = 0;
    let totalKeluarInfaqTahunan = 0;

    for (const t of all) {
      const nom = Number(t.nominal) || 0;
      const tgl = new Date(t.tanggal);
      const itemYear = tgl.getFullYear();
      const itemMonth = tgl.getMonth();
      distinctYears.add(itemYear);

      // All-time totals
      if (t.kategoriKas === "JARIYAH") {
        if (t.jenis === "MASUK") totalMasukJariyah += nom;
        else totalKeluarJariyah += nom;
      } else {
        if (t.jenis === "MASUK") totalMasukInfaq += nom;
        else totalKeluarInfaq += nom;
      }

      // Bulan ini
      if (tgl >= startOfMonth) {
        if (t.jenis === "MASUK") masukBulanIni += nom;
        else keluarBulanIni += nom;
      }

      // Selected Year data
      if (itemYear === selectedYear) {
        if (t.kategoriKas === "JARIYAH") {
          if (t.jenis === "MASUK") {
            totalMasukJariyahTahunan += nom;
            monthlyData[itemMonth].masukJariyah += nom;
            monthlyData[itemMonth].totalMasuk += nom;
            totalMasukTahunan += nom;
          } else {
            totalKeluarJariyahTahunan += nom;
            monthlyData[itemMonth].keluarJariyah += nom;
            monthlyData[itemMonth].totalKeluar += nom;
            totalKeluarTahunan += nom;
          }
        } else {
          // INFAQ
          if (t.jenis === "MASUK") {
            totalMasukInfaqTahunan += nom;
            monthlyData[itemMonth].masukInfaq += nom;
            monthlyData[itemMonth].totalMasuk += nom;
            totalMasukTahunan += nom;
          } else {
            totalKeluarInfaqTahunan += nom;
            monthlyData[itemMonth].keluarInfaq += nom;
            monthlyData[itemMonth].totalKeluar += nom;
            totalKeluarTahunan += nom;
          }
        }
      }
    }

    for (const m of monthlyData) {
      m.surplus = m.totalMasuk - m.totalKeluar;
    }

    // Tambahkan tahun saat ini hingga 5 tahun ke depan
    for (let offset = 0; offset <= 5; offset++) {
      distinctYears.add(currentYear + offset);
    }
    const availableYears = Array.from(distinctYears).sort((a, b) => a - b);

    const saldoJariyah = totalMasukJariyah - totalKeluarJariyah;
    const saldoInfaq = totalMasukInfaq - totalKeluarInfaq;
    const totalSaldo = saldoJariyah + saldoInfaq;

    return NextResponse.json({
      saldoJariyah,
      saldoInfaq,
      totalSaldo,
      totalMasukJariyah,
      totalKeluarJariyah,
      totalMasukInfaq,
      totalKeluarInfaq,
      masukBulanIni,
      keluarBulanIni,
      rekapTahunan: {
        tahun: selectedYear,
        totalMasukTahunan,
        totalKeluarTahunan,
        totalMasukJariyahTahunan,
        totalKeluarJariyahTahunan,
        totalMasukInfaqTahunan,
        totalKeluarInfaqTahunan,
        surplusTahunan: totalMasukTahunan - totalKeluarTahunan,
        monthlyData,
      },
      availableYears,
    });
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    return NextResponse.json(
      { error: "Gagal menghitung statistik keuangan" },
      { status: 500 }
    );
  }
}
