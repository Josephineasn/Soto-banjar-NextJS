import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.deliveryArea.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    const services = await prisma.shippingService.findMany({
      where: { isActive: true },
      orderBy: { extraPrice: "asc" },
    });

    return NextResponse.json({ areas, services });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data pengiriman" },
      { status: 500 }
    );
  }
}