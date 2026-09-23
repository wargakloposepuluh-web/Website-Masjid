"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuratPreview from "@/components/SuratPreview";
import {
  Send,
  Save,
  RotateCw,
  Calendar,
  MapPin,
  Clock,
  ListOrdered,
  FileCheck,
  CheckSquare,
  Square,
  AlertCircle,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  TEMPLATES_SURAT,
  JenisSuratKey,
  getTemplateSurat,
  getKodeJenisSurat,
} from "@/lib/templatesSurat";
import { parseIndoDateToYmd, formatYmdToIndoHariTanggal } from "@/lib/utils";

export interface SuratPenandatanganItem {
  id: string;
  nama: string;
  jabatan: string;
  ttdImageUrl?: string;
  pakaiTtd: boolean;
}

export default function BuatSuratKeluarPage() {
  const router = useRouter();
  const [setting, setSetting] = useState<any>(null);
  const [loadingSetting, setLoadingSetting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"identitas" | "isi" | "pengesahan">("identitas");

  // Format / Kategori Surat
  const [jenisSurat, setJenisSurat] = useState<JenisSuratKey>("undangan");

  // Form State
  const [nomorSurat, setNomorSurat] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lampiran, setLampiran] = useState("-");
  const [perihal, setPerihal] = useState("Undangan Rapat Pengurus & Evaluasi Program");
  const [tujuan, setTujuan] = useState("Yth. Segenap Pengurus Masjid Baitul Maghfirah");
  const [alamatTujuan, setAlamatTujuan] = useState("di Tempat");
  const [salamPembuka, setSalamPembuka] = useState("");
  const [kalimatPembuka, setKalimatPembuka] = useState("");
  const [isiSurat, setIsiSurat] = useState(
    "Sehubungan dengan akan diadakannya evaluasi program kerja dan rencana kegiatan dakwah, kami mengharapkan kehadiran Bapak/Ibu/Saudara/i dalam pertemuan yang insyaAllah akan diselenggarakan pada:"
  );

  // Detail Acara
  const [adaAcara, setAdaAcara] = useState(true);
  const [acaraHariTanggal, setAcaraHariTanggal] = useState("Sabtu, 19 September 2026");
  const [acaraWaktu, setAcaraWaktu] = useState("19.30 WIB (Ba'da Isya) s/d Selesai");
  const [acaraTempat, setAcaraTempat] = useState("Masjid Baitul Maghfirah");
  const [acaraAgenda, setAcaraAgenda] = useState("Rapat Koordinasi & Evaluasi Program Dakwah");

  const [kalimatPenutup, setKalimatPenutup] = useState(
    "Mengingat pentingnya agenda tersebut, kami sangat mengharapkan kehadiran Bapak/Ibu/Saudara/i tepat pada waktunya. Atas perhatian, kehadiran, dan kerja samanya, kami ucapkan terima kasih.\nJazakumullah khairan katsiran."
  );
  const [salamPenutup, setSalamPenutup] = useState("");
  const [tempatSurat, setTempatSurat] = useState("Sidoarjo");

  // Pengesahan
  const [namaPenandatangan, setNamaPenandatangan] = useState("");
  const [jabatanPenandatangan, setJabatanPenandatangan] = useState("");
  const [namaPenandatangan2, setNamaPenandatangan2] = useState("");
  const [jabatanPenandatangan2, setJabatanPenandatangan2] = useState("");

  const [penandatanganList, setPenandatanganList] = useState<SuratPenandatanganItem[]>([]);
  const [masterPenandatangan, setMasterPenandatangan] = useState<
    { id: string; nama: string; jabatan: string; ttdImageUrl?: string }[]
  >([]);

  const [pakaiTtd, setPakaiTtd] = useState(true);
  const [pakaiTtd2, setPakaiTtd2] = useState(true);
  const [pakaiStempel, setPakaiStempel] = useState(true);
  const [tembusan, setTembusan] = useState("");

  // Load Settings & Nomor Otomatis
  useEffect(() => {
    async function loadInitData() {
      try {
        const resSet = await fetch("/api/settings");
        const setData = await resSet.json();
        setSetting(setData);

        setSalamPembuka(setData.defaultSalamPembuka || "Assalamu'alaikum Warahmatullahi Wabarakatuh,");
        setKalimatPembuka(setData.defaultKalimatPembuka || "");
        setKalimatPenutup(setData.defaultKalimatPenutup || "");
        setSalamPenutup(setData.defaultSalamPenutup || "Wassalamu'alaikum Warahmatullahi Wabarakatuh,");
        setTempatSurat(setData.kotaSurat || "Jakarta");
        setNamaPenandatangan(setData.penandatanganNama || "H. Ahmad Syarifuddin, S.Ag.");
        setJabatanPenandatangan(setData.penandatanganJabatan || "Ketua Takmir");
        setNamaPenandatangan2(setData.penandatanganNama2 || "Ustadz Muhammad Rizqi, M.Pd.");
        setJabatanPenandatangan2(setData.penandatanganJabatan2 || "Sekretaris Takmir");

        // Parse master penandatangan dari pengaturan
        let masterList: any[] = [];
        if (setData.daftarPenandatangan) {
          try {
            masterList =
              typeof setData.daftarPenandatangan === "string"
                ? JSON.parse(setData.daftarPenandatangan)
                : setData.daftarPenandatangan;
          } catch (e) {
            console.error("Gagal parse daftarPenandatangan:", e);
          }
        }
        if (!Array.isArray(masterList) || masterList.length === 0) {
          masterList = [
            {
              id: "1",
              nama: setData.penandatanganNama || "H. Ahmad Syarifuddin, S.Ag.",
              jabatan: setData.penandatanganJabatan || "Ketua Takmir",
              ttdImageUrl: setData.ttdImageUrl || "",
            },
            {
              id: "2",
              nama: setData.penandatanganNama2 || "Ustadz Muhammad Rizqi, M.Pd.",
              jabatan: setData.penandatanganJabatan2 || "Sekretaris Takmir",
              ttdImageUrl: setData.ttdImage2Url || "",
            },
          ];
        }
        setMasterPenandatangan(masterList);

        // Pasang penandatangan awal untuk surat baru
        const initialList: SuratPenandatanganItem[] = masterList.slice(0, 2).map((m) => ({
          id: m.id || Date.now().toString(),
          nama: m.nama,
          jabatan: m.jabatan,
          ttdImageUrl: m.ttdImageUrl || "",
          pakaiTtd: true,
        }));
        setPenandatanganList(initialList);

        // Fetch nomor surat berikutnya dengan kode default UND dan tanggal hari ini
        const todayStr = new Date().toISOString().split("T")[0];
        const resNum = await fetch(
          `/api/surat-keluar/next-number?kode=UND&tanggal=${encodeURIComponent(todayStr)}`
        );
        const numData = await resNum.json();
        if (numData.formattedNomorSurat) {
          setNomorSurat(numData.formattedNomorSurat);
        }
      } catch (err) {
        console.error("Gagal memuat template surat:", err);
      } finally {
        setLoadingSetting(false);
      }
    }

    loadInitData();
  }, []);

  const refreshNomor = async (customKode?: string, customTanggal?: string) => {
    try {
      const kodeTarget = customKode || getKodeJenisSurat(jenisSurat);
      const tanggalTarget = customTanggal || tanggalSurat;
      const res = await fetch(
        `/api/surat-keluar/next-number?kode=${encodeURIComponent(
          kodeTarget
        )}&tanggal=${encodeURIComponent(tanggalTarget)}`
      );
      const data = await res.json();
      if (data.formattedNomorSurat) {
        setNomorSurat(data.formattedNomorSurat);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePilihJenisSurat = (id: JenisSuratKey) => {
    setJenisSurat(id);
    const tpl = getTemplateSurat(id);
    setPerihal(tpl.perihal);
    setLampiran(tpl.lampiran);
    setTujuan(tpl.tujuan);
    setAlamatTujuan(tpl.alamatTujuan);
    setIsiSurat(tpl.isiSurat);
    setAdaAcara(tpl.adaAcara);
    setAcaraHariTanggal(tpl.acaraHariTanggal);
    setAcaraWaktu(tpl.acaraWaktu);
    setAcaraTempat(tpl.acaraTempat);
    setAcaraAgenda(tpl.acaraAgenda);
    setKalimatPenutup(tpl.kalimatPenutup);

    // Otomatis sesuaikan kode jenis surat pada nomor surat
    if (nomorSurat) {
      const updatedNomor = nomorSurat.replace(
        /(\/PM-BM\/)[A-Z0-9]+(\/\d{2}\/\d{4})/i,
        `$1${tpl.kode}$2`
      );
      if (updatedNomor !== nomorSurat) {
        setNomorSurat(updatedNomor);
      } else {
        refreshNomor(tpl.kode);
      }
    } else {
      refreshNomor(tpl.kode);
    }
  };

  const handleTanggalSuratChange = (newDateStr: string) => {
    setTanggalSurat(newDateStr);
    if (!nomorSurat || !newDateStr) return;
    const parts = newDateStr.split("-");
    if (parts.length === 3) {
      const mm = parts[1];
      const yyyy = parts[0];
      const updatedNomor = nomorSurat.replace(
        /(\/PM-BM\/[A-Z0-9]+\/)\d{2}\/\d{4}/i,
        `$1${mm}/${yyyy}`
      );
      if (updatedNomor !== nomorSurat) {
        setNomorSurat(updatedNomor);
      }
    }
  };

  const handleTambahDariMaster = (masterItem: {
    id: string;
    nama: string;
    jabatan: string;
    ttdImageUrl?: string;
  }) => {
    const newItem: SuratPenandatanganItem = {
      id: Date.now().toString(),
      nama: masterItem.nama,
      jabatan: masterItem.jabatan,
      ttdImageUrl: masterItem.ttdImageUrl || "",
      pakaiTtd: true,
    };
    setPenandatanganList([...penandatanganList, newItem]);
  };

  const handleTambahKustom = () => {
    const newIdx = penandatanganList.length + 1;
    const newItem: SuratPenandatanganItem = {
      id: Date.now().toString(),
      nama: "",
      jabatan: `Pejabat ${newIdx}`,
      ttdImageUrl: "",
      pakaiTtd: true,
    };
    setPenandatanganList([...penandatanganList, newItem]);
  };

  const handleHapusPenandatangan = (index: number) => {
    const updated = penandatanganList.filter((_, idx) => idx !== index);
    setPenandatanganList(updated);
  };

  const handleUpdatePenandatangan = (
    index: number,
    key: keyof SuratPenandatanganItem,
    value: any
  ) => {
    const updated = [...penandatanganList];
    updated[index] = { ...updated[index], [key]: value };
    setPenandatanganList(updated);
  };

  const handleSimpan = async (statusSurat: "Final" | "Draft" = "Final") => {
    if (!perihal.trim() || !tujuan.trim() || !isiSurat.trim()) {
      alert("Mohon lengkapi Perihal, Penerima, dan Isi Surat.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/surat-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorSurat,
          tanggalSurat,
          lampiran,
          perihal,
          tujuan,
          alamatTujuan,
          salamPembuka,
          kalimatPembuka,
          isiSurat,
          adaAcara,
          acaraHariTanggal,
          acaraWaktu,
          acaraTempat,
          acaraAgenda,
          kalimatPenutup,
          salamPenutup,
          tempatSurat,
          namaPenandatangan: penandatanganList[0]?.nama || namaPenandatangan,
          jabatanPenandatangan: penandatanganList[0]?.jabatan || jabatanPenandatangan,
          namaPenandatangan2: penandatanganList[1]?.nama || null,
          jabatanPenandatangan2: penandatanganList[1]?.jabatan || null,
          pakaiTtd: penandatanganList[0] ? penandatanganList[0].pakaiTtd : pakaiTtd,
          pakaiTtd2: penandatanganList[1] ? penandatanganList[1].pakaiTtd : false,
          penandatanganList: JSON.stringify(penandatanganList),
          pakaiStempel,
          tembusan,
          status: statusSurat,
          incrementCounter: true, // update nomor urut counter
        }),
      });

      if (res.ok) {
        alert("Surat keluar berhasil disimpan ke arsip!");
        router.push("/surat-keluar");
      } else {
        const err = await res.json();
        alert("Gagal menyimpan surat: " + (err.error || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan saat menyimpan surat.");
    } finally {
      setSaving(false);
    }
  };

  const currentSuratData = {
    nomorSurat,
    tanggalSurat,
    lampiran,
    perihal,
    tujuan,
    alamatTujuan,
    salamPembuka,
    kalimatPembuka,
    isiSurat,
    adaAcara,
    acaraHariTanggal,
    acaraWaktu,
    acaraTempat,
    acaraAgenda,
    kalimatPenutup,
    salamPenutup,
    tempatSurat,
    namaPenandatangan: penandatanganList[0]?.nama || namaPenandatangan,
    jabatanPenandatangan: penandatanganList[0]?.jabatan || jabatanPenandatangan,
    namaPenandatangan2: penandatanganList[1]?.nama || "",
    jabatanPenandatangan2: penandatanganList[1]?.jabatan || "",
    pakaiTtd: penandatanganList[0] ? penandatanganList[0].pakaiTtd : pakaiTtd,
    pakaiTtd2: penandatanganList[1] ? penandatanganList[1].pakaiTtd : false,
    pakaiStempel,
    tembusan,
    penandatanganList,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1550px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Generator Surat Keluar Otomatis
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Isi formulir dan otomatis dirangkai pada lembar kerja F4.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSimpan("Final")}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan ke Arsip"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Input (Left) & Live Preview F4 (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORM PANEL (KIRI - 5 COLS) - SISTEM 3 TAB TANPA SCROLL */}
        <div className="no-print lg:col-span-5 bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          {/* TAB NAVIGATION BAR */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("identitas")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${activeTab === "identitas"
                ? "bg-white text-emerald-800 shadow-sm border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span></span>
              <span className="truncate">1. Identitas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("isi")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${activeTab === "isi"
                ? "bg-white text-emerald-800 shadow-sm border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span></span>
              <span className="truncate">2. Isi & Acara</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pengesahan")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${activeTab === "pengesahan"
                ? "bg-white text-emerald-800 shadow-sm border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span></span>
              <span className="truncate">3. Pengesahan</span>
            </button>
          </div>

          {/* TAB 1: IDENTITAS & PENERIMA */}
          {activeTab === "identitas" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  1. Identitas Surat & Penerima
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Langkah 1 dari 3</span>
              </div>

              {/* Pilihan Jenis / Format Surat Keluar */}
              <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Pilih Format / Kategori Surat:</span>
                  </label>
                  <span className="text-[10px] text-orange-700 bg-orange-100 font-bold px-2.5 py-0.5 rounded-full">
                    {TEMPLATES_SURAT.find((t) => t.id === jenisSurat)?.nama}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {TEMPLATES_SURAT.map((item) => {
                    const isSelected = jenisSurat === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePilihJenisSurat(item.id)}
                        className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition border ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300"
                        }`}
                        title={item.deskripsi}
                      >
                        <span className="text-sm">{item.emoji}</span>
                        <span className="truncate text-[11px]">{item.badge}</span>
                        <span
                          className={`text-[9px] px-1 rounded font-mono font-bold ${
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.kode}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  {TEMPLATES_SURAT.find((t) => t.id === jenisSurat)?.deskripsi}
                </p>
              </div>

              {/* Nomor Surat & Refresh */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nomor Surat (Otomatis)
                  </label>
                  <button
                    type="button"
                    onClick={() => refreshNomor()}
                    className="text-[11px] text-emerald-600 hover:text-orange-600 hover:underline flex items-center gap-1 font-semibold"
                    title="Generate ulang nomor surat berdasarkan template"
                  >
                    <RotateCw className="w-3 h-3" /> Refresh Nomor
                  </button>
                </div>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Perihal & Lampiran Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Perihal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={perihal}
                    onChange={(e) => setPerihal(e.target.value)}
                    placeholder="Contoh: Undangan Rapat / Permohonan Bantuan"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lampiran
                  </label>
                  <input
                    type="text"
                    value={lampiran}
                    onChange={(e) => setLampiran(e.target.value)}
                    placeholder="-"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Penerima / Tujuan & Alamat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kepada : Tujuan / Penerima <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    placeholder="Contoh:&#10;1. Pengurus Harian&#10;2. Bidang Ibadah&#10;3. dst."
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat / Keterangan
                  </label>
                  <input
                    type="text"
                    value={alamatTujuan}
                    onChange={(e) => setAlamatTujuan(e.target.value)}
                    placeholder="di, Tempat"
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Tanggal & Tempat Surat */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Surat
                  </label>
                  <input
                    type="date"
                    value={tanggalSurat}
                    onChange={(e) => handleTanggalSuratChange(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat / Kota Surat
                  </label>
                  <input
                    type="text"
                    value={tempatSurat}
                    onChange={(e) => setTempatSurat(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Tombol Lanjut ke Tab 2 */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("isi")}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow-sm transition active:scale-95"
                >
                  <span>Lanjut: Isi & Acara</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ISI & ACARA */}
          {activeTab === "isi" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-emerald-600" />
                  2. Isi Surat & Detail Acara
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Langkah 2 dari 3</span>
              </div>

              {/* Isi / Pesan Utama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Isi / Pesan Utama Surat <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={isiSurat}
                  onChange={(e) => setIsiSurat(e.target.value)}
                  placeholder="Tuliskan maksud atau pesan utama surat di sini..."
                  className="w-full text-xs p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition leading-relaxed"
                />
              </div>

              {/* Toggle Rincian Acara */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdaAcara(!adaAcara)}
                      className="text-emerald-600"
                    >
                      {adaAcara ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <label
                      onClick={() => setAdaAcara(!adaAcara)}
                      className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                    >
                      {jenisSurat === "tugas"
                        ? "Sertakan Rincian Waktu & Lokasi Tugas (Opsional)"
                        : jenisSurat === "pemberitahuan"
                        ? "Sertakan Rincian Waktu & Lokasi Kegiatan (Opsional)"
                        : jenisSurat === "permohonan"
                        ? "Sertakan Rincian Acara / Jadwal Kegiatan (Jika Ada)"
                        : "Sertakan Rincian Acara / Jadwal Kegiatan"}
                    </label>
                  </div>
                </div>

                {adaAcara && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-medium text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Hari / Tanggal
                        </label>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Pilih kalender otomatis terisi
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Pemilih Tanggal (Kalender) */}
                        <div className="relative shrink-0">
                          <input
                            type="date"
                            value={parseIndoDateToYmd(acaraHariTanggal)}
                            onChange={(e) => {
                              if (e.target.value) {
                                setAcaraHariTanggal(formatYmdToIndoHariTanggal(e.target.value));
                              }
                            }}
                            className="text-xs px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-950 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition shadow-sm"
                            title="Klik untuk memilih tanggal dari kalender"
                          />
                        </div>

                        {/* Input Teks Format Hari & Tanggal */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={acaraHariTanggal}
                            onChange={(e) => setAcaraHariTanggal(e.target.value)}
                            placeholder="Contoh: Sabtu, 19 September 2026"
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800 transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" /> Waktu Pelaksanaan
                      </label>
                      <input
                        type="text"
                        value={acaraWaktu}
                        onChange={(e) => setAcaraWaktu(e.target.value)}
                        placeholder="Contoh: 19.30 WIB s/d Selesai"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" /> Tempat Kegiatan
                      </label>
                      <input
                        type="text"
                        value={acaraTempat}
                        onChange={(e) => setAcaraTempat(e.target.value)}
                        placeholder="Masjid Baitul Maghfirah"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                        <ListOrdered className="w-3 h-3 text-emerald-600" />{" "}
                        {jenisSurat === "tugas" ? "Agenda / Amanah Penugasan" : "Agenda / Acara"}
                      </label>
                      <textarea
                        rows={2}
                        value={acaraAgenda}
                        onChange={(e) => setAcaraAgenda(e.target.value)}
                        placeholder={
                          jenisSurat === "tugas"
                            ? "Contoh: Pelatihan Manajemen Kemakmuran Masjid"
                            : jenisSurat === "pemberitahuan"
                            ? "Contoh: Kerja Bakti Kebersihan Lingkungan Masjid"
                            : "Contoh: Rapat Koordinasi & Evaluasi Program Dakwah"
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Navigasi Tab 2 */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("identitas")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition"
                >
                  <span>⬅</span>
                  <span>1. Identitas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pengesahan")}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow-sm transition active:scale-95"
                >
                  <span>Lanjut: Pengesahan</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PENGESAHAN & TANDA TANGAN */}
          {activeTab === "pengesahan" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  3. Pengesahan (Tanda Tangan & Cap)
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Langkah 3 dari 3</span>
              </div>

              {/* Checklist Global: Cap Stempel */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pakaiStempel}
                    onChange={(e) => setPakaiStempel(e.target.checked)}
                    className="rounded text-orange-500 focus:ring-orange-400 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">
                    Bubuhkan Cap Stempel Resmi
                  </span>
                </label>
                <span className="text-[11px] text-slate-500">
                  (Posisi stempel dapat diatur di menu Pengaturan Surat)
                </span>
              </div>

              {/* DAFTAR PENANDATANGAN AKTIF PADA SURAT INI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Penandatangan Surat ({penandatanganList.length} orang)
                  </label>
                  <button
                    type="button"
                    onClick={handleTambahKustom}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Manual
                  </button>
                </div>

                {/* Kartu per Penandatangan */}
                {penandatanganList.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {index === 0
                            ? "Penandatangan 1 (Utama)"
                            : index === 1
                            ? "Penandatangan 2"
                            : `Penandatangan ${index + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.pakaiTtd}
                            onChange={(e) =>
                              handleUpdatePenandatangan(index, "pakaiTtd", e.target.checked)
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-[11px] text-slate-600 font-medium">
                            Scan TTD
                          </span>
                        </label>

                        {penandatanganList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleHapusPenandatangan(index)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                            title="Hapus penandatangan dari surat ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                          Nama Lengkap & Gelar
                        </label>
                        <input
                          type="text"
                          value={item.nama}
                          onChange={(e) =>
                            handleUpdatePenandatangan(index, "nama", e.target.value)
                          }
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                          Jabatan
                        </label>
                        <input
                          type="text"
                          value={item.jabatan}
                          onChange={(e) =>
                            handleUpdatePenandatangan(index, "jabatan", e.target.value)
                          }
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* OPSI PENAMBAHAN PENANDATANGAN SESUAI PENGATURAN SURAT */}
                {masterPenandatangan.length > 0 && (
                  <div className="mt-3 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                    <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                      Pilihan Penandatangan dari Pengaturan Surat:
                    </p>
                    <p className="text-[10px] text-emerald-700/90 leading-tight">
                      Klik salah satu pejabat di bawah ini untuk menambahkannya langsung ke surat:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {masterPenandatangan.map((m) => {
                        const isAlreadyAdded = penandatanganList.some(
                          (p) =>
                            p.nama.trim().toLowerCase() === m.nama.trim().toLowerCase() &&
                            p.jabatan.trim().toLowerCase() === m.jabatan.trim().toLowerCase()
                        );
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleTambahDariMaster(m)}
                            disabled={isAlreadyAdded}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
                              isAlreadyAdded
                                ? "bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-sm"
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>
                              {m.nama || "Tanpa Nama"} ({m.jabatan || "Pejabat"})
                            </span>
                            {isAlreadyAdded && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                (Terpasang)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Opsi Tambahan (Accordion) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
                >
                  <span>Opsi Tambahan (Tembusan, Pembuka, Penutup Kustom)</span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2 space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Kalimat Pembuka (Bisa diubah jika perlu)
                      </label>
                      <textarea
                        rows={2}
                        value={kalimatPembuka}
                        onChange={(e) => setKalimatPembuka(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Kalimat Penutup (Bisa diubah jika perlu)
                      </label>
                      <textarea
                        rows={2}
                        value={kalimatPenutup}
                        onChange={(e) => setKalimatPenutup(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Tembusan Surat (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        value={tembusan}
                        onChange={(e) => setTembusan(e.target.value)}
                        placeholder="1. Pembina Masjid&#10;2. Arsip"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Aksi Tab 3: Kembali & Simpan */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("isi")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition"
                >
                  <span>⬅</span>
                  <span>2. Isi & Acara</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimpan("Final")}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Menyimpan..." : "Simpan Surat"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LIVE PREVIEW PANEL (KANAN - 7 COLS) */}
        <div className="lg:col-span-7 bg-slate-200/35 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center print:bg-transparent print:p-0 print:border-none print:shadow-none print:w-full print:block">
          <SuratPreview
            surat={currentSuratData}
            setting={setting || {}}
          />
        </div>
      </div>
    </div>
  );
}
