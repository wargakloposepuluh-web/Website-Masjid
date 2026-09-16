"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  FileText,
  Inbox,
  Sliders,
  Menu,
  X,
  ShieldCheck,
  Users,
  Wallet,
  PlusCircle,
  CalendarDays,
  Calendar,
  Clock,
  LogOut,
  UserCheck,
  Globe,
  MessageSquare,
  MessageSquareHeart,
  Tv,
  QrCode,
  Archive,
  LayoutGrid,
} from "lucide-react";
import { useState, useEffect } from "react";

interface CurrentUser {
  id: number;
  username: string;
  nama: string;
  role: "SUPER_ADMIN" | "ADMIN_SURAT" | "ADMIN_KEUANGAN" | "ADMIN_IBADAH";
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Gagal load session user:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      window.location.href = "/login";
    }
  };

  const role = user?.role;

  const allMenuItems = [
    {
      name: "Dashboard Persuratan",
      href: "/",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Buat Surat",
      href: "/surat-keluar/buat",
      icon: Send,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Surat Keluar",
      href: "/surat-keluar",
      icon: FileText,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Surat Masuk",
      href: "/surat-masuk",
      icon: Inbox,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Hasil Aspirasi Jama'ah",
      href: "/surat-masuk/saran",
      icon: MessageSquareHeart,
      badge: role === "SUPER_ADMIN" ? "Surat" : undefined,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Sholat Jum'at",
      href: "/kegiatan/jumat",
      icon: Calendar,
      badge: "Jum'at",
      roles: ["SUPER_ADMIN", "ADMIN_IBADAH"],
    },
    {
      name: "Kegiatan Mingguan",
      href: "/kegiatan/mingguan",
      icon: Clock,
      roles: ["SUPER_ADMIN", "ADMIN_IBADAH"],
    },
    {
      name: "Kegiatan Bulanan",
      href: "/kegiatan/bulanan",
      icon: Users,
      roles: ["SUPER_ADMIN", "ADMIN_IBADAH"],
    },
    {
      name: "Hasil Aspirasi Jama'ah",
      href: "/kegiatan/saran",
      icon: MessageSquareHeart,
      badge: role === "SUPER_ADMIN" ? "Ibadah" : undefined,
      roles: ["SUPER_ADMIN", "ADMIN_IBADAH"],
    },
    {
      name: "Buku Kas Masjid",
      href: "/keuangan",
      icon: Wallet,
      roles: ["SUPER_ADMIN", "ADMIN_KEUANGAN"],
    },
    {
      name: "Catat Kas Baru",
      href: "/keuangan/catat",
      icon: PlusCircle,
      roles: ["SUPER_ADMIN", "ADMIN_KEUANGAN"],
    },
    {
      name: "Pengaturan QRIS",
      href: "/keuangan/qris",
      icon: QrCode,
      roles: ["SUPER_ADMIN", "ADMIN_KEUANGAN"],
    },
    {
      name: "Hasil Aspirasi Jama'ah",
      href: "/keuangan/saran",
      icon: MessageSquareHeart,
      badge: role === "SUPER_ADMIN" ? "Kas" : undefined,
      roles: ["SUPER_ADMIN", "ADMIN_KEUANGAN"],
    },
    {
      name: "Daftar Pengurus",
      href: "/pengurus",
      icon: Users,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Fasilitas & TV Display",
      href: "/fasilitas",
      icon: LayoutGrid,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Pengaturan Surat",
      href: "/pengaturan",
      icon: Sliders,
      roles: ["SUPER_ADMIN", "ADMIN_SURAT"],
    },
    {
      name: "Kelola Pengguna",
      href: "/pengaturan/pengguna",
      icon: ShieldCheck,
      badge: "Admin",
      roles: ["SUPER_ADMIN"],
    },
    {
      name: "Cadangan & Backup",
      href: "/pengaturan/backup",
      icon: Archive,
      badge: "Admin",
      roles: ["SUPER_ADMIN"],
    },
  ];

  // Filter items based on user role (if not loaded yet, show default items)
  const menuItems = role
    ? allMenuItems.filter((item) => item.roles.includes(role))
    : allMenuItems;

  const getRoleLabel = (r?: string) => {
    switch (r) {
      case "SUPER_ADMIN":
        return { text: "Super Admin", bg: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "ADMIN_SURAT":
        return { text: "Admin Surat", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "ADMIN_KEUANGAN":
        return { text: "Admin Keuangan", bg: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "ADMIN_IBADAH":
        return { text: "Admin Ibadah", bg: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      default:
        return { text: "Pengguna", bg: "bg-slate-700 text-slate-300 border-slate-600" };
    }
  };

  const roleBadge = getRoleLabel(role);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50 no-print">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2.5 bg-[#17181c] text-white rounded-2xl shadow-xl border border-[#26272e] hover:bg-[#25262c] transition transform ${
            isOpen ? "translate-x-64" : ""
          }`}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#16171b] text-white flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out no-print select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          {/* Logo Header */}
          <div className="flex items-center gap-3 pt-2 px-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-md shadow-black/20 flex items-center justify-center flex-shrink-0">
              <img
                src="/logo-masjid-baitul-maghfirah.png"
                alt="Logo Masjid Baitul Maghfirah"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                Masjid Baitul Maghfirah
              </span>
              <span className="text-[10px] text-slate-400 tracking-wide font-semibold block truncate">
                Kloposepuluh • Sukodono
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              let isActive = false;
              if (item.href === "/") {
                isActive = pathname === "/";
              } else if (item.href === "/surat-keluar") {
                isActive = pathname === "/surat-keluar" || (pathname.startsWith("/surat-keluar/") && !pathname.startsWith("/surat-keluar/buat"));
              } else if (item.href === "/surat-masuk") {
                isActive = pathname === "/surat-masuk";
              } else if (item.href === "/keuangan") {
                isActive = pathname === "/keuangan"; // If there's detail kas it wouldn't match, but right now there isn't.
              } else if (item.href === "/pengaturan") {
                isActive = pathname === "/pengaturan";
              } else {
                isActive = pathname.startsWith(item.href);
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-950/70 to-[#1f2622] text-white border-l-4 border-emerald-500 shadow-sm font-semibold pl-3"
                      : "text-[#7e828f] hover:text-white hover:bg-[#1d1e23]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-[18px] h-[18px] ${
                        isActive ? "text-emerald-400" : "text-[#7e828f]"
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                        item.badge === "Admin"
                          ? "bg-amber-600 text-white"
                          : item.badge === "Kas"
                          ? "bg-blue-600 text-white"
                          : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="pt-4 border-t border-[#23242a] space-y-3">
          <div className="flex items-center justify-between bg-[#1f2026] p-2.5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-800/50 flex-shrink-0">
                {user ? user.nama.charAt(0).toUpperCase() : <UserCheck className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user ? user.nama : "Memuat..."}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 font-semibold rounded-md border ${roleBadge.bg}`}
                  >
                    {roleBadge.text}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari Aplikasi"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
