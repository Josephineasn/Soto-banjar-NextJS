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

    // 1. Jika user atau admin melakukan LOGOUT
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
      } catch {
        // Abaikan jika gagal simpan log
      }

      return NextResponse.json({ message: "Logout tercatat" }, { status: 200 });
    }

    const cleanEmail = (body.email ?? "").trim().toLowerCase();
    const rawPassword = body.password ?? "";

    if (!cleanEmail || !rawPassword) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Jika REGISTER akun baru
    if (action === "register" || action === "signup") {
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Email sudah terdaftar, silakan login" },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(rawPassword);
      const isRoleAdmin = cleanEmail.includes("admin");
      const newUser = await prisma.user.create({
        data: {
          name: (body.name ?? cleanEmail.split("@")[0]).trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: isRoleAdmin ? "admin" : "user",
        },
      });

      try {
        await prisma.loginHistory.create({
          data: {
            logCode: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
            username: `${newUser.name} (${newUser.email})`,
            role: isRoleAdmin ? "ADMIN" : "CUSTOMER",
            device: userAgent.slice(0, 120),
            status: "REGISTER & LOGIN",
          },
        });
      } catch {
        // Abaikan jika tabel belum sinkron
      }

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

    // 3. Jika LOGIN
    if (action === "login" || action === "signin") {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Email atau password salah" },
          { status: 401 }
        );
      }

      const isValid =
        (await verifyPassword(rawPassword, user.password)) ||
        user.password === rawPassword;

      if (!isValid) {
        return NextResponse.json(
          { error: "Email atau password salah" },
          { status: 401 }
        );
      }

      const roleLabel =
        user.role.toLowerCase() === "admin" || cleanEmail.includes("admin")
          ? "ADMIN"
          : "CUSTOMER";

      try {
        await prisma.loginHistory.create({
          data: {
            logCode: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
            username: `${user.name} (${user.email})`,
            role: roleLabel,
            device: userAgent.slice(0, 120),
            status: "LOGIN BERHASIL",
          },
        });
      } catch {
        // Abaikan jika gagal mencatat log
      }

      return NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Action autentikasi tidak dikenali" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("POST /api/auth/[action] error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan autentikasi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}