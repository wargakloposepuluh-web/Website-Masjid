"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KegiatanRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/kegiatan/jumat");
  }, [router]);

  return (
    <div className="p-12 text-center text-slate-400 text-sm">
      Mengalihkan ke Jadwal Sholat Jum&apos;at...
    </div>
  );
}
