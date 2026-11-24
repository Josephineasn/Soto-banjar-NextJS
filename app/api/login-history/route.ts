import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CreateLoginLogBody {
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  action?: string;
  status?: string;
  device?: string;
}

// status log menjadi LOGIN BERHASIL, LOGIN GAGAL, atau LOGOUT
function normalizeIncomingStatus(rawAction: string, rawStatus: string): string {
  const combined = `${rawStatus} ${rawAction}`.toUpperCase();
  if (
    combined.includes("GAGAL") ||
    combined.includes("FAIL") ||
    combined.includes("SALAH") ||
    combined.includes("WRONG") ||
    combined.includes("INVALID") ||
    combined.includes("ERROR")
  ) {
    return "LOGIN GAGAL";
  }
  if (combined.includes("LOGOUT") || combined.includes("KELUAR")) {
    return "LOGOUT";
  }
  return "LOGIN BERHASIL";
}

// Mengambil riwayat login dari database
export async function GET() {
  try {
    const logs = await prisma.loginHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const deduplicated: typeof logs = [];
    for (const item of logs) {
      const itemTime = new Date(item.createdAt).getTime();
      const isNearDup = deduplicated.some((kept) => {
        const sameUser =
          kept.username.trim().toLowerCase() ===
          item.username.trim().toLowerCase();
        const sameStatus =
          kept.status.trim().toUpperCase() === item.status.trim().toUpperCase();
        const keptTime = new Date(kept.createdAt).getTime();
        return (
          sameUser &&
          sameStatus &&
          Math.abs(keptTime - itemTime) <= 10000
        );
      });

      if (!isNearDup) {
        deduplicated.push(item);
      }
    }

    return NextResponse.json(deduplicated, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/login-history error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// Menyimpan log baru
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateLoginLogBody;

    const username = String(
      body.username || body.name || body.email || "User"
    ).trim();
    const role = String(body.role || "CUSTOMER")
      .trim()
      .toUpperCase();
    const actionType = String(body.action || "").trim().toUpperCase();
    const rawStatus = String(body.status || "").trim().toUpperCase();
    const userAgent =
      body.device || request.headers.get("user-agent") || "Web Browser";

    const status = normalizeIncomingStatus(actionType, rawStatus);

    // Cek di database
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const recentDuplicate = await prisma.loginHistory.findFirst({
      where: {
        username,
        status,
        createdAt: {
          gte: tenSecondsAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (recentDuplicate) {
      return NextResponse.json(recentDuplicate, { status: 200 });
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const prefix =
      status === "LOGOUT" ? "OUT" : status === "LOGIN GAGAL" ? "FAIL" : "LOG";
    const logCode = `${prefix}-${randomCode}`;

    const created = await prisma.loginHistory.create({
      data: {
        logCode,
        username,
        role,
        device: userAgent.slice(0, 120),
        status,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/login-history error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal mencatat riwayat login";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Menghapus satu entri log berdasarkan id/logCode atau menghapus semua riwayat login
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id")?.trim();
    const codeParam = searchParams.get("code")?.trim();

    if (idParam || codeParam) {
      const conditions: Array<Record<string, unknown>> = [];

      if (idParam) {
        conditions.push({ logCode: idParam });
        const asNumber = Number(idParam);
        if (!Number.isNaN(asNumber) && String(asNumber) === idParam) {
          conditions.push({ id: asNumber });
        } else {
          conditions.push({ id: idParam });
        }
      }

      if (codeParam && codeParam !== idParam) {
        conditions.push({ logCode: codeParam });
        conditions.push({ id: codeParam });
      }

      await prisma.loginHistory.deleteMany({
        where: { OR: conditions },
      });

      return NextResponse.json(
        { ok: true, message: "Riwayat login berhasil dihapus" },
        { status: 200 }
      );
    }

    await prisma.loginHistory.deleteMany({});

    return NextResponse.json(
      { ok: true, message: "Semua riwayat login berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE /api/login-history error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal menghapus riwayat login";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}