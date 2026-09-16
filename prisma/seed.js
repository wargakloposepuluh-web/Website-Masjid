const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding database...");

  // Inisialisasi Pengaturan Default
  const setting = await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      namaOrganisasi: "DEWAN KEMAKMURAN MASJID (DKM) AL-MUHAJIRIN",
      alamatOrganisasi: "Jl. Masjid Raya No. 45, Kelurahan Sukadamai, Kec. Cilandak, Kota Jakarta Selatan",
      kopType: "image",
      kopImageUrl: "/sample-kop-banner.svg",
      marginTop: 2.0,
      marginBottom: 2.0,
      marginLeft: 2.5,
      marginRight: 2.0,
      fontFamily: "Times New Roman",
      fontSize: 12,
      lineHeight: 1.3,
      paragrafSpacing: 0.8,
      formatNomorSurat: "{nomor}/DKM-AM/{romawi}/{tahun}",
      kotaSurat: "Jakarta",
      defaultSalamPembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
      defaultKalimatPembuka: "Puji syukur kehadirat Allah SWT yang senantiasa melimpahkan rahmat, taufik, dan inayah-Nya kepada kita semua. Shalawat serta salam semoga tercurah kepada junjungan kita Nabi Muhammad SAW, beserta keluarga, para sahabat, dan pengikutnya hingga yaumil akhir.",
      defaultKalimatPenutup: "Demikian surat ini kami sampaikan. Besar harapan kami atas perkenan dan kehadiran Bapak/Ibu/Saudara/i sekalian. Atas perhatian dan kerja samanya, kami haturkan terima kasih yang sebesar-besarnya. Jazakumullah khairan katsiran.",
      defaultSalamPenutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh,",
      penandatanganNama: "H. Ahmad Syarifuddin, S.Ag.",
      penandatanganJabatan: "Ketua DKM Al-Muhajirin",
      penandatanganNama2: "Ustadz M. Rizqi Fauzan, S.Kom.I.",
      penandatanganJabatan2: "Sekretaris DKM",
      stempelPosisiX: -25,
      stempelPosisiY: -15,
      stempelUkuran: 105,
      stempelOpacity: 0.85,
    },
  });

  // Sample Surat Keluar
  const countSuratKeluar = await prisma.suratKeluar.count();
  if (countSuratKeluar === 0) {
    await prisma.suratKeluar.create({
      data: {
        nomorSurat: "001/DKM-AM/IX/2026",
        tanggalSurat: new Date(),
        lampiran: "1 (satu) Berkas",
        perihal: "Undangan Rapat Koordinasi Panitia Peringatan Maulid Nabi",
        tujuan: "Yth. Segenap Pengurus DKM & Tokoh Masyarakat",
        alamatTujuan: "di Tempat",
        salamPembuka: setting.defaultSalamPembuka,
        kalimatPembuka: setting.defaultKalimatPembuka,
        isiSurat: "Sehubungan dengan semakin dekatnya agenda Peringatan Maulid Nabi Muhammad SAW 1448 H / 2026 M di lingkungan Masjid Al-Muhajirin, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dalam musyawarah panitia guna mematangkan teknis pelaksanaan kegiatan tersebut.",
        adaAcara: true,
        acaraHariTanggal: "Ahad, 20 September 2026",
        acaraWaktu: "09.00 WIB s/d Selesai (Ba'da Sholat Dhuha)",
        acaraTempat: "Aula Serbaguna Lt. 2 Masjid Al-Muhajirin",
        acaraAgenda: "1. Pemaparan rencana kerja divisi\n2. Finalisasi anggaran kegiatan\n3. Pembagian tugas lapangan",
        kalimatPenutup: setting.defaultKalimatPenutup,
        salamPenutup: setting.defaultSalamPenutup,
        tempatSurat: "Jakarta",
        namaPenandatangan: setting.penandatanganNama,
        jabatanPenandatangan: setting.penandatanganJabatan,
        namaPenandatangan2: setting.penandatanganNama2,
        jabatanPenandatangan2: setting.penandatanganJabatan2,
        pakaiTtd: true,
        pakaiTtd2: true,
        pakaiStempel: true,
        tembusan: "1. Penasihat DKM Al-Muhajirin\n2. Ketua RW 05 Sukadamai\n3. Arsip",
        status: "Final",
      },
    });

    await prisma.counter.upsert({
      where: {
        tipe_tahun: {
          tipe: "SURAT_KELUAR",
          tahun: new Date().getFullYear(),
        },
      },
      update: { lastNumber: 1 },
      create: {
        tipe: "SURAT_KELUAR",
        tahun: new Date().getFullYear(),
        lastNumber: 1,
      },
    });
  }

  // Sample Surat Masuk
  const countSuratMasuk = await prisma.suratMasuk.count();
  if (countSuratMasuk === 0) {
    await prisma.suratMasuk.create({
      data: {
        nomorAgenda: "AG-001/2026",
        nomorSurat: "045/KUA-CK/VIII/2026",
        tanggalSurat: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tanggalTerima: new Date(),
        pengirim: "Kantor Urusan Agama (KUA) Kec. Cilandak",
        perihal: "Himbauan Pelaksanaan Sosialisasi Sertifikasi Halal Rumah Ibadah & UMKM",
        disposisi: "Ketua DKM & Sie. Pembinaan Umat: Mohon diagendakan sosialisasi ba'da Sholat Jumat.",
        status: "Diproses",
        keterangan: "Surat dinas resmi dari KUA",
      },
    });

    await prisma.counter.upsert({
      where: {
        tipe_tahun: {
          tipe: "AGENDA_MASUK",
          tahun: new Date().getFullYear(),
        },
      },
      update: { lastNumber: 1 },
      create: {
        tipe: "AGENDA_MASUK",
        tahun: new Date().getFullYear(),
        lastNumber: 1,
      },
    });
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
