import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = parseInt(id, 10);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "ID menu tidak valid." }, { status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { reviews: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Gagal mengambil detail menu:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = parseInt(id, 10);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "ID menu tidak valid." }, { status: 400 });
    }

    const body = await req.json();

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(body.name && { name: String(body.name).trim() }),
        ...(body.category && { category: body.category }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.description && { description: String(body.description).trim() }),
        ...(body.image && { image: String(body.image).trim() }),
        ...(body.calories && { calories: body.calories }),
        ...(body.spicyLevel && { spicyLevel: body.spicyLevel }),
        ...(body.popular !== undefined && { popular: Boolean(body.popular) }),
        ...(body.available !== undefined && { available: Boolean(body.available) }),
        ...(body.packagingInfo && { packagingInfo: body.packagingInfo }),
        ...(body.rating !== undefined && { rating: Number(body.rating) }),
      },
    });

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error("Gagal update menu:", error);
    return NextResponse.json({ error: "Gagal memperbarui menu." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = parseInt(id, 10);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "ID menu tidak valid." }, { status: 400 });
    }

    await prisma.menu.delete({
      where: { id: menuId },
    });

    return NextResponse.json({ message: "Menu berhasil dihapus dari katalog." });
  } catch (error) {
    console.error("Gagal menghapus menu:", error);
    return NextResponse.json(
      { error: "Menu tidak ditemukan atau gagal dihapus." },
      { status: 500 }
    );
  }
}