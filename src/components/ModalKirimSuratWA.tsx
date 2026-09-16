"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Users,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Check,
  Search,
  Filter,
  Phone,
  FileText,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { formatIndoDate } from "@/lib/utils";

interface PengurusItem {
  id: number;
  nama: string;
  jabatan: string;
  bidang: string;
  nomorWa: string | null;
}

interface ModalKirimSuratWAProps {
  isOpen: boolean;
  onClose: () => void;
  surat: any;
  setting?: any;
  sheetRef: React.RefObject<HTMLDivElement>;
}

export default function ModalKirimSuratWA({
  isOpen,
  onClose,
  surat,
  setting = {},
  sheetRef,
}: ModalKirimSuratWAProps) {
  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([]);
  const [loadingPengurus, setLoadingPengurus] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedBidang, setSelectedBidang] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // WhatsApp connection status
  const [waStatus, setWaStatus] = useState<"CONNECTED" | "DISCONNECTED" | "SCANNING">("DISCONNECTED");
  const [waUser, setWaUser] = useState<any>(null);

  // Personalisasi opsi
  const [isPersonalized, setIsPersonalized] = useState(true);

  // Template Pesan
  const [customCaption, setCustomCaption] = useState("");

  // Sending states
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [currentSendingName, setCurrentSendingName] = useState("");
  const [sendLogs, setSendLogs] = useState<
    Array<{ id: number; nama: string; phone: string; status: "success" | "error"; message?: string }>
  >([]);

  // Quick edit phone inside modal
  const [quickPhoneId, setQuickPhoneId] = useState<number | null>(null);
  const [quickPhoneVal, setQuickPhoneVal] = useState("");

  // Check WA status
  const checkWaStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) {
        const data = await res.json();
        setWaStatus(data.status || "DISCONNECTED");
        setWaUser(data.user || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Pengurus
  const fetchPengurus = async () => {
    try {
      setLoadingPengurus(true);
      const res = await fetch("/api/pengurus");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPengurusList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPengurus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkWaStatus();
      fetchPengurus();
      setSendLogs([]);
      setSendingProgress(0);

      // Default template caption
      const defaultTeks = `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth, {nama} ({jabatan}),

Bersama ini kami sampaikan surat resmi dari Pengurus Masjid Baitul Maghfirah:
📌 Nomor Surat : ${surat.nomorSurat || "001/PM-BM/UND/08/2026"}
📌 Perihal     : ${surat.perihal || "Surat Resmi"}
📌 Tanggal     : ${formatIndoDate(surat.tanggalSurat || new Date())}${
        surat.adaAcara && surat.acaraHariTanggal ? `\n📌 Waktu Acara : ${surat.acaraHariTanggal} (${surat.acaraWaktu || ""})` : ""
      }${
        surat.adaAcara && surat.acaraTempat ? `\n📌 Tempat Acara: ${surat.acaraTempat}` : ""
      }

File dokumen surat resmi PDF telah kami lampirkan bersama pesan ini. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh,
Pengurus Masjid Baitul Maghfirah`;

      setCustomCaption(defaultTeks);
    }
  }, [isOpen, surat]);

  if (!isOpen) return null;

  // Filtered Pengurus
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

  const uniqueBidang = Array.from(new Set(pengurusList.map((p) => p.bidang))).filter(Boolean);

  // Toggle selection
  const toggleSelectAll = () => {
    const currentFilteredIds = filteredList.map((p) => p.id);
    const allSelected = currentFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // Quick save phone inside modal
  const handleSaveQuickPhone = async (id: number) => {
    try {
      const res = await fetch("/api/pengurus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nomorWa: quickPhoneVal.trim() || null }),
      });
      if (res.ok) {
        setPengurusList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, nomorWa: quickPhoneVal.trim() || null } : item
          )
        );
        setQuickPhoneId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Function to generate PDF base64 for a personalized recipient
  const generatePdfBase64 = async (recipientName: string): Promise<string> => {
    if (!sheetRef.current) throw new Error("Elemen surat tidak ditemukan");

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    // Clone element
    const sourceEl = sheetRef.current;
    const clone = sourceEl.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.boxShadow = "none";
    clone.style.margin = "0";
    clone.style.width = "215mm";
    clone.style.minHeight = "330mm";
    clone.style.maxHeight = "330mm";
    clone.style.height = "330mm";
    clone.style.boxSizing = "border-box";
    clone.style.overflow = "hidden";

    // Jika personalisasi aktif, ganti teks nama tujuan di dalam clone secara spesifik!
    if (isPersonalized) {
      const targetEl = clone.querySelector("#tujuan-surat-content");
      if (targetEl) {
        targetEl.textContent = recipientName;
      } else {
        // Fallback aman hanya pada leaf node (elemen tanpa child element)
        const candidates = clone.querySelectorAll("div, p, span");
        for (const el of Array.from(candidates)) {
          if (el.children.length === 0 && el.textContent?.includes(surat.tujuan || "Penerima Surat")) {
            el.textContent = recipientName;
            break;
          }
        }
      }
    }

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "215mm";
    container.style.height = "330mm";
    container.style.zIndex = "-99999";
    container.style.pointerEvents = "none";
    container.style.backgroundColor = "#ffffff";
    container.appendChild(clone);
    document.body.appendChild(container);

    // Tunggu gambar selesai dimuat
    const imgs = Array.from(clone.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve(true);
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          })
      )
    );

    if (document.fonts) {
      await document.fonts.ready;
    }

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 813,
      });

      document.body.removeChild(container);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [215, 330],
        compress: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(imgData, "JPEG", 0, 0, 215, 330, undefined, "FAST");

      return pdf.output("datauristring");
    } catch (err) {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      throw err;
    }
  };

  // Process Batch Send
  const handleStartSending = async () => {
    const targets = pengurusList.filter(
      (p) => selectedIds.includes(p.id) && p.nomorWa && p.nomorWa.trim() !== ""
    );

    if (targets.length === 0) {
      alert("Pilihlah minimal 1 pengurus yang sudah memiliki nomor WhatsApp!");
      return;
    }

    if (waStatus !== "CONNECTED") {
      alert("WhatsApp belum terhubung. Silakan hubungkan WhatsApp terlebih dahulu di menu Pengaturan.");
      return;
    }

    if (
      !confirm(
        `Mulai mengirimkan surat PDF resmi ke ${targets.length} pengurus via WhatsApp?`
      )
    ) {
      return;
    }

    setIsSending(true);
    setSendLogs([]);
    setSendingProgress(0);

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      setCurrentSendingName(target.nama);

      // Personalisasikan teks caption
      const personalizedCaption = customCaption
        .replace(/{nama}/g, target.nama)
        .replace(/{jabatan}/g, target.jabatan);

      try {
        // 1. Generate PDF base64 khusus untuk pengurus ini
        const pdfBase64 = await generatePdfBase64(target.nama);

        // 2. Kirim via WhatsApp API
        const safeNomor = (surat.nomorSurat || "001").replace(/[/\\?%*:|"<>]/g, "-");
        const fileName = `${safeNomor}_Surat_Untuk_${target.nama.replace(/\s+/g, "_")}.pdf`;

        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientPhone: target.nomorWa,
            caption: personalizedCaption,
            pdfBase64: pdfBase64,
            fileName: fileName,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setSendLogs((prev) => [
            ...prev,
            { id: target.id, nama: target.nama, phone: target.nomorWa!, status: "success" },
          ]);
        } else {
          setSendLogs((prev) => [
            ...prev,
            {
              id: target.id,
              nama: target.nama,
              phone: target.nomorWa!,
              status: "error",
              message: data.error || "Gagal",
            },
          ]);
        }
      } catch (err: any) {
        setSendLogs((prev) => [
          ...prev,
          {
            id: target.id,
            nama: target.nama,
            phone: target.nomorWa!,
            status: "error",
            message: err.message || "Kesalahan generate PDF",
          },
        ]);
      }

      setSendingProgress(Math.round(((i + 1) / targets.length) * 100));

      // Jeda waktu aman 2.5 detik per pengiriman agar nomor WA aman dari deteksi spam
      if (i < targets.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    setIsSending(false);
    setCurrentSendingName("");
  };

  const selectedWithPhoneCount = pengurusList.filter(
    (p) => selectedIds.includes(p.id) && p.nomorWa && p.nomorWa.trim() !== ""
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Kirim Surat Resmi ke WhatsApp Pengurus</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  Scan QR Bot
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Kirim dokumen PDF personal (nama penerima disesuaikan) otomatis ke WhatsApp pengurus Masjid Baitul Maghfirah.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WA STATUS BANNER */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            {waStatus === "CONNECTED" ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WhatsApp Masjid Terhubung (+{waUser?.phone || "-"})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>WhatsApp Belum Terhubung</span>
              </span>
            )}
          </div>

          {waStatus !== "CONNECTED" && (
            <a
              href="/pengaturan"
              target="_blank"
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
            >
              <span>Scan QR di Menu Pengaturan</span>
            </a>
          )}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* STEP 1: PILIH PENGURUS */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>1. Pilih Pengurus Penerima Surat ({selectedIds.length} dipilih)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pilih seluruh pengurus atau filter berdasarkan bidang/struktur tertentu.
                </p>
              </div>

              {/* Filter & Select all */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition"
                >
                  Pilih / Batal Semua
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau jabatan pengurus..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedBidang}
                onChange={(e) => setSelectedBidang(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700"
              >
                <option value="all">Semua Bidang ({pengurusList.length})</option>
                {uniqueBidang.map((b) => (
                  <option key={b} value={b}>
                    {b} ({pengurusList.filter((p) => p.bidang === b).length})
                  </option>
                ))}
              </select>
            </div>

            {/* List Box */}
            <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white">
              {loadingPengurus ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Memuat pengurus...</span>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Tidak ada pengurus yang cocok dengan kriteria filter.
                </div>
              ) : (
                filteredList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isEditingThis = quickPhoneId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition ${
                        isSelected ? "bg-emerald-50/50" : ""
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate">
                            {item.nama}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {item.jabatan} • <span className="text-emerald-700 font-medium">{item.bidang}</span>
                          </span>
                        </div>
                      </label>

                      {/* Nomor WA */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={quickPhoneVal}
                              onChange={(e) => setQuickPhoneVal(e.target.value)}
                              placeholder="0812..."
                              className="w-28 px-2 py-0.5 rounded border border-emerald-500 focus:outline-none text-xs"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveQuickPhone(item.id);
                                if (e.key === "Escape") setQuickPhoneId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuickPhone(item.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickPhoneId(null)}
                              className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : item.nomorWa ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                            <Phone className="w-2.5 h-2.5 text-teal-600" />
                            <span>{item.nomorWa}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setQuickPhoneId(item.id);
                              setQuickPhoneVal("");
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Isi No WA</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* STEP 2: OPSI PERSONALISASI */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <label className="flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isPersonalized}
                onChange={(e) => setIsPersonalized(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Personalisasikan Nama Penerima di Dalam Dokumen PDF</span>
            </label>
            <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
              Jika aktif, lembar PDF yang diterima masing-masing pengurus akan otomatis memuat nama beliau di kolom tujuan (misal: <em>Kepada, Yth, [Nama Pengurus] di, Tempat</em>).
            </p>
          </div>

          {/* STEP 3: PREVIEW REDAKSI PESAN */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>2. Redaksi Pesan Pengantar WhatsApp</span>
            </h4>
            <textarea
              rows={6}
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              className="w-full p-3 font-mono text-[11.5px] rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />
            <p className="text-[10.5px] text-slate-400">
              Variabel dinamis: <code>{"{nama}"}</code> akan otomatis diganti nama lengkap pengurus, <code>{"{jabatan}"}</code> diganti dengan jabatan pengurus.
            </p>
          </div>

          {/* SENDING PROGRESS & LOGS */}
          {(isSending || sendLogs.length > 0) && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center font-semibold text-slate-800 text-xs">
                <span>Progress Pengiriman</span>
                <span>{sendingProgress}%</span>
              </div>

              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-300"
                  style={{ width: `${sendingProgress}%` }}
                />
              </div>

              {currentSendingName && (
                <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>
                    Sedang memproses & mengirim PDF ke: <strong>{currentSendingName}</strong>...
                  </span>
                </div>
              )}

              {/* Logs */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-200">
                {sendLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded-xl text-[11px] flex items-center justify-between ${
                      log.status === "success"
                        ? "bg-emerald-100/60 text-emerald-900 border border-emerald-200"
                        : "bg-rose-100/60 text-rose-900 border border-rose-200"
                    }`}
                  >
                    <span>
                      {log.status === "success" ? "✅" : "❌"} <strong>{log.nama}</strong> ({log.phone})
                    </span>
                    <span className="font-medium">
                      {log.status === "success" ? "Terkirim" : `Gagal (${log.message || ""})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0">
          <div className="text-slate-500 text-xs">
            Siap dikirim ke:{" "}
            <strong className="text-slate-800">{selectedWithPhoneCount} pengurus</strong>{" "}
            (yang sudah memiliki nomor WA)
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold transition"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleStartSending}
              disabled={isSending || selectedWithPhoneCount === 0 || waStatus !== "CONNECTED"}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim ({sendingProgress}%)...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim ke {selectedWithPhoneCount} Pengurus</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
