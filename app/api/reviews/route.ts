import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Mengambil review berdasarkan menu
export async function GET(req: NextRequest) {
  const menuId = Number(
    req.nextUrl.searchParams.get("menuId")
  );

  if (!Number.isInteger(menuId) || menuId < 1) {
    return NextResponse.json(
      { error: "menuId diperlukan" },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { menuId },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });

  return NextResponse.json(reviews);
}

// Menambahkan review
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (
    !Number.isInteger(body.menuId) ||
    !Number.isInteger(body.rating) ||
    body.rating < 1 ||
    body.rating > 5 ||
    !body.name?.trim() ||
    !body.comment?.trim() ||
    body.comment.length > 500
  ) {
    return NextResponse.json(
      { error: "Ulasan tidak valid" },
      { status: 400 }
    );
  }

  try {
    const review = await prisma.review.create({
      data: {
        menuId: body.menuId,
        name: body.name.trim().slice(0, 80),
        rating: body.rating,
        comment: body.comment.trim(),
      },
    });

    return NextResponse.json(review, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { error: "Menu tidak ditemukan" },
      { status: 404 }
    );
  }
}