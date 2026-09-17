"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  Coins,
  Calendar,
  Send,
  HeartHandshake,
  Heart,
  MessageSquareHeart,
  ChevronRight,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  X,
  Volume2,
  BookOpen,
  QrCode,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Tv,
  Landmark,
  Maximize2,
  Download,
  Copy,
  Check,
  Users,
  Star,
  Leaf,
  Music,
  GraduationCap,
  Home,
  Globe,
  Zap,
  LayoutGrid,
  MessageSquare,
} from "lucide-react";
import {
  calculateSidoarjoPrayerTimes,
  getNextPrayer,
  PrayerTimeSchedule,
  NextPrayerInfo,
} from "@/lib/prayerTimes";

// Helper: Map nama ikon ke komponen Lucide untuk fasilitas dinamis
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Heart,
  Users,
  DollarSign: Coins,
  Coins,
  Star,
  Sparkles,
  Leaf,
  Shield,
  Music,
  GraduationCap,
  Home,
  Phone,
  MapPin,
  Clock,
  Calendar,
  HeartHandshake,
  Smile: HeartHandshake,
  MessageSquare,
  Globe,
  Zap,
  LayoutGrid,
};

function getIconForFasilitas(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || BookOpen;
}

// ============================================================
// KOMPONEN MECHANICAL FLIP CARD PER UNIT (JAM, MENIT, DETIK)
// 1 Kotak Utuh Berisi 2-Digit & Animasi Flip Mekanis Per Satuan Waktu
// ============================================================
interface FlipCardProps {
  label: string;
  value: string; // misal "02", "45", "10"
}

const FlipCard: React.FC<FlipCardProps> = ({ label, value }) => {
  const [displayedValue, setDisplayedValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== displayedValue) {
      setPreviousValue(displayedValue);
      setFlipping(true);

      const timer = setTimeout(() => {
        setDisplayedValue(value);
        setPreviousValue(value);
        setFlipping(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, displayedValue]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[68px] sm:w-24 lg:w-[96px] h-16 sm:h-20 lg:h-[84px] bg-[#16171b] rounded-xl border border-white/20 shadow-[0_4px_14px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col font-extrabold font-displayClock text-white select-none flip-card-container">
        {/* 1. LAYER STATIS ATAS */}
        <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#252730] to-[#18191f] border-b border-black/85 flex items-end justify-center z-0">
          <span className="translate-y-[50%] text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
            {flipping ? value : displayedValue}
          </span>
        </div>

        {/* 2. LAYER STATIS BAWAH */}
        <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#141518] to-[#0b0c0e] flex items-start justify-center z-0">
          <span className="-translate-y-[50%] text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
            {flipping ? previousValue : displayedValue}
          </span>
        </div>

        {/* 3. FLAP ATAS MEKANIS */}
        {flipping && (
          <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#2b2d38] to-[#1a1b22] border-b border-black/85 flex items-end justify-center animate-flap-fall z-20 shadow-md">
            <span className="translate-y-[50%] text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
              {previousValue}
            </span>
          </div>
        )}

        {/* 4. FLAP BAWAH MEKANIS */}
        {flipping && (
          <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#1a1b22] to-[#0c0d10] flex items-start justify-center animate-flap-rise z-20 shadow-md">
            <span className="-translate-y-[50%] text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
              {value}
            </span>
          </div>
        )}

        {/* Slit Tengah */}
        <div className="absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 bg-black/95 z-30 shadow-[0_1px_1px_rgba(255,255,255,0.08)] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-1.5 h-2.5 -translate-y-1/2 bg-neutral-900 border border-neutral-700 rounded-r-xs z-40" />
        <div className="absolute top-1/2 right-0 w-1.5 h-2.5 -translate-y-1/2 bg-neutral-900 border border-neutral-700 rounded-l-xs z-40" />
      </div>

      <span className="text-[10px] sm:text-sm font-black uppercase tracking-wider text-slate-900 font-sans mt-0.5">
        {label}
      </span>
    </div>
  );
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // State Data Portal
  const [portalData, setPortalData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerTimeSchedule | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);

  // State Form Aspirasi Jamaah
  const [saranNama, setSaranNama] = useState("");
  const [saranKontak, setSaranKontak] = useState("");
  const [saranKategori, setSaranKategori] = useState("IBADAH");
  const [saranJudul, setSaranJudul] = useState("");
  const [saranPesan, setSaranPesan] = useState("");
  const [saranSubmitting, setSaranSubmitting] = useState(false);
  const [saranSuccessMsg, setSaranSuccessMsg] = useState("");
  const [saranErrorMsg, setSaranErrorMsg] = useState("");

  // State Modal Login Pengurus
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");

  // User Session
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // State Modal QRIS & Copy Rekening
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);

  const handleCopyRekening = (text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2500);
  };

  useEffect(() => {
    setCurrentTime(new Date());
    const initialSchedule = calculateSidoarjoPrayerTimes(new Date());
    setPrayerSchedule(initialSchedule);
    setNextPrayer(getNextPrayer(initialSchedule, new Date()));

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const schedule = calculateSidoarjoPrayerTimes(now);
      setPrayerSchedule(schedule);
      setNextPrayer(getNextPrayer(schedule, now));
    }, 1000);

    fetchPortalData();
    checkCurrentUser();

    return () => clearInterval(timer);
  }, []);

  const fetchPortalData = async () => {
    try {
      const res = await fetch("/api/public/portal-info");
      const json = await res.json();
      if (json.success) {
        setPortalData(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat info portal:", err);
    }
  };

  const checkCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setLoggedInUser(json.user);
      }
    } catch (err) {
      // unauthenticated
    }
  };

  const handleSubmitSaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saranPesan.trim()) {
      setSaranErrorMsg("Silakan isi pesan atau masukan Anda.");
      return;
    }

    setSaranSubmitting(true);
    setSaranErrorMsg("");
    setSaranSuccessMsg("");

    try {
      const res = await fetch("/api/saran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: saranNama,
          kontak: saranKontak,
          kategori: saranKategori,
          judul: saranJudul,
          pesan: saranPesan,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setSaranSuccessMsg(
          "Alhamdulillah! Pesan saran Anda telah berhasil dikirimkan dan akan ditindaklanjuti oleh pengurus terkait."
        );
        setSaranNama("");
        setSaranKontak("");
        setSaranJudul("");
        setSaranPesan("");
      } else {
        setSaranErrorMsg(json.error || "Gagal mengirimkan saran.");
      }
    } catch (err) {
      setSaranErrorMsg("Terjadi gangguan koneksi. Silakan coba lagi.");
    } finally {
      setSaranSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginErrorMsg("Mohon masukkan username dan password.");
      return;
    }

    setLoginLoading(true);
    setLoginErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowLoginModal(false);
        if (callbackUrl === "/" && data.user?.role === "ADMIN_KEUANGAN") {
          router.push("/keuangan");
        } else if (callbackUrl === "/" && data.user?.role === "ADMIN_IBADAH") {
          router.push("/kegiatan/jumat");
        } else {
          router.push(callbackUrl);
        }
      } else {
        setLoginErrorMsg(data.error || "Username atau password salah.");
      }
    } catch (err) {
      setLoginErrorMsg("Terjadi gangguan koneksi ke server. Silakan coba lagi.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setLoginErrorMsg("");
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      const isMobile = window.innerWidth < 640;
      const yOffset = isMobile ? -65 : -140;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const qrisData = portalData?.qris || {
    qrisImageUrl: "/qris-masjid.png",
    qrisBank: "Bank Syariah Indonesia (BSI)",
    qrisNama: "Masjid Baitul Maghfirah",
    qrisRekening: null,
    qrisKeterangan: "Scan untuk Infaq, Sedekah dan Donasi",
  };

  // Parsing hitungan mundur (detik, menit, jam) untuk Flip Clock Mekanis
  const totalSecondsLeft = nextPrayer?.secondsLeft ?? 0;
  const countdownHours = String(Math.floor(totalSecondsLeft / 3600)).padStart(2, "0");
  const countdownMinutes = String(Math.floor((totalSecondsLeft % 3600) / 60)).padStart(2, "0");
  const countdownSeconds = String(totalSecondsLeft % 60).padStart(2, "0");

  // Ekstrak info kontak (No Telp & Email) persis seperti TV Display
  const kontakRaw = portalData?.profil?.kontakOrganisasi || "";
  const phoneMatch = kontakRaw.match(/(?:Telp|WA|HP|Kontak)?[:\s]*([0-9\(\)\s\-\+]{8,20})/i);
  const emailMatch = kontakRaw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

  const displayPhone = phoneMatch ? phoneMatch[1].trim() : "0812-4604-3951";
  const displayEmail = emailMatch ? emailMatch[1].trim() : "baitul.maghfirah.kloposepuluh@gmail.com";

  // 5 Waktu Sholat dengan Ikon SVG dari Web Publik (Sama persis TV Display)
  const prayerList = [
    {
      label: "Subuh",
      time: prayerSchedule?.subuh,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M20 12h2M17.66 6.34l1.41-1.41" />
          <path d="M7 16a5 5 0 0 1 10 0" />
          <path d="M3 20c4-2 14-2 18 0" />
        </svg>
      ),
    },
    {
      label: "Dzuhur",
      time: prayerSchedule?.dzuhur,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      label: "Ashar",
      time: prayerSchedule?.ashar,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2" />
          <path d="M17.5 19H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 2.9A4 4 0 0 1 17.5 19z" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "Maghrib",
      time: prayerSchedule?.maghrib,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v2M4.93 6.93l1.41 1.41M17.66 8.34l1.41-1.41" />
          <circle cx="12" cy="14" r="4" fill="currentColor" />
          <path d="M3 19c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
          <path d="M3 22c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
        </svg>
      ),
    },
    {
      label: "Isya",
      time: prayerSchedule?.isya,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          <path d="M19 3l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#111317] selection:bg-emerald-600 selection:text-white relative font-sans">
      {/* Background Image Layer (Persis Seperti TV Display - Jernih, Tajam, Alami & Kualitas Penuh 100%) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-tv-display.jpg')",
        }}
      />

      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-16 relative z-10">
        {/* ========================================================= */}
        {/* 1. HEADER UTAMA (Responsif HP & Desktop: Gaya TV Display) */}
        {/* ========================================================= */}
        <header className="sticky top-2 sm:top-3 z-40 bg-white/20 backdrop-blur-md p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2.5 sm:space-y-3.5 transition-all">
          {/* Identitas Masjid & Kaligrafi Arab (Sesuai Gaya TV Display) */}
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Sisi Kiri: Logo + Nama Masjid + Alamat + Kontak */}
            <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-masjid-baitul-maghfirah.png"
                  alt="Logo Masjid"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Masjid Baitul Maghfirah
                </h1>
                <p className="hidden sm:block text-[9px] sm:text-xs lg:text-sm font-semibold text-emerald-900 leading-snug mt-0.5 break-words">
                  {portalData?.profil?.alamatOrganisasi || "Jl. Raya Kloposepuluh, RT : 11, RW : 03, - Sukodono - Sidoarjo"}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2.5 text-[9px] sm:text-xs lg:text-[13px] font-medium text-emerald-900 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-800 flex-shrink-0" />
                    <span>{displayPhone}</span>
                  </span>
                  <span className="hidden sm:inline text-emerald-900/40">•</span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-800 flex-shrink-0" />
                    <span className="break-all sm:break-normal">{displayEmail}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Kaligrafi Arab (Selalu Ditampilkan di Web & HP) */}
            <div className="flex h-9 sm:h-14 lg:h-18 items-center justify-end flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kaligrafi-masjid-hijau.png"
                alt="Masjid Baitul Maghfirah"
                className="h-full w-auto object-contain drop-shadow-2xs"
              />
            </div>
          </div>

          {/* Baris Link Navigasi (Responsif Swipe/Wrap: Singkat di HP, Penuh di Web) */}
          <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-center overflow-x-auto">
            <nav className="flex items-center justify-center gap-x-1.5 sm:gap-x-6 text-[11px] sm:text-xs font-bold text-slate-900 whitespace-nowrap min-w-full sm:min-w-0 px-1">
              <a
                href="#waktu-sholat"
                onClick={(e) => scrollToSection(e, "waktu-sholat")}
                className="hover:text-emerald-700 hover:bg-emerald-50 px-2 sm:px-3 py-1 rounded-xl transition cursor-pointer"
              >
                <span className="sm:hidden">Sholat</span>
                <span className="hidden sm:inline">Waktu Sholat</span>
              </a>
              <a
                href="#transparansi-kas"
                onClick={(e) => scrollToSection(e, "transparansi-kas")}
                className="hover:text-emerald-700 hover:bg-emerald-50 px-2 sm:px-3 py-1 rounded-xl transition cursor-pointer"
              >
                <span className="sm:hidden">Keuangan</span>
                <span className="hidden sm:inline">Laporan Keuangan</span>
              </a>
              <a
                href="#fasilitas"
                onClick={(e) => scrollToSection(e, "fasilitas")}
                className="hover:text-emerald-700 hover:bg-emerald-50 px-2 sm:px-3 py-1 rounded-xl transition cursor-pointer"
              >
                <span>Fasilitas</span>
              </a>
              <a
                href="#agenda-ibadah"
                onClick={(e) => scrollToSection(e, "agenda-ibadah")}
                className="hover:text-emerald-700 hover:bg-emerald-50 px-2 sm:px-3 py-1 rounded-xl transition cursor-pointer"
              >
                <span className="sm:hidden">Kegiatan</span>
                <span className="hidden sm:inline">Kegiatan Masjid</span>
              </a>
              <a
                href="#saran-aspirasi"
                onClick={(e) => scrollToSection(e, "saran-aspirasi")}
                className="hover:text-emerald-700 hover:bg-emerald-50 px-2 sm:px-3 py-1 rounded-xl transition cursor-pointer"
              >
                <span className="sm:hidden">Saran</span>
                <span className="hidden sm:inline">Saran & Aspirasi</span>
              </a>
            </nav>
          </div>
        </header>

      {/* ========================================================= */}
      {/* 1. SECTION: WAKTU SHOLAT & COUNTDOWN (Gaya TV Display)    */}
      {/* ========================================================= */}
      <section id="waktu-sholat" className="scroll-mt-36 sm:scroll-mt-44 space-y-6">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-7 lg:p-8 flex flex-col gap-4 sm:gap-6">
          
          {/* Header Judul Jadwal Sholat (Persis TV Display) */}
          <div className="flex flex-col items-center text-center gap-1">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-wider text-slate-900 flex items-center justify-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Jadwal Sholat</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </h3>
            {prayerSchedule && (
              <p className="text-xs sm:text-sm font-bold text-emerald-900">
                {prayerSchedule.tanggalMasehi} • {prayerSchedule.hijriah}
              </p>
            )}
          </div>

          {/* Kartu 5 Waktu Sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya) Sesuai Gaya TV Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {prayerList.map((p, idx) => {
              const isNext = nextPrayer?.name.toLowerCase() === p.label.toLowerCase();
              return (
                <div
                  key={idx}
                  className={`px-3.5 py-2.5 sm:px-4 sm:py-3.5 rounded-xl flex items-center justify-between transition-all duration-300 ${
                    isNext
                      ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-950/20 border border-slate-800"
                      : "bg-white/60 hover:bg-white/80 text-slate-800 border border-white/70 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isNext ? "text-emerald-400" : "text-emerald-600"}>
                      {p.icon}
                    </div>
                    <span className="text-sm sm:text-xs lg:text-sm font-black uppercase tracking-tight">
                      {p.label}
                    </span>
                  </div>
                  <span className="font-mono font-black text-xl sm:text-base lg:text-lg tracking-normal drop-shadow-2xs">
                    {p.time || "--:--"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bagian Countdown Menuju Sholat (Persis Gaya TV Display) */}
          <div className="pt-3 sm:pt-6 border-t border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 text-sm sm:text-base lg:text-lg font-extrabold text-slate-800 mb-1.5 sm:mb-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 animate-pulse" />
              <span>
                Menuju Sholat <strong className="text-emerald-700 font-black text-lg sm:text-xl lg:text-2xl uppercase">{nextPrayer?.name || "..."}</strong>
              </span>
            </div>

            {/* Flip Clock Cards (Jam, Menit, Detik) */}
            <div className="flex items-start justify-center gap-1.5 sm:gap-2.5 py-1">
              <FlipCard label="Jam" value={countdownHours} />
              <div className="h-16 sm:h-20 lg:h-[84px] flex items-center justify-center text-slate-900 font-black text-base sm:text-xl lg:text-2xl">
                <span>:</span>
              </div>
              <FlipCard label="Menit" value={countdownMinutes} />
              <div className="h-16 sm:h-20 lg:h-[84px] flex items-center justify-center text-slate-900 font-black text-base sm:text-xl lg:text-2xl">
                <span>:</span>
              </div>
              <FlipCard label="Detik" value={countdownSeconds} />
            </div>

            <p className="text-xs sm:text-sm text-slate-900 font-medium pt-2 leading-normal">
              Waktu sholat berpedoman pada standar Kemenag RI untuk wilayah Kabupaten Sidoarjo.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECTION: LAPORAN KEUANGAN & KAS REALTIME               */}
      {/* ========================================================= */}
      <section id="transparansi-kas" className="scroll-mt-36 sm:scroll-mt-44 space-y-6">
        {/* Header Section Keuangan Masjid */}
        <div className="bg-emerald-600 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center gap-4 text-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            KEUANGAN MASJID
          </h3>
          <p className="text-xs sm:text-sm text-white font-medium mt-0.5 max-w-2xl leading-relaxed">
            Pengelolaan Terpisah Kas Jariyah dan Kas Infaq/Shodaqoh
          </p>
        </div>

        {/* Ringkasan 3 Kartu Saldo + QRIS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sisi Kiri: 3 Kartu Saldo & Catatan Transaksi (8 Kolom) */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1 Kotak Utuh: Informasi Kas Jariyah, Kas Infaq, dan Total Saldo Kas */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70">
                {/* 1. Kas Jariyah */}
                <div className="p-5 sm:p-6 flex flex-col justify-between space-y-3 hover:bg-teal-50/20 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                      <Landmark className="w-4 h-4" />
                      <span>Kas Jariyah</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-semibold border border-teal-200/60">
                      Pembangunan
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700">Saldo Kas Jariyah:</span>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {portalData?.keuangan ? formatRupiah(portalData.keuangan.saldoJariyah) : "..."}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100 leading-relaxed">
                    Renovasi fisik, sarana ibadah & fasilitas gedung.
                  </p>
                </div>

                {/* 2. Kas Infaq */}
                <div className="p-5 sm:p-6 flex flex-col justify-between space-y-3 hover:bg-amber-50/20 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                      <HeartHandshake className="w-4 h-4" />
                      <span>Kas Infaq</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
                      Operasional
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700">Saldo Kas Infaq:</span>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {portalData?.keuangan ? formatRupiah(portalData.keuangan.saldoInfaq) : "..."}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100 leading-relaxed">
                    Operasional harian, listrik, air, kajian & takmir.
                  </p>
                </div>

                {/* 3. Total Saldo Kas (Highlight) */}
                <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 flex flex-col justify-between space-y-3 hover:bg-emerald-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                      <Coins className="w-4 h-4 text-emerald-700" />
                      <span>Total Saldo Kas</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white font-bold tracking-wide shadow-xs">
                      Jariyah + Infaq
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-900">Total Akumulasi Seluruh Kas:</span>
                    <h4 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 mt-0.5 tracking-tight">
                      {portalData?.keuangan ? formatRupiah(portalData.keuangan.totalKas) : "..."}
                    </h4>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 pt-2 border-t border-emerald-200/80 leading-relaxed font-medium">
                    Gabungan Kas Jariyah & Kas Infaq tersimpan akuntabel.
                  </p>
                </div>
              </div>
            </div>

            {/* Catatan Transaksi Kas Terakhir (Tabel Kolom seperti Modul Keuangan) */}
            {Boolean(portalData?.keuangan?.transaksiTerkini && portalData.keuangan.transaksiTerkini.length > 0) && (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3.5">
                <div className="flex items-center justify-between text-xs text-slate-900 font-semibold">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Catatan Transaksi Terakhir</h4>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/60 shadow-2xs">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100/80 border-b border-slate-300 text-slate-900 font-bold uppercase text-[10px] sm:text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center font-mono">No</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Tanggal</th>
                        <th className="py-3 px-3.5">Jenis</th>
                        <th className="py-3 px-3.5">Kategori Kas</th>
                        <th className="py-3 px-3.5">Uraian / Keterangan</th>
                        <th className="py-3 px-3.5 text-right whitespace-nowrap">Nominal (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portalData.keuangan.transaksiTerkini.slice(0, 5).map((trx: any, idx: number) => {
                        const isMasuk = trx.jenis === "MASUK";
                        const isJariyah = trx.kategoriKas === "JARIYAH";

                        return (
                          <tr key={trx.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap text-xs">
                              {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${isMasuk
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                                  }`}
                              >
                                {isMasuk ? (
                                  <>
                                    <ArrowDownLeft className="w-3.5 h-3.5" />
                                    <span>Masuk</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>Keluar</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${isJariyah
                                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                              >
                                {isJariyah ? (
                                  <>
                                    <Landmark className="w-3.5 h-3.5" />
                                    <span>Kas Jariyah</span>
                                  </>
                                ) : (
                                  <>
                                    <HeartHandshake className="w-3.5 h-3.5" />
                                    <span>Kas Infaq</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 min-w-[200px]">
                              <div className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2" title={trx.keterangan}>
                                {trx.keterangan}
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono font-bold text-xs sm:text-sm">
                              <span className={isMasuk ? "text-emerald-700" : "text-rose-600"}>
                                {isMasuk ? "+ " : "- "}
                                {formatRupiah(trx.nominal)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sisi Kanan: Kotak QRIS Infaq (4 Kolom) */}
          <div className="lg:col-span-4 bg-white/20 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-4">
            {/* Header Keterangan QRIS Hijau (2.5x lebih besar) */}
            <div className="w-full flex items-center justify-center py-2 px-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qris-header-hijau.png"
                alt="QRIS - QR Code Standar Pembayaran Nasional"
                className="w-full max-w-[250px] sm:max-w-[290px] h-auto object-contain drop-shadow-sm transition-transform hover:scale-[1.02]"
              />
            </div>

            {/* Kotak Card QRIS Sesuai Desain */}
            <div
              onClick={() => setShowQrisModal(true)}
              className="group relative w-full max-w-[280px] sm:max-w-[310px] cursor-pointer rounded-2xl overflow-hidden shadow-lg shadow-emerald-950/8 border border-emerald-900/10 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white"
              title="Klik untuk memperbesar / scan"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrisData.qrisImageUrl || "/qris-masjid.png"}
                alt="QRIS Infaq Masjid Baitul Maghfirah"
                className="w-full h-auto object-contain block"
              />
              <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-white/95 text-emerald-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Maximize2 className="w-3.5 h-3.5" /> Perbesar QRIS
                </span>
              </div>
            </div>

            {/* Logo Layanan Pembayaran QRIS */}
            <div className="w-full max-w-[280px] sm:max-w-[310px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qris-payment-methods.png"
                alt="Layanan Pembayaran QRIS (GoPay, OVO, DANA, ShopeePay, BCA Mobile)"
                className="w-full max-w-[230px] sm:max-w-[260px] h-auto object-contain drop-shadow-2xs"
              />
            </div>

            {/* Opsi Rekening Transfer Bank jika diatur */}
            {qrisData.qrisRekening && (
              <div className="w-full max-w-[310px] bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-left space-y-1">
                <div className="text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
                  <span>{qrisData.qrisBank || "Bank Syariah Indonesia"}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRekening(qrisData.qrisRekening)}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shadow-2xs transition active:scale-95"
                  >
                    {copiedRekening ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedRekening ? "Tersalin!" : "Salin"}</span>
                  </button>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                  {qrisData.qrisRekening}
                </div>
                <div className="text-[10px] text-slate-900 font-medium truncate">
                  a.n. {qrisData.qrisNama || "Masjid Baitul Maghfirah"}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SECTION: FASILITAS & LAYANAN JAMAAH                    */}
      {/* ========================================================= */}
      <section id="fasilitas" className="scroll-mt-36 sm:scroll-mt-44 space-y-6">
        {/* Header Section Fasilitas & Pelayanan */}
        <div className="bg-emerald-600 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center gap-4 text-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {portalData?.fasilitas?.judul || "Fasilitas & Pelayanan"}
          </h3>
          <p className="text-xs sm:text-sm text-white font-medium mt-0.5 max-w-2xl leading-relaxed">
            {portalData?.fasilitas?.slogan || "Berkhidmat untuk Jamaah, Merawat Rumah Allah."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Cards Fasilitas (7 Kolom) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(portalData?.fasilitas?.items && portalData.fasilitas.items.length > 0
              ? portalData.fasilitas.items
              : [
                { id: 1, judul: "Bimbingan Al-Qur'an", deskripsi: "Program tahsin, tadarrus, dan pembinaan membaca Al-Qur'an rutin ba'da Maghrib untuk generasi muda dan jamaah umum.", icon: "BookOpen" },
                { id: 2, judul: "Ukhuwah & Dakwah", deskripsi: "Kajian fiqih, tafsir, dan majelis ta'lim yang mempererat kerukunan serta wawasan keislaman warga.", icon: "Heart" },
                { id: 3, judul: "Petugas Sholat Jum'at", deskripsi: "Penjadwalan khotib, imam, dan bilal sholat Jum'at yang transparan dan terorganisir dengan tema khutbah mendidik.", icon: "Calendar" },
                { id: 4, judul: "Infaq & Transparansi Kas", deskripsi: "Pencatatan kas jariyah dan infaq operasional yang akuntabel, serta kemudahan donasi digital via scan QRIS resmi.", icon: "Coins" },
              ]
            ).map((item: { id: number; judul: string; deskripsi: string; icon: string; fotoUrl?: string | null }) => {
              const IconComp = getIconForFasilitas(item.icon);
              return (
                <div
                  key={item.id}
                  className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/80 transition flex flex-col justify-between space-y-3"
                >
                  {item.fotoUrl ? (
                    <div className="w-full h-36 rounded-2xl overflow-hidden shadow-sm relative bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.fotoUrl}
                        alt={item.judul}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#16171b] text-white flex items-center justify-center shadow-sm">
                      <IconComp className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.judul}
                    </h4>
                    <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Foto Masjid (5 Kolom) */}
          <div className="lg:col-span-5 bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="relative w-full h-64 sm:h-72 lg:h-full rounded-2xl overflow-hidden shadow-sm min-h-[260px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portalData?.fasilitas?.fotoUrl || "/bg_masjid.jpg"}
                alt="Masjid Baitul Maghfirah"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs font-semibold text-emerald-300">
                  {portalData?.profil?.namaOrganisasi || "Masjid Baitul Maghfirah"}
                </span>
                <h4 className="text-base font-bold">
                  Kloposepuluh • Sukodono • Sidoarjo
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ========================================================= */}
      {/* 4. SECTION: KEGIATAN MASJID & AGENDA DAKWAH               */}
      {/* ========================================================= */}
      <section id="agenda-ibadah" className="scroll-mt-36 sm:scroll-mt-44 space-y-6">
        {/* Header Section Sholat Jum'at dan Kegiatan Masjid */}
        <div className="bg-emerald-600 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center gap-4 text-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Sholat Jum'at dan Kegiatan Masjid
          </h3>
          <p className="text-xs sm:text-sm text-white font-medium mt-0.5 max-w-2xl leading-relaxed">
            Petugas Jum'at terdekat dan jadwal kegiatan masjid
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Petugas Sholat Jum'at (7 Kolom) */}
          <div className="lg:col-span-7 bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/60">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Petugas Sholat Jum&apos;at Terdekat
                  </h4>
                  <p className="text-xs text-slate-800 font-medium">
                    {portalData?.ibadah?.upcomingJumat
                      ? new Date(portalData.ibadah.upcomingJumat.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "Jadwal segera diumumkan"}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Waktu Dzuhur
              </span>
            </div>

            {portalData?.ibadah?.upcomingJumat ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Khotib Sholat Jum&apos;at
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {portalData.ibadah.upcomingJumat.khotib || "Dalam Konfirmasi"}
                  </div>
                  {portalData.ibadah.upcomingJumat.temaKhutbah && (
                    <p className="text-xs text-slate-800 italic mt-0.5">
                      &quot;{portalData.ibadah.upcomingJumat.temaKhutbah}&quot;
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Imam Sholat Jum&apos;at
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {portalData.ibadah.upcomingJumat.imam || portalData.ibadah.upcomingJumat.khotib || "Dalam Konfirmasi"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 block">
                    Bilal / Muadzin
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {portalData.ibadah.upcomingJumat.bilal || "-"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 block">
                    Pembaca Pengumuman
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {portalData.ibadah.upcomingJumat.pembacaPengumuman || "-"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-800 text-xs font-semibold">
                Jadwal petugas sholat Jum&apos;at sedang disiapkan oleh Takmir Bidang Ibadah.
              </div>
            )}
          </div>

          {/* Jadwal Kegiatan Rutin (5 Kolom) */}
          <div className="lg:col-span-5 bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                Agenda Kegiatan Rutin
              </h4>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {Boolean(portalData?.ibadah?.kegiatanMingguan && portalData.ibadah.kegiatanMingguan.length > 0) && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Rutin Mingguan
                  </span>
                  {portalData.ibadah.kegiatanMingguan.map((k: any) => (
                    <div key={k.id} className="p-3 rounded-2xl bg-white/60 border border-white/70 shadow-2xs text-xs">
                      <div className="font-bold text-slate-900">{k.namaKegiatan}</div>
                      <div className="text-slate-800 font-medium text-xs mt-0.5">
                        Setiap {k.hari}, Pukul {k.waktu} WIB • {k.pengisi || "Takmir"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {Boolean(portalData?.ibadah?.kegiatanBulanan && portalData.ibadah.kegiatanBulanan.length > 0) && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    Rutin Bulanan
                  </span>
                  {portalData.ibadah.kegiatanBulanan.map((k: any) => (
                    <div key={k.id} className="p-3 rounded-2xl bg-white/60 border border-white/70 shadow-2xs text-xs">
                      <div className="font-bold text-slate-900">{k.namaKegiatan}</div>
                      <div className="text-slate-800 font-medium text-xs mt-0.5">
                        {k.siklusBulanan || k.hari}, Pukul {k.waktu} WIB
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!portalData?.ibadah?.kegiatanMingguan?.length && !portalData?.ibadah?.kegiatanBulanan?.length && (
                <p className="text-xs text-slate-800 font-semibold text-center py-6">
                  Belum ada agenda kegiatan rutin yang tercatat.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================= */}
      {/* 5. SECTION: KOTAK SARAN & ASPIRASI JAMAAH                 */}
      {/* ========================================================= */}
      <section id="saran-aspirasi" className="scroll-mt-36 sm:scroll-mt-44 bg-white/20 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
        {/* Header Section Saran & Aspirasi */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col items-center text-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200/80 shadow-sm">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-0.5">
              <span>Partisipasi & Masukan</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saran & Aspirasi Jamaah
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1 max-w-xl text-center">
              Masukan Anda diteruskan ke pengurus terkait: Administrasi, Ibadah & Dakwah, atau Keuangan Kas.
            </p>
          </div>
        </div>

        {saranSuccessMsg && (
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p>{saranSuccessMsg}</p>
              <p className="text-xs text-emerald-700 mt-0.5">Jazakumullah khairan katsiran atas kepedulian Anda.</p>
            </div>
          </div>
        )}

        {saranErrorMsg && (
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-center gap-2.5 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{saranErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitSaran} className="space-y-4 max-w-3xl mx-auto">
          {/* Pilihan Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">
              Pilih Bidang Pengurus yang Dituju:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: "IBADAH", icon: Compass, label: "Ibadah & Dakwah", desc: "Kajian, Sholat, Jum'at" },
                { key: "KEUANGAN", icon: Coins, label: "Keuangan & Kas", desc: "Infaq, Alokasi Dana" },
                { key: "SURAT", icon: Send, label: "Administrasi", desc: "Persuratan, Proposal" },
                { key: "UMUM", icon: HeartHandshake, label: "Sarana & Umum", desc: "Kebersihan, Fasilitas" },
              ].map((item) => {
                const isSelected = saranKategori === item.key;
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => setSaranKategori(item.key)}
                    className={`p-3.5 rounded-2xl text-left border transition ${isSelected
                      ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-sm"
                      : "bg-white/60 border-white/70 text-slate-900 hover:bg-white/80 shadow-2xs"
                      }`}
                  >
                    <item.icon className="w-5 h-5 text-emerald-600 mb-1.5" />
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-800 font-medium">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Nama Anda (Opsional)
              </label>
              <input
                type="text"
                value={saranNama}
                onChange={(e) => setSaranNama(e.target.value)}
                placeholder="Kosongkan jika Hamba Allah"
                className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Nomor Kontak / WhatsApp (Opsional)
              </label>
              <input
                type="text"
                value={saranKontak}
                onChange={(e) => setSaranKontak(e.target.value)}
                placeholder="Untuk balasan atau konfirmasi"
                className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Topik / Judul Masukan (Opsional)
            </label>
            <input
              type="text"
              value={saranJudul}
              onChange={(e) => setSaranJudul(e.target.value)}
              placeholder="Contoh: Usulan fasilitas air wudhu atau materi kajian"
              className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Isi Masukan, Saran, atau Pertanyaan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={saranPesan}
              onChange={(e) => setSaranPesan(e.target.value)}
              placeholder="Tuliskan masukan atau saran membangun Anda untuk DKM Masjid Baitul Maghfirah..."
              className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={saranSubmitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{saranSubmitting ? "Mengirimkan..." : "Kirim Masukan Sekarang"}</span>
          </button>
        </form>
      </section>

      {/* ========================================================= */}
      {/* 10. FOOTER                                                */}
      {/* ========================================================= */}
      <footer className="bg-white/20 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 p-1 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-masjid-baitul-maghfirah.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                  Masjid Baitul Maghfirah
                </h4>
                <p className="text-xs text-slate-800 font-bold tracking-wide mt-0.5">
                  Kloposepuluh • Sukodono • Sidoarjo
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed max-w-sm">
              Menjaga Ukhuwah Islamiyah, Ahlussunnah Wal Jama&apos;ah An-nahdliyah
            </p>
          </div>

          <div className="md:col-span-4 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Informasi & Layanan
            </h5>
            <div className="space-y-1.5 text-xs font-semibold text-slate-900">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>0812-3456-7890 (Takmir / Humas)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{portalData?.profil?.alamatOrganisasi || "Jl. Raya Kloposepuluh, RT : 11, RW : 03, - Sukodono - Sidoarjo"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>baitulmaghfirah.kloposepuluh@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Akses Cepat
            </h5>
            <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-900">
              <a href="/display" target="_blank" className="hover:text-emerald-600 transition flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-emerald-600" />
                <span>Layar TV Display Masjid</span>
              </a>
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-left hover:text-emerald-600 transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portal Login Pengurus Masjid</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-slate-800">
          <div>© 2026 Masjid Baitul Maghfirah</div>
          <div className="text-emerald-700 font-semibold">Sistem Administrasi, Keuangan & Ibadah Masjid</div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 11. MODAL LOGIN PENGURUS                                  */}
      {/* ========================================================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5 relative">
            {/* Tombol Tutup */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Identitas Modal */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto p-2 border border-emerald-200/60 flex items-center justify-center shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-masjid-baitul-maghfirah.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Login Pengurus Masjid
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  Masuk ke sistem manajemen persuratan, keuangan & ibadah
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {loginErrorMsg && (
              <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-2xl font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{loginErrorMsg}</span>
              </div>
            )}

            {/* Formulir Login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Username Pengurus
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-orange-500 text-white font-semibold text-xs sm:text-sm py-3 rounded-2xl shadow-md shadow-emerald-600/25 transition-all active:scale-98 disabled:opacity-50 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loginLoading ? "Memproses Masuk..." : "Masuk ke Sistem Pengurus"}</span>
              </button>
            </form>

            {/* Quick Fill Akun Demo */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-slate-800 text-center uppercase tracking-wider">
                Akses Cepat (Demo):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin", "admin123")}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-900 font-semibold transition border border-slate-200 text-center hover:border-emerald-300"
                >
                  <span className="block text-slate-900 font-bold">Admin</span>
                  <span className="text-[10px] text-slate-700 font-semibold">admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("sekretaris", "surat123")}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-900 font-semibold transition border border-slate-200 text-center hover:border-emerald-300"
                >
                  <span className="block text-slate-900 font-bold">Sekretaris</span>
                  <span className="text-[10px] text-slate-700 font-semibold">sekretaris</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("bendahara", "keuangan123")}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-900 font-semibold transition border border-slate-200 text-center hover:border-emerald-300"
                >
                  <span className="block text-slate-900 font-bold">Bendahara</span>
                  <span className="text-[10px] text-slate-700 font-semibold">bendahara</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("ibadah", "ibadah123")}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-900 font-semibold transition border border-slate-200 text-center hover:border-emerald-300"
                >
                  <span className="block text-slate-900 font-bold">Ibadah</span>
                  <span className="text-[10px] text-slate-700 font-semibold">ibadah</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL PERBESAR QRIS (LIGHTBOX)                           */}
      {/* ========================================================= */}
      {showQrisModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQrisModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl space-y-4 border border-white/20 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qris-header-hijau.png"
                alt="QRIS - QR Code Standar Pembayaran Nasional"
                className="h-10 sm:h-12 w-auto max-w-[220px] sm:max-w-[260px] object-contain"
              />
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="p-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gambar QRIS Penuh */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrisData.qrisImageUrl || "/qris-masjid.png"}
                alt="QRIS Masjid Baitul Maghfirah"
                className="w-full h-auto object-contain mx-auto block"
              />
            </div>

            {/* Logo Layanan Pembayaran QRIS */}
            <div className="w-full flex items-center justify-center pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qris-payment-methods.png"
                alt="Layanan Pembayaran QRIS (GoPay, OVO, DANA, ShopeePay, BCA Mobile)"
                className="w-full max-w-[240px] sm:max-w-[270px] h-auto object-contain drop-shadow-2xs"
              />
            </div>

            {/* Petunjuk & Tombol Simpan */}
            <div className="space-y-3 pt-1">
              <p className="text-[11px] sm:text-xs text-slate-800 font-medium text-center leading-relaxed">
                Scan barcode ini menggunakan aplikasi m-Banking (BCA, BSI, Mandiri, dll.) atau Dompet Digital (GoPay, OVO, DANA, ShopeePay).
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={qrisData.qrisImageUrl || "/qris-masjid.png"}
                  download="QRIS-Masjid-Baitul-Maghfirah.png"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Simpan Gambar ke Galeri</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function PublicPortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-900 text-sm bg-[#faf8f5] font-semibold">
          Memuat halaman portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
