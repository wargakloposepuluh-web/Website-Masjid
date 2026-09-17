import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    let setting = await prisma.setting.findUnique({
      where: { id: 1 },
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          id: 1,
        },
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Gagal mengambil pengaturan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Pastikan konversi tipe data yang sesuai
    const updated = await prisma.setting.upsert({
      where: { id: 1 },
      update: {
        namaOrganisasi: body.namaOrganisasi,
        alamatOrganisasi: body.alamatOrganisasi,
        kontakOrganisasi: body.kontakOrganisasi,
        kopType: body.kopType || "text",
        kopImageUrl: body.kopImageUrl,
        logoKiriUrl: body.logoKiriUrl,
        logoKananUrl: body.logoKananUrl,
        garisKop: body.garisKop !== undefined ? Boolean(body.garisKop) : true,
        marginTop: Number(body.marginTop) || 2.0,
        marginBottom: Number(body.marginBottom) || 2.0,
        marginLeft: Number(body.marginLeft) || 2.5,
        marginRight: Number(body.marginRight) || 2.0,
        fontFamily: body.fontFamily || "Times New Roman",
        fontSize: Number(body.fontSize) || 12,
        lineHeight: Number(body.lineHeight) || 1.3,
        paragrafSpacing: Number(body.paragrafSpacing) || 0.8,
        formatNomorSurat: body.formatNomorSurat || "{nomor}/PM-BM/{kode}/{bulan}/{tahun}",
        kotaSurat: body.kotaSurat || "Jakarta",
        defaultSalamPembuka: body.defaultSalamPembuka,
        defaultKalimatPembuka: body.defaultKalimatPembuka,
        defaultKalimatPenutup: body.defaultKalimatPenutup,
        defaultSalamPenutup: body.defaultSalamPenutup,
        penandatanganNama: body.penandatanganNama,
        penandatanganJabatan: body.penandatanganJabatan,
        penandatanganNama2: body.penandatanganNama2,
        penandatanganJabatan2: body.penandatanganJabatan2,
        ttdImageUrl: body.ttdImageUrl,
        ttdImage2Url: body.ttdImage2Url,
        stempelImageUrl: body.stempelImageUrl,
        stempelPosisiX: Number(body.stempelPosisiX) || -25,
        stempelPosisiY: Number(body.stempelPosisiY) || -15,
        stempelUkuran: Number(body.stempelUkuran) || 105,
        stempelOpacity: Number(body.stempelOpacity) || 0.85,
        waGatewayUrl: body.waGatewayUrl !== undefined ? body.waGatewayUrl : undefined,
        waGatewayAuth: body.waGatewayAuth !== undefined ? body.waGatewayAuth : undefined,
      },
      create: {
        id: 1,
        ...body,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal menyimpan pengaturan:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan template" },
      { status: 500 }
    );
  }
}
