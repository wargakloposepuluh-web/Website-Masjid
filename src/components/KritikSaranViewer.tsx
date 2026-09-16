"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  User,
  Phone,
  Calendar,
  Check,
  Archive,
  RefreshCw,
} from "lucide-react";

interface KritikSaranItem {
  id: number;
  nama: string;
  kontak?: string | null;
  kategori: string;
  judul?: string | null;
  pesan: string;
  status: string; // BARU, DIBACA, DITINDAKLANJUTI, ARSIP
  tanggapan?: string | null;
  ditanggapiOleh?: string | null;
  ditanggapiPada?: string | null;
  createdAt: string;
}

interface Props {
  moduleKategori: "SURAT" | "IBADAH" | "KEUANGAN" | "ALL";
  title?: string;
  description?: string;
}

export default function KritikSaranViewer({
  moduleKategori,
  title = "Kotak Aspirasi & Saran Jamaah",
  description = "Aspirasi dan saran dari jamaah melalui portal website publik yang masuk ke modul ini.",
}: Props) {
  const [items, setItems] = useState<KritikSaranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");

  // Selected item to respond
  const [selectedItem, setSelectedItem] = useState<KritikSaranItem | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [tanggapanText, setTanggapanText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moduleKategori !== "ALL") {
        params.append("kategori", moduleKategori);
      }
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      const res = await fetch(`/api/saran?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [moduleKategori, statusFilter]);

  const handleOpenDetail = (item: KritikSaranItem) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setTanggapanText(item.tanggapan || "");
    setFeedbackMsg(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/saran/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          tanggapan: tanggapanText,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: "Status & tindak lanjut berhasil disimpan." });
        setSelectedItem(json.data);
        fetchItems();
      } else {
        setFeedbackMsg({ type: "error", text: json.error || "Gagal memperbarui status." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus aspirasi/saran ini secara permanen?")) return;

    try {
      const res = await fetch(`/api/saran/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedItem?.id === id) setSelectedItem(null);
        fetchItems();
      } else {
        alert("Gagal menghapus pesan.");
      }
    } catch (err) {
      alert("Kesalahan koneksi.");
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "ACTIVE" && item.status === "ARSIP") return false;
    if (activeTab === "ARCHIVED" && item.status !== "ARSIP") return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(q) ||
      item.pesan.toLowerCase().includes(q) ||
      (item.judul && item.judul.toLowerCase().includes(q)) ||
      (item.kontak && item.kontak.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "BARU":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">BARU</span>;
      case "DIBACA":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">DIBACA</span>;
      case "DITINDAKLANJUTI":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">SELESAI / DITINDAKLANJUTI</span>;
      case "ARSIP":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">ARSIP</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getKategoriBadge = (kat: string) => {
    switch (kat) {
      case "SURAT":
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">✉️ Modul Surat</span>;
      case "IBADAH":
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">🕌 Modul Ibadah</span>;
      case "KEUANGAN":
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">💰 Modul Keuangan</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">🤝 Umum / Fasilitas</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Aspirasi & Saran Portal Publik</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchItems}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs: Aktif vs Arsip */}
        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "ACTIVE"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Aspirasi Aktif
          </button>
          <button
            onClick={() => setActiveTab("ARCHIVED")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "ARCHIVED"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Diarsipkan
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="BARU">Status Baru</option>
            <option value="DIBACA">Status Dibaca</option>
            <option value="DITINDAKLANJUTI">Sudah Ditindaklanjuti</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aspirasi atau nama..."
              className="w-full pl-9 pr-3.5 py-2 bg-white/80 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Messages (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white/50 rounded-3xl border border-slate-200/60">
              Memuat data aspirasi & saran...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-white/50 rounded-3xl border border-slate-200/60 space-y-2">
              <div className="text-3xl">📭</div>
              <p className="text-xs font-semibold text-slate-700">Belum ada saran masuk</p>
              <p className="text-[11px] text-slate-400">
                Aspirasi yang dikirimkan jamaah melalui portal website akan tampil otomatis di sini.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className={`p-4 sm:p-5 rounded-3xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-white/60 hover:bg-white/90 border-white/80 hover:border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{item.nama}</span>
                        {getKategoriBadge(item.kategori)}
                        {getStatusBadge(item.status)}
                      </div>
                      {item.judul && (
                        <div className="text-xs font-semibold text-emerald-800">
                          &quot;{item.judul}&quot;
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 text-right whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.pesan}
                  </p>

                  {item.tanggapan && (
                    <div className="mt-2.5 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                      <span className="truncate">Tindak lanjut: {item.tanggapan}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Detail & Response Panel (1 Col) */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-white/90 p-5 sm:p-6 shadow-sm space-y-4 lg:sticky lg:top-24 h-fit">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <h3 className="font-bold text-slate-900 text-sm">Detail & Tindak Lanjut</h3>
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  title="Hapus saran"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info Pengirim */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Pengirim:</span>
                  <span className="font-bold text-slate-900">{selectedItem.nama}</span>
                </div>
                {selectedItem.kontak && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Kontak:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">{selectedItem.kontak}</span>
                      {selectedItem.kontak.replace(/[^0-9]/g, "").length >= 9 && (
                        <a
                          href={`https://wa.me/${selectedItem.kontak.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Kategori:</span>
                  <span>{getKategoriBadge(selectedItem.kategori)}</span>
                </div>
              </div>

              {/* Isi Pesan */}
              <div className="space-y-1">
                {selectedItem.judul && (
                  <h4 className="font-bold text-slate-900 text-xs">
                    {selectedItem.judul}
                  </h4>
                )}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedItem.pesan}
                </div>
              </div>

              {/* Form Tanggapan & Perubahan Status */}
              <form onSubmit={handleUpdateStatus} className="pt-2 border-t border-slate-200/70 space-y-3">
                {feedbackMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-xs ${
                      feedbackMsg.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ubah Status Penanganan:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="BARU">BARU (Belum ditinjau)</option>
                    <option value="DIBACA">DIBACA (Dalam perhatian)</option>
                    <option value="DITINDAKLANJUTI">DITINDAKLANJUTI (Sudah dieksekusi)</option>
                    <option value="ARSIP">ARSIP (Disimpan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Catatan Tindak Lanjut Pengurus:
                  </label>
                  <textarea
                    rows={2}
                    value={tanggapanText}
                    onChange={(e) => setTanggapanText(e.target.value)}
                    placeholder="Contoh: Sudah dikoordinasikan dengan marbot untuk pengecekan mikrofon..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submitting ? "Menyimpan..." : "Simpan Tindak Lanjut"}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <div className="text-2xl">👈</div>
              <p>Pilih salah satu pesan di samping untuk melihat rincian dan melakukan tindak lanjut.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
