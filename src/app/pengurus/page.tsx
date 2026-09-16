"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Check,
  X,
  Loader2,
  Filter,
} from "lucide-react";

interface PengurusItem {
  id: number;
  nama: string;
  jabatan: string;
  bidang: string;
  nomorWa: string | null;
  keterangan: string | null;
  urutan: number;
}

export default function DaftarPengurusPage() {
  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBidang, setSelectedBidang] = useState("all");

  // Inline editing state for quick phone update
  const [editingPhoneId, setEditingPhoneId] = useState<number | null>(null);
  const [tempPhone, setTempPhone] = useState("");
  const [savingPhoneId, setSavingPhoneId] = useState<number | null>(null);

  // Modal Add / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentPengurus, setCurrentPengurus] = useState<Partial<PengurusItem>>({});
  const [modalLoading, setModalLoading] = useState(false);

  const fetchPengurus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pengurus");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPengurusList(data);
      }
    } catch (err) {
      console.error("Gagal memuat pengurus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengurus();
  }, []);

  // Filtered list
  const filteredList = pengurusList.filter((item) => {
    const matchBidang =
      selectedBidang === "all" || item.bidang.toLowerCase() === selectedBidang.toLowerCase();
    const matchSearch =
      searchQuery === "" ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bidang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nomorWa && item.nomorWa.includes(searchQuery));
    return matchBidang && matchSearch;
  });

  // Unique list of bidang for filter dropdown
  const uniqueBidang = Array.from(new Set(pengurusList.map((p) => p.bidang))).filter(Boolean);

  // Statistics
  const totalPengurus = pengurusList.length;
  const totalWaFilled = pengurusList.filter((p) => p.nomorWa && p.nomorWa.trim() !== "").length;
  const totalWaEmpty = totalPengurus - totalWaFilled;

  // Save quick inline phone edit
  const handleSavePhone = async (id: number) => {
    setSavingPhoneId(id);
    try {
      const res = await fetch("/api/pengurus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          nomorWa: tempPhone.trim() || null,
        }),
      });
      if (res.ok) {
        setPengurusList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, nomorWa: tempPhone.trim() || null } : item
          )
        );
        setEditingPhoneId(null);
      } else {
        alert("Gagal menyimpan nomor WhatsApp");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setSavingPhoneId(null);
    }
  };

  // Handle submit modal Add/Edit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (modalMode === "add") {
        const res = await fetch("/api/pengurus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentPengurus),
        });
        if (res.ok) {
          await fetchPengurus();
          setIsModalOpen(false);
        } else {
          alert("Gagal menambahkan pengurus");
        }
      } else {
        const res = await fetch("/api/pengurus", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentPengurus),
        });
        if (res.ok) {
          await fetchPengurus();
          setIsModalOpen(false);
        } else {
          alert("Gagal memperbarui pengurus");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setModalLoading(false);
    }
  };

  // Delete pengurus
  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus pengurus "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/pengurus?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPengurusList((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Gagal menghapus pengurus");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            <Users className="w-4 h-4" />
            <span>Struktur & Direktori Masjid</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Daftar Pengurus & Nomor WhatsApp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data pejabat dan nomor WhatsApp pengurus Masjid Baitul Maghfirah untuk keperluan pengiriman surat otomatis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCurrentPengurus({ bidang: "Pengurus Harian", jabatan: "Anggota", nama: "", nomorWa: "" });
            setModalMode("add");
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengurus</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-3.5 hover:bg-white/70 transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Pengurus
            </p>
            <h3 className="text-xl font-bold text-slate-800">{totalPengurus}</h3>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-3.5 hover:bg-white/70 transition-all">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Nomor WhatsApp Terisi
            </p>
            <h3 className="text-xl font-bold text-teal-700">{totalWaFilled}</h3>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-3.5 hover:bg-white/70 transition-all">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Belum Ada Nomor WA
            </p>
            <h3 className="text-xl font-bold text-orange-600">{totalWaEmpty}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, jabatan, atau nomor WA..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBidang}
            onChange={(e) => setSelectedBidang(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-slate-700 font-medium"
          >
            <option value="all">Semua Bidang / Struktur ({pengurusList.length})</option>
            {uniqueBidang.map((b) => (
              <option key={b} value={b}>
                {b} ({pengurusList.filter((p) => p.bidang === b).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Pengurus */}
      <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs">Memuat daftar pengurus...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="text-sm font-medium">Tidak ada pengurus yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Pengurus</th>
                  <th className="py-3.5 px-4">Jabatan</th>
                  <th className="py-3.5 px-4">Bidang / Struktur</th>
                  <th className="py-3.5 px-4">Nomor WhatsApp</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredList.map((item, index) => {
                  const isEditingPhone = editingPhoneId === item.id;
                  const isSavingPhone = savingPhoneId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {item.nama}
                        </span>
                        {item.keterangan && (
                          <span className="text-[10px] text-slate-400 block">
                            {item.keterangan}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.jabatan}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {item.bidang}
                        </span>
                      </td>

                      {/* Kolom Nomor WhatsApp dengan Inline Quick-Edit */}
                      <td className="py-3 px-4">
                        {isEditingPhone ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempPhone}
                              onChange={(e) => setTempPhone(e.target.value)}
                              placeholder="Contoh: 08123456789"
                              autoFocus
                              className="w-36 px-2.5 py-1 text-xs rounded-lg border border-emerald-500 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSavePhone(item.id);
                                if (e.key === "Escape") setEditingPhoneId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePhone(item.id)}
                              disabled={isSavingPhone}
                              className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
                              title="Simpan"
                            >
                              {isSavingPhone ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPhoneId(null)}
                              className="p-1 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : item.nomorWa ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                              <Phone className="w-3 h-3 text-teal-600" />
                              <span>{item.nomorWa}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhoneId(item.id);
                                setTempPhone(item.nomorWa || "");
                              }}
                              className="text-slate-400 hover:text-emerald-600 p-1 transition"
                              title="Ubah nomor"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://wa.me/${item.nomorWa.replace(/\D/g, "").replace(/^0/, "62")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-teal-600 p-1 transition"
                              title="Buka obrolan WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPhoneId(item.id);
                              setTempPhone("");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Masukkan Nomor WA</span>
                          </button>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPengurus(item);
                              setModalMode("edit");
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Pengurus"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Pengurus */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {modalMode === "add" ? "Tambah Data Pengurus" : "Edit Data Pengurus"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={currentPengurus.nama || ""}
                  onChange={(e) =>
                    setCurrentPengurus({ ...currentPengurus, nama: e.target.value })
                  }
                  placeholder="Contoh: Drs. H. Muqrinin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={currentPengurus.jabatan || ""}
                  onChange={(e) =>
                    setCurrentPengurus({ ...currentPengurus, jabatan: e.target.value })
                  }
                  placeholder="Contoh: Majlis Tahkim / Koordinator / Anggota"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Bidang / Struktur *
                </label>
                <input
                  type="text"
                  required
                  value={currentPengurus.bidang || ""}
                  onChange={(e) =>
                    setCurrentPengurus({ ...currentPengurus, bidang: e.target.value })
                  }
                  placeholder="Contoh: Pengurus Harian / Bidang Kebersihan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={currentPengurus.nomorWa || ""}
                  onChange={(e) =>
                    setCurrentPengurus({ ...currentPengurus, nomorWa: e.target.value })
                  }
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Format bisa menggunakan awalan 08... atau 628...
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Keterangan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={currentPengurus.keterangan || ""}
                  onChange={(e) =>
                    setCurrentPengurus({ ...currentPengurus, keterangan: e.target.value })
                  }
                  placeholder="Contoh: Domisili RT 02 / Koordinator Lapangan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {modalLoading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
