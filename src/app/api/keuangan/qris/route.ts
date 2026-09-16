import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let setting = await prisma.setting.findFirst();
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          qrisBank: "Bank Syariah Indonesia (BSI)",
          qrisNama: "Masjid Baitul Maghfirah",
          qrisNmid: "ID1020304050607",
          qrisRekening: "7123456789",
          qrisKeterangan: "Infaq & Shodaqoh Digital",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        qrisImageUrl: setting.qrisImageUrl || "/qris-masjid.png",
        qrisBank: setting.qrisBank || "Bank Syariah Indonesia (BSI)",
        qrisNama: setting.qrisNama || "Masjid Baitul Maghfirah",
        qrisNmid: setting.qrisNmid || "ID1020304050607",
        qrisRekening: setting.qrisRekening || "7123456789",
        qrisKeterangan: setting.qrisKeterangan || "Scan untuk Infaq, Sedekah dan Donasi",
      },
    });
  } catch (error: any) {
    console.error("Error fetching QRIS:", error);
    return NextResponse.json({ error: "Gagal mengambil data QRIS" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || (session.role !== "ADMIN_KEUANGAN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden. Hanya Bendahara dan Super Admin yang dapat mengatur QRIS." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { qrisImageUrl, qrisBank, qrisNama, qrisNmid, qrisRekening, qrisKeterangan } = body;

    let setting = await prisma.setting.findFirst();
    if (!setting) {
      setting = await prisma.setting.create({ data: {} });
    }

    const updated = await prisma.setting.update({
      where: { id: setting.id },
      data: {
        qrisImageUrl: qrisImageUrl !== undefined ? qrisImageUrl : setting.qrisImageUrl,
        qrisBank: qrisBank !== undefined ? qrisBank : setting.qrisBank,
        qrisNama: qrisNama !== undefined ? qrisNama : setting.qrisNama,
        qrisNmid: qrisNmid !== undefined ? qrisNmid : setting.qrisNmid,
        qrisRekening: qrisRekening !== undefined ? qrisRekening : setting.qrisRekening,
        qrisKeterangan: qrisKeterangan !== undefined ? qrisKeterangan : setting.qrisKeterangan,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengaturan QRIS berhasil disimpan.",
      data: {
        qrisImageUrl: updated.qrisImageUrl,
        qrisBank: updated.qrisBank,
        qrisNama: updated.qrisNama,
        qrisNmid: updated.qrisNmid,
        qrisRekening: updated.qrisRekening,
        qrisKeterangan: updated.qrisKeterangan,
      },
    });
  } catch (error: any) {
    console.error("Error saving QRIS:", error);
    return NextResponse.json({ error: "Gagal menyimpan data QRIS" }, { status: 500 });
  }
}
