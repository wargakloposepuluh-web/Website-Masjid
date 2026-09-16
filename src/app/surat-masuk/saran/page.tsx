"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import KritikSaranViewer from "@/components/KritikSaranViewer";

export default function SuratSaranPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navbar Surat */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Link
            href="/surat-masuk"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Surat Masuk Fisik</span>
          </Link>
        </div>

        <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
          Kesekretariatan & Administrasi DKM
        </span>
      </div>

      <KritikSaranViewer
        moduleKategori="SURAT"
        title="Hasil Aspirasi Jama'ah (Administrasi & Persuratan)"
        description="Pesan dan aspirasi warga serta jamaah seputar administrasi DKM, permohonan surat, dan tata kelola masjid."
      />
    </div>
  );
}
