import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const targetId = Number(resolvedParams.id);

    if (!targetId || Number.isNaN(targetId)) {
      return NextResponse.json({ error: "ID Menu tidak valid" }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    const popularValue =
      body.popular !== undefined
        ? Boolean(body.popular)
        : body.isRecommended !== undefined
        ? Boolean(body.isRecommended)
        : body.isFavorite !== undefined
        ? Boolean(body.isFavorite)
        : undefined;

    const spicesValue =
      body.spices !== undefined
        ? String(body.spices)
        : body.ingredients !== undefined
        ? String(body.ingredients)
        : undefined;

    const packagingValue =
      body.packagingInfo !== undefined
        ? String(body.packagingInfo)
        : body.packaging !== undefined
        ? String(body.packaging)
        : undefined;

    const spicyValue =
      body.spicyLevel !== undefined
        ? String(body.spicyLevel)
        : body.spiceLevel !== undefined
        ? String(body.spiceLevel)
        : undefined;

    const updated = await prisma.menu.update({
      where: { id: targetId },
      data: {
        ...(body.name !== undefined ? { name: String(body.name) } : {}),
        ...(body.category !== undefined
          ? { category: String(body.category).toLowerCase() }
          : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(body.description !== undefined
          ? { description: String(body.description) }
          : {}),
        ...(body.image !== undefined ? { image: String(body.image) } : {}),
        ...(body.available !== undefined
          ? { available: Boolean(body.available) }
          : {}),
        ...(body.rating !== undefined ? { rating: Number(body.rating) } : {}),
        ...(popularValue !== undefined ? { popular: popularValue } : {}),
        ...(spicesValue !== undefined ? { spices: spicesValue } : {}),
        ...(packagingValue !== undefined
          ? { packagingInfo: packagingValue }
          : {}),
        ...(body.calories !== undefined ? { calories: String(body.calories) } : {}),
        ...(spicyValue !== undefined ? { spicyLevel: spicyValue } : {}),
      },
    });

    return NextResponse.json(
      {
        ...updated,
        isAvailable: updated.available,
        isRecommended: updated.popular,
        isFavorite: updated.popular,
        spiceLevel: updated.spicyLevel,
        packaging: updated.packagingInfo,
        ingredients: updated.spices,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memperbarui menu";
    console.error("PATCH /api/menu/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const targetId = Number(resolvedParams.id);

    if (!targetId || Number.isNaN(targetId)) {
      return NextResponse.json({ error: "ID Menu tidak valid" }, { status: 400 });
    }

    await prisma.menu.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ success: true, id: targetId }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus menu";
    console.error("DELETE /api/menu/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}