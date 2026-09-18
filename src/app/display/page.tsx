"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Calendar,
  Coins,
  BookOpen,
  Users,
  Maximize,
  Minimize,
  VolumeX,
  Sparkles,
  QrCode,
  TrendingUp,
  TrendingDown,
  Landmark,
  HeartHandshake,
  Heart,
  Volume2,
  Phone,
  MapPin,
  Mail,
  Shield,
  Star,
  Leaf,
  Music,
  GraduationCap,
  Home,
  Globe,
  Zap,
  LayoutGrid,
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight,
  Maximize2
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
// ============================================================
interface FlipCardProps {
  label: string;
  value: string;
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
      <div className="relative w-18 sm:w-24 lg:w-[96px] h-16 sm:h-20 lg:h-[84px] bg-[#16171b] rounded-xl border border-white/20 shadow-[0_4px_14px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col font-extrabold font-displayClock text-white select-none flip-card-container">
        {/* 1. LAYER STATIS ATAS */}
        <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#252730] to-[#18191f] border-b border-black/85 flex items-end justify-center z-0">
          <span className="translate-y-[50%] text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
            {flipping ? value : displayedValue}
          </span>
        </div>

        {/* 2. LAYER STATIS BAWAH */}
        <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#141518] to-[#0b0c0e] flex items-start justify-center z-0">
          <span className="-translate-y-[50%] text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
            {flipping ? previousValue : displayedValue}
          </span>
        </div>

        {/* 3. FLAP ATAS MEKANIS */}
        {flipping && (
          <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#2b2d38] to-[#1a1b22] border-b border-black/85 flex items-end justify-center animate-flap-fall z-20 shadow-md">
            <span className="translate-y-[50%] text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
              {previousValue}
            </span>
          </div>
        )}

        {/* 4. FLAP BAWAH MEKANIS */}
        {flipping && (
          <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#1a1b22] to-[#0c0d10] flex items-start justify-center animate-flap-rise z-20 shadow-md">
            <span className="-translate-y-[50%] text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wider">
              {value}
            </span>
          </div>
        )}

        {/* Slit Tengah */}
        <div className="absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 bg-black/95 z-30 shadow-[0_1px_1px_rgba(255,255,255,0.08)] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-1.5 h-2.5 -translate-y-1/2 bg-neutral-900 border border-neutral-700 rounded-r-xs z-40" />
        <div className="absolute top-1/2 right-0 w-1.5 h-2.5 -translate-y-1/2 bg-neutral-900 border border-neutral-700 rounded-l-xs z-40" />
      </div>

      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black font-sans mt-0.5">
        {label}
      </span>
    </div>
  );
};

export default function MosqueTvDisplayPage() {
  const [portalData, setPortalData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerTimeSchedule | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);

  // Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mode Khusyu' Sholat
  const [isPrayerTimeActive, setIsPrayerTimeActive] = useState(false);
  const [activePrayerName, setActivePrayerName] = useState("");
  const [simulationModeSholat, setSimulationModeSholat] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/public/portal-info");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPortalData(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal load data TV Display:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, 60000);
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const schedule = calculateSidoarjoPrayerTimes(now);
      setPrayerSchedule(schedule);
      setNextPrayer(getNextPrayer(schedule, now));
      checkIsPrayerTime(now, schedule);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkIsPrayerTime = (now: Date, schedule: PrayerTimeSchedule) => {
    const isFriday = now.getDay() === 5;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const parseToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };
    const prayerWindows = [
      { name: "Subuh", start: parseToMinutes(schedule.subuh), duration: 20 },
      {
        name: isFriday ? "Jum'at" : "Dzuhur",
        start: parseToMinutes(schedule.dzuhur),
        duration: isFriday ? 45 : 15,
      },
      { name: "Ashar", start: parseToMinutes(schedule.ashar), duration: 15 },
      { name: "Maghrib", start: parseToMinutes(schedule.maghrib), duration: 15 },
      { name: "Isya'", start: parseToMinutes(schedule.isya), duration: 15 },
    ];
    let foundActive = false;
    for (const p of prayerWindows) {
      if (nowMinutes >= p.start && nowMinutes < p.start + p.duration) {
        setIsPrayerTimeActive(true);
        setActivePrayerName(p.name);
        foundActive = true;
        break;
      }
    }
    if (!foundActive) {
      setIsPrayerTimeActive(false);
      setActivePrayerName("");
    }
  };

  // Bangun Slide Dinamis
  const baseSlides: {
    type: "KEUANGAN" | "FASILITAS" | "JUMAT_AGENDA" | "CUSTOM_PHOTO";
    title: string;
    subtitle?: string;
    fotoUrl?: string;
  }[] = [
    {
      type: "KEUANGAN",
      title: "KEUANGAN MASJID",
      subtitle: "Pengelolaan Terpisah Kas Jariyah dan Kas Infaq/Shodaqoh",
    },
    {
      type: "FASILITAS",
      title: portalData?.fasilitas?.judul || "Fasilitas & Pelayanan",
      subtitle: portalData?.fasilitas?.slogan || "Berkhidmat untuk Jamaah, Merawat Rumah Allah.",
    },
    {
      type: "JUMAT_AGENDA",
      title: "Sholat Jum'at dan Kegiatan Masjid",
      subtitle: "Petugas Jum'at terdekat dan jadwal kegiatan dakwah ibadah masjid",
    },
  ];

  const customPhotoSlides: {
    type: "CUSTOM_PHOTO";
    title: string;
    subtitle?: string;
    fotoUrl?: string;
  }[] = (portalData?.displaySlides || []).map((s: any) => ({
    type: "CUSTOM_PHOTO" as const,
    title: s.judul || "Informasi & Pengumuman",
    subtitle: "Masjid Baitul Maghfirah",
    fotoUrl: s.fotoUrl,
  }));

  const slides = [...baseSlides, ...customPhotoSlides];

  useEffect(() => {
    if (isPaused || isPrayerTimeActive || simulationModeSholat || slides.length === 0) return;
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 12000);
    return () => clearInterval(slideTimer);
  }, [isPaused, isPrayerTimeActive, simulationModeSholat, slides.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const showQuietPrayerMode = isPrayerTimeActive || simulationModeSholat;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const qrisData = portalData?.qris || {
    qrisImageUrl: "/qris-masjid.png",
    qrisBank: "Bank Syariah Indonesia (BSI)",
    qrisNama: "Masjid Baitul Maghfirah",
    qrisNmid: null,
    qrisRekening: null,
    qrisKeterangan: "Scan untuk Infaq, Sedekah dan Donasi",
  };

  const totalSecondsLeft = nextPrayer?.secondsLeft ?? 0;
  const countdownHours = String(Math.floor(totalSecondsLeft / 3600)).padStart(2, "0");
  const countdownMinutes = String(Math.floor((totalSecondsLeft % 3600) / 60)).padStart(2, "0");
  const countdownSeconds = String(totalSecondsLeft % 60).padStart(2, "0");

  const currentHours = String(currentTime.getHours()).padStart(2, "0");
  const currentMinutes = String(currentTime.getMinutes()).padStart(2, "0");
  const currentSeconds = String(currentTime.getSeconds()).padStart(2, "0");

  // 5 Waktu Sholat dengan Ikon SVG dari Web Publik
  const prayerList = [
    {
      label: "Subuh",
      time: prayerSchedule?.subuh,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      label: "Ashar",
      time: prayerSchedule?.ashar,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2" />
          <path d="M17.5 19H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 2.9A4 4 0 0 1 17.5 19z" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "Maghrib",
      time: prayerSchedule?.maghrib,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          <path d="M19 3l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
        </svg>
      ),
    },
  ];

  // Ekstrak info kontak (No Telp & Email)
  const kontakRaw = portalData?.profil?.kontakOrganisasi || "";
  const phoneMatch = kontakRaw.match(/(?:Telp|WA|HP|Kontak)?[:\s]*([0-9\(\)\s\-\+]{8,20})/i);
  const emailMatch = kontakRaw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

  const displayPhone = phoneMatch ? phoneMatch[1].trim() : "0812-4604-3951";
  const displayEmail = emailMatch ? emailMatch[1].trim() : "baitul.maghfirah.kloposepuluh@gmail.com";

  return (
    <div className="h-screen w-screen overflow-hidden relative select-none font-sans text-slate-800 bg-[#f8faf7]">
      {/* Background Image Layer (Daun Tropis Alami) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-tv-display.jpg')",
        }}
      />

      {/* Mode Khusyu' Sholat */}
      {showQuietPrayerMode ? (
        <div className="fixed inset-0 z-50 bg-[#060809] flex flex-col items-center justify-between p-8 sm:p-14 text-center">
          <div className="flex items-center justify-between w-full opacity-50 text-xs text-amber-200/70">
            <span>Masjid Baitul Maghfirah • Kloposepuluh Sidoarjo</span>
            <span className="font-mono text-sm">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
            </span>
          </div>

          <div className="max-w-4xl space-y-6 sm:space-y-8 my-auto flex flex-col items-center">
            {/* Logo Masjid Baitul Maghfirah */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center flex-shrink-0 drop-shadow-[0_4px_25px_rgba(245,158,11,0.25)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-masjid-baitul-maghfirah.png"
                alt="Logo Masjid Baitul Maghfirah"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-4xl sm:text-7xl font-serif text-amber-400/90 tracking-widest">
              اسْتَوُوا وَتَرَاصُّوا وَاعْتَدِلُوا
            </div>
            <div className="space-y-4 sm:space-y-5">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Luruskan dan Rapatkan Shaf
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 font-medium">
                Harap menonaktifkan nada dering handphone (HP)
              </p>
            </div>
            <div className="inline-flex items-center gap-3 px-7 py-3.5 rounded-3xl bg-amber-950/50 border border-amber-700/50 text-amber-300 text-base sm:text-lg shadow-inner">
              <VolumeX className="w-6 h-6 text-amber-400 animate-pulse flex-shrink-0" />
              <span>
                Sedang Berlangsung Ibadah Sholat{" "}
                <strong className="text-amber-200 uppercase">{activePrayerName ? activePrayerName.replace(/^Sholat\s+/i, "") : "Berjamaah"}</strong>
              </span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between opacity-30 hover:opacity-100 transition text-xs text-slate-500 pt-4 border-t border-slate-900">
            <span>Mode Khusyu&apos; Sholat aktif otomatis saat waktu sholat berlangsung.</span>
            {simulationModeSholat && (
              <button
                onClick={() => setSimulationModeSholat(false)}
                className="px-3 py-1.5 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Tutup Simulasi
              </button>
            )}
          </div>
        </div>
      ) : (
        /* KONDISI B: LAYOUT TV DISPLAY SESUAI SKETSA */
        <div className="relative z-10 flex h-screen w-screen p-5 sm:p-6 lg:p-7 gap-5 sm:gap-6 lg:gap-7 overflow-hidden">
          
          {/* ======================================================== */}
          {/* SISI KIRI (75% - 78%): HEADER ATAS + SLIDE + RUNNING TEXT */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col gap-5 sm:gap-6 min-w-0 h-full overflow-hidden">
            
            {/* 1. HEADER ATAS (Ditinggikan & Diperbesar) */}
            <header className="flex-shrink-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-6 sm:px-8 py-4 sm:py-5 min-h-[96px] sm:min-h-[110px] flex items-center justify-between gap-4">
              {/* Sisi Kiri: Logo + Nama Masjid + Alamat (Desain Sama Persis Web Publik) */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-masjid-baitul-maghfirah.png"
                    alt="Logo Masjid"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Masjid Baitul Maghfirah
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-emerald-900 tracking-wide mt-0.5">
                    {portalData?.profil?.alamatOrganisasi || "Jl. Raya Kloposepuluh, RT : 11, RW : 03, - Sukodono - Sidoarjo"}
                  </p>
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-emerald-900 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-800 flex-shrink-0" />
                      <span>{displayPhone}</span>
                    </span>
                    <span className="text-emerald-900/40">•</span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-800 flex-shrink-0" />
                      <span>{displayEmail}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Sisi Tengah: Waktu Saat Ini (Di antara Masjid Baitul... dan Kaligrafi Arab) */}
              <div className="flex flex-col items-center justify-center text-center px-3 py-1">
                <span className="text-sm sm:text-base lg:text-lg font-black uppercase tracking-wider text-emerald-900 mb-0.5">
                  Waktu Saat Ini
                </span>
                <div className="flex items-baseline justify-center gap-1.5 font-displayClock font-black text-slate-900 tracking-tight leading-none py-0.5">
                  <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 drop-shadow-xs">
                    {currentHours} : {currentMinutes}
                  </span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-emerald-900 font-mono">
                    :{currentSeconds}
                  </span>
                </div>
              </div>

              {/* Sisi Kanan: Kaligrafi Arab Hijau + Tanggal Masehi & Hijriyah */}
              <div className="flex flex-col items-end justify-center text-right">
                <div className="h-[52px] sm:h-16 lg:h-[74px] flex items-center justify-end">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/kaligrafi-masjid-hijau.png"
                    alt="Masjid Baitul Maghfirah"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 mt-1.5 px-3 py-1 rounded-xl border border-white/70 bg-white/60 shadow-2xs">
                  <span className="text-slate-900">{prayerSchedule?.tanggalMasehi || "..."}</span>
                  <span className="text-emerald-900/60">•</span>
                  <span className="text-emerald-900 font-bold">{prayerSchedule?.hijriah || "..."}</span>
                </div>
              </div>
            </header>

            {/* 2. SLIDE AREA (UTAMA) */}
            <div className={`flex-1 bg-white/20 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col min-h-0 overflow-hidden relative ${
              currentSlide.type === "CUSTOM_PHOTO" ? "p-0 bg-black/90" : "p-4 sm:p-5"
            }`}>
              
              {/* Header Slide (Hanya tampil untuk slide standar, tidak untuk slide foto penuh) */}
              {currentSlide.type !== "CUSTOM_PHOTO" && (
                <div className="flex-shrink-0 bg-emerald-600 rounded-xl py-2.5 px-4 mb-3 text-center shadow-xs flex items-center justify-between gap-2 border border-emerald-500/50">
                  <div className="flex items-center gap-1.5">
                    {/* Indikator Slide Bulat */}
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-2 rounded-full transition-all ${idx === currentSlideIndex ? "w-5 bg-white" : "w-2 bg-white/40"}`}
                      />
                    ))}
                  </div>
                  <div key={`title-${currentSlideIndex}`} className="flex-1 text-center animate-slide-smooth">
                    <h2 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight uppercase leading-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-snug line-clamp-1 mt-0.5">
                        {currentSlide.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-emerald-100 font-extrabold px-3 py-1 rounded-full bg-white/20">
                    {currentSlideIndex + 1}/{slides.length}
                  </div>
                </div>
              )}

              {/* Konten Slide dengan Animasi Halus (Smooth Slide & Fade) */}
              <div
                key={`content-${currentSlideIndex}`}
                className="flex-1 overflow-hidden min-h-0 flex flex-col justify-center animate-slide-smooth"
              >
                
                {/* ---------------- SLIDE 1: KEUANGAN ---------------- */}
                {currentSlide.type === "KEUANGAN" && (
                  <div className="h-full flex flex-col gap-3 justify-between overflow-hidden">
                    {/* 3 Kartu Saldo */}
                    <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                      {/* Kas Jariyah */}
                      <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/70 shadow-2xs flex flex-col justify-between space-y-2 hover:bg-white/75 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm sm:text-base uppercase tracking-wider">
                            <Landmark className="w-5 h-5" />
                            <span>Kas Jariyah</span>
                          </div>
                          <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-bold border border-teal-200/60">
                            Pembangunan
                          </span>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-slate-600 font-semibold">Saldo Kas Jariyah:</span>
                          <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                            {portalData?.keuangan ? formatRupiah(portalData.keuangan.saldoJariyah) : "..."}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium pt-1.5 border-t border-slate-100 truncate">
                          Renovasi fisik, sarana ibadah & fasilitas gedung.
                        </p>
                      </div>

                      {/* Kas Infaq */}
                      <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/70 shadow-2xs flex flex-col justify-between space-y-2 hover:bg-white/75 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm sm:text-base uppercase tracking-wider">
                            <HeartHandshake className="w-5 h-5" />
                            <span>Kas Infaq</span>
                          </div>
                          <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200/60">
                            Operasional
                          </span>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-slate-600 font-semibold">Saldo Kas Infaq:</span>
                          <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                            {portalData?.keuangan ? formatRupiah(portalData.keuangan.saldoInfaq) : "..."}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium pt-1.5 border-t border-slate-100 truncate">
                          Operasional harian, listrik, air, kajian & takmir.
                        </p>
                      </div>

                      {/* Total Saldo */}
                      <div className="bg-emerald-50/90 backdrop-blur-md rounded-xl p-4 border border-white/70 shadow-2xs flex flex-col justify-between space-y-2 hover:bg-emerald-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-800 font-black text-sm sm:text-base uppercase tracking-wider">
                            <Coins className="w-5 h-5 text-emerald-700" />
                            <span>Total Saldo Kas</span>
                          </div>
                          <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white font-bold tracking-wide shadow-xs">
                            Jariyah + Infaq
                          </span>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-600">Total Akumulasi Seluruh Kas:</span>
                          <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                            {portalData?.keuangan ? formatRupiah(portalData.keuangan.totalKas) : "..."}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-800/90 pt-1.5 border-t border-emerald-200/80 truncate font-semibold">
                          Gabungan Kas Jariyah & Kas Infaq tersimpan akuntabel.
                        </p>
                      </div>
                    </div>

                    {/* Tabel Transaksi Terkini */}
                    <div className="flex-1 bg-white/60 backdrop-blur-md rounded-xl border border-white/70 shadow-2xs p-3.5 flex flex-col min-h-0 overflow-hidden">
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100 text-slate-600">
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-slate-900 text-base sm:text-lg">Catatan Transaksi Kas Terkini</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            4 Transaksi Terbaru
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-500 font-semibold">Terverifikasi Takmir</span>
                      </div>
                      <div className="overflow-y-auto flex-1 pr-1">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50/80 text-slate-600 font-black uppercase text-xs sm:text-sm tracking-wider sticky top-0 border-b border-slate-200/70">
                            <tr>
                              <th className="py-2 px-3 w-10 text-center font-mono">No</th>
                              <th className="py-2 px-3.5 whitespace-nowrap">Tanggal</th>
                              <th className="py-2 px-3.5">Jenis</th>
                              <th className="py-2 px-3.5">Kategori</th>
                              <th className="py-2 px-3.5">Keterangan</th>
                              <th className="py-2 px-3.5 text-right whitespace-nowrap">Nominal (Rp)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {portalData?.keuangan?.transaksiTerkini?.slice(0, 4).map((trx: any, idx: number) => {
                              const isMasuk = trx.jenis === "MASUK";
                              const isJariyah = trx.kategoriKas === "JARIYAH";
                              return (
                                <tr key={trx.id} className="hover:bg-slate-50/60 transition">
                                  <td className="py-2 px-3 text-center font-mono text-slate-400 text-xs sm:text-sm font-bold">{idx + 1}</td>
                                  <td className="py-2 px-3.5 whitespace-nowrap text-xs sm:text-sm font-bold text-slate-700">
                                    {new Date(trx.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                  </td>
                                  <td className="py-2 px-3.5 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-xs sm:text-sm font-bold ${isMasuk ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                                      {isMasuk ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                      <span>{isMasuk ? "Masuk" : "Keluar"}</span>
                                    </span>
                                  </td>
                                  <td className="py-2 px-3.5 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-xs sm:text-sm font-bold ${isJariyah ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                                      {isJariyah ? "Kas Jariyah" : "Kas Infaq"}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3.5 text-sm sm:text-base text-slate-900 font-bold truncate max-w-[260px]">
                                    {trx.keterangan}
                                  </td>
                                  <td className="py-2 px-3.5 text-right whitespace-nowrap font-mono font-black text-sm sm:text-base lg:text-lg">
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
                  </div>
                )}

                {/* ---------------- SLIDE 2: FASILITAS ---------------- */}
                {currentSlide.type === "FASILITAS" && (
                  <div className="h-full grid grid-cols-12 gap-3.5 items-stretch overflow-hidden">
                    {/* 4 Cards Fasilitas */}
                    <div className="col-span-7 grid grid-cols-2 gap-3 overflow-hidden">
                      {(portalData?.fasilitas?.items && portalData.fasilitas.items.length > 0
                        ? portalData.fasilitas.items
                        : [
                          { id: 1, judul: "Bimbingan Al-Qur'an", deskripsi: "Program tahsin, tadarrus, dan pembinaan membaca Al-Qur'an rutin ba'da Maghrib untuk generasi muda.", icon: "BookOpen" },
                          { id: 2, judul: "Ukhuwah & Dakwah", deskripsi: "Kajian fiqih, tafsir, dan majelis ta'lim yang mempererat kerukunan serta wawasan keislaman warga.", icon: "Heart" },
                          { id: 3, judul: "Petugas Sholat Jum'at", deskripsi: "Penjadwalan khotib, imam, dan bilal sholat Jum'at yang transparan dan terorganisir dengan tema mendidik.", icon: "Calendar" },
                          { id: 4, judul: "Infaq & Transparansi Kas", deskripsi: "Pencatatan kas jariyah dan infaq operasional akuntabel, serta kemudahan donasi via scan QRIS resmi.", icon: "Coins" },
                        ]
                      ).map((item: any) => {
                        const IconComp = getIconForFasilitas(item.icon);
                        return (
                          <div
                            key={item.id}
                            className="bg-white/60 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/70 shadow-2xs hover:bg-white/75 transition flex flex-col justify-between space-y-2 overflow-hidden"
                          >
                            {item.fotoUrl ? (
                              <div className="w-full h-24 sm:h-28 rounded-lg overflow-hidden relative shadow-xs shrink-0 bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.fotoUrl}
                                  alt={item.judul}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#16171b] text-white flex items-center justify-center shadow-sm shrink-0">
                                <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 leading-snug truncate">
                                {item.judul}
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 leading-relaxed line-clamp-2">
                                {item.deskripsi}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Foto Masjid */}
                    <div className="col-span-5 bg-white/60 backdrop-blur-md rounded-xl p-2.5 border border-white/70 shadow-2xs flex flex-col h-full overflow-hidden">
                      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={portalData?.fasilitas?.fotoUrl || "/bg_masjid.jpg"}
                          alt="Masjid Baitul Maghfirah"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5 text-white">
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
                            {portalData?.profil?.namaOrganisasi || "Masjid Baitul Maghfirah"}
                          </span>
                          <h4 className="text-lg sm:text-xl lg:text-2xl font-black mt-0.5">
                            Kloposepuluh • Sukodono • Sidoarjo
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
                            Rumah Ibadah yang Bersih, Nyaman & Makmur
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- SLIDE 3: JUMAT & AGENDA ---------------- */}
                {currentSlide.type === "JUMAT_AGENDA" && (
                  <div className="h-full grid grid-cols-12 gap-3.5 items-stretch overflow-hidden">
                    {/* Petugas Sholat Jum'at (7 Kolom) */}
                    <div className="col-span-7 bg-white/60 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/70 shadow-2xs flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/60">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                              Petugas Sholat Jum&apos;at Terdekat
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
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
                        <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Waktu Dzuhur
                        </span>
                      </div>

                      {portalData?.ibadah?.upcomingJumat ? (
                        <div className="grid grid-cols-2 gap-3 my-auto">
                          <div className="p-3.5 rounded-xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-700 block">
                              Khotib Jum&apos;at
                            </span>
                            <div className="font-black text-base sm:text-lg lg:text-xl text-slate-900 truncate">
                              {portalData.ibadah.upcomingJumat.khotib || "Dalam Konfirmasi"}
                            </div>
                            {portalData.ibadah.upcomingJumat.temaKhutbah && (
                              <p className="text-xs sm:text-sm text-slate-600 italic font-medium truncate">
                                &quot;{portalData.ibadah.upcomingJumat.temaKhutbah}&quot;
                              </p>
                            )}
                          </div>

                          <div className="p-3.5 rounded-xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-700 block">
                              Imam Jum&apos;at
                            </span>
                            <div className="font-black text-base sm:text-lg lg:text-xl text-slate-900 truncate">
                              {portalData.ibadah.upcomingJumat.imam || portalData.ibadah.upcomingJumat.khotib || "Takmir Masjid"}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 block">
                              Bilal / Muadzin
                            </span>
                            <div className="font-black text-base sm:text-lg lg:text-xl text-slate-900 truncate">
                              {portalData.ibadah.upcomingJumat.bilal || "-"}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white/60 border border-white/70 shadow-2xs space-y-1">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 block">
                              Pembaca Pengumuman
                            </span>
                            <div className="font-black text-base sm:text-lg lg:text-xl text-slate-900 truncate">
                              {portalData.ibadah.upcomingJumat.pembacaPengumuman || "-"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 text-base font-medium">
                          Jadwal petugas sholat Jum&apos;at sedang disiapkan oleh Takmir Bidang Ibadah.
                        </div>
                      )}
                    </div>

                    {/* Agenda Kegiatan Rutin (5 Kolom) */}
                    <div className="col-span-5 bg-white/60 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/70 shadow-2xs flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                        <Volume2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-black text-base sm:text-lg text-slate-900">
                          Agenda Kegiatan Rutin
                        </h4>
                      </div>

                      <div className="space-y-3 overflow-y-auto flex-1 my-2 pr-1">
                        {Boolean(portalData?.ibadah?.kegiatanMingguan && portalData.ibadah.kegiatanMingguan.length > 0) && (
                          <div className="space-y-1.5">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-700 block">
                              Rutin Mingguan
                            </span>
                            {portalData.ibadah.kegiatanMingguan.slice(0, 2).map((k: any) => (
                              <div key={k.id} className="p-3 rounded-xl bg-white/60 border border-white/70 shadow-2xs">
                                <div className="font-extrabold text-sm sm:text-base text-slate-900">{k.namaKegiatan}</div>
                                <div className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
                                  Setiap {k.hari}, Pukul {k.waktu} WIB • {k.pengisi || "Takmir"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {Boolean(portalData?.ibadah?.kegiatanBulanan && portalData.ibadah.kegiatanBulanan.length > 0) && (
                          <div className="space-y-1.5 pt-1.5">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-700 block">
                              Rutin Bulanan
                            </span>
                            {portalData.ibadah.kegiatanBulanan.slice(0, 2).map((k: any) => (
                              <div key={k.id} className="p-3 rounded-xl bg-white/60 border border-white/70 shadow-2xs">
                                <div className="font-extrabold text-sm sm:text-base text-slate-900">{k.namaKegiatan}</div>
                                <div className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
                                  {k.siklusBulanan || k.hari}, Pukul {k.waktu} WIB
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!portalData?.ibadah?.kegiatanMingguan?.length && !portalData?.ibadah?.kegiatanBulanan?.length && (
                          <p className="text-base text-slate-500 font-medium text-center py-6">
                            Belum ada agenda kegiatan rutin tercatat.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- SLIDE CUSTOM (FOTO / POSTER - TAMPIL PENUH TANPA KETERANGAN) ---------------- */}
                {currentSlide.type === "CUSTOM_PHOTO" && currentSlide.fotoUrl && (
                  <div className="h-full w-full overflow-hidden relative flex items-center justify-center bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentSlide.fotoUrl}
                      alt="Slide Foto TV Display"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 3. RUNNING TEXT FOOTER (Di Bawah Slide Area Sesuai Sketsa - Diperbesar) */}
            <footer className="flex-shrink-0 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-3.5 sm:px-5 py-2 flex items-center overflow-hidden h-12 sm:h-14 gap-2.5 sm:gap-3">
              {/* Tombol Icon Fullscreen di Sebelah Kiri */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Keluar Layar Penuh (Esc)" : "Layar Penuh / Fullscreen (F)"}
                className="flex-shrink-0 p-2 rounded-xl bg-white/80 hover:bg-white text-emerald-800 border border-white/80 shadow-2xs hover:shadow-xs active:scale-95 transition flex items-center justify-center cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              <span className="flex-shrink-0 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-emerald-700 text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                INFORMASI
              </span>
              <div className="whitespace-nowrap overflow-hidden flex-1 text-sm sm:text-base lg:text-[17px] font-medium text-slate-800 tracking-normal">
                <div
                  className="inline-block"
                  style={{
                    animation: `marquee ${Math.max(20, 100 - (portalData?.runningText?.kecepatan || 40))}s linear infinite`,
                  }}
                >
                  {portalData?.runningText?.teks
                    ? portalData.runningText.teks
                    : "Selamat Datang di Masjid Baitul Maghfirah Kloposepuluh Sukodono Sidoarjo • Jadwal Sholat Berpedoman Standar Kemenag RI • Tersedia Infaq Digital via Scan QRIS pada Layar • Harap Nonaktifkan Suara Handphone di Dalam Masjid • Jazakumullah Khairan Katsiran kepada Seluruh Donatur & Jamaah."
                  }
                  {portalData?.runningText?.tampilkanSaldo !== false && portalData?.keuangan && (
                    <> &nbsp;•&nbsp; Total Saldo Kas: {formatRupiah(portalData.keuangan.totalKas)} (Jariyah: {formatRupiah(portalData.keuangan.saldoJariyah)} | Infaq: {formatRupiah(portalData.keuangan.saldoInfaq)})</>
                  )}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              </div>
            </footer>

          </div>

          {/* ======================================================== */}
          {/* SISI KANAN (22% - 25%): JADWAL SHOLAT + COUNTDOWN + QRIS */}
          {/* ======================================================== */}
          <aside className="w-[340px] sm:w-[380px] lg:w-[420px] xl:w-[450px] flex-shrink-0 flex flex-col gap-5 sm:gap-6 min-w-0 h-full overflow-hidden">
            
            {/* KOTAK 1: JADWAL SHOLAT & COUNTDOWN (UKURAN PAS & COMPACT) */}
            <div className="flex-shrink-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-3.5 sm:p-4 flex flex-col overflow-hidden gap-3">
              
              {/* Bagian 1: Daftar 5 Waktu Sholat */}
              <div className="flex flex-col justify-start min-h-0 pt-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wider text-slate-900 text-center mb-1.5 sm:mb-2 flex items-center justify-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Jadwal Sholat</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                </h3>

                <div className="space-y-1.5 sm:space-y-2">
                  {prayerList.map((p, idx) => {
                    const isNext = nextPrayer?.name.toLowerCase() === p.label.toLowerCase();
                    return (
                      <div
                        key={idx}
                        className={`px-4 py-2.5 sm:py-3 rounded-xl flex items-center justify-between transition-all duration-300 ${
                          isNext
                            ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-950/20 border border-slate-800"
                            : "bg-white/60 hover:bg-white/80 text-slate-800 border border-white/70 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={isNext ? "text-emerald-400" : "text-emerald-600"}>
                            {p.icon}
                          </div>
                          <span className="text-sm sm:text-base lg:text-lg font-black uppercase tracking-tight">
                            {p.label}
                          </span>
                        </div>
                        <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl tracking-wide drop-shadow-2xs">
                          {p.time || "--:--"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bagian 2: Countdown Menuju Sholat (Tanpa Tambahan Border) */}
              <div className="flex-shrink-0 pt-1 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 text-sm sm:text-base lg:text-lg font-extrabold text-slate-800 mb-1.5">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 animate-pulse" />
                  <span>
                    Menuju Sholat <strong className="text-emerald-700 font-black text-lg sm:text-xl lg:text-2xl uppercase">{nextPrayer?.name || "..."}</strong>
                  </span>
                </div>

                {/* Flip Clock Cards (Jam, Menit, Detik) */}
                <div className="flex items-start justify-center gap-2 sm:gap-2.5 py-0.5">
                  <FlipCard label="Jam" value={countdownHours} />
                  <div className="h-16 sm:h-20 lg:h-[84px] flex items-center justify-center text-slate-700 font-black text-lg sm:text-xl lg:text-2xl">
                    <span>:</span>
                  </div>
                  <FlipCard label="Menit" value={countdownMinutes} />
                  <div className="h-16 sm:h-20 lg:h-[84px] flex items-center justify-center text-slate-700 font-black text-lg sm:text-xl lg:text-2xl">
                    <span>:</span>
                  </div>
                  <FlipCard label="Detik" value={countdownSeconds} />
                </div>
              </div>

            </div>

            {/* KOTAK 2: QRIS INFAQ (MENYESUAIKAN TINGGI FULLSCREEN) */}
            <div className="flex-1 min-h-0 bg-white/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between text-center overflow-hidden">
              {/* Header Logo QRIS Hijau */}
              <div className="w-full flex items-center justify-center flex-shrink-0 py-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/qris-header-hijau.png"
                  alt="QRIS"
                  className="w-full max-w-[170px] sm:max-w-[200px] h-auto object-contain drop-shadow-2xs"
                />
              </div>

              {/* Barcode QRIS Resmi (Menyesuaikan Tinggi Fleksibel) */}
              <div className="flex-1 min-h-[120px] max-h-[190px] sm:max-h-[230px] aspect-square bg-white rounded-xl p-2 sm:p-2.5 border border-white/70 flex items-center justify-center overflow-hidden shadow-2xs my-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrisData.qrisImageUrl || "/qris-masjid.png"}
                  alt="QRIS Infaq Masjid"
                  className="w-full h-full object-contain block rounded-xl"
                />
              </div>

              {/* Keterangan Layanan & Rekening QRIS (1 Border) */}
              <div className="w-full flex-shrink-0 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-xl border border-white/70 bg-white/60 shadow-2xs flex flex-col items-center justify-center space-y-1 mt-1">
                {/* Logo Layanan Pembayaran (GoPay, OVO, DANA, ShopeePay, BCA Mobile) */}
                <div className="w-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/qris-payment-methods.png"
                    alt="Layanan Pembayaran QRIS (GoPay, OVO, DANA, ShopeePay, BCA Mobile)"
                    className="w-full max-w-[150px] sm:max-w-[165px] h-auto object-contain drop-shadow-2xs rounded-md"
                  />
                </div>

                {/* Info Rekening & Keterangan */}
                <div className="w-full leading-tight space-y-0.5 text-center">
                  <div className="font-bold text-slate-800 text-[11px] sm:text-xs truncate">
                    {qrisData.qrisNama || "Masjid Baitul Maghfirah"}
                  </div>
                  {qrisData.qrisRekening && (
                    <div className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-900 truncate">
                      {qrisData.qrisBank || "BSI"}: {qrisData.qrisRekening}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </aside>

        </div>
      )}
    </div>
  );
}
