const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rawData = [
  // Pelindung
  { bidang: "Pelindung", jabatan: "Pelindung", nama: "Kepala Desa Kloposepuluh" },
  { bidang: "Pelindung", jabatan: "Pelindung", nama: "Ketua NU Ranting Kloposepuluh" },

  // Majlis Tahkim
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "Drs. H. Muqrinin" },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "Drs. H. Abd Mujib Hasyim, M.Pd.I" },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "Dr. H.M. Zainul Arifin, M.HI., M.Pd.I." },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "H. Mochammad Hudori" },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "H. Mushowir, M.Pd" },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "H. Imam Syafi'i Azizy, M.Pd.I" },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "Gatot Wimbanu, S.Th.I, M.Pd." },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "Dr. Hj. Nurul Asiyah Nadhifah M.Hi" },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "Hj. Kholidah" },
  { bidang: "Majlis Tahkim", jabatan: "Majlis Tahkim", nama: "Hj. Saidah" },

  // Penasehat
  { bidang: "Penasehat", jabatan: "Penasehat", nama: "Drs. H. Abdul Manan" },
  { bidang: "Penasehat", jabatan: "Penasehat", nama: "Budi Riyanto, ST" },
  { bidang: "Penasehat", jabatan: "Penasehat", nama: "H. M. Sholeh Syarifuddin, SH" },
  { bidang: "Penasehat", jabatan: "Penasehat", nama: "H. Sholeh Ya’kub" },
  { bidang: "Penasehat", jabatan: "Penasehat", nama: "Suharsono, M.Pd" },
  { bidang: "Penasehat", jabatan: "Penasehat", nama: "H. Mahbub Junaidi, S.Ag" },
  { bidang: "Penasehat", jabatan: "Penasehat", nama: "Hamim Musthofa, ST" },

  // Ketua Umum
  { bidang: "Pengurus Harian", jabatan: "Ketua Umum", nama: "H. Sullamul Hadi Nurmawan, S.Th.I" },

  // Wakil Ketua
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua", nama: "H. Abdul Munif" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua", nama: "Muqofi Widad" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua", nama: "H. Abdul Muntholib, M.Pd" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua", nama: "M Nuri Khusroini, S.H" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua", nama: "Moh. As’ad Kholili, M.Sn" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua / Ketua RW 01", nama: "Machfud S.Ag (Ketua RW 01)" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua / Ketua RW 02", nama: "Djumadi (Ketua RW 02)" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua / Ketua RW 03", nama: "Arifuddin (Ketua RW 03)" },
  { bidang: "Pengurus Harian", jabatan: "Wakil Ketua / Ketua RW 04", nama: "Usman (Ketua RW 04)" },

  // Sekretaris
  { bidang: "Pengurus Harian", jabatan: "Sekretaris 1", nama: "Awal Nur Hakim S.Pd.Gr" },
  { bidang: "Pengurus Harian", jabatan: "Sekretaris 2", nama: "Baharuddin Fadli" },
  { bidang: "Pengurus Harian", jabatan: "Sekretaris", nama: "Aqil Nanda Irmawa" },
  { bidang: "Pengurus Harian", jabatan: "Sekretaris", nama: "M. Dani Rahmatulloh" },
  { bidang: "Pengurus Harian", jabatan: "Sekretaris", nama: "Ananda Cahyo P. S.Pd" },
  { bidang: "Pengurus Harian", jabatan: "Sekretaris", nama: "M. Andrianto" },

  // Bendahara
  { bidang: "Pengurus Harian", jabatan: "Bendahara 1", nama: "H. M. Sutris" },
  { bidang: "Pengurus Harian", jabatan: "Bendahara 2", nama: "Moh. Fawaid" },
  { bidang: "Pengurus Harian", jabatan: "Bendahara", nama: "H. Achmad Nurochim" },
  { bidang: "Pengurus Harian", jabatan: "Bendahara", nama: "H. Nur Hasan" },
  { bidang: "Pengurus Harian", jabatan: "Bendahara", nama: "M. Aulia Farchan S.Pd" },

  // Koordinator Bidang
  { bidang: "Koordinator Bidang", jabatan: "Koordinator Bidang", nama: "M. Khafidin, S.Pd.I" },

  // Bidang Keputrian
  { bidang: "Bidang Keputrian", jabatan: "Ketua Muslimat", nama: "Ketua Muslimat" },
  { bidang: "Bidang Keputrian", jabatan: "Ketua Fatayat", nama: "Ketua Fatayat" },

  // Bidang Hubungan Masyarakat
  { bidang: "Bidang Hubungan Masyarakat", jabatan: "Koordinator", nama: "Tohirin" },
  { bidang: "Bidang Hubungan Masyarakat", jabatan: "Anggota", nama: "Ketua RT 1 sd 18 dan 33" },
  { bidang: "Bidang Hubungan Masyarakat", jabatan: "Anggota", nama: "Shodiq" },
  { bidang: "Bidang Hubungan Masyarakat", jabatan: "Anggota", nama: "Minarto" },
  { bidang: "Bidang Hubungan Masyarakat", jabatan: "Anggota", nama: "Subhan" },
  { bidang: "Bidang Hubungan Masyarakat", jabatan: "Anggota", nama: "Kaseri" },

  // Bidang Kebersihan dan Pengembangan
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Koordinator", nama: "Anang" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "Suhendi" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "Agung" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "Iwan Purwanto" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "H. Taufiq" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "Khusoyi" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "M. Irfan" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "Taufan Fanani" },
  { bidang: "Bidang Kebersihan dan Pengembangan", jabatan: "Anggota", nama: "Abd. Rokim" },

  // Peribadatan, Dakwah dan Majlis Ta’lim
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Koordinator", nama: "Mucharror" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Yulianto" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "M. Irham" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Sigit" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Masruhan" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Faruq" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Rosyid" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Mulyadi" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Saiful Huda" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Basyirul Fuad" },
  { bidang: "Peribadatan, Dakwah dan Majlis Ta’lim", jabatan: "Anggota", nama: "Ust. Hasan" },

  // Bidang Keamanan dan Ketertiban
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Koordinator", nama: "Shofi" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "H. Muripan" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "H. Ja’far" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "Maskud" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "Bashori" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "M. Yahya" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "Sulton Hanafi" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "Fudin" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "Sahlan" },
  { bidang: "Bidang Keamanan dan Ketertiban", jabatan: "Anggota", nama: "Hari" },

  // Bidang Pemeliharaan dan Sarana Prasarana
  { bidang: "Bidang Sarana Prasarana", jabatan: "Anggota", nama: "Nidhom" },
  { bidang: "Bidang Sarana Prasarana", jabatan: "Anggota", nama: "Zainuri" },
  { bidang: "Bidang Sarana Prasarana", jabatan: "Anggota", nama: "Rokaid" },
  { bidang: "Bidang Sarana Prasarana", jabatan: "Anggota", nama: "Machrus" },
  { bidang: "Bidang Sarana Prasarana", jabatan: "Anggota", nama: "Ahmad Muhammad" },

  // Bidang Peringatan Hari Besar Islam (PBHI)
  { bidang: "Bidang PBHI", jabatan: "Koordinator", nama: "Toyib" },
  { bidang: "Bidang PBHI", jabatan: "Anggota", nama: "Ketua Takmir Musholla" },
  { bidang: "Bidang PBHI", jabatan: "Anggota", nama: "Amrozi" },
  { bidang: "Bidang PBHI", jabatan: "Anggota", nama: "Syamsul Riasyad" },
  { bidang: "Bidang PBHI", jabatan: "Anggota", nama: "Nur Hasyim" },
  { bidang: "Bidang PBHI", jabatan: "Anggota", nama: "H. Agus Sutiono" },
  { bidang: "Bidang PBHI", jabatan: "Anggota", nama: "Lek Lu" },
  { bidang: "Bidang PBHI", jabatan: "Anggota", nama: "Abd Ghofur" },

  // Bidang Remaja Masjid
  { bidang: "Bidang Remaja Masjid", jabatan: "Koordinator", nama: "Dwi Yakub Alim" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Habib Syarif Hidayatulloh" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Ahmad Muhyiddin" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Syihab Zuhry Haqiqy" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Aditya" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Wahyu Putra" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Azhar" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Adam" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Khusni" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Aril" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Andre" },
  { bidang: "Bidang Remaja Masjid", jabatan: "Anggota", nama: "Zulfian" },

  // Lazis
  { bidang: "Lazis", jabatan: "Pengurus Lazis", nama: "Lazisnu Ranting Kloposepuluh" },
];

async function seed() {
  console.log("Menanam data pengurus DKM Baitul Maghfirah...");
  
  // Hapus data lama jika ada untuk idempotency
  await prisma.pengurus.deleteMany();

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    await prisma.pengurus.create({
      data: {
        nama: item.nama,
        jabatan: item.jabatan,
        bidang: item.bidang,
        nomorWa: "",
        urutan: i + 1,
      },
    });
  }

  const count = await prisma.pengurus.count();
  console.log(`Berhasil menanam ${count} pengurus ke database dev.db!`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
