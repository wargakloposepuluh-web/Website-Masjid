"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  LayoutGrid, BookOpen, Heart, Users, DollarSign, Star, Landmark, 
  Sparkles, Leaf, Shield, Music, GraduationCap, Home, Phone, 
  MapPin, Clock, Calendar, Smile, MessageSquare, Globe, Zap,
  Save, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff,
  Upload, Tv, RefreshCw, ChevronUp, ChevronDown, CheckCircle,
  AlertCircle, X, ToggleLeft, ToggleRight
} from "lucide-react";

// Daftar ikon tersedia
const ICON_LIST = [
  { name: "BookOpen", icon: BookOpen, label: "Buku" },
  { name: "Heart", icon: Heart, label: "Hati" },
  { name: "Users", icon: Users, label: "Jamaah" },
  { name: "DollarSign", icon: DollarSign, label: "Keuangan" },
  { name: "Star", icon: Star, label: "Bintang" },
  { name: "Sparkles", icon: Sparkles, label: "Cahaya" },
  { name: "Leaf", icon: Leaf, label: "Daun" },
  { name: "Shield", icon: Shield, label: "Perlindungan" },
  { name: "Music", icon: Music, label: "Musik" },
  { name: "GraduationCap", icon: GraduationCap, label: "Pendidikan" },
  { name: "Home", icon: Home, label: "Rumah" },
  { name: "Phone", icon: Phone, label: "Kontak" },
  { name: "MapPin", icon: MapPin, label: "Lokasi" },
  { name: "Clock", icon: Clock, label: "Waktu" },
  { name: "Calendar", icon: Calendar, label: "Kalender" },
  { name: "Smile", icon: Smile, label: "Senyum" },
  { name: "MessageSquare", icon: MessageSquare, label: "Pesan" },
  { name: "Globe", icon: Globe, label: "Global" },
  { name: "Zap", icon: Zap, label: "Kilat" },
  { name: "LayoutGrid", icon: LayoutGrid, label: "Grid" },
];

function getIconComponent(name: string) {
  const found = ICON_LIST.find((i) => i.name === name);
  return found ? found.icon : BookOpen;
}

interface FasilitasItem {
  id: number;
  judul: string;
  deskripsi: string;
  icon: string;
  urutan: number;
  isActive: boolean;
}

interface FasilitasSetting {
  fasilitasJudul: string | null;
  fasilitasSlogan: string | null;
  fasilitasFotoUrl: string | null;
}

interface RunningTextSetting {
  runningText: string | null;
  tampilkanSaldoRT: boolean;
  kecepatanRT: number;
}

type ActiveTab = "fasilitas" | "running-text";

export default function FasilitasPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("fasilitas");
  
  // === FASILITAS STATE ===
  const [fasilitas, setFasilitas] = useState<FasilitasItem[]>([]);
  const [fasilitasSetting, setFasilitasSetting] = useState<FasilitasSetting>({
    fasilitasJudul: "Fasilitas & Pelayanan",
    fasilitasSlogan: "Berkhidmat untuk Jamaah, Merawat Rumah Allah.",
    fasilitasFotoUrl: "/bg_masjid.jpg",
  });
  const [loadingFasilitas, setLoadingFasilitas] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);

  // Form modal fasilitas
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<FasilitasItem | null>(null);
  const [formData, setFormData] = useState({ judul: "", deskripsi: "", icon: "BookOpen", urutan: 0, isActive: true });
  const [savingItem, setSavingItem] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // === RUNNING TEXT STATE ===
  const [rtSetting, setRtSetting] = useState<RunningTextSetting>({
    runningText: "",
    tampilkanSaldoRT: true,
    kecepatanRT: 40,
  });
  const [loadingRT, setLoadingRT] = useState(true);
  const [savingRT, setSavingRT] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ========================
  // LOAD DATA
  // ========================
  const loadFasilitas = useCallback(async () => {
    setLoadingFasilitas(true);
    try {
      const res = await fetch("/api/fasilitas");
      const data = await res.json();
      setFasilitas(data.fasilitas || []);
      if (data.setting) {
        setFasilitasSetting({
          fasilitasJudul: data.setting.fasilitasJudul || "Fasilitas & Pelayanan",
          fasilitasSlogan: data.setting.fasilitasSlogan || "Berkhidmat untuk Jamaah, Merawat Rumah Allah.",
          fasilitasFotoUrl: data.setting.fasilitasFotoUrl || "/bg_masjid.jpg",
        });
      }
    } catch {
      showToast("error", "Gagal memuat data fasilitas");
    } finally {
      setLoadingFasilitas(false);
    }
  }, []);

  const loadRunningText = useCallback(async () => {
    setLoadingRT(true);
    try {
      const res = await fetch("/api/pengaturan/running-text");
      const data = await res.json();
      if (data.setting) {
        setRtSetting({
          runningText: data.setting.runningText || "",
          tampilkanSaldoRT: data.setting.tampilkanSaldoRT !== false,
          kecepatanRT: data.setting.kecepatanRT || 40,
        });
      }
    } catch {
      showToast("error", "Gagal memuat konfigurasi running text");
    } finally {
      setLoadingRT(false);
    }
  }, []);

  useEffect(() => {
    loadFasilitas();
    loadRunningText();
  }, [loadFasilitas, loadRunningText]);

  // ========================
  // FASILITAS HANDLERS
  // ========================
  const openAddModal = () => {
    setEditItem(null);
    setFormData({ judul: "", deskripsi: "", icon: "BookOpen", urutan: fasilitas.length, isActive: true });
    setShowModal(true);
  };

  const openEditModal = (item: FasilitasItem) => {
    setEditItem(item);
    setFormData({ judul: item.judul, deskripsi: item.deskripsi, icon: item.icon, urutan: item.urutan, isActive: item.isActive });
    setShowModal(true);
  };

  const handleSaveItem = async () => {
    if (!formData.judul.trim() || !formData.deskripsi.trim()) {
      showToast("error", "Judul dan deskripsi wajib diisi");
      return;
    }
    setSavingItem(true);
    try {
      if (editItem) {
        // Update
        const res = await fetch("/api/fasilitas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editItem.id, ...formData }),
        });
        if (!res.ok) throw new Error();
        showToast("success", "Fasilitas berhasil diperbarui");
      } else {
        // Create
        const res = await fetch("/api/fasilitas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
        showToast("success", "Fasilitas berhasil ditambahkan");
      }
      setShowModal(false);
      loadFasilitas();
    } catch {
      showToast("error", "Gagal menyimpan fasilitas");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus fasilitas ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/fasilitas?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Fasilitas dihapus");
      loadFasilitas();
    } catch {
      showToast("error", "Gagal menghapus fasilitas");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (item: FasilitasItem) => {
    try {
      await fetch("/api/fasilitas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, judul: item.judul, deskripsi: item.deskripsi, icon: item.icon, urutan: item.urutan, isActive: !item.isActive }),
      });
      loadFasilitas();
    } catch {
      showToast("error", "Gagal mengubah status");
    }
  };

  const handleMoveOrder = async (item: FasilitasItem, direction: "up" | "down") => {
    const idx = fasilitas.findIndex((f) => f.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= fasilitas.length) return;
    const other = fasilitas[swapIdx];
    // Swap urutan
    try {
      await Promise.all([
        fetch("/api/fasilitas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, judul: item.judul, deskripsi: item.deskripsi, icon: item.icon, urutan: other.urutan, isActive: item.isActive }),
        }),
        fetch("/api/fasilitas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: other.id, judul: other.judul, deskripsi: other.deskripsi, icon: other.icon, urutan: item.urutan, isActive: other.isActive }),
        }),
      ]);
      loadFasilitas();
    } catch {
      showToast("error", "Gagal mengubah urutan");
    }
  };

  const handleSaveHeader = async () => {
    setSavingHeader(true);
    try {
      const res = await fetch("/api/fasilitas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "setting", ...fasilitasSetting }),
      });
      if (!res.ok) throw new Error();
      showToast("success", "Header fasilitas disimpan");
    } catch {
      showToast("error", "Gagal menyimpan header");
    } finally {
      setSavingHeader(false);
    }
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      setFasilitasSetting((prev) => ({ ...prev, fasilitasFotoUrl: data.url }));
      showToast("success", "Foto berhasil diunggah");
    } catch {
      showToast("error", "Gagal upload foto");
    }
  };

  // ========================
  // RUNNING TEXT HANDLERS
  // ========================
  const handleSaveRT = async () => {
    setSavingRT(true);
    try {
      const res = await fetch("/api/pengaturan/running-text", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rtSetting),
      });
      if (!res.ok) throw new Error();
      showToast("success", "Konfigurasi running text disimpan");
    } catch {
      showToast("error", "Gagal menyimpan konfigurasi");
    } finally {
      setSavingRT(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-green-100 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Fasilitas & TV Display</h1>
            <p className="text-sm text-gray-500">Kelola konten Fasilitas & Pelayanan dan Running Text TV Display</p>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("fasilitas")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "fasilitas"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Fasilitas & Pelayanan
        </button>
        <button
          onClick={() => setActiveTab("running-text")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "running-text"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Tv className="w-4 h-4" />
          Running Text TV Display
        </button>
      </div>

      {/* ==================== TAB: FASILITAS ==================== */}
      {activeTab === "fasilitas" && (
        <div className="space-y-6">
          {/* Card Header Fasilitas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              Header Seksi Fasilitas (Web Publik)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Judul Seksi</label>
                <input
                  type="text"
                  value={fasilitasSetting.fasilitasJudul || ""}
                  onChange={(e) => setFasilitasSetting((p) => ({ ...p, fasilitasJudul: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Fasilitas & Pelayanan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slogan / Deskripsi Singkat</label>
                <input
                  type="text"
                  value={fasilitasSetting.fasilitasSlogan || ""}
                  onChange={(e) => setFasilitasSetting((p) => ({ ...p, fasilitasSlogan: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Berkhidmat untuk Jamaah..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Foto Latar Belakang Seksi</label>
                <div className="flex items-center gap-3">
                  {fasilitasSetting.fasilitasFotoUrl && (
                    <img
                      src={fasilitasSetting.fasilitasFotoUrl}
                      alt="preview"
                      className="w-16 h-10 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={fasilitasSetting.fasilitasFotoUrl || ""}
                      onChange={(e) => setFasilitasSetting((p) => ({ ...p, fasilitasFotoUrl: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                      placeholder="/bg_masjid.jpg"
                    />
                    <label className="inline-flex items-center gap-1 cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                      <Upload className="w-3 h-3" />
                      Upload Foto
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveHeader}
                disabled={savingHeader}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {savingHeader ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Header
              </button>
            </div>
          </div>

          {/* Daftar Fasilitas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                Daftar Item Fasilitas
              </h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>

            {loadingFasilitas ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : fasilitas.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <LayoutGrid className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada fasilitas. Klik &quot;Tambah&quot; untuk menambahkan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fasilitas.map((item, idx) => {
                  const IconComp = getIconComponent(item.icon);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        item.isActive ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-gray-50 opacity-60"
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                      <div className="p-2 bg-green-100 rounded-lg shrink-0">
                        <IconComp className="w-4 h-4 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.judul}</p>
                        <p className="text-xs text-gray-500 truncate">{item.deskripsi}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveOrder(item, "up")}
                          disabled={idx === 0}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          title="Naik"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(item, "down")}
                          disabled={idx === fasilitas.length - 1}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          title="Turun"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`p-1.5 ${item.isActive ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}`}
                          title={item.isActive ? "Sembunyikan" : "Tampilkan"}
                        >
                          {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === item.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: RUNNING TEXT ==================== */}
      {activeTab === "running-text" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Tv className="w-4 h-4 text-green-600" />
              Konfigurasi Running Text TV Display
            </h2>
            <p className="text-xs text-gray-400 mb-5">Teks berjalan yang tampil di layar TV Display masjid.</p>

            {loadingRT ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Preview */}
                <div className="bg-green-900 rounded-xl px-4 py-3 overflow-hidden">
                  <div className="text-xs text-green-400 mb-1 font-medium">Preview TV Display</div>
                  <div className="overflow-hidden">
                    <div
                      className="text-white text-sm font-medium whitespace-nowrap"
                      style={{
                        display: "inline-block",
                        animation: `marquee ${100 - (rtSetting.kecepatanRT || 40)}s linear infinite`,
                      }}
                    >
                      {rtSetting.runningText || "Selamat datang di Masjid kami. Semoga ibadah Anda diterima Allah SWT."}
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {rtSetting.runningText || "Selamat datang di Masjid kami. Semoga ibadah Anda diterima Allah SWT."}
                    </div>
                  </div>
                </div>

                {/* Teks Running Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teks Running Text</label>
                  <textarea
                    rows={4}
                    value={rtSetting.runningText || ""}
                    onChange={(e) => setRtSetting((p) => ({ ...p, runningText: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Contoh: Selamat datang di Masjid Al-Muhajirin. Jadwal Sholat Jumat: Khotib – Ustadz Ahmad | Imam – Ustadz Rizqi..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Teks akan berjalan berulang di TV Display. Gunakan spasi panjang untuk jeda antar pengulangan.</p>
                </div>

                {/* Tampilkan Saldo */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Tampilkan Saldo Kas di Running Text</p>
                    <p className="text-xs text-gray-500 mt-0.5">Jika aktif, saldo kas masjid akan ditampilkan setelah teks running text</p>
                  </div>
                  <button
                    onClick={() => setRtSetting((p) => ({ ...p, tampilkanSaldoRT: !p.tampilkanSaldoRT }))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      rtSetting.tampilkanSaldoRT
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {rtSetting.tampilkanSaldoRT ? (
                      <><ToggleRight className="w-4 h-4" /> Aktif</>
                    ) : (
                      <><ToggleLeft className="w-4 h-4" /> Nonaktif</>
                    )}
                  </button>
                </div>

                {/* Kecepatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecepatan Running Text: <span className="text-green-600 font-bold">{rtSetting.kecepatanRT}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Lambat</span>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      value={rtSetting.kecepatanRT}
                      onChange={(e) => setRtSetting((p) => ({ ...p, kecepatanRT: Number(e.target.value) }))}
                      className="flex-1 accent-green-600"
                    />
                    <span className="text-xs text-gray-400">Cepat</span>
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveRT}
                    disabled={savingRT}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
                  >
                    {savingRT ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Konfigurasi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Tv className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Cara Menggunakan TV Display</p>
                <p className="text-sm text-blue-700 mt-1">
                  Buka halaman <code className="bg-blue-100 px-1 rounded text-xs font-mono">/display</code> di browser TV atau perangkat yang terhubung ke TV. 
                  Running text dan data keuangan akan tampil secara otomatis dan diperbarui setiap 5 menit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL TAMBAH/EDIT FASILITAS ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                {editItem ? "Edit Fasilitas" : "Tambah Fasilitas"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Judul Fasilitas *</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData((p) => ({ ...p, judul: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Bimbingan Al-Qur'an"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi *</label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Program tahfizh, tajwid, dan tafsir untuk seluruh usia"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Pilih Ikon</label>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto">
                  {ICON_LIST.map(({ name, icon: IconComp, label }) => (
                    <button
                      key={name}
                      onClick={() => setFormData((p) => ({ ...p, icon: name }))}
                      title={label}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                        formData.icon === name
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[10px] leading-tight text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Status Tampil</label>
                <button
                  onClick={() => setFormData((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    formData.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formData.isActive ? (
                    <><Eye className="w-3 h-3" /> Tampil</>
                  ) : (
                    <><EyeOff className="w-3 h-3" /> Tersembunyi</>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSaveItem}
                disabled={savingItem}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingItem ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editItem ? "Simpan Perubahan" : "Tambahkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
