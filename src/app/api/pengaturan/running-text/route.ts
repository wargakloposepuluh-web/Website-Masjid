import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getUser(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("masjid_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// GET - ambil konfigurasi running text
export async function GET(req: NextRequest) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { id: 1 },
      select: {
        runningText: true,
        tampilkanSaldoRT: true,
        kecepatanRT: true,
      },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("GET /api/pengaturan/running-text error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// PUT - update konfigurasi running text
export async function PUT(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SURAT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { runningText, tampilkanSaldoRT, kecepatanRT } = body;

    const setting = await prisma.setting.update({
      where: { id: 1 },
      data: {
        runningText: runningText !== undefined ? runningText : undefined,
        tampilkanSaldoRT: tampilkanSaldoRT !== undefined ? tampilkanSaldoRT : undefined,
        kecepatanRT: kecepatanRT !== undefined ? Number(kecepatanRT) : undefined,
      },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("PUT /api/pengaturan/running-text error:", error);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}
