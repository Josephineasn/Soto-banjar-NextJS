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

export async function GET() {
  try {
    const logs = await prisma.loginHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/login-history error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateLoginLogBody;

    const username = String(
      body.username || body.name || body.email || "User"
    ).trim();
    const role = String(body.role || "CUSTOMER")
      .trim()
      .toUpperCase();
    const actionType = String(body.action || body.status || "LOGIN")
      .trim()
      .toUpperCase();
    const userAgent =
      body.device || request.headers.get("user-agent") || "Web Browser";

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const prefix = actionType.includes("LOGOUT") ? "OUT" : "LOG";
    const logCode = `${prefix}-${randomCode}`;

    const created = await prisma.loginHistory.create({
      data: {
        logCode,
        username,
        role,
        device: userAgent.slice(0, 120),
        status: actionType.includes("LOGOUT") ? "LOGOUT" : "LOGIN BERHASIL",
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