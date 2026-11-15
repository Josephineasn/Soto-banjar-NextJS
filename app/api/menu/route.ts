import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const META_FILE = path.join(process.cwd(), "menu-meta.json");
const DEFAULT_RECOMMENDED_NAMES = [
  "soto banjar otentik",
  "soto banjar (ketupat)",
  "soto banjar nasi",
  "sop banjar spesial",
];

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

export async function GET() {
  try {
    const dbMenus = await prisma.menu.findMany({
      orderBy: { id: "asc" },
    });

    const meta = readMeta();

    const enriched = dbMenus.map((m) => {
      const rec = m as unknown as Record<string, unknown>;
      const strId = String(rec.id);
      const savedItemMeta = meta.items[strId] || {};

      const nameLower = String(rec.name || "").trim().toLowerCase();

      // Cek apakah menu direkomendasikan dari penyimpanan Admin, dari DB, atau dari default awal
      const isRec =
        savedItemMeta.isRecommended !== undefined
          ? Boolean(savedItemMeta.isRecommended)
          : rec.isRecommended !== undefined
          ? Boolean(rec.isRecommended)
          : rec.isFavorite !== undefined
          ? Boolean(rec.isFavorite)
          : rec.recommended !== undefined
          ? Boolean(rec.recommended)
          : rec.bestSeller !== undefined
          ? Boolean(rec.bestSeller)
          : DEFAULT_RECOMMENDED_NAMES.includes(nameLower);

      const categoryVal = String(
        savedItemMeta.category || rec.category || "makanan"
      ).toLowerCase();

      const ingredientsVal =
        savedItemMeta.ingredients ??
        rec.ingredients ??
        rec.spices ??
        rec.rempah ??
        "Kayu Manis, Kapulaga, Cengkeh, Bawang Merah Banjar";

      const packagingVal =
        savedItemMeta.packaging ??
        rec.packaging ??
        rec.kemasan ??
        rec.standardPackaging ??
        "Wadah Food Grade Kedap Udara";

      return {
        ...rec,
        ...savedItemMeta,
        id: rec.id,
        category: categoryVal,
        rating: Number(savedItemMeta.rating ?? rec.rating ?? 4.8),
        spiceLevel: String(savedItemMeta.spiceLevel ?? rec.spiceLevel ?? "Tidak Pedas"),
        calories: Number(savedItemMeta.calories ?? rec.calories ?? 350),
        ingredients: ingredientsVal,
        spices: ingredientsVal,
        packaging: packagingVal,
        standardPackaging: packagingVal,
        // Set SEMUA variasi properti rekomendasi agar komponen Customer pasti membacanya
        isFavorite: isRec,
        isRecommended: isRec,
        recommended: isRec,
        bestSeller: isRec,
        isBestSeller: isRec,
        popular: isRec,
        badge: isRec ? "Rekomendasi" : "",
      };
    });

    return NextResponse.json(enriched, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/menu error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = String(body.name || "Menu Baru").trim();
    const category = String(body.category || "makanan").trim().toLowerCase();
    const price = Number(body.price || 0);
    const image = String(body.image || "/soto-banjar.jpg").trim();
    const description = String(body.description || "").trim();
    const isRec = Boolean(
      body.isRecommended ?? body.isFavorite ?? body.recommended ?? false
    );

    // Simpan ke Prisma dengan field standar yang pasti ada di schema
    const created = await prisma.menu.create({
      data: {
        name,
        category,
        price,
        image,
        description,
      } as unknown as Parameters<typeof prisma.menu.create>[0]["data"],
    });

    const createdRec = created as unknown as Record<string, unknown>;
    const strId = String(createdRec.id);

    // Simpan detail lengkap & status rekomendasi ke menu-meta.json
    const meta = readMeta();
    if (!meta.categories.includes(category)) {
      meta.categories.push(category);
    }
    meta.items[strId] = {
      category,
      rating: Number(body.rating || 4.8),
      spiceLevel: String(body.spiceLevel || "Tidak Pedas"),
      calories: Number(body.calories || 350),
      ingredients: String(body.ingredients || ""),
      packaging: String(body.packaging || "Kotak makanan"),
      isRecommended: isRec,
      isFavorite: isRec,
      recommended: isRec,
      bestSeller: isRec,
    };
    writeMeta(meta);

    return NextResponse.json(
      {
        ...createdRec,
        ...meta.items[strId],
        isFavorite: isRec,
        isRecommended: isRec,
        recommended: isRec,
        bestSeller: isRec,
        isBestSeller: isRec,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/menu error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}