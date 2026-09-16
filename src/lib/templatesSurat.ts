export type JenisSuratKey =
  | "undangan"
  | "pemberitahuan"
  | "permohonan"
  | "tugas"
  | "berita_acara";

export interface TemplateSurat {
  id: JenisSuratKey;
  kode: string; // UND, PBH, PMH, TGS, BAC
  nama: string;
  emoji: string;
  badge: string;
  deskripsi: string;
  perihal: string;
  lampiran: string;
  tujuan: string;
  alamatTujuan: string;
  salamPembuka: string;
  kalimatPembuka: string;
  isiSurat: string;
  adaAcara: boolean;
  acaraHariTanggal: string;
  acaraWaktu: string;
  acaraTempat: string;
  acaraAgenda: string;
  kalimatPenutup: string;
  salamPenutup: string;
}

export const TEMPLATES_SURAT: TemplateSurat[] = [
  {
    id: "undangan",
    kode: "UND",
    nama: "Surat Undangan",
    emoji: "✉️",
    badge: "Undangan",
    deskripsi: "Undangan rapat pengurus, kajian, peringatan PHBI, atau musyawarah bersama.",
    perihal: "Undangan Rapat Pengurus & Evaluasi Program",
    lampiran: "-",
    tujuan: "Segenap Pengurus Masjid Baitul Maghfirah",
    alamatTujuan: "di, Tempat",
    salamPembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
    kalimatPembuka: "",
    isiSurat:
      "Sehubungan dengan akan diadakannya evaluasi program kerja dan rencana kegiatan dakwah, kami mengharapkan kehadiran Bapak/Ibu/Saudara/i dalam pertemuan yang insyaAllah akan diselenggarakan pada:",
    adaAcara: true,
    acaraHariTanggal: "Sabtu, 19 September 2026",
    acaraWaktu: "19.30 WIB (Ba'da Isya) s/d Selesai",
    acaraTempat: "Masjid Baitul Maghfirah",
    acaraAgenda: "Rapat Koordinasi & Evaluasi Program Dakwah",
    kalimatPenutup:
      "Mengingat pentingnya agenda tersebut, kami sangat mengharapkan kehadiran Bapak/Ibu/Saudara/i tepat pada waktunya. Atas perhatian, kehadiran, dan kerja samanya, kami ucapkan terima kasih.\nJazakumullah khairan katsiran.",
    salamPenutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh,",
  },
  {
    id: "pemberitahuan",
    kode: "PBH",
    nama: "Surat Pemberitahuan",
    emoji: "📢",
    badge: "Pemberitahuan",
    deskripsi: "Maklumat kegiatan, kerja bakti, pengumuman ibadah, atau informasi kepada jamaah & warga.",
    perihal: "Pemberitahuan Pelaksanaan Kerja Bakti & Pemeliharaan Sarana",
    lampiran: "-",
    tujuan: "Seluruh Jamaah & Warga Sekitar Masjid Baitul Maghfirah",
    alamatTujuan: "di, Tempat",
    salamPembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
    kalimatPembuka: "",
    isiSurat:
      "Dengan ini kami beritahukan kepada seluruh Jamaah dan warga masyarakat, bahwa dalam rangka menjaga kebersihan, kenyamanan, serta kesiapan fasilitas peribadatan, Pengurus Takmir Masjid Baitul Maghfirah akan menyelenggarakan kegiatan Kerja Bakti Massal yang insyaAllah akan dilaksanakan pada:",
    adaAcara: true,
    acaraHariTanggal: "Ahad, 20 September 2026",
    acaraWaktu: "07.00 WIB s/d Selesai",
    acaraTempat: "Lingkungan Masjid Baitul Maghfirah",
    acaraAgenda: "Kerja Bakti Kebersihan Lingkungan & Perawatan Sarana Masjid",
    kalimatPenutup:
      "Demikian surat pemberitahuan ini kami sampaikan agar menjadi maklum dan perhatian bersama. Atas perhatian, partisipasi aktif, dan kerja sama segenap jamaah serta warga, kami haturkan terima kasih yang sebesar-besarnya.\nJazakumullah khairan katsiran.",
    salamPenutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh,",
  },
  {
    id: "permohonan",
    kode: "PMH",
    nama: "Surat Permohonan",
    emoji: "📝",
    badge: "Permohonan",
    deskripsi: "Permohonan bantuan dana, peminjaman sarana/tempat, narasumber kajian, rekomendasi, dll.",
    perihal: "Permohonan Bantuan Dana Renovasi Tempat Wudhu & Sanitasi",
    lampiran: "1 (Satu) Berkas Proposal",
    tujuan: "Bapak/Ibu Para Dermawan & Donatur Kaum Muslimin",
    alamatTujuan: "di, Tempat",
    salamPembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
    kalimatPembuka: "",
    isiSurat:
      "Dalam rangka meningkatkan kenyamanan ibadah serta memfasilitasi kebutuhan jamaah yang terus bertambah, Pengurus Takmir Masjid Baitul Maghfirah berencana melakukan perbaikan dan renovasi sarana tempat wudhu serta fasilitas sanitasi masjid.\n\nSehubungan dengan hal tersebut dan demi kelancaran pembangunan sarana keumatan ini, kami dengan segala kerendahan hati mengajukan permohonan dukungan dan bantuan dana infaq/sedekah kepada Bapak/Ibu para dermawan.",
    adaAcara: false,
    acaraHariTanggal: "",
    acaraWaktu: "",
    acaraTempat: "",
    acaraAgenda: "",
    kalimatPenutup:
      "Demikian surat permohonan ini kami sampaikan. Besar harapan kami atas perkenan dan partisipasi Bapak/Ibu para dermawan dalam amal jariyah ini. Semoga Allah SWT senantiasa membalas segala kebaikan dengan pahala yang berlipat ganda. Atas perhatian dan bantuannya, kami ucapkan terima kasih.\nJazakumullah khairan katsiran.",
    salamPenutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh,",
  },
  {
    id: "tugas",
    kode: "TGS",
    nama: "Surat Tugas",
    emoji: "📋",
    badge: "Surat Tugas",
    deskripsi: "Mandat atau penugasan resmi bagi pengurus/panitia/petugas untuk menjalankan tugas atau menghadiri forum.",
    perihal: "Surat Tugas / Mandat Utusan",
    lampiran: "-",
    tujuan: "Yang Bersangkutan / Pihak Terkait",
    alamatTujuan: "di, Tempat",
    salamPembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
    kalimatPembuka: "",
    isiSurat:
      "Yang bertanda tangan di bawah ini, Pengurus Takmir Masjid Baitul Maghfirah, dengan ini memberikan tugas dan amanah kepada:\n\nNama / Jabatan : Ustadz Ahmad Fauzi, S.Pd.I (Koordinator Bidang Dakwah)\nTugas Utama   : Menjadi Delegasi / Utusan Resmi Pengurus Masjid Baitul Maghfirah\n\nUntuk menghadiri dan mengikuti rangkaian agenda yang insyaAllah diselenggarakan pada:",
    adaAcara: true,
    acaraHariTanggal: "Sabtu - Ahad, 26 - 27 September 2026",
    acaraWaktu: "08.30 WIB s/d Selesai",
    acaraTempat: "Gedung Balai Diklat Keagamaan / BKM",
    acaraAgenda: "Bimbingan Teknis & Pelatihan Manajemen Kemakmuran Masjid",
    kalimatPenutup:
      "Demikian Surat Tugas ini dibuat dan diberikan kepada yang bersangkutan untuk dapat dilaksanakan dengan penuh keikhlasan dan rasa tanggung jawab. Atas perhatian serta kerja samanya, kami sampaikan terima kasih.\nJazakumullah khairan katsiran.",
    salamPenutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh,",
  },
  {
    id: "berita_acara",
    kode: "BAC",
    nama: "Berita Acara",
    emoji: "📜",
    badge: "Berita Acara",
    deskripsi: "Berita acara serah terima, hasil musyawarah mufakat, pemilihan pengurus, atau verifikasi kas/aset masjid.",
    perihal: "Berita Acara Musyawarah & Serah Terima Amanah",
    lampiran: "1 (Satu) Berkas Lampiran",
    tujuan: "Segenap Pengurus & Jamaah Masjid Baitul Maghfirah",
    alamatTujuan: "di, Tempat",
    salamPembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
    kalimatPembuka: "",
    isiSurat:
      "Pada hari ini telah diselenggarakan musyawarah mufakat dan penandatanganan Berita Acara terkait pelaksanaan program kemakmuran serta pertanggungjawaban amanah kepengurusan Masjid Baitul Maghfirah, dengan keterangan agenda sebagai berikut:",
    adaAcara: true,
    acaraHariTanggal: "Sabtu, 19 September 2026",
    acaraWaktu: "20.00 WIB s/d Selesai",
    acaraTempat: "Masjid Baitul Maghfirah",
    acaraAgenda: "Penandatanganan Berita Acara Hasil Musyawarah & Serah Terima",
    kalimatPenutup:
      "Demikian Berita Acara ini dibuat dengan sebenarnya dalam keadaan sadar tanpa paksaan dari pihak manapun, untuk dapat dipergunakan sebagaimana mestinya.\nJazakumullah khairan katsiran.",
    salamPenutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh,",
  },
];

export function getTemplateSurat(id: JenisSuratKey): TemplateSurat {
  const found = TEMPLATES_SURAT.find((t) => t.id === id);
  return found || TEMPLATES_SURAT[0];
}

export function getKodeJenisSurat(id: JenisSuratKey): string {
  const tpl = getTemplateSurat(id);
  return tpl.kode;
}

export function detectJenisSurat(perihalText: string): JenisSuratKey {
  const p = (perihalText || "").toLowerCase();
  if (p.includes("berita acara") || p.includes("serah terima") || p.includes("/bac/")) return "berita_acara";
  if (p.includes("pemberitahuan") || p.includes("/pbh/")) return "pemberitahuan";
  if (p.includes("tugas") || p.includes("mandat") || p.includes("penugasan") || p.includes("/tgs/")) return "tugas";
  if (p.includes("permohonan") || p.includes("bantuan") || p.includes("proposal") || p.includes("/pmh/")) return "permohonan";
  return "undangan";
}
