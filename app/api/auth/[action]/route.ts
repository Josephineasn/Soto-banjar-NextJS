import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const body = await req.json();

  // 1. REGISTRASI
  if (action === "register") {
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data registrasi belum lengkap." }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Validasi email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Format email tidak valid (harus menyertakan @)." }, { status: 400 });
    }

    // Validasi kata sandi (minimal 6 karakter & ada angka)
    if (password.length < 6 || !/\d/.test(password)) {
      return NextResponse.json({ error: "Kata sandi harus minimal 6 karakter dan mengandung angka." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password,
        role: role === "ADMIN" ? "ADMIN" : "CUSTOMER",
      },
    });

    const response = NextResponse.json({
      message: "Registrasi berhasil.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("user_session", JSON.stringify({ id: user.id, name: user.name, role: user.role }), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  // 2. LOGIN
  if (action === "login") {
    const { email, password } = body;
    const cleanEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
    }

    const response = NextResponse.json({
      message: "Login berhasil.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("user_session", JSON.stringify({ id: user.id, name: user.name, role: user.role }), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  // 3. LOGOUT
  if (action === "logout") {
    const response = NextResponse.json({ message: "Logout berhasil." });
    response.cookies.delete("user_session");
    return response;
  }

  return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 404 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === "me") {
    const sessionCookie = req.cookies.get("user_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    try {
      const user = JSON.parse(sessionCookie);
      return NextResponse.json({ user });
    } catch {
      return NextResponse.json({ user: null });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}