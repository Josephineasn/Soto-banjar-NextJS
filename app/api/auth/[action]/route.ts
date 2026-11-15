import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  isPasswordHashed,
} from "@/lib/password";

export const dynamic = "force-dynamic";

interface AuthRequestBody {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

// Otomatis ubah semua password teks biasa yang ada di Prisma Studio menjadi kode acak (enkripsi)
async function upgradePlainPasswords() {
  try {
    const allUsers = await prisma.user.findMany();
    for (const u of allUsers) {
      if (u.password && !isPasswordHashed(u.password)) {
        const encrypted = hashPassword(u.password);
        await prisma.user.update({
          where: { id: u.id },
          data: { password: encrypted },
        });
      }
    }
  } catch (err) {
    console.error("Gagal auto-enkripsi password lama:", err);
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ action: string }> }
) {
  await upgradePlainPasswords();
  const { action } = await context.params;

  if (action === "me") {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ message: "Auth endpoint aktif" });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> }
) {
  await upgradePlainPasswords();
  const { action } = await context.params;

  if (action === "logout") {
    return NextResponse.json({ message: "Berhasil keluar" });
  }

  try {
    const body = (await request.json()) as AuthRequestBody;
    const rawIdentifier = (
      body.name ||
      body.username ||
      body.email ||
      ""
    ).trim();
    const rawEmail = (body.email || "").trim().toLowerCase();
    const rawPassword = body.password || "";

    // 1. REGISTER / DAFTAR AKUN BARU (Simpan Password Terenkripsi ke Prisma)
    if (action === "register" || action === "signup") {
      if (!rawIdentifier || !rawPassword) {
        return NextResponse.json(
          { error: "Nama/Username dan Password wajib diisi!" },
          { status: 400 }
        );
      }

      if (rawPassword.length < 6) {
        return NextResponse.json(
          { error: "Password minimal 6 karakter." },
          { status: 400 }
        );
      }

      const existingUsers = await prisma.user.findMany();
      const duplicate = existingUsers.find(
        (u) =>
          u.name.toLowerCase() === rawIdentifier.toLowerCase() ||
          (rawEmail && u.email.toLowerCase() === rawEmail)
      );

      if (duplicate) {
        return NextResponse.json(
          { error: "Username atau Email sudah terdaftar!" },
          { status: 409 }
        );
      }

      const encryptedPassword = hashPassword(rawPassword);

      const newUser = await prisma.user.create({
        data: {
          name: rawIdentifier,
          email:
            rawEmail ||
            `${rawIdentifier.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
          password: encryptedPassword,
          role:
            rawIdentifier.toLowerCase() === "admin" ? "ADMIN" : "CUSTOMER",
        },
      });

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

    // 2. LOGIN / MASUK AKUN (Cocokkan Password Asli Customer dengan Hash di Prisma)
    if (action === "login" || action === "signin") {
      if (!rawIdentifier || !rawPassword) {
        return NextResponse.json(
          { error: "Masukkan username/email dan password Anda." },
          { status: 400 }
        );
      }

      const users = await prisma.user.findMany();
      const foundUser = users.find(
        (u) =>
          u.name.toLowerCase() === rawIdentifier.toLowerCase() ||
          u.email.toLowerCase() === rawIdentifier.toLowerCase()
      );

      if (!foundUser) {
        return NextResponse.json(
          { error: "Akun tidak ditemukan. Silakan daftar terlebih dahulu." },
          { status: 401 }
        );
      }

      const isMatch = verifyPassword(rawPassword, foundUser.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Password yang Anda masukkan salah!" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        },
      });
    }

    return NextResponse.json(
      { error: "Action auth tidak dikenali" },
      { status: 400 }
    );
  } catch (error) {
    console.error(`POST /api/auth/${action} error:`, error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server autentikasi" },
      { status: 500 }
    );
  }
}