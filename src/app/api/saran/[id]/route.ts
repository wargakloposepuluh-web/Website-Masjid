import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { status, tanggapan } = body;

    const existing = await prisma.kritikSaran.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.kritikSaran.update({
      where: { id },
      data: {
        status: status || existing.status,
        tanggapan: tanggapan !== undefined ? tanggapan : existing.tanggapan,
        ditanggapiOleh: session.nama,
        ditanggapiPada: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Status saran berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating saran:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status saran." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.kritikSaran.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Saran berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Error deleting saran:", error);
    return NextResponse.json(
      { error: "Gagal menghapus saran." },
      { status: 500 }
    );
  }
}
