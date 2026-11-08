import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const services = await prisma.shippingService.findMany({
        orderBy: { id: "asc" },
        });
        return NextResponse.json(services);
    } catch (error) {
        console.error("Gagal mengambil shipping services:", error);
        return NextResponse.json(
        { error: "Gagal memuat layanan pengiriman." },
        { status: 500 }
        );
    }
}