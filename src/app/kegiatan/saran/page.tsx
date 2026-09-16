"use client";

import React from "react";
import KritikSaranViewer from "@/components/KritikSaranViewer";

export default function KegiatanSaranPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <KritikSaranViewer
        moduleKategori="IBADAH"
        title="Hasil Aspirasi Jama'ah (Bidang Ibadah & Dakwah)"
        description="Pesan, usulan materi khutbah, evaluasi sholat berjamaah & kegiatan pengajian yang masuk dari jamaah melalui portal publik."
      />
    </div>
  );
}
