"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatIndoDate, formatHijriDate } from "@/lib/utils";
import { Calendar, LogOut, User, ShieldCheck, Wallet } from "lucide-react";

interface CurrentUser {
  id: number;
  username: string;
  nama: string;
  role: "SUPER_ADMIN" | "ADMIN_SURAT" | "ADMIN_KEUANGAN" | "ADMIN_IBADAH";
}

export default function Header() {
  const today = new Date();
  const masehi = formatIndoDate(today);
  const hijri = formatHijriDate(today);

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return { text: "Super Admin", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "ADMIN_SURAT":
        return { text: "Admin Surat", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "ADMIN_KEUANGAN":
        return { text: "Admin Keuangan", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "ADMIN_IBADAH":
        return { text: "Admin Ibadah", color: "bg-purple-100 text-purple-800 border-purple-200" };
      default:
        return { text: "Pengguna", color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="no-print sticky top-0 z-30 bg-white/50 backdrop-blur-md border-b border-white/70 px-4 sm:px-6 lg:px-8 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-[1550px] mx-auto flex items-center justify-between gap-4">
        {/* Sisi Kiri: Logo & Identitas Masjid */}
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-100 p-1.5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/logo-masjid-baitul-maghfirah.png"
                alt="Logo Masjid Baitul Maghfirah"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight group-hover:text-emerald-700 transition-colors">
                  Masjid Baitul Maghfirah
                </h1>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                Kloposepuluh • Sukodono • Sidoarjo
              </p>
            </div>
          </Link>
        </div>

        {/* Sisi Kanan: Tanggal & Profil Pengguna */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Tanggal Hari Ini (Desktop) */}
          <div className="hidden md:flex flex-col items-end text-right border-r border-slate-200/80 pr-4">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {masehi} M
            </span>
            {hijri && (
              <span className="text-[11px] font-semibold text-orange-600">
                {hijri}
              </span>
            )}
          </div>

          {/* User Info & Role Badge */}
          {user && (
            <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user.nama.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                  {user.nama}
                </p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border inline-block mt-0.5 ${roleInfo.color}`}>
                  {roleInfo.text}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar / Logout"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
