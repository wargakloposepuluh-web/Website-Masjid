"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  PlusCircle,
  Search,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Edit,
  X,
  FileUp,
  Filter,
  MessageSquare,
} from "lucide-react";
import { formatIndoDate } from "@/lib/utils";

export default function SuratMasukPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [nomorAgenda, setNomorAgenda] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tanggalTerima, setTanggalTerima] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pengirim, setPengirim] = useState("");
  const [perihal, setPerihal] = useState("");
  const [disposisi, setDisposisi] = useState("");
  const [status, setStatus] = useState("Diterima");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [keterangan, setKeterangan] = useState("");

  const fetchSuratMasuk = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "Semua") params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/surat-masuk?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuratMasuk();
  }, [statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuratMasuk();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFileUrl(data.url);
        setFileName(data.fileName);
        setFileSize(data.fileSize);
      } else {
        alert("Gagal mengunggah file");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunggah file");
    } finally {
      setUploading(false);
    }
  };

  const openNewForm = () => {
    setEditingId(null);
    setNomorAgenda("");
    setNomorSurat("");
    setTanggalSurat(new Date().toISOString().split("T")[0]);
    setTanggalTerima(new Date().toISOString().split("T")[0]);
    setPengirim("");
    setPerihal("");
    setDisposisi("");
    setStatus("Diterima");
    setFileUrl("");
    setFileName("");
    setFileSize(null);
    setKeterangan("");
    setIsFormOpen(true);
  };

  const openEditForm = (item: any) => {
    setEditingId(item.id);
    setNomorAgenda(item.nomorAgenda);
    setNomorSurat(item.nomorSurat);
    setTanggalSurat(
      item.tanggalSurat
        ? new Date(item.tanggalSurat).toISOString().split("T")[0]
        : ""
    );
    setTanggalTerima(
      item.tanggalTerima
        ? new Date(item.tanggalTerima).toISOString().split("T")[0]
        : ""
    );
    setPengirim(item.pengirim);
    setPerihal(item.perihal);
    setDisposisi(item.disposisi || "");
    setStatus(item.status || "Diterima");
    setFileUrl(item.fileUrl || "");
    setFileName(item.fileName || "");
    setFileSize(item.fileSize || null);
    setKeterangan(item.keterangan || "");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !pengirim.trim() || !perihal.trim()) {
      alert("Mohon isi Nomor Surat Asal, Pengirim, dan Perihal");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nomorAgenda: nomorAgenda.trim() || undefined,
        nomorSurat,
        tanggalSurat,
        tanggalTerima,
        pengirim,
        perihal,
        disposisi,
        status,
        fileUrl,
        fileName,
        fileSize,
        keterangan,
      };

      const url = editingId
        ? `/api/surat-masuk/${editingId}`
        : "/api/surat-masuk";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchSuratMasuk();
      } else {
        alert("Gagal menyimpan surat masuk");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan surat masuk ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/surat-masuk/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
      } else {
        alert("Gagal menghapus surat masuk");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Buku Agenda Surat Masuk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pencatatan surat masuk, instruksi disposisi pimpinan, dan pengarsipan scan berkas fisik.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/surat-masuk/saran"
            className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-slate-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition active:scale-95"
            title="Kotak Aspirasi & Masukan Jamaah"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Aspirasi Jamaah</span>
          </Link>

          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-md shadow-orange-500/25 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Surat Masuk Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white/50 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 flex-1 min-w-[280px]"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor agenda, nomor surat, pengirim, perihal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#16171b] text-white text-xs font-semibold rounded-2xl hover:bg-black transition shadow-sm"
            >
              Cari
            </button>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">
              Status:
            </span>
            {["Semua", "Diterima", "Diproses", "Selesai"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${statusFilter === st
                    ? "bg-orange-500 text-white shadow-sm font-bold"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                  }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-orange-500" /> Filter Tanggal Terima:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[11px] text-red-500 font-semibold hover:underline ml-1"
              >
                Reset Tanggal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Recapitulation */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">No. Agenda</th>
                <th className="py-4 px-5">Surat Asal & Pengirim</th>
                <th className="py-4 px-5">Tgl. Diterima</th>
                <th className="py-4 px-5">Perihal & Disposisi</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-center">Berkas</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat agenda surat masuk...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada surat masuk yang tercatat.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.nomorAgenda}
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {item.pengirim}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        No: {item.nomorSurat}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600 whitespace-nowrap">
                      {formatIndoDate(item.tanggalTerima)}
                    </td>
                    <td className="py-4 px-5 max-w-sm">
                      <div className="font-medium text-slate-900 truncate">
                        {item.perihal}
                      </div>
                      {item.disposisi && (
                        <div className="text-[11px] text-slate-700 bg-orange-50/60 border border-orange-100 p-2 rounded-xl mt-1.5 line-clamp-2">
                          <span className="font-bold text-orange-600">Disposisi:</span>{" "}
                          {item.disposisi}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${item.status === "Selesai"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : item.status === "Diproses"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-orange-50 text-orange-700 border border-orange-200/60"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      {item.fileUrl ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                          title={item.fileName || "Unduh Berkas"}
                        >
                          <Download className="w-4 h-4" />
                          <span>Unduh</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
                          title="Edit Catatan & Disposisi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM INPUT / EDIT SURAT MASUK */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <Inbox className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingId
                    ? "Edit Catatan Surat Masuk"
                    : "Catat Surat Masuk Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Agenda (Opsional / Otomatis)
                  </label>
                  <input
                    type="text"
                    value={nomorAgenda}
                    onChange={(e) => setNomorAgenda(e.target.value)}
                    placeholder="Contoh: AG-002/2026 (Kosongkan utk otomatis)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Surat Asal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Contoh: 045/KUA-CK/VIII/2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Instansi / Nama Pengirim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pengirim}
                    onChange={(e) => setPengirim(e.target.value)}
                    placeholder="Contoh: Kantor Urusan Agama (KUA)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Surat
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  >
                    <option value="Diterima">Diterima</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Pada Surat
                  </label>
                  <input
                    type="date"
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Diterima
                  </label>
                  <input
                    type="date"
                    value={tanggalTerima}
                    onChange={(e) => setTanggalTerima(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perihal / Ringkasan Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  placeholder="Contoh: Undangan Peringatan Hari Besar Islam"
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instruksi / Catatan Disposisi Pimpinan
                </label>
                <textarea
                  rows={2}
                  value={disposisi}
                  onChange={(e) => setDisposisi(e.target.value)}
                  placeholder="Contoh: Diteruskan kepada Sekretaris & Sie Dakwah untuk ditindaklanjuti."
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              {/* Upload File Fisik Scan (PDF/JPG/PNG) */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-dashed border-slate-200">
                <label className="block font-semibold text-slate-700 mb-2">
                  Unggah Berkas Fisik / Scan Surat (PDF, JPG, PNG)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#16171b] hover:file:bg-black file:text-white cursor-pointer transition"
                  />
                  {uploading && (
                    <span className="text-xs text-orange-600 animate-pulse font-medium">
                      Mengunggah...
                    </span>
                  )}
                </div>

                {fileUrl && (
                  <div className="mt-3 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <span className="font-medium text-emerald-700 flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {fileName || "Berkas terunggah"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFileUrl("");
                        setFileName("");
                        setFileSize(null);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2 font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-2xl shadow-md shadow-orange-500/25 disabled:opacity-50 transition-all active:scale-95"
                >
                  {submitting ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
