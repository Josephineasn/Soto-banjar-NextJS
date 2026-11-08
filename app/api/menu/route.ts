import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua menu
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(menus);
  } catch (error) {
    console.error("Gagal mengambil menu:", error);
    return NextResponse.json({ error: "Gagal mengambil data menu." }, { status: 500 });
  }
}

// POST: Tambah menu baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, price, description, image, spicyLevel, calories, popular } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Nama dan harga wajib diisi." }, { status: 400 });
    }

    const cleanCalories = calories
      ? String(calories).replace(/kkal/gi, "").trim()
      : "";

    const newMenu = await prisma.menu.create({
      data: {
        name: String(name).trim(),
        category: category || "makanan",
        price: Number(price),
        description: description ? String(description).trim() : "",
        image: image ? String(image).trim() : "",
        spicyLevel: spicyLevel || "Tidak Pedas",
        calories: cleanCalories,
        popular: Boolean(popular),
        available: true,
      },
    });

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error("Gagal menambahkan menu:", error);
    return NextResponse.json({ error: "Gagal menambahkan menu." }, { status: 500 });
  }
}

// PUT: Perbarui data menu (Edit Menu)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, category, price, description, image, spicyLevel, calories, popular } = body;

    if (!id) {
      return NextResponse.json({ error: "ID menu wajib disertakan." }, { status: 400 });
    }

    const cleanCalories = calories
      ? String(calories).replace(/kkal/gi, "").trim()
      : "";

    const updatedMenu = await prisma.menu.update({
      where: { id: Number(id) },
      data: {
        name: String(name).trim(),
        category: category || "makanan",
        price: Number(price),
        description: description ? String(description).trim() : "",
        image: image ? String(image).trim() : "",
        spicyLevel: spicyLevel || "Tidak Pedas",
        calories: cleanCalories,
        popular: Boolean(popular),
      },
    });

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error("Gagal memperbarui menu:", error);
    return NextResponse.json({ error: "Gagal memperbarui data menu ke database." }, { status: 500 });
  }
}

// DELETE: Hapus menu
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID menu tidak ditemukan." }, { status: 400 });
    }

    await prisma.menu.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Menu berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus menu:", error);
    return NextResponse.json(
      { error: "Gagal menghapus menu dari database." },
      { status: 500 }
    );
  }
}