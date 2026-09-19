"use client";

import React from "react";
import KritikSaranViewer from "@/components/KritikSaranViewer";

export default function KeuanganSaranPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <KritikSaranViewer
        moduleKategori="KEUANGAN"
        title="Hasil Aspirasi Jama'ah (Keuangan & Donatur)"
        description="Aspirasi, masukan, usulan alokasi dana kas jariyah maupun infaq harian yang masuk dari jamaah melalui website publik."
      />
    </div>
  );
}
