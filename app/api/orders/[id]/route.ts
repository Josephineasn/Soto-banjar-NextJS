import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Melihat detail pesanan
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}

// Mengubah status pesanan (Admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (
    !process.env.ADMIN_KEY ||
    req.headers.get("x-admin-key") !== process.env.ADMIN_KEY
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { status } = await req.json();

  const allowedStatus = [
    "PENDING",
    "DIPROSES",
    "DIKIRIM",
    "SELESAI",
    "DIBATALKAN",
  ];

  if (!allowedStatus.includes(status)) {
    return NextResponse.json(
      { error: "Status tidak valid" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan" },
      { status: 404 }
    );
  }
}