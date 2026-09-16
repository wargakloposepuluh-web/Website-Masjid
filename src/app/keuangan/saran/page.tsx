"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import KritikSaranViewer from "@/components/KritikSaranViewer";

export default function KeuanganSaranPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navbar Keuangan */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Link
            href="/keuangan"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Buku Kas</span>
          </Link>
        </div>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          Modul Keuangan Masjid
        </span>
      </div>

      <KritikSaranViewer
        moduleKategori="KEUANGAN"
        title="Hasil Aspirasi Jama'ah (Keuangan & Donatur)"
        description="Aspirasi, masukan, usulan alokasi dana kas jariyah maupun infaq harian yang masuk dari jamaah melalui website publik."
      />
    </div>
  );
}
