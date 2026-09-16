import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

export const dynamic = "force-dynamic";

async function getSuperAdmin() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload || payload.role !== "SUPER_ADMIN") return null;
  return payload;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getDirStats(dirPath: string): { count: number; totalBytes: number } {
  let count = 0;
  let totalBytes = 0;

  if (!fs.existsSync(dirPath)) {
    return { count, totalBytes };
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        count++;
        totalBytes += stat.size;
      }
    } catch (e) {
      // ignore
    }
  }

  return { count, totalBytes };
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

export async function GET(request: Request) {
  const admin = await getSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak. Khusus Super Admin." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // 1. STATISTIK SISTEM & CADANGAN
  if (type === "info") {
    try {
      const dbExists = fs.existsSync(dbPath);
      const dbStat = dbExists ? fs.statSync(dbPath) : null;
      const uploadsStats = getDirStats(uploadsDir);

      const [
        suratKeluar,
        suratMasuk,
        kasMasjid,
        pengurus,
        jadwalJumat,
        kegiatanMasjid,
        saranJamaah,
        users,
      ] = await Promise.all([
        prisma.suratKeluar.count().catch(() => 0),
        prisma.suratMasuk.count().catch(() => 0),
        prisma.transaksiKeuangan.count().catch(() => 0),
        prisma.pengurus.count().catch(() => 0),
        prisma.jadwalJumat.count().catch(() => 0),
        prisma.kegiatanMasjid.count().catch(() => 0),
        prisma.kritikSaran.count().catch(() => 0),
        prisma.user.count().catch(() => 0),
      ]);

      return NextResponse.json({
        database: {
          exists: dbExists,
          path: "prisma/dev.db",
          size: dbStat?.size || 0,
          sizeFormatted: formatBytes(dbStat?.size || 0),
          lastModified: dbStat?.mtime ? dbStat.mtime.toISOString() : null,
        },
        counts: {
          suratKeluar,
          suratMasuk,
          kasMasjid,
          pengurus,
          jadwalJumat,
          kegiatanMasjid,
          saranJamaah,
          users,
          totalRecords:
            suratKeluar +
            suratMasuk +
            kasMasjid +
            pengurus +
            jadwalJumat +
            kegiatanMasjid +
            saranJamaah +
            users,
        },
        uploads: {
          count: uploadsStats.count,
          size: uploadsStats.totalBytes,
          sizeFormatted: formatBytes(uploadsStats.totalBytes),
          path: "public/uploads",
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          serverTime: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Gagal mengambil info backup:", error);
      return NextResponse.json({ error: "Gagal membaca status data sistem" }, { status: 500 });
    }
  }

  // 2. UNDUH DATABASE SAJA (.db)
  if (type === "database") {
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "File database tidak ditemukan." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    const filename = `database-masjid-${getTimestamp()}.db`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/x-sqlite3",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  }

  // 3. UNDUH BERKAS ARSIP UPLOADS SAJA (.zip)
  if (type === "uploads") {
    const zip = new AdmZip();

    if (fs.existsSync(uploadsDir)) {
      zip.addLocalFolder(uploadsDir, "arsip-uploads");
    } else {
      zip.addFile("readme.txt", Buffer.from("Folder arsip kosong.", "utf8"));
    }

    const zipBuffer = zip.toBuffer();
    const filename = `arsip-berkas-masjid-${getTimestamp()}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  }

  // 4. UNDUH CADANGAN LENGKAP (.zip: Database + Berkas Arsip + Metadata)
  const zip = new AdmZip();

  // Masukkan File Database
  if (fs.existsSync(dbPath)) {
    zip.addLocalFile(dbPath, "database");
  }

  // Masukkan Seluruh Berkas Arsip Upload
  if (fs.existsSync(uploadsDir)) {
    zip.addLocalFolder(uploadsDir, "arsip-uploads");
  }

  // Masukkan File Metadata & Ringkasan Cadangan
  const meta = {
    appName: "Sistem Informasi & Keuangan Masjid Baitul Maghfirah",
    backupDate: new Date().toISOString(),
    backupBy: admin.nama || admin.username,
    notes: "Simpan file cadangan ini di media penyimpanan yang aman (Google Drive / Flashdisk Takmir).",
  };
  zip.addFile("informasi-cadangan.json", Buffer.from(JSON.stringify(meta, null, 2), "utf8"));

  const zipBuffer = zip.toBuffer();
  const filename = `cadangan-lengkap-masjid-${getTimestamp()}.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}

// 5. RESTORE / PULIHKAN DATABASE DARI FILE CADANGAN
export async function POST(request: Request) {
  const admin = await getSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak. Khusus Super Admin." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File cadangan database (.db) tidak ditemukan." }, { status: 400 });
    }

    if (!file.name.endsWith(".db")) {
      return NextResponse.json(
        { error: "Format file tidak valid. Harap unggah file database SQLite (.db)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validasi SQLite header (16 byte pertama harus 'SQLite format 3\0')
    const sqliteHeader = "SQLite format 3\0";
    const headerFromBuffer = buffer.slice(0, 16).toString("utf8");
    if (!headerFromBuffer.startsWith(sqliteHeader)) {
      return NextResponse.json(
        { error: "Isi file bukan database SQLite yang sah." },
        { status: 400 }
      );
    }

    const prismaDir = path.join(process.cwd(), "prisma");
    const dbPath = path.join(prismaDir, "dev.db");
    const backupsDir = path.join(prismaDir, "backups");

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Buat snapshot cadangan sebelum ditimpa untuk keselamatan
    if (fs.existsSync(dbPath)) {
      const snapshotPath = path.join(backupsDir, `dev.db.auto-snapshot-${getTimestamp()}`);
      fs.copyFileSync(dbPath, snapshotPath);
    }

    // Tulis database baru
    fs.writeFileSync(dbPath, buffer);

    return NextResponse.json({
      success: true,
      message: "Database berhasil dipulihkan dari file cadangan.",
      fileName: file.name,
      fileSizeFormatted: formatBytes(buffer.length),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gagal memulihkan database:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memulihkan database." }, { status: 500 });
  }
}
