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

export async function GET() {
  const admin = await getSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak. Khusus Super Admin." }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak. Khusus Super Admin." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, nama, role } = body;

    if (!username || !password || !nama || !role) {
      return NextResponse.json({ error: "Semua kolom wajib diisi." }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { username: cleanUsername } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        password: hashedPassword,
        nama: nama.trim(),
        role: role,
      },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}
