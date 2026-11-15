import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const areas = await prisma.deliveryArea.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(areas, { status: 200 });
  } catch (error) {
    console.error("GET /api/delivery-areas error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; city?: string; price?: number; fee?: number; cost?: number };
    const cityName = (body.name || body.city || "").trim();
    const priceVal = Number(body.price ?? body.fee ?? body.cost ?? 0);

    if (!cityName || isNaN(priceVal)) {
      return NextResponse.json({ error: "Nama wilayah dan harga wajib diisi!" }, { status: 400 });
    }

    const newArea = await prisma.deliveryArea.create({
      data: {
        name: cityName,
        price: priceVal,
      } as unknown as Parameters<typeof prisma.deliveryArea.create>[0]["data"],
    });

    return NextResponse.json(newArea, { status: 201 });
  } catch (error) {
    console.error("POST /api/delivery-areas error:", error);
    return NextResponse.json({ error: "Gagal menyimpan ke database" }, { status: 500 });
  }
}