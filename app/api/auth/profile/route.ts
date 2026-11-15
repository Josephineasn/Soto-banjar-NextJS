import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface RawUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateProfilePayload {
  currentName: string;
  currentPassword: string;
  newName?: string;
  newEmail?: string;
  newPassword?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Nama pengguna tidak ditemukan" },
        { status: 400 }
      );
    }

    const users = (await prisma.user.findMany()) as unknown as RawUserRecord[];
    const foundUser = users.find(
      (u) => u.name.toLowerCase() === name.toLowerCase()
    );

    if (!foundUser) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan di database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    });
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json(
      { error: "Gagal memuat profil pengguna" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as UpdateProfilePayload;
    const {
      currentName,
      currentPassword,
      newName,
      newEmail,
      newPassword,
    } = body;

    if (!currentName || !currentPassword) {
      return NextResponse.json(
        { error: "Password saat ini wajib diisi untuk menyimpan perubahan!" },
        { status: 400 }
      );
    }

    const users = (await prisma.user.findMany()) as unknown as RawUserRecord[];
    const existingUser = users.find(
      (u) => u.name.toLowerCase() === currentName.toLowerCase()
    );

    if (!existingUser) {
      return NextResponse.json(
        { error: "Data akun tidak ditemukan di database." },
        { status: 404 }
      );
    }

    // Verifikasi password saat ini dengan hash di Prisma
    const isPasswordValid = verifyPassword(
      currentPassword,
      existingUser.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Password saat ini salah! Perubahan dibatalkan." },
        { status: 401 }
      );
    }

    const updatedName = newName?.trim() || existingUser.name;
    const updatedEmail =
      newEmail !== undefined && newEmail.trim().length > 0
        ? newEmail.trim()
        : existingUser.email;

    // Jika ganti password baru, enkripsi password barunya. Jika tidak, pastikan password lama juga terenkripsi
    const updatedPassword =
      newPassword && newPassword.trim().length > 0
        ? hashPassword(newPassword.trim())
        : hashPassword(currentPassword);

    const duplicate = users.find(
      (u) =>
        u.id !== existingUser.id &&
        (u.name.toLowerCase() === updatedName.toLowerCase() ||
          u.email.toLowerCase() === updatedEmail.toLowerCase())
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Username atau Email tersebut sudah digunakan akun lain." },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: updatedName,
        email: updatedEmail,
        password: updatedPassword,
      } as Prisma.UserUpdateInput,
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui!",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil di database." },
      { status: 500 }
    );
  }
}