"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
} from "lucide-react";

interface UserItem {
  id: number;
  username: string;
  nama: string;
  role: "SUPER_ADMIN" | "ADMIN_SURAT" | "ADMIN_KEUANGAN" | "ADMIN_IBADAH";
  createdAt: string;
}

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN_SURAT" | "ADMIN_KEUANGAN" | "ADMIN_IBADAH">("ADMIN_SURAT");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setEditingId(null);
    setUsername("");
    setPassword("");
    setNama("");
    setRole("ADMIN_SURAT");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setModalMode("edit");
    setEditingId(u.id);
    setUsername(u.username);
    setPassword("");
    setNama(u.nama);
    setRole(u.role);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      if (modalMode === "add") {
        if (!password) {
          setErrorMsg("Password wajib diisi.");
          setSubmitting(false);
          return;
        }

        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, nama, role }),
        });

        const data = await res.json();
        if (res.ok) {
          setIsModalOpen(false);
          fetchUsers();
        } else {
          setErrorMsg(data.error || "Gagal membuat user.");
        }
      } else {
        const res = await fetch(`/api/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama,
            role,
            password: password ? password : undefined,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setIsModalOpen(false);
          fetchUsers();
        } else {
          setErrorMsg(data.error || "Gagal memperbarui user.");
        }
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, uname: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${uname}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        alert(data.error || "Gagal menghapus user.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus user.");
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "SUPER_ADMIN":
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            Super Admin (Semua Akses)
          </span>
        );
      case "ADMIN_SURAT":
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            Admin Surat (Sekretariat)
          </span>
        );
      case "ADMIN_KEUANGAN":
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
            Admin Keuangan (Bendahara)
          </span>
        );
      case "ADMIN_IBADAH":
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
            Admin Ibadah (Petugas Ibadah)
          </span>
        );
      default:
        return <span className="text-xs">{r}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <Link
            href="/pengaturan"
            className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-600 transition shadow-sm"
            title="Kembali ke Pengaturan"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Manajemen Akun & Hak Akses
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola akun administrator untuk modul persuratan dan pencatatan kas masjid.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-md shadow-purple-600/20 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Tabel Daftar Pengguna */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">Pengguna & Username</th>
                <th className="py-4 px-5">Peran / Hak Akses</th>
                <th className="py-4 px-5">Hak Akses Modul</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Memuat daftar akun...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Belum ada akun terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{u.nama}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">@{u.username}</div>
                    </td>
                    <td className="py-3.5 px-5">{getRoleBadge(u.role)}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {u.role === "SUPER_ADMIN" && "Semua Modul (Surat, Keuangan, Ibadah, Pengurus, Akun)"}
                      {u.role === "ADMIN_SURAT" && "Modul Surat Keluar, Surat Masuk & Pengurus"}
                      {u.role === "ADMIN_KEUANGAN" && "Modul Keuangan Masjid (Kas Jariyah & Infaq)"}
                      {u.role === "ADMIN_IBADAH" && "Modul Kegiatan Masjid & Sholat Jum'at"}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-purple-600 transition"
                          title="Edit Akun"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.username)}
                          className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                          title="Hapus Akun"
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

      {/* Modal Tambah / Edit Akun */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {modalMode === "add" ? "Tambah Akun Pengguna Baru" : "Edit Akun Pengguna"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: H. Ahmad Fauzi (Bendahara)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  disabled={modalMode === "edit"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: bendahara"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50"
                />
                {modalMode === "edit" && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Username tidak dapat diubah.
                  </span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {modalMode === "add" ? "Kata Sandi (Password)" : "Ganti Password (Kosongkan jika tidak diubah)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={modalMode === "add" ? "Masukkan kata sandi" : "Biarkan kosong jika tidak diubah"}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran & Hak Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
                >
                  <option value="ADMIN_SURAT">Admin Surat (Hanya Modul Persuratan)</option>
                  <option value="ADMIN_KEUANGAN">Admin Keuangan (Hanya Modul Keuangan)</option>
                  <option value="ADMIN_IBADAH">Admin Ibadah (Hanya Modul Kegiatan & Sholat Jum'at)</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh Semua Modul & Pengguna)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Menyimpan..." : "Simpan Akun"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
