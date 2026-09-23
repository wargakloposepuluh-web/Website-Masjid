"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  FileText,
  Building2,
  Stamp,
  Type,
  Layout,
  RefreshCw,
  MessageSquare,
  QrCode,
  Tv,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { generateFormattedNomorSurat } from "@/lib/utils";
import WhatsAppTab from "@/components/WhatsAppTab";

export interface PenandatanganItem {
  id: string;
  nama: string;
  jabatan: string;
  ttdImageUrl?: string;
}

export default function PengaturanTemplatePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "margin" | "kop" | "nomor" | "teks" | "pengesahan" | "whatsapp" | "qris"
  >("margin");

  // State settings
  const [namaOrganisasi, setNamaOrganisasi] = useState("");
  const [alamatOrganisasi, setAlamatOrganisasi] = useState("");
  const [kontakOrganisasi, setKontakOrganisasi] = useState("");
  const [kotaSurat, setKotaSurat] = useState("Jakarta");

  const [kopType, setKopType] = useState("text");
  const [kopImageUrl, setKopImageUrl] = useState("");
  const [logoKiriUrl, setLogoKiriUrl] = useState("");
  const [logoKananUrl, setLogoKananUrl] = useState("");
  const [garisKop, setGarisKop] = useState(true);

  const [marginTop, setMarginTop] = useState(2.0);
  const [marginBottom, setMarginBottom] = useState(2.0);
  const [marginLeft, setMarginLeft] = useState(2.5);
  const [marginRight, setMarginRight] = useState(2.0);
  const [fontFamily, setFontFamily] = useState("Times New Roman");
  const [fontSize, setFontSize] = useState(12);
  const [lineHeight, setLineHeight] = useState(1.35);
  const [paragrafSpacing, setParagrafSpacing] = useState(0.8);

  const [formatNomorSurat, setFormatNomorSurat] = useState(
    "{nomor}/PM-BM/{kode}/{bulan}/{tahun}"
  );

  const [defaultSalamPembuka, setDefaultSalamPembuka] = useState("");
  const [defaultKalimatPembuka, setDefaultKalimatPembuka] = useState("");
  const [defaultKalimatPenutup, setDefaultKalimatPenutup] = useState("");
  const [defaultSalamPenutup, setDefaultSalamPenutup] = useState("");

  const [penandatanganNama, setPenandatanganNama] = useState("");
  const [penandatanganJabatan, setPenandatanganJabatan] = useState("");
  const [penandatanganNama2, setPenandatanganNama2] = useState("");
  const [penandatanganJabatan2, setPenandatanganJabatan2] = useState("");
  const [daftarPenandatangan, setDaftarPenandatangan] = useState<PenandatanganItem[]>([]);

  const [ttdImageUrl, setTtdImageUrl] = useState("");
  const [ttdImage2Url, setTtdImage2Url] = useState("");
  const [stempelImageUrl, setStempelImageUrl] = useState("");

  const [stempelPosisiX, setStempelPosisiX] = useState(-25);
  const [stempelPosisiY, setStempelPosisiY] = useState(-15);
  const [stempelUkuran, setStempelUkuran] = useState(105);
  const [stempelOpacity, setStempelOpacity] = useState(0.85);

  // State QRIS TV Display
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [qrisBank, setQrisBank] = useState("Bank Syariah Indonesia (BSI)");
  const [qrisNama, setQrisNama] = useState("Masjid Baitul Maghfirah");
  const [qrisNmid, setQrisNmid] = useState("");
  const [qrisRekening, setQrisRekening] = useState("");
  const [qrisKeterangan, setQrisKeterangan] = useState("Infaq & Shodaqoh Digital");

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setNamaOrganisasi(data.namaOrganisasi || "");
        setAlamatOrganisasi(data.alamatOrganisasi || "");
        setKontakOrganisasi(data.kontakOrganisasi || "");
        setKotaSurat(data.kotaSurat || "Jakarta");
        setKopType(data.kopType || "text");
        setKopImageUrl(data.kopImageUrl || "");
        setLogoKiriUrl(data.logoKiriUrl || "");
        setLogoKananUrl(data.logoKananUrl || "");
        setGarisKop(data.garisKop !== false);
        setMarginTop(data.marginTop ?? 2.0);
        setMarginBottom(data.marginBottom ?? 2.0);
        setMarginLeft(data.marginLeft ?? 2.5);
        setMarginRight(data.marginRight ?? 2.0);
        setFontFamily(data.fontFamily || "Times New Roman");
        setFontSize(data.fontSize ?? 12);
        lineHeight && setLineHeight(data.lineHeight ?? 1.35);
        setParagrafSpacing(data.paragrafSpacing ?? 0.8);
        setFormatNomorSurat(
          data.formatNomorSurat || "{nomor}/PM-BM/{kode}/{bulan}/{tahun}"
        );
        setDefaultSalamPembuka(data.defaultSalamPembuka || "");
        setDefaultKalimatPembuka(data.defaultKalimatPembuka || "");
        setDefaultKalimatPenutup(data.defaultKalimatPenutup || "");
        setDefaultSalamPenutup(data.defaultSalamPenutup || "");
        setPenandatanganNama(data.penandatanganNama || "");
        setPenandatanganJabatan(data.penandatanganJabatan || "");
        setPenandatanganNama2(data.penandatanganNama2 || "");
        setPenandatanganJabatan2(data.penandatanganJabatan2 || "");
        setTtdImageUrl(data.ttdImageUrl || "");
        setTtdImage2Url(data.ttdImage2Url || "");

        // Muat daftar penandatangan dinamis
        let list: PenandatanganItem[] = [];
        if (data.daftarPenandatangan) {
          try {
            list = typeof data.daftarPenandatangan === "string"
              ? JSON.parse(data.daftarPenandatangan)
              : data.daftarPenandatangan;
          } catch (e) {
            console.error("Gagal parse daftarPenandatangan:", e);
          }
        }
        if (!Array.isArray(list) || list.length === 0) {
          list = [
            {
              id: "1",
              nama: data.penandatanganNama || "H. Ahmad Syarifuddin, S.Ag.",
              jabatan: data.penandatanganJabatan || "Ketua Takmir Masjid",
              ttdImageUrl: data.ttdImageUrl || "",
            },
            {
              id: "2",
              nama: data.penandatanganNama2 || "Ustadz Muhammad Rizqi, M.Pd.",
              jabatan: data.penandatanganJabatan2 || "Sekretaris Takmir",
              ttdImageUrl: data.ttdImage2Url || "",
            },
          ];
        }
        setDaftarPenandatangan(list);
        setStempelImageUrl(data.stempelImageUrl || "");
        setStempelPosisiX(data.stempelPosisiX ?? -25);
        setStempelPosisiY(data.stempelPosisiY ?? -15);
        setStempelUkuran(data.stempelUkuran ?? 105);
        setStempelOpacity(data.stempelOpacity ?? 0.85);
        setQrisImageUrl(data.qrisImageUrl || "");
        setQrisBank(data.qrisBank || "Bank Syariah Indonesia (BSI)");
        setQrisNama(data.qrisNama || "Masjid Baitul Maghfirah");
        setQrisNmid(data.qrisNmid || "");
        setQrisRekening(data.qrisRekening || "");
        setQrisKeterangan(data.qrisKeterangan || "Infaq & Shodaqoh Digital");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setter(data.url);
      } else {
        alert("Gagal mengunggah gambar");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan");
    } finally {
      setUploadingField(null);
    }
  };

  const handleTambahPenandatangan = () => {
    const newIdx = daftarPenandatangan.length + 1;
    const newItem: PenandatanganItem = {
      id: Date.now().toString(),
      nama: "",
      jabatan: newIdx === 3 ? "Bendahara" : `Pejabat ${newIdx}`,
      ttdImageUrl: "",
    };
    setDaftarPenandatangan([...daftarPenandatangan, newItem]);
  };

  const handleHapusPenandatangan = (index: number) => {
    if (daftarPenandatangan.length <= 1) {
      alert("Minimal harus ada 1 penandatangan");
      return;
    }
    const updated = daftarPenandatangan.filter((_, idx) => idx !== index);
    setDaftarPenandatangan(updated);
  };

  const handleUpdatePenandatangan = (
    index: number,
    key: keyof PenandatanganItem,
    value: string
  ) => {
    const updated = [...daftarPenandatangan];
    updated[index] = { ...updated[index], [key]: value };
    setDaftarPenandatangan(updated);
  };

  const handleSimpan = async () => {
    setSaving(true);
    try {
      const p1 = daftarPenandatangan[0];
      const p2 = daftarPenandatangan[1];

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaOrganisasi,
          alamatOrganisasi,
          kontakOrganisasi,
          kotaSurat,
          kopType,
          kopImageUrl,
          logoKiriUrl,
          logoKananUrl,
          garisKop,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          fontFamily,
          fontSize,
          lineHeight,
          paragrafSpacing,
          formatNomorSurat,
          defaultSalamPembuka,
          defaultKalimatPembuka,
          defaultKalimatPenutup,
          defaultSalamPenutup,
          penandatanganNama: p1 ? p1.nama : penandatanganNama,
          penandatanganJabatan: p1 ? p1.jabatan : penandatanganJabatan,
          penandatanganNama2: p2 ? p2.nama : penandatanganNama2,
          penandatanganJabatan2: p2 ? p2.jabatan : penandatanganJabatan2,
          ttdImageUrl: p1 ? p1.ttdImageUrl : ttdImageUrl,
          ttdImage2Url: p2 ? p2.ttdImageUrl : ttdImage2Url,
          daftarPenandatangan: JSON.stringify(daftarPenandatangan),
          stempelImageUrl,
          stempelPosisiX,
          stempelPosisiY,
          stempelUkuran,
          stempelOpacity,
          qrisImageUrl,
          qrisBank,
          qrisNama,
          qrisNmid,
          qrisRekening,
          qrisKeterangan,
        }),
      });

      if (res.ok) {
        alert("Pengaturan template berhasil disimpan!");
      } else {
        alert("Gagal menyimpan pengaturan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        Memuat konfigurasi template...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Pengaturan & Template Surat
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengaturan tata letak dokumen F4, desain kop, rumus nomor surat dinamis, tanda tangan, dan posisi stempel.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimpan}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "kop", label: "Kop Surat (Banner Gambar)", icon: Building2 },
          { id: "margin", label: "Margin F4 & Font", icon: Layout },
          { id: "nomor", label: "Format Nomor Dinamis", icon: Type },
          { id: "pengesahan", label: "Tanda Tangan & Stempel", icon: Stamp },
          { id: "teks", label: "Teks Standar", icon: FileText },
          { id: "whatsapp", label: "Koneksi WhatsApp", icon: MessageSquare },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${isActive
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "bg-white/50 backdrop-blur-sm text-slate-600 hover:bg-white/80 border border-white/70"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: KOP SURAT */}
      {activeTab === "kop" && (
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Desain Kop Surat (Banner Gambar)
            </h2>
            <p className="text-xs text-slate-500">
              Unggah file gambar kop surat utuh (JPG, PNG, atau SVG) yang telah Anda desain. Gambar ini akan otomatis dipasang di bagian paling atas lembar F4.
            </p>
          </div>

          {/* Area Upload Banner Gambar */}
          <div className="bg-slate-50/60 p-6 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase">
              Upload File Banner Kop Surat (JPG / PNG / SVG)
            </h3>
            <p className="text-xs text-slate-500">
              Disarankan gambar beresolusi tajam dengan rasio lebar penuh (standar lebar kertas F4: 215 mm / ~800–1200 px).
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileUpload(e, "kopBanner", setKopImageUrl)
                }
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#16171b] hover:file:bg-black file:text-white cursor-pointer transition"
              />
              {uploadingField === "kopBanner" && (
                <span className="text-xs text-emerald-600 animate-pulse font-medium">
                  Mengunggah gambar...
                </span>
              )}

              {kopImageUrl && (
                <button
                  type="button"
                  onClick={() => setKopImageUrl("")}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-3.5 py-1.5 border border-red-200 rounded-xl hover:bg-red-50 transition"
                >
                  Hapus Banner Kop
                </button>
              )}
            </div>

            {/* Pratinjau Gambar Banner */}
            <div className="mt-4 p-3 bg-white rounded-2xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Pratinjau Banner Kop yang Sedang Digunakan:
              </p>
              {kopImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={kopImageUrl}
                  alt="Pratinjau Kop Surat"
                  className="w-full max-h-40 object-contain rounded-xl border border-slate-100 bg-white"
                />
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  Belum ada banner kop surat yang diunggah.
                </div>
              )}
            </div>
          </div>

          {/* Identitas Pendukung Organisasi & Kota Asal Surat */}
          <div className="pt-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Identitas Organisasi & Kota Asal Surat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lembaga / Masjid (Ditampilkan di atas Tanda Tangan)
                </label>
                <input
                  type="text"
                  value={namaOrganisasi}
                  onChange={(e) => setNamaOrganisasi(e.target.value)}
                  placeholder="DEWAN KEMAKMURAN MASJID AL-MUHAJIRIN"
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kota Asal Surat (Untuk Baris Tanggal, misal: Jakarta, 10 September 2026)
                </label>
                <input
                  type="text"
                  value={kotaSurat}
                  onChange={(e) => setKotaSurat(e.target.value)}
                  placeholder="Jakarta"
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MARGIN & FONT */}
      {activeTab === "margin" && (
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Margin Lembar Kertas F4 (Folio) & Tipografi
            </h2>
            <p className="text-xs text-slate-500">
              Sesuaikan batas tepi kertas (dalam satuan cm) dan ukuran huruf cetak.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Margin Atas (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6"
                value={marginTop}
                onChange={(e) => setMarginTop(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Margin Bawah (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6"
                value={marginBottom}
                onChange={(e) => setMarginBottom(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Margin Kiri (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6"
                value={marginLeft}
                onChange={(e) => setMarginLeft(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Disarankan 2.5 - 3 cm (tempat jilid)
              </span>
            </div>

            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Margin Kanan (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6"
                value={marginRight}
                onChange={(e) => setMarginRight(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenis Font Surat
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="Times New Roman">Times New Roman (Standar Resmi)</option>
                <option value="Arial">Arial (Modern Bersih)</option>
                <option value="Georgia">Georgia (Elegan Klasik)</option>
                <option value="Segoe UI">Segoe UI / Sans</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ukuran Huruf Pokok (pt)
              </label>
              <input
                type="number"
                min="9"
                max="16"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standar: 11pt atau 12pt
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jarak Antar Baris (Line Spacing)
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="2.0"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standar: 1.3 - 1.4
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FORMAT NOMOR DINAMIS */}
      {activeTab === "nomor" && (
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Rumus Format Penomoran Surat Otomatis
            </h2>
            <p className="text-xs text-slate-500">
              Gunakan tag variabel di bawah untuk merancang struktur penomoran surat resmi lembaga Anda.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pola / Template Nomor Surat
              </label>
              <input
                type="text"
                value={formatNomorSurat}
                onChange={(e) => setFormatNomorSurat(e.target.value)}
                className="w-full font-mono text-sm px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            {/* Simulasi Live Nomor */}
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Hasil Simulasi Nomor Surat Saat Ini:
              </span>
              <div className="text-xl font-mono font-bold text-slate-900">
                {generateFormattedNomorSurat(formatNomorSurat, 1, new Date(), "UND")}
              </div>
            </div>

            {/* Petunjuk Tag Variabel */}
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <p className="font-semibold text-slate-700">Daftar Kode Tag:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-bold text-emerald-700">
                    &#123;nomor&#125;
                  </code>
                  <span>Nomor urut otomatis 3 digit (contoh: 001, 002)</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-bold text-emerald-700">
                    &#123;bulan&#125;
                  </code>
                  <span>Bulan dalam angka 2 digit (contoh: 08, 09)</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-bold text-emerald-700">
                    &#123;tahun&#125;
                  </code>
                  <span>Tahun 4 digit (contoh: 2026)</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-bold text-emerald-700">
                    &#123;romawi&#125;
                  </code>
                  <span>Bulan dalam angka Romawi (contoh: VIII, IX)</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2 bg-orange-50/80 p-2.5 rounded-xl border border-orange-200">
                  <code className="bg-white px-2 py-0.5 rounded-lg border border-orange-200 font-bold text-orange-600">
                    &#123;kode&#125;
                  </code>
                  <span className="text-[11px] text-slate-700 font-medium">
                    Kode Jenis Surat: <strong>UND</strong> (Undangan), <strong>PBH</strong> (Pemberitahuan), <strong>PMH</strong> (Permohonan), <strong>TGS</strong> (Penugasan), <strong>BAC</strong> (Berita Acara)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PENGESAHAN, TTD & STEMPEL */}
      {activeTab === "pengesahan" && (
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-8">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Pengesahan: Tanda Tangan & Cap Stempel
            </h2>
            <p className="text-xs text-slate-500">
              Atur data penandatangan resmi, upload gambar stempel/tanda tangan berlatar transparan (PNG), dan atur letak timpaan cap.
            </p>
          </div>

          {/* HEADER & DAFTAR PENANDATANGAN DINAMIS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Daftar Penandatangan Dokumen Surat
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur nama, jabatan resmi, dan scan tanda tangan pejabat. Penandatangan yang ditambahkan di sini akan muncul sebagai pilihan saat membuat surat.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTambahPenandatangan}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Penandatangan</span>
            </button>
          </div>

          {/* KARTU-KARTU PENANDATANGAN DINAMIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {daftarPenandatangan.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 space-y-3.5 relative hover:border-emerald-300 transition"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Penandatangan {index + 1} {index === 0 ? "(Utama)" : ""}
                    </span>
                  </div>
                  {daftarPenandatangan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleHapusPenandatangan(index)}
                      className="text-xs text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                      title="Hapus penandatangan ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1 text-xs">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={item.nama}
                    placeholder="Contoh: H. Ahmad Syarifuddin, S.Ag."
                    onChange={(e) =>
                      handleUpdatePenandatangan(index, "nama", e.target.value)
                    }
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1 text-xs">
                    Jabatan Resmi
                  </label>
                  <input
                    type="text"
                    value={item.jabatan}
                    placeholder="Contoh: Ketua Takmir / Sekretaris / Bendahara"
                    onChange={(e) =>
                      handleUpdatePenandatangan(index, "jabatan", e.target.value)
                    }
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1 text-xs">
                    Upload Scan TTD (PNG Transparan)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, `ttd_${item.id || index}`, (url) =>
                          handleUpdatePenandatangan(index, "ttdImageUrl", url)
                        )
                      }
                      className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#16171b] hover:file:bg-black file:text-white cursor-pointer transition"
                    />
                    {uploadingField === `ttd_${item.id || index}` && (
                      <span className="text-xs text-emerald-600 animate-pulse font-medium">
                        Mengunggah...
                      </span>
                    )}
                  </div>
                  {item.ttdImageUrl && (
                    <div className="mt-2.5 flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.ttdImageUrl}
                        alt={`Scan TTD ${item.nama}`}
                        className="h-10 max-w-[120px] object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdatePenandatangan(index, "ttdImageUrl", "")}
                        className="text-[11px] text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition ml-2"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CAP STEMPEL & SLIDER OVERLAY */}
          <div className="bg-slate-50/60 p-6 sm:p-8 rounded-2xl border border-slate-100 space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Stamp className="w-4 h-4 text-orange-500" />
              Pengaturan Posisi & Efek Cap Stempel
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Slider Controls */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Upload Gambar Cap Stempel (PNG Transparan / Vektor)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, "stempel", setStempelImageUrl)
                    }
                    className="text-xs text-slate-600 file:mr-2 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#16171b] hover:file:bg-black file:text-white cursor-pointer transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">
                      Posisi Geser Horizontal (X): {stempelPosisiX}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={stempelPosisiX}
                    onChange={(e) => setStempelPosisiX(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">
                      Posisi Geser Vertikal (Y): {stempelPosisiY}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={stempelPosisiY}
                    onChange={(e) => setStempelPosisiY(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">
                      Diameter Ukuran Stempel: {stempelUkuran}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={stempelUkuran}
                    onChange={(e) => setStempelUkuran(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">
                      Kepekatan Tinta Stempel: {Math.round(stempelOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.0"
                    step="0.05"
                    value={stempelOpacity}
                    onChange={(e) =>
                      setStempelOpacity(parseFloat(e.target.value))
                    }
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>

              {/* Live Mini Preview of Overlay */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Pratinjau Timpaan Cap di Atas Tanda Tangan:
                </span>
                <div className="w-56 h-32 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Tanda Tangan */}
                  <div className="w-36 h-16 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={daftarPenandatangan[0]?.ttdImageUrl || ttdImageUrl || "/sample-ttd.svg"}
                      alt="TTD"
                      className="max-h-16 max-w-36 object-contain"
                    />

                    {/* Stempel Cap Overlay */}
                    <div
                      className="absolute pointer-events-none select-none z-10"
                      style={{
                        left: `calc(50% + ${stempelPosisiX}px)`,
                        top: `calc(50% + ${stempelPosisiY}px)`,
                        transform: "translate(-50%, -50%) rotate(-4deg)",
                        opacity: stempelOpacity,
                        width: `${stempelUkuran}px`,
                        height: `${stempelUkuran}px`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stempelImageUrl || "/sample-stempel.svg"}
                        alt="Stempel"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold underline mt-1 text-slate-800">
                    {daftarPenandatangan[0]?.nama || penandatanganNama || "Nama Penandatangan"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: TEKS STANDAR */}
      {activeTab === "teks" && (
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Teks Standar Pembuka & Penutup Surat
            </h2>
            <p className="text-xs text-slate-500">
              Kalimat ini akan otomatis terisi saat Anda membuat surat baru, sehingga Anda tidak perlu mengetik ulang dari awal.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Salam Pembuka Standar
              </label>
              <input
                type="text"
                value={defaultSalamPembuka}
                onChange={(e) => setDefaultSalamPembuka(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kalimat Pembuka Default (Puji Syukur / Muqaddimah)
              </label>
              <textarea
                rows={3}
                value={defaultKalimatPembuka}
                onChange={(e) => setDefaultKalimatPembuka(e.target.value)}
                className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kalimat Penutup Default
              </label>
              <textarea
                rows={3}
                value={defaultKalimatPenutup}
                onChange={(e) => setDefaultKalimatPenutup(e.target.value)}
                className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Salam Penutup Standar
              </label>
              <input
                type="text"
                value={defaultSalamPenutup}
                onChange={(e) => setDefaultSalamPenutup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>
      )}


      {/* TAB CONTENT 7: QRIS TV DISPLAY */}
      {activeTab === "qris" && (
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Tv className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Pengaturan QRIS TV Display Masjid</h2>
            </div>
            <p className="text-xs text-slate-500">
              Informasi QRIS ini akan ditampilkan di sidebar kanan layar TV Display Masjid sebagai sarana infaq digital untuk jamaah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Gambar QR */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Gambar QR Code QRIS</h3>
              <div className="bg-slate-50/60 p-5 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                <p className="text-xs text-slate-500">
                  Upload file gambar QR Code QRIS Anda (JPG / PNG). Disarankan resolusi minimal 300×300px.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "qrisImage", setQrisImageUrl)}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#16171b] hover:file:bg-black file:text-white cursor-pointer transition"
                  />
                  {uploadingField === "qrisImage" && (
                    <span className="text-xs text-emerald-600 animate-pulse font-medium">Mengunggah...</span>
                  )}
                </div>
                {qrisImageUrl && (
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrisImageUrl}
                      alt="Preview QRIS"
                      className="w-40 h-40 object-contain bg-white rounded-2xl border border-slate-200 p-2 shadow-sm"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-emerald-700 font-semibold">✅ Gambar QRIS berhasil diunggah</p>
                      <p className="text-[10px] text-slate-500 break-all">{qrisImageUrl}</p>
                      <button
                        type="button"
                        onClick={() => setQrisImageUrl("")}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Hapus gambar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Rekening & Bank */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Informasi Rekening QRIS</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={qrisNama}
                    onChange={(e) => setQrisNama(e.target.value)}
                    placeholder="Masjid Baitul Maghfirah"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    value={qrisBank}
                    onChange={(e) => setQrisBank(e.target.value)}
                    placeholder="Bank Syariah Indonesia (BSI)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={qrisRekening}
                    onChange={(e) => setQrisRekening(e.target.value)}
                    placeholder="7123456789"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">NMID / Merchant ID (Opsional)</label>
                  <input
                    type="text"
                    value={qrisNmid}
                    onChange={(e) => setQrisNmid(e.target.value)}
                    placeholder="ID1020304050607"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Singkat</label>
                  <input
                    type="text"
                    value={qrisKeterangan}
                    onChange={(e) => setQrisKeterangan(e.target.value)}
                    placeholder="Infaq & Shodaqoh Digital"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview tampilan di TV */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Preview Tampilan di TV Display</h3>
            <div className="inline-flex flex-col items-center text-center p-4 rounded-2xl gap-2 border"
              style={{ background: "rgba(15,8,3,0.9)", borderColor: "rgba(212,180,131,0.3)", minWidth: "180px" }}>
              <div className="flex items-center gap-1.5">
                <QrCode className="w-3 h-3" style={{ color: "#c9a96e" }} />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#c9a96e" }}>INFAQ DIGITAL</span>
              </div>
              <div className="w-20 h-20 bg-white rounded-xl p-1.5 flex items-center justify-center border" style={{ borderColor: "rgba(201,169,110,0.5)" }}>
                {qrisImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrisImageUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-14 h-14 text-slate-800" />
                )}
              </div>
              <div className="text-[10px] font-bold truncate max-w-[160px]" style={{ color: "#f5e6c8" }}>
                {qrisNama || "Masjid Baitul Maghfirah"}
              </div>
              <div className="text-[9px]" style={{ color: "#c9a96e" }}>
                {qrisBank || "Bank"}{qrisRekening ? <span> • {qrisRekening}</span> : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: KONEKSI WHATSAPP */}
      {activeTab === "whatsapp" && <WhatsAppTab />}
    </div>
  );
}
