import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await prisma.shippingService.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /api/shipping-services error:", error);
    return NextResponse.json([], { status: 500 });
  }
}