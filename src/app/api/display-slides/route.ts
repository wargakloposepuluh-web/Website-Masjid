import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getUser(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("masjid_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// GET - ambil semua slide display TV
export async function GET(req: NextRequest) {
  try {
    const slides = await prisma.displaySlide.findMany({
      orderBy: { urutan: "asc" },
    });
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("GET /api/display-slides error:", error);
    return NextResponse.json({ error: "Gagal mengambil data slide" }, { status: 500 });
  }
}

// POST - tambah slide foto baru
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SURAT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fotoUrl, judul, urutan, isActive } = body;

    if (!fotoUrl) {
      return NextResponse.json({ error: "Foto slide wajib diunggah" }, { status: 400 });
    }

    const slide = await prisma.displaySlide.create({
      data: {
        fotoUrl,
        judul: judul || null,
        urutan: urutan ?? 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error("POST /api/display-slides error:", error);
    return NextResponse.json({ error: "Gagal menambah slide" }, { status: 500 });
  }
}

// PUT - update slide foto
export async function PUT(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SURAT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, fotoUrl, judul, urutan, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID slide wajib diisi" }, { status: 400 });
    }

    const slide = await prisma.displaySlide.update({
      where: { id: Number(id) },
      data: {
        fotoUrl: fotoUrl !== undefined ? fotoUrl : undefined,
        judul: judul !== undefined ? (judul || null) : undefined,
        urutan: urutan !== undefined ? urutan : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("PUT /api/display-slides error:", error);
    return NextResponse.json({ error: "Gagal memperbarui slide" }, { status: 500 });
  }
}

// DELETE - hapus slide foto
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SURAT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID wajib disertakan" }, { status: 400 });
    }

    await prisma.displaySlide.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/display-slides error:", error);
    return NextResponse.json({ error: "Gagal menghapus slide" }, { status: 500 });
  }
}
