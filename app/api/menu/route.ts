import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { id: "asc" },
    });

    const formatted = menus.map((m) => ({
      ...m,
      isAvailable: m.available,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error: unknown) {
    console.error("Gagal memuat menu dari Prisma:", error);
    // Kembalikan array kosong atau tangani dengan aman agar tidak error 500
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const isAvail =
      body.available !== undefined
        ? Boolean(body.available)
        : body.isAvailable !== false;

    const created = await prisma.menu.create({
      data: {
        name: String(body.name || "Menu Baru"),
        description: String(body.description || "Deskripsi menu"),
        price: Number(body.price || 25000),
        category: String(body.category || "Makanan"),
        image: String(
          body.image ||
            "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
        ),
        available: isAvail,
      },
    });

    return NextResponse.json(
      { ...created, isAvailable: created.available },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const targetId = Number(body.id);

    if (!targetId || Number.isNaN(targetId)) {
      return NextResponse.json({ error: "ID Menu tidak valid" }, { status: 400 });
    }

    const isAvail =
      body.available !== undefined
        ? Boolean(body.available)
        : body.isAvailable !== undefined
        ? Boolean(body.isAvailable)
        : true;

    const updated = await prisma.menu.update({
      where: { id: targetId },
      data: {
        name: body.name !== undefined ? String(body.name) : undefined,
        description:
          body.description !== undefined
            ? String(body.description)
            : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        category:
          body.category !== undefined ? String(body.category) : undefined,
        image: body.image !== undefined ? String(body.image) : undefined,
        available: isAvail,
      },
    });

    return NextResponse.json(
      { ...updated, isAvailable: updated.available },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let idParam = searchParams.get("id");

    if (!idParam) {
      const body = await request.json().catch(() => ({}));
      if (body.id !== undefined) {
        idParam = String(body.id);
      }
    }

    const targetId = Number(idParam);
    if (!targetId || Number.isNaN(targetId)) {
      return NextResponse.json({ error: "ID Menu tidak valid" }, { status: 400 });
    }

    await prisma.menu.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ success: true, id: targetId }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}