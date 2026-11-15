import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const META_FILE = path.join(process.cwd(), "menu-meta.json");
const DEFAULT_CATEGORIES = ["makanan", "cemilan", "pendamping", "minuman"];

interface MenuMetaStore {
  categories: string[];
  items: Record<string, Record<string, unknown>>;
}

function normalizeCategoryOrder(list: string[]): string[] {
  const cleanList = Array.from(
    new Set(
      list
        .map((c) => c.trim().toLowerCase())
        .filter((c) => Boolean(c) && c !== "makanan ringan")
    )
  );
  const coreTail = ["pendamping", "minuman"];
  const customExtra = cleanList.filter(
    (c) => c !== "makanan" && c !== "cemilan" && !coreTail.includes(c)
  );

  const result: string[] = [];
  if (cleanList.includes("makanan")) result.push("makanan");
  if (cleanList.includes("cemilan")) result.push("cemilan");
  result.push(...customExtra);
  if (cleanList.includes("pendamping")) result.push("pendamping");
  if (cleanList.includes("minuman")) result.push("minuman");

  return result.length > 0 ? result : [...DEFAULT_CATEGORIES];
}

function readMeta(): MenuMetaStore {
  try {
    if (fs.existsSync(META_FILE)) {
      const parsed = JSON.parse(
        fs.readFileSync(META_FILE, "utf-8")
      ) as Partial<MenuMetaStore>;
      const rawCats =
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : DEFAULT_CATEGORIES;
      return {
        categories: normalizeCategoryOrder(rawCats),
        items:
          parsed.items && typeof parsed.items === "object" ? parsed.items : {},
      };
    }
  } catch {
    // Abaikan jika gagal baca
  }
  return { categories: [...DEFAULT_CATEGORIES], items: {} };
}

function writeMeta(data: MenuMetaStore) {
  try {
    fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan menu-meta.json:", err);
  }
}

export async function GET() {
  const meta = readMeta();
  // Sekalian bersihkan jika "makanan ringan" masih tersimpan di file
  writeMeta(meta);
  return NextResponse.json(meta.categories, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const newCat = (body.name || "").trim().toLowerCase();
    if (!newCat) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const meta = readMeta();
    if (!meta.categories.includes(newCat)) {
      meta.categories.push(newCat);
      meta.categories = normalizeCategoryOrder(meta.categories);
      writeMeta(meta);
    }

    return NextResponse.json(meta.categories, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      oldName?: string;
      newName?: string;
    };
    const oldCat = (body.oldName || "").trim().toLowerCase();
    const newCat = (body.newName || "").trim().toLowerCase();

    if (!oldCat || !newCat) {
      return NextResponse.json(
        { error: "Nama kategori lama dan baru wajib diisi" },
        { status: 400 }
      );
    }

    const meta = readMeta();
    meta.categories = meta.categories.map((c) =>
      c.toLowerCase() === oldCat ? newCat : c
    );
    meta.categories = normalizeCategoryOrder(meta.categories);

    Object.keys(meta.items).forEach((id) => {
      if (String(meta.items[id].category || "").toLowerCase() === oldCat) {
        meta.items[id].category = newCat;
      }
    });
    writeMeta(meta);

    try {
      const allMenus = await prisma.menu.findMany();
      for (const m of allMenus) {
        const rec = m as unknown as Record<string, unknown>;
        if (String(rec.category || "").toLowerCase() === oldCat) {
          const whereClause = { id: rec.id } as unknown as Parameters<
            typeof prisma.menu.update
          >[0]["where"];
          await prisma.menu.update({
            where: whereClause,
            data: { category: newCat } as unknown as Parameters<
              typeof prisma.menu.update
            >[0]["data"],
          });
        }
      }
    } catch {
      // Abaikan
    }

    return NextResponse.json(meta.categories, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetCat = (searchParams.get("name") || "").trim().toLowerCase();

    if (!targetCat) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const meta = readMeta();
    meta.categories = meta.categories.filter(
      (c) => c.toLowerCase() !== targetCat
    );
    if (meta.categories.length === 0) {
      meta.categories = [...DEFAULT_CATEGORIES];
    }

    // Pindahkan juga semua item di menu-meta.json yang memakai kategori yang dihapus
    Object.keys(meta.items).forEach((id) => {
      if (String(meta.items[id].category || "").toLowerCase() === targetCat) {
        meta.items[id].category = "makanan";
      }
    });
    writeMeta(meta);

    try {
      const allMenus = await prisma.menu.findMany();
      for (const m of allMenus) {
        const rec = m as unknown as Record<string, unknown>;
        if (String(rec.category || "").toLowerCase() === targetCat) {
          const whereClause = { id: rec.id } as unknown as Parameters<
            typeof prisma.menu.update
          >[0]["where"];
          await prisma.menu.update({
            where: whereClause,
            data: { category: "makanan" } as unknown as Parameters<
              typeof prisma.menu.update
            >[0]["data"],
          });
        }
      }
    } catch {
      // Abaikan
    }

    return NextResponse.json(meta.categories, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}