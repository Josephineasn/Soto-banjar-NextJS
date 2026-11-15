import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

interface AuthRequestBody {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await context.params;
    const body = (await request.json()) as AuthRequestBody;
    const userAgent = request.headers.get("user-agent") || "Web Browser";

    // LOGOUT
    if (action === "logout" || action === "signout") {
      const logoutName = String(
        body.name || body.username || body.email || "Pengguna"
      ).trim();
      const logoutRole = String(
        body.role ||
          (logoutName.toLowerCase().includes("admin") ? "ADMIN" : "CUSTOMER")
      ).toUpperCase();

      try {
        await prisma.loginHistory.create({
          data: {
            logCode: `OUT-${Math.floor(100000 + Math.random() * 900000)}`,
            username: logoutName,
            role: logoutRole,
            device: userAgent.slice(0, 120),
            status: "LOGOUT",
          },
        });
      } catch {}

      return NextResponse.json({ message: "Logout tercatat" }, { status: 200 });
    }

    const cleanEmail = (body.email ?? "").trim().toLowerCase();
    const rawPassword = body.password ?? "";
    const cleanName = String(body.name || body.username || "Pelanggan").trim();

    if (!cleanEmail || !rawPassword) {
      return NextResponse.json(
        { error: "Email/Username dan Password wajib diisi." },
        { status: 400 }
      );
    }

    // LOGIN
    if (action === "login") {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Akun belum terdaftar. Silakan daftar terlebih dahulu." },
          { status: 400 }
        );
      }

      const isValidPass = verifyPassword(rawPassword, user.password);
      if (!isValidPass) {
        return NextResponse.json(
          { error: "Password yang Anda masukkan salah." },
          { status: 400 }
        );
      }

      const userRole = String(user.role || "CUSTOMER").toUpperCase();

      try {
        await prisma.loginHistory.create({
          data: {
            logCode: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
            username: `${user.name} (${user.email})`,
            role: userRole,
            device: userAgent.slice(0, 120),
            status: "LOGIN BERHASIL",
          },
        });
      } catch {}

      return NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: userRole,
          },
        },
        { status: 200 }
      );
    }

    // REGISTER
    if (action === "register") {
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Email atau akun tersebut sudah terdaftar." },
          { status: 400 }
        );
      }

      const hashedPassword = hashPassword(rawPassword);
      const assignedRole = cleanName.toLowerCase().includes("admin")
        ? "ADMIN"
        : "CUSTOMER";

      const newUser = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          role: assignedRole,
        },
      });

      try {
        await prisma.loginHistory.create({
          data: {
            logCode: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
            username: `${newUser.name} (${newUser.email})`,
            role: assignedRole,
            device: userAgent.slice(0, 120),
            status: "REGISTER & LOGIN",
          },
        });
      } catch {}

      return NextResponse.json(
        {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Kesalahan server";
    console.error("Auth action error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}