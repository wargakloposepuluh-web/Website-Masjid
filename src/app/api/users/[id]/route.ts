import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getSuperAdmin() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload || payload.role !== "SUPER_ADMIN") return null;
  return payload;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    const body = await request.json();
    const { nama, role, password } = body;

    const dataToUpdate: any = {};
    if (nama) dataToUpdate.nama = nama.trim();
    if (role) dataToUpdate.role = role;
    if (password && password.trim().length > 0) {
      dataToUpdate.password = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  // Tidak boleh menghapus diri sendiri jika sedang login
  if (admin.userId === id) {
    return NextResponse.json(
      { error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
