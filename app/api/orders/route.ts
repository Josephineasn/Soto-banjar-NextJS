import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { id: "desc" },
    });

    const formatted = orders.map((ord) => {
      const itemRecord = ord as unknown as Record<string, unknown>;

      return {
        ...ord,
        note: String(itemRecord.note || itemRecord.notes || itemRecord.orderNotes || itemRecord.catatan || "-"),
        landmark: String(itemRecord.landmark || itemRecord.patokan || itemRecord.addressBenchmark || "-"),
        customerPhone: String(itemRecord.customerPhone || itemRecord.phone || itemRecord.phoneNumber || itemRecord.telp || "-"),
        customerName: String(itemRecord.customerName || itemRecord.name || "Customer"),
        shippingCost: Number(
          itemRecord.shippingCost ??
          itemRecord.shippingFee ??
          itemRecord.ongkir ??
          0
        ),
        totalAmount: Number(
          itemRecord.totalAmount ??
          itemRecord.subtotal ??
          itemRecord.totalPrice ??
          itemRecord.total ??
          0
        ),
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}