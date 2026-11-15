import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface IncomingLog {
  id?: number;
  logCode?: string;
  time?: string;
  username?: string;
  name?: string;
  role?: string;
  status?: string;
  device?: string;
  ip?: string;
  createdAt?: string;
}

// GET: Ambil seluruh riwayat login dari tabel Prisma LoginHistory
export async function GET() {
  try {
    const logs = await prisma.loginHistory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(logs, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat log";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Simpan 1 log baru atau sinkronisasi kumpulan log dari localStorage ke Prisma
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IncomingLog | { syncLogs?: IncomingLog[] };

    // Jika sinkronisasi massal dari localStorage lama agar masuk ke Prisma Studio
    if ("syncLogs" in body && Array.isArray(body.syncLogs)) {
      const existingCount = await prisma.loginHistory.count();
      if (existingCount === 0 && body.syncLogs.length > 0) {
        for (const item of body.syncLogs.slice().reverse()) {
          const code =
            item.logCode ||
            (typeof item.id === "string" && String(item.id).startsWith("LOG-")
              ? String(item.id)
              : `LOG-${Math.floor(1000 + Math.random() * 9000)}`);

          await prisma.loginHistory.create({
            data: {
              logCode: code,
              username: String(item.username || item.name || "josephine"),
              role: String(item.role || "Customer"),
              status: String(item.status || "Berhasil"),
              device: String(item.device || item.ip || "127.0.0.1 (Web Local)"),
            },
          });
        }
      }
      const allLogs = await prisma.loginHistory.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(allLogs, { status: 200 });
    }

    // Simpan 1 log aktivitas login baru
    const single = body as IncomingLog;
    const randomCode = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;

    const created = await prisma.loginHistory.create({
      data: {
        logCode: single.logCode || randomCode,
        username: String(single.username || single.name || "Pelanggan"),
        role: String(single.role || "Customer"),
        status: String(single.status || "Berhasil"),
        device: String(single.device || single.ip || "127.0.0.1 (Web Local)"),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan log";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Hapus 1 log berdasarkan id (?id=123) ATAU hapus semua (?all=true)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const logCodeParam = searchParams.get("logCode");
    const clearAll = searchParams.get("all");

    if (clearAll === "true") {
      await prisma.loginHistory.deleteMany({});
      return NextResponse.json({ message: "Semua log dihapus" }, { status: 200 });
    }

    if (idParam && !isNaN(Number(idParam))) {
      await prisma.loginHistory.delete({
        where: { id: Number(idParam) },
      });
      return NextResponse.json({ message: "Log berhasil dihapus" }, { status: 200 });
    }

    if (logCodeParam) {
      await prisma.loginHistory.deleteMany({
        where: { logCode: logCodeParam },
      });
      return NextResponse.json({ message: "Log berhasil dihapus" }, { status: 200 });
    }

    return NextResponse.json({ error: "Parameter id tidak ditemukan" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus log";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}