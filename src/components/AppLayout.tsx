"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isDisplayPage = pathname.startsWith("/display");

  useEffect(() => {
    if (isLoginPage || isDisplayPage) return;

    // 1. Verifikasi status session aktif ke API
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        });
        const data = await res.json();
        if (!data.authenticated) {
          window.location.replace("/login");
        }
      } catch {
        window.location.replace("/login");
      }
    };

    verifyAuth();

    // 2. Tangani restorasi dari BFCache browser (Back-Forward Cache pada HP/desktop)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Halaman direstore dari BFCache memori browser setelah tombol Back ditekan
        // Paksa reload penuh agar middleware server memeriksa auth ulang
        window.location.reload();
      } else {
        verifyAuth();
      }
    };

    // 3. Tangani navigasi history tombol Back/Forward
    const handlePopState = () => {
      verifyAuth();
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, isLoginPage, isDisplayPage]);

  if (isLoginPage || isDisplayPage) {
    return <main className="min-h-screen w-full relative z-10">{children}</main>;
  }

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <div className="flex-1 lg:ml-64 min-h-screen w-full transition-all print:m-0 print:p-0 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
