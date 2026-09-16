"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  HeartHandshake,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Coins,
  Receipt,
  Info,
} from "lucide-react";
import { formatRupiah, formatIndoDate } from "@/lib/utils";

function CatatKeuanganContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Stats for mini balance cards
  const [stats, setStats] = useState<{
    saldoJariyah: number;
    saldoInfaq: number;
    totalSaldo: number;
  } | null>(null);

  // Form states
  const [jenis, setJenis] = useState<"MASUK" | "KELUAR">("MASUK");
  const [kategoriKas, setKategoriKas] = useState<"JARIYAH" | "INFAQ">("JARIYAH");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [nominal, setNominal] = useState<number>(0);
  const [nominalDisplay, setNominalDisplay] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [buktiFotoUrl, setBuktiFotoUrl] = useState("");

  // Fetch stats on mount
  useEffect(() => {
    fetch("/api/keuangan/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  // Fetch initial data if editing
  useEffect(() => {
    if (editId) {
      setLoadingEdit(true);
      fetch(`/api/keuangan/${editId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mengambil data transaksi");
          return res.json();
        })
        .then((item) => {
          setJenis(item.jenis || "MASUK");
          setKategoriKas(item.kategoriKas || "JARIYAH");
          setTanggal(
            item.tanggal
              ? new Date(item.tanggal).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          );
          const nom = item.nominal || 0;
          setNominal(nom);
          setNominalDisplay(nom ? nom.toLocaleString("id-ID") : "");
          setKeterangan(item.keterangan || "");
          setBuktiFotoUrl(item.buktiFotoUrl || "");
        })
        .catch((err) => {
          setErrorMsg(err.message || "Gagal memuat data transaksi.");
        })
        .finally(() => {
          setLoadingEdit(false);
        });
    }
  }, [editId]);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) {
      setNominal(0);
      setNominalDisplay("");
      return;
    }
    const val = parseInt(raw, 10);
    setNominal(val);
    setNominalDisplay(val.toLocaleString("id-ID"));
  };

  const addPresetNominal = (addVal: number) => {
    const newTotal = (nominal || 0) + addVal;
    setNominal(newTotal);
    setNominalDisplay(newTotal.toLocaleString("id-ID"));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setBuktiFotoUrl(data.url);
      } else {
        setErrorMsg("Gagal mengunggah foto bukti.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat upload berkas.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || nominal <= 0) {
      setErrorMsg("Nominal transaksi harus lebih dari Rp 0.");
      return;
    }
    if (!keterangan.trim()) {
      setErrorMsg("Uraian / Keterangan transaksi wajib diisi.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        tanggal,
        jenis,
        kategoriKas,
        nominal,
        keterangan: keterangan.trim(),
        buktiFotoUrl: buktiFotoUrl || null,
      };

      const url = editId ? `/api/keuangan/${editId}` : "/api/keuangan";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(
          editId
            ? "Transaksi kas berhasil diperbarui! Mengalihkan ke Buku Kas..."
            : "Transaksi kas berhasil dicatat! Mengalihkan ke Buku Kas..."
        );
        setTimeout(() => {
          router.push("/keuangan");
          router.refresh();
        }, 800);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan transaksi.");
      }
    } catch {
      setErrorMsg("Terjadi kendala jaringan saat menyimpan transaksi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="p-6 sm:p-10 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Memuat data transaksi kas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-[#111317]">
      {/* 1. Header & Tombol Navigasi Kembali (Tanpa Kotak) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-4">
          <Link
            href="/keuangan"
            className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-sm transition active:scale-95 flex-shrink-0"
            title="Kembali ke Buku Kas"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>{editId ? "Ubah Transaksi Kas" : "Input Pencatatan Kas Masjid"}</span>
            </h1>
          </div>
        </div>

        {/* Mini Balance Indicators */}
        {stats && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-teal-50/80 border border-teal-200/80 px-3 py-1.5 rounded-2xl text-right">
              <span className="text-[10px] text-teal-700 font-bold uppercase block">Kas Jariyah</span>
              <span className="text-xs font-extrabold text-teal-900">{formatRupiah(stats.saldoJariyah)}</span>
            </div>
            <div className="bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 rounded-2xl text-right">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">Kas Infaq</span>
              <span className="text-xs font-extrabold text-amber-900">{formatRupiah(stats.saldoInfaq)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Alert Feedback (Error / Success) */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3. Kotak Formulir Pencatatan Keuangan (Card Box) */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-7"
      >
        {/* BAGIAN 1: JENIS TRANSAKSI (MASUK / KELUAR) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            1. Pilih Jenis Mutasi Kas <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setJenis("MASUK")}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                jenis === "MASUK"
                  ? "border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10"
                  : "border-slate-200 hover:border-slate-300 bg-white/70"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  jenis === "MASUK"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Pemasukan (Kas Masuk)</span>
                  {jenis === "MASUK" && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Dipilih
                    </span>
                  )}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setJenis("KELUAR")}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                jenis === "KELUAR"
                  ? "border-rose-500 bg-rose-50/80 shadow-md shadow-rose-500/10"
                  : "border-slate-200 hover:border-slate-300 bg-white/70"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  jenis === "KELUAR"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Pengeluaran (Kas Keluar)</span>
                  {jenis === "KELUAR" && (
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Dipilih
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* BAGIAN 2: KATEGORI KAS (HANYA 2 JENIS KAS) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            2. Pilih Kategori Kas Masjid <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setKategoriKas("JARIYAH")}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                kategoriKas === "JARIYAH"
                  ? "border-teal-500 bg-teal-50/80 shadow-md shadow-teal-500/10"
                  : "border-slate-200 hover:border-slate-300 bg-white/70"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  kategoriKas === "JARIYAH"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Kas Jariyah</span>
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Pembangunan
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setKategoriKas("INFAQ")}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                kategoriKas === "INFAQ"
                  ? "border-amber-500 bg-amber-50/80 shadow-md shadow-amber-500/10"
                  : "border-slate-200 hover:border-slate-300 bg-white/70"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  kategoriKas === "INFAQ"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Kas Infaq / Shodaqoh</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Operasional
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* BAGIAN 3: NOMINAL & TANGGAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          {/* Nominal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              3. Nominal Transaksi (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">
                Rp
              </span>
              <input
                type="text"
                value={nominalDisplay}
                onChange={handleNominalChange}
                placeholder="0"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold text-slate-900 shadow-sm"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Cepat:</span>
              {[50000, 100000, 250000, 500000, 1000000, 5000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addPresetNominal(val)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 transition"
                >
                  +{val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000} Rb`}
                </button>
              ))}
              {nominal > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNominal(0);
                    setNominalDisplay("");
                  }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              4. Tanggal Transaksi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 shadow-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatIndoDate(tanggal)}</span>
            </p>
          </div>
        </div>

        {/* BAGIAN 4: URAIAN / KETERANGAN */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            5. Uraian / Keterangan Transaksi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Infaq pembangunan keramik lantai 2 dari H. Ahmad, atau Pembelian pewangi karpet & sabun cuci tempat wudhu..."
            required
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 shadow-sm"
          />
        </div>

        {/* BAGIAN 5: UPLOAD BUKTI FOTO / STRUK */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            6. Lampiran Foto Bukti / Kwitansi / Struk (Opsional)
          </label>
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {buktiFotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={buktiFotoUrl}
                  alt="Bukti Transaksi"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0 shadow-sm">
                  <Receipt className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  {buktiFotoUrl ? "Foto bukti sudah terunggah" : "Unggah foto nota, kwitansi, struk belanja, atau bukti transfer"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Format gambar JPG, PNG, atau WEBP (Maksimal 5MB).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>{uploading ? "Mengunggah..." : buktiFotoUrl ? "Ganti Foto" : "Pilih Berkas"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {buktiFotoUrl && (
                <button
                  type="button"
                  onClick={() => setBuktiFotoUrl("")}
                  className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                  title="Hapus foto bukti"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BAGIAN 6: RINGKASAN DATA SEBELUM SIMPAN (LIVE SUMMARY) */}
        {nominal > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Ringkasan Transaksi yang Akan Dicatat:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Jenis</span>
                <span className={`font-bold ${jenis === "MASUK" ? "text-emerald-700" : "text-rose-700"}`}>
                  {jenis === "MASUK" ? "Pemasukan (Masuk)" : "Pengeluaran (Keluar)"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kategori</span>
                <span className="font-bold text-slate-800">
                  {kategoriKas === "JARIYAH" ? "Kas Jariyah" : "Kas Infaq / Shodaqoh"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tanggal</span>
                <span className="font-bold text-slate-800">{formatIndoDate(tanggal)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Nominal</span>
                <span className="font-extrabold text-emerald-800 text-sm">{formatRupiah(nominal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* BAGIAN 7: TOMBOL AKSI UTAMA */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/keuangan"
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition"
          >
            Batal / Kembali
          </Link>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Transaksi...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editId ? "Simpan Perubahan" : "Simpan Transaksi Kas"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CatatKeuanganPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-slate-400 text-sm">
          Memuat formulir pencatatan kas...
        </div>
      }
    >
      <CatatKeuanganContent />
    </Suspense>
  );
}
