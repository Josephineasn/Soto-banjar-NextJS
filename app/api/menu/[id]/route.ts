import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const authorized = (req: NextRequest) => {
  return (
    !!process.env.ADMIN_KEY &&
    req.headers.get("x-admin-key") === process.env.ADMIN_KEY
  );
};

// Edit menu
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const id = Number((await params).id);
  const body = await req.json();

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { error: "ID invalid" },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};

  const allowedFields = [
    "name",
    "category",
    "description",
    "image",
    "popular",
    "available",
    "price",
  ];

  for (const key of allowedFields) {
    if (key in body) {
      data[key] = body[key];
    }
  }

  if ("price" in data) {
    data.price = Number(data.price);

    if (
      !Number.isInteger(data.price) ||
      Number(data.price) < 0
    ) {
      return NextResponse.json(
        { error: "Harga invalid" },
        { status: 400 }
      );
    }
  }

  try {
    const menu = await prisma.menu.update({
      where: { id },
      data,
    });

    return NextResponse.json(menu);
  } catch {
    return NextResponse.json(
      { error: "Menu tidak ditemukan" },
      { status: 404 }
    );
  }
}

// Hapus menu
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const id = Number((await params).id);

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Menu tidak ditemukan" },
      { status: 404 }
    );
  }
}