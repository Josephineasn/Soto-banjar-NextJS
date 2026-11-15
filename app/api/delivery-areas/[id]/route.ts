import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Kompatibel dengan Next.js App Router (baik synchronous maupun Promise params)
    const resolvedParams = await Promise.resolve(context.params);
    const rawId = resolvedParams.id;
    const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

    const body = (await request.json()) as {
      name?: string;
      city?: string;
      price?: number;
      fee?: number;
      cost?: number;
    };

    const cityName = (body.name || body.city)?.trim();
    const priceVal = Number(body.price ?? body.fee ?? body.cost ?? 0);

    const updateData: Record<string, string | number> = {};
    if (cityName) updateData.name = cityName;
    if (!isNaN(priceVal)) updateData.price = priceVal;

    const updated = await prisma.deliveryArea.update({
      where: { id: id as unknown as number },
      data: updateData as unknown as Parameters<typeof prisma.deliveryArea.update>[0]["data"],
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("PATCH /api/delivery-areas/[id] error:", errorMessage);
    return NextResponse.json(
      { error: `Gagal memperbarui data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const rawId = resolvedParams.id;
    const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

    await prisma.deliveryArea.delete({
      where: { id: id as unknown as number },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("DELETE /api/delivery-areas/[id] error:", errorMessage);
    return NextResponse.json(
      { error: `Gagal menghapus data: ${errorMessage}` },
      { status: 500 }
    );
  }
}