
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - Mengambil menu dari database
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: {
        id: "asc",
      },
    });

    const result = menus.map((menu) => ({
      ...menu,
      spices: JSON.parse(menu.spices),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

// POST - Menambahkan menu baru
export async function POST(req: NextRequest) {
  if (
    !process.env.ADMIN_KEY ||
    req.headers.get("x-admin-key") !== process.env.ADMIN_KEY
  ) {
    return NextResponse.json(
      { error: "Akses ditolak" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      !["makanan", "cemilan", "pendamping", "minuman"].includes(
        body.category
      ) ||
      !Number.isInteger(body.price) ||
      body.price < 0
    ) {
      return NextResponse.json(
        { error: "Data menu tidak valid" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name: body.name.trim(),
        category: body.category,
        price: body.price,
        description: String(body.description || ""),
        image: String(body.image || ""),
        rating: 0,
        spicyLevel: String(body.spicyLevel || "Tidak Pedas"),
        calories: String(body.calories || "-"),
        packagingInfo: String(body.packagingInfo || "-"),
        spices: JSON.stringify(
          Array.isArray(body.spices) ? body.spices : []
        ),
        popular: Boolean(body.popular),
        available: true,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal menambahkan menu" },
      { status: 500 }
    );
  }
}
