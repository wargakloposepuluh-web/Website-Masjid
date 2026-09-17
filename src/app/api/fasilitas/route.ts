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

// GET - ambil semua fasilitas + header setting
export async function GET(req: NextRequest) {
  try {
    const fasilitas = await prisma.fasilitas.findMany({
      orderBy: { urutan: "asc" },
    });

    const setting = await prisma.setting.findUnique({
      where: { id: 1 },
      select: {
        fasilitasJudul: true,
        fasilitasSlogan: true,
        fasilitasFotoUrl: true,
      },
    });

    return NextResponse.json({ fasilitas, setting });
  } catch (error) {
    console.error("GET /api/fasilitas error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST - tambah fasilitas baru
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SURAT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { judul, deskripsi, icon, fotoUrl, urutan, isActive } = body;

    if (!judul || !deskripsi) {
      return NextResponse.json({ error: "Judul dan deskripsi wajib diisi" }, { status: 400 });
    }

    const fasilitas = await prisma.fasilitas.create({
      data: {
        judul,
        deskripsi,
        icon: icon || "BookOpen",
        fotoUrl: fotoUrl || null,
        urutan: urutan ?? 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ fasilitas }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fasilitas error:", error);
    return NextResponse.json({ error: "Gagal menambah fasilitas" }, { status: 500 });
  }
}

// PUT - update fasilitas atau header setting
export async function PUT(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SURAT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Update header setting jika ada key setting
    if (body.type === "setting") {
      const { fasilitasJudul, fasilitasSlogan, fasilitasFotoUrl } = body;
      const updated = await prisma.setting.update({
        where: { id: 1 },
        data: { fasilitasJudul, fasilitasSlogan, fasilitasFotoUrl },
      });
      return NextResponse.json({ setting: updated });
    }

    // Update fasilitas item
    const { id, judul, deskripsi, icon, fotoUrl, urutan, isActive } = body;
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const fasilitas = await prisma.fasilitas.update({
      where: { id },
      data: { 
        judul, 
        deskripsi, 
        icon, 
        fotoUrl: fotoUrl !== undefined ? fotoUrl : undefined,
        urutan, 
        isActive 
      },
    });

    return NextResponse.json({ fasilitas });
  } catch (error) {
    console.error("PUT /api/fasilitas error:", error);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

// DELETE - hapus fasilitas
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SURAT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    await prisma.fasilitas.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/fasilitas error:", error);
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}
