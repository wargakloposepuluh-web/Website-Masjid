import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSidoarjoPrayerTimes } from "@/lib/prayerTimes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Data Sholat Sidoarjo
    const today = new Date();
    const prayerTimes = calculateSidoarjoPrayerTimes(today);

    // 2. Transparansi Keuangan (Kas Jariyah & Kas Infaq)
    const transaksiList = await prisma.transaksiKeuangan.findMany({
      select: {
        jenis: true,
        kategoriKas: true,
        nominal: true,
        tanggal: true,
      },
    });

    let saldoJariyah = 0;
    let saldoInfaq = 0;
    let totalMasukBulanIni = 0;
    let totalKeluarBulanIni = 0;

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    for (const t of transaksiList) {
      const isThisMonth =
        t.tanggal.getFullYear() === currentYear &&
        t.tanggal.getMonth() === currentMonth;

      if (t.kategoriKas === "JARIYAH") {
        if (t.jenis === "MASUK") {
          saldoJariyah += t.nominal;
          if (isThisMonth) totalMasukBulanIni += t.nominal;
        } else {
          saldoJariyah -= t.nominal;
          if (isThisMonth) totalKeluarBulanIni += t.nominal;
        }
      } else {
        // INFAQ
        if (t.jenis === "MASUK") {
          saldoInfaq += t.nominal;
          if (isThisMonth) totalMasukBulanIni += t.nominal;
        } else {
          saldoInfaq -= t.nominal;
          if (isThisMonth) totalKeluarBulanIni += t.nominal;
        }
      }
    }

    const totalKas = saldoJariyah + saldoInfaq;

    // 2b. 5 Transaksi Terkini untuk TV Display
    const transaksiTerkini = await prisma.transaksiKeuangan.findMany({
      orderBy: { tanggal: "desc" },
      take: 5,
      select: {
        id: true,
        tanggal: true,
        jenis: true,
        kategoriKas: true,
        nominal: true,
        keterangan: true,
      },
    });

    // 3. Ibadah & Dakwah: Jadwal Sholat Jum'at Terdekat
    // Mulai dari hari ini jam 00:00
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingJumatList = await prisma.jadwalJumat.findMany({
      where: {
        tanggal: {
          gte: startOfToday,
        },
      },
      orderBy: {
        tanggal: "asc",
      },
      take: 3,
    });

    // 4. Kegiatan Mingguan & Bulanan Aktif
    const kegiatanMingguan = await prisma.kegiatanMasjid.findMany({
      where: {
        tipe: "MINGGUAN",
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const kegiatanBulanan = await prisma.kegiatanMasjid.findMany({
      where: {
        tipe: "BULANAN",
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 5. Setting Profil Masjid, QRIS, Fasilitas & Running Text
    const setting = await prisma.setting.findFirst({
      select: {
        namaOrganisasi: true,
        alamatOrganisasi: true,
        kontakOrganisasi: true,
        qrisImageUrl: true,
        qrisBank: true,
        qrisNama: true,
        qrisNmid: true,
        qrisRekening: true,
        qrisKeterangan: true,
        fasilitasJudul: true,
        fasilitasSlogan: true,
        fasilitasFotoUrl: true,
        runningText: true,
        tampilkanSaldoRT: true,
        kecepatanRT: true,
      },
    });

    // 6. Data Fasilitas aktif
    const fasilitasList = await prisma.fasilitas.findMany({
      where: { isActive: true },
      orderBy: { urutan: "asc" },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        icon: true,
        fotoUrl: true,
        urutan: true,
      },
    });

    // 7. Slide Display TV & Web Publik Aktif
    const displaySlides = await prisma.displaySlide.findMany({
      where: { isActive: true },
      orderBy: { urutan: "asc" },
      select: {
        id: true,
        judul: true,
        fotoUrl: true,
        urutan: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        prayerTimes,
        keuangan: {
          saldoJariyah,
          saldoInfaq,
          totalKas,
          totalMasukBulanIni,
          totalKeluarBulanIni,
          transaksiTerkini,
        },
        ibadah: {
          upcomingJumat: upcomingJumatList[0] || null,
          nextJumatList: upcomingJumatList,
          kegiatanMingguan,
          kegiatanBulanan,
        },
        profil: setting || {
          namaOrganisasi: "MASJID BAITUL MAGHFIRAH",
          alamatOrganisasi: "Jl. Raya Kloposepuluh, RT : 11, RW : 03, - Sukodono - Sidoarjo",
          kontakOrganisasi: "Telp/WA: 0812-4604-3951 | Email: baitul.maghfirah.kloposepuluh@gmail.com | Sukodono - Sidoarjo",
        },
        qris: {
          qrisImageUrl: setting?.qrisImageUrl || "/qris-masjid.png",
          qrisBank: setting?.qrisBank || "Bank Syariah Indonesia (BSI)",
          qrisNama: setting?.qrisNama || "Masjid Baitul Maghfirah",
          qrisNmid: setting?.qrisNmid || null,
          qrisRekening: setting?.qrisRekening || null,
          qrisKeterangan: setting?.qrisKeterangan || "Scan untuk Infaq, Sedekah dan Donasi",
        },
        fasilitas: {
          judul: setting?.fasilitasJudul || "Fasilitas & Pelayanan",
          slogan: setting?.fasilitasSlogan || "Berkhidmat untuk Jamaah, Merawat Rumah Allah.",
          fotoUrl: setting?.fasilitasFotoUrl || "/bg_masjid.jpg",
          items: fasilitasList,
        },
        runningText: {
          teks: setting?.runningText || "",
          tampilkanSaldo: setting?.tampilkanSaldoRT !== false,
          kecepatan: setting?.kecepatanRT || 40,
        },
        displaySlides,
      },
    });
  } catch (error: any) {
    console.error("Error fetching portal info:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data portal." },
      { status: 500 }
    );
  }
}
