import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Melihat detail pesanan beserta item rinciannya
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Gagal mengambil detail pesanan:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// Mengubah status pesanan (Admin Panel)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const allowedStatus = [
      "PENDING",
      "DIPROSES",
      "DIKIRIM",
      "SELESAI",
      "DIBATALKAN",
    ];

    if (!status || !allowedStatus.includes(status)) {
      return NextResponse.json(
        { error: "Status pesanan tidak valid." },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Gagal memperbarui status pesanan:", error);
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan atau gagal diperbarui." },
      { status: 404 }
    );
  }
}

// Menghapus pesanan (Admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Pesanan berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus pesanan:", error);
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan atau gagal dihapus." },
      { status: 404 }
    );
  }
}