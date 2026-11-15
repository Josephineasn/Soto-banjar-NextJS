import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const orderId = String(resolvedParams.id);

    const body = (await request.json()) as { status?: string };
    const newStatus = (body.status || "").trim();

    if (!newStatus) {
      return NextResponse.json({ error: "Status baru wajib diisi!" }, { status: 400 });
    }

    // Menggunakan string langsung tanpa casting 'any' atau 'number'
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("PATCH /api/orders/[id] error:", errMessage);
    return NextResponse.json({ error: `Gagal memperbarui status: ${errMessage}` }, { status: 500 });
  }
}