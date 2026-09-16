import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toRoman(num: number): string {
  const romanMap: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  for (const [val, letter] of romanMap) {
    while (num >= val) {
      result += letter;
      num -= val;
    }
  }
  return result || "I";
}

export function formatIndoDate(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const day = d.getDate();
  const month = bulan[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatHijriDate(dateInput: Date | string | number): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const formatter = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatter
      .format(d)
      .replace(/Rabiulawal/gi, "Rabiul Awwal")
      .replace(/Rabiulakhir/gi, "Rabiul Akhir")
      .replace(/Jumadilawal/gi, "Jumadil Ula")
      .replace(/Jumadilakhir/gi, "Jumadil Akhir");
  } catch {
    return "";
  }
}

export function generateFormattedNomorSurat(
  template: string,
  counterNumber: number,
  dateInput: Date | string = new Date(),
  kodeJenis: string = "UND"
): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const paddedNumber = String(counterNumber).padStart(3, "0");
  const monthNumber = validDate.getMonth() + 1;
  const monthRoman = toRoman(monthNumber);
  const monthPadded = String(monthNumber).padStart(2, "0");
  const year = String(validDate.getFullYear());

  return template
    .replace(/{nomor}/g, paddedNumber)
    .replace(/{kode}/g, kodeJenis)
    .replace(/{kategori}/g, kodeJenis)
    .replace(/{jenis}/g, kodeJenis)
    .replace(/{romawi}/g, monthRoman)
    .replace(/{bulan}/g, monthPadded)
    .replace(/{tahun}/g, year);
}

export function extractNomorUrut(nomorSurat: string, template?: string): number | null {
  if (!nomorSurat || typeof nomorSurat !== "string") return null;
  const str = nomorSurat.trim();

  // 1. Jika ada template nomor surat yang menggunakan {nomor}, cocokkan polanya
  if (template && template.includes("{nomor}")) {
    try {
      const pattern = template
        .replace(/[-\/\\^$*+?.()|[\]]/g, "\\$&")
        .replace(/\\\{nomor\\\}/g, "(\\d+)")
        .replace(/\\\{kode\\\}/g, "[^\\/\\\\-]+")
        .replace(/\\\{kategori\\\}/g, "[^\\/\\\\-]+")
        .replace(/\\\{jenis\\\}/g, "[^\\/\\\\-]+")
        .replace(/\\\{romawi\\\}/g, "[IVXLCDMivxlcdm]+")
        .replace(/\\\{bulan\\\}/g, "\\d+")
        .replace(/\\\{tahun\\\}/g, "\\d+");
      const reg = new RegExp(`^${pattern}$`, "i");
      const match = str.match(reg);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0) return num;
      }
    } catch {
      // Abaikan jika regex template gagal
    }
  }

  // 2. Cocokkan nomor di awal format standar: misal "003/PM-BM/...", "01-DKM-..."
  const prefixMatch = str.match(/^0*(\d+)[^0-9]/);
  if (prefixMatch && prefixMatch[1]) {
    const num = parseInt(prefixMatch[1], 10);
    if (!isNaN(num) && num > 0) return num;
  }

  // 3. Cocokkan bagian angka pertama yang dipisahkan garis miring atau strip (bukan tahun 4 digit)
  const parts = str.split(/[\/\-_]/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      if (num >= 2000 && num <= 2099) continue;
      if (num > 0) return num;
    }
  }

  // 4. Fallback: Cari angka manapun dalam string yang bukan tahun
  const allNums = str.match(/\d+/g);
  if (allNums) {
    for (const n of allNums) {
      const num = parseInt(n, 10);
      if (num >= 2000 && num <= 2099) continue;
      if (num > 0) return num;
    }
  }

  return null;
}

export function parseIndoDateToYmd(str: string): string {
  if (!str) return "";
  const months: Record<string, string> = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };
  const match = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const d = match[1].padStart(2, "0");
    const m = months[match[2].toLowerCase()];
    const y = match[3];
    if (m && y) return `${y}-${m}-${d}`;
  }
  return "";
}

export function formatYmdToIndoHariTanggal(ymd: string): string {
  if (!ymd) return "";
  const parts = ymd.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return "";
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  const days = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayName = days[dateObj.getDay()];
  const monthName = months[m - 1];
  return `${dayName}, ${d} ${monthName} ${y}`;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}


