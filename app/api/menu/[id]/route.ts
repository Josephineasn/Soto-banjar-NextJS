import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const META_FILE = path.join(process.cwd(), "menu-meta.json");

interface MenuMetaStore {
  categories: string[];
  items: Record<string, Record<string, unknown>>;
}

function readMeta(): MenuMetaStore {
  try {
    if (fs.existsSync(META_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(META_FILE, "utf-8")) as Partial<MenuMetaStore>;
      return {
        categories: Array.isArray(parsed.categories)
          ? parsed.categories
          : ["makanan", "cemilan", "pendamping", "minuman"],
        items: parsed.items && typeof parsed.items === "object" ? parsed.items : {},
      };
    }
  } catch {
    // Abaikan
  }
  return {
    categories: ["makanan", "cemilan", "pendamping", "minuman"],
    items: {},
  };
}

function writeMeta(data: MenuMetaStore) {
  try {
    fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menulis menu-meta.json:", err);
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const rawId = String(resolvedParams.id);
    const body = (await request.json()) as Record<string, unknown>;

    const meta = readMeta();
    const existingMeta = meta.items[rawId] || {};

    const isRec =
      body.isRecommended !== undefined
        ? Boolean(body.isRecommended)
        : body.isFavorite !== undefined
        ? Boolean(body.isFavorite)
        : body.recommended !== undefined
        ? Boolean(body.recommended)
        : existingMeta.isRecommended !== undefined
        ? Boolean(existingMeta.isRecommended)
        : false;

    const updatedMeta: Record<string, unknown> = {
      ...existingMeta,
      ...(body.category !== undefined ? { category: String(body.category).toLowerCase() } : {}),
      ...(body.rating !== undefined ? { rating: Number(body.rating) } : {}),
      ...(body.spiceLevel !== undefined ? { spiceLevel: String(body.spiceLevel) } : {}),
      ...(body.calories !== undefined ? { calories: Number(body.calories) } : {}),
      ...(body.ingredients !== undefined ? { ingredients: String(body.ingredients) } : {}),
      ...(body.packaging !== undefined ? { packaging: String(body.packaging) } : {}),
      isRecommended: isRec,
      isFavorite: isRec,
      recommended: isRec,
      bestSeller: isRec,
      isBestSeller: isRec,
    };

    meta.items[rawId] = updatedMeta;
    if (body.category && !meta.categories.includes(String(body.category).toLowerCase())) {
      meta.categories.push(String(body.category).toLowerCase());
    }
    writeMeta(meta);

    // Update field dasar di Prisma jika ada perubahan nama/harga/kategori/deskripsi/gambar
    let dbUpdated: Record<string, unknown> = {};
    try {
      const parsedId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const whereClause = { id: parsedId } as unknown as Parameters<
        typeof prisma.menu.update
      >[0]["where"];

      const prismaData: Record<string, unknown> = {};
      if (body.name !== undefined) prismaData.name = String(body.name);
      if (body.category !== undefined) prismaData.category = String(body.category).toLowerCase();
      if (body.price !== undefined) prismaData.price = Number(body.price);
      if (body.image !== undefined) prismaData.image = String(body.image);
      if (body.description !== undefined) prismaData.description = String(body.description);

      if (Object.keys(prismaData).length > 0) {
        const res = await prisma.menu.update({
          where: whereClause,
          data: prismaData as unknown as Parameters<typeof prisma.menu.update>[0]["data"],
        });
        dbUpdated = res as unknown as Record<string, unknown>;
      }
    } catch {
      // Abaikan jika kolom tertentu tidak ada di Prisma
    }

    return NextResponse.json(
      {
        id: isNaN(Number(rawId)) ? rawId : Number(rawId),
        ...dbUpdated,
        ...body,
        ...updatedMeta,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const rawId = String(resolvedParams.id);

    const meta = readMeta();
    delete meta.items[rawId];
    writeMeta(meta);

    try {
      const parsedId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const whereClause = { id: parsedId } as unknown as Parameters<
        typeof prisma.menu.delete
      >[0]["where"];
      await prisma.menu.delete({ where: whereClause });
    } catch {
      // Abaikan
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}