/**
 * Hisab Waktu Sholat Standar Kementerian Agama Republik Indonesia (Kemenag RI)
 * Khusus Wilayah: Kota Sidoarjo, Jawa Timur
 * 
 * Koordinat Sidoarjo:
 * - Lintang (Latitude) : -7.4478° LS (7° 26' 52" S)
 * - Bujur (Longitude)  : 112.7183° BT (112° 43' 06" E)
 * - Zona Waktu         : UTC+7 (WIB)
 * - Ketinggian (Elev)  : ~10 mdpl
 * 
 * Parameter Kemenag:
 * - Subuh   : -20.0° (sudut depresi matahari)
 * - Isya    : -18.0° (sudut depresi matahari)
 * - Imsak   : 10 menit sebelum Subuh
 * - Terbit  : -1.0° (refraksi 34' + semi-diameter 16')
 * - Dhuha   : +4.5°
 * - Ashar   : Bayangan 1:1 (Mazhab Syafi'i)
 * - Ihtiyat : Pengaman +2 menit untuk Subuh, Dzuhur, Ashar, Maghrib, Isya'
 */

export interface PrayerTimeSchedule {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  tanggalMasehi: string;
  hijriah: string;
}

export interface NextPrayerInfo {
  name: string;
  time: string;
  countdown: string;
  secondsLeft: number;
}

const SIDOARJO_COORDS = {
  lat: -7.4478,
  lng: 112.7183,
  timezone: 7, // WIB UTC+7
};

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

function toDegrees(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

function normalize(val: number, max: number): number {
  let res = val - max * Math.floor(val / max);
  if (res < 0) res += max;
  return res;
}

function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}

function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = normalize(357.529 + 0.98560028 * D, 360);
  const q = normalize(280.459 + 0.98564736 * D, 360);
  const L = normalize(q + 1.915 * Math.sin(toRadians(g)) + 0.02 * Math.sin(toRadians(2 * g)), 360);
  const e = 23.439 - 0.00000036 * D;

  const RA = normalize(
    toDegrees(Math.atan2(Math.cos(toRadians(e)) * Math.sin(toRadians(L)), Math.cos(toRadians(L)))),
    360
  ) / 15;

  const d = toDegrees(Math.asin(Math.sin(toRadians(e)) * Math.sin(toRadians(L))));
  const EqT = q / 15 - RA;

  return { declination: d, equationOfTime: EqT };
}

function hourAngle(altitude: number, lat: number, dec: number): number {
  const cosH =
    (Math.sin(toRadians(altitude)) -
      Math.sin(toRadians(lat)) * Math.sin(toRadians(dec))) /
    (Math.cos(toRadians(lat)) * Math.cos(toRadians(dec)));

  if (cosH > 1) return 0;
  if (cosH < -1) return 180;
  return toDegrees(Math.acos(cosH));
}

function formatHour(timeDecimal: number): string {
  let totalMinutes = Math.round(timeDecimal * 60);
  let h = Math.floor(totalMinutes / 60) % 24;
  let m = totalMinutes % 60;
  if (h < 0) h += 24;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function calculateSidoarjoPrayerTimes(date = new Date()): PrayerTimeSchedule {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = julianDay(year, month, day);
  const { declination, equationOfTime } = sunPosition(jd);

  // Zawal / Solar Noon
  const solarNoon = 12 + SIDOARJO_COORDS.timezone - SIDOARJO_COORDS.lng / 15 - equationOfTime;

  // Subuh: -20°
  const subuhH = hourAngle(-20.0, SIDOARJO_COORDS.lat, declination) / 15;
  // Terbit: -1.0°
  const terbitH = hourAngle(-1.0, SIDOARJO_COORDS.lat, declination) / 15;
  // Dhuha: +4.5°
  const dhuhaH = hourAngle(4.5, SIDOARJO_COORDS.lat, declination) / 15;

  // Ashar: Shafi'i (1:1 shadow)
  const ashrAlt = toDegrees(
    Math.atan(1 / (1 + Math.tan(toRadians(Math.abs(SIDOARJO_COORDS.lat - declination)))))
  );
  const asharH = hourAngle(ashrAlt, SIDOARJO_COORDS.lat, declination) / 15;

  // Maghrib: -1.0°
  const maghribH = hourAngle(-1.0, SIDOARJO_COORDS.lat, declination) / 15;
  // Isya: -18.0°
  const isyaH = hourAngle(-18.0, SIDOARJO_COORDS.lat, declination) / 15;

  // Ihtiyat Kemenag (+2 menit)
  const IHTIYAT = 2 / 60;

  const rawDzuhur = solarNoon + IHTIYAT;
  const rawSubuh = solarNoon - subuhH + IHTIYAT;
  const rawImsak = rawSubuh - 10 / 60;
  const rawTerbit = solarNoon - terbitH - IHTIYAT;
  const rawDhuha = solarNoon - dhuhaH + IHTIYAT;
  const rawAshar = solarNoon + asharH + IHTIYAT;
  const rawMaghrib = solarNoon + maghribH + IHTIYAT;
  const rawIsya = solarNoon + isyaH + IHTIYAT;

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const tanggalMasehi = new Intl.DateTimeFormat("id-ID", options).format(date);

  let hijriah = "";
  try {
    const hijriFormatter = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formatted = hijriFormatter.format(date);
    hijriah = formatted.endsWith("H") ? formatted : `${formatted} H`;
  } catch {
    hijriah = "1447 H";
  }

  return {
    imsak: formatHour(rawImsak),
    subuh: formatHour(rawSubuh),
    terbit: formatHour(rawTerbit),
    dhuha: formatHour(rawDhuha),
    dzuhur: formatHour(rawDzuhur),
    ashar: formatHour(rawAshar),
    maghrib: formatHour(rawMaghrib),
    isya: formatHour(rawIsya),
    tanggalMasehi,
    hijriah,
  };
}

export function getNextPrayer(schedule: PrayerTimeSchedule, now = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = currentMinutes * 60 + now.getSeconds();

  const parseToSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h * 60 + m) * 60;
  };

  const prayers = [
    { name: "Subuh", time: schedule.subuh, seconds: parseToSeconds(schedule.subuh) },
    { name: "Dzuhur", time: schedule.dzuhur, seconds: parseToSeconds(schedule.dzuhur) },
    { name: "Ashar", time: schedule.ashar, seconds: parseToSeconds(schedule.ashar) },
    { name: "Maghrib", time: schedule.maghrib, seconds: parseToSeconds(schedule.maghrib) },
    { name: "Isya", time: schedule.isya, seconds: parseToSeconds(schedule.isya) },
  ];

  for (const p of prayers) {
    if (p.seconds > currentSeconds) {
      const diffSec = p.seconds - currentSeconds;
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      return {
        name: p.name,
        time: p.time,
        countdown: `-${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        secondsLeft: diffSec,
      };
    }
  }

  const tomorrowSubuhSec = parseToSeconds(schedule.subuh) + 24 * 3600;
  const diffSec = tomorrowSubuhSec - currentSeconds;
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;

  return {
    name: "Subuh",
    time: schedule.subuh,
    countdown: `-${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    secondsLeft: diffSec,
  };
}
