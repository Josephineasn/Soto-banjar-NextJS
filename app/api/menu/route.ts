import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface MenuRecord {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  isAvailable?: boolean;
  rating?: number;
  isBestSeller?: boolean;
}

const FALLBACK_MENUS: MenuRecord[] = [
  {
    id: 1,
    name: "Soto Banjar Otentik",
    description: "Menu legendaris soto khas Kalimantan Selatan dengan racikan rempah murni pilihan.",
    price: 32000,
    category: "Makanan",
    image: "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg",
    available: true,
    isAvailable: true,
    rating: 4.9,
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Soto Banjar Susu / Kuah Kental",
    description: "Soto khas Banjar dengan kuah gurih creamy perpaduan susu/kentang tumbuk, suwiran ayam kampung, telur rebus, soun, dan perkedel.",
    price: 35000,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.9,
    isBestSeller: true,
  },
  {
    id: 3,
    name: "Sop Banjar Spesial",
    description: "Sop kuah bening kaya rempah pilihan khas Banjar dengan potongan ayam kampung.",
    price: 32000,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.8,
    isBestSeller: false,
  },
  {
    id: 4,
    name: "Sop Banjar (Nasi Terpisah)",
    description: "Racikan sop ayam kampung rempah otentik disajikan dengan nasi putih terpisah.",
    price: 35000,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.8,
    isBestSeller: true,
  },
  {
    id: 5,
    name: "Nasi Sop Banjar (Campur)",
    description: "Penyajian praktis khas lokal, nasi putih langsung dicampur di dalam wadah sop hangat.",
    price: 35000,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.7,
    isBestSeller: false,
  },
  {
    id: 6,
    name: "Sate Ayam Bumbu Banjar (5 Tusuk)",
    description: "Sate ayam empuk dengan bumbu kacang merah gurih manis khas Kalimantan Selatan.",
    price: 25000,
    category: "Cemilan",
    image: "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.8,
    isBestSeller: true,
  },
  {
    id: 7,
    name: "Ekstra Ketupat Lembut",
    description: "Ketupat matang pulen berbungkus daun pisang yang legit.",
    price: 10000,
    category: "Pendamping",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.6,
    isBestSeller: false,
  },
  {
    id: 8,
    name: "Ekstra Nasi Putih Pulen",
    description: "Nasi putih pulen yang lembut dan harum.",
    price: 5000,
    category: "Pendamping",
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.6,
    isBestSeller: false,
  },
  {
    id: 9,
    name: "Perkedel Singkong / Kentang",
    description: "Perkedel empuk gurih pelengkap nikmat bersantap soto.",
    price: 6000,
    category: "Pendamping",
    image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.7,
    isBestSeller: false,
  },
  {
    id: 10,
    name: "Ekstra Telur Bebek Rebus",
    description: "Telur bebek rebus gurih pilihan pelengkap kuah soto.",
    price: 8000,
    category: "Pendamping",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.7,
    isBestSeller: false,
  },
  {
    id: 11,
    name: "Es / Hangat Teh Ahmad",
    description: "Seduhan teh harum pilihan disajikan dingin atau hangat.",
    price: 8000,
    category: "Minuman",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.8,
    isBestSeller: false,
  },
  {
    id: 12,
    name: "Es Jeruk Peras Murni",
    description: "Perasan jeruk segar asli tanpa pemanis buatan.",
    price: 12000,
    category: "Minuman",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
    available: true,
    isAvailable: true,
    rating: 4.8,
    isBestSeller: false,
  },
];

export async function GET() {
  try {
    const dbMenus = await prisma.menu.findMany({
      orderBy: { id: "asc" },
    });

    if (Array.isArray(dbMenus) && dbMenus.length > 0) {
      const sanitized = dbMenus.map((m) => ({
        ...m,
        isAvailable: m.available,
      }));
      return NextResponse.json(sanitized, { status: 200 });
    }

    // Jika database dari Prisma kosong, gunakan fallback menus
    return NextResponse.json(FALLBACK_MENUS, { status: 200 });
  } catch (error: unknown) {
    console.warn("Menggunakan fallback menu karena error database:", error);
    return NextResponse.json(FALLBACK_MENUS, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const isAvail =
      body.available !== undefined
        ? Boolean(body.available)
        : body.isAvailable !== false;

    const created = await prisma.menu.create({
      data: {
        name: String(body.name || "Menu Baru"),
        description: String(body.description || "Deskripsi menu"),
        price: Number(body.price || 25000),
        category: String(body.category || "Makanan"),
        image: String(
          body.image ||
            "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
        ),
        available: isAvail,
      },
    });

    return NextResponse.json(
      { ...created, isAvailable: created.available },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const targetId = Number(body.id);

    if (!targetId || Number.isNaN(targetId)) {
      return NextResponse.json({ error: "ID Menu tidak valid" }, { status: 400 });
    }

    const isAvail =
      body.available !== undefined
        ? Boolean(body.available)
        : body.isAvailable !== undefined
        ? Boolean(body.isAvailable)
        : true;

    const updated = await prisma.menu.update({
      where: { id: targetId },
      data: {
        name: body.name !== undefined ? String(body.name) : undefined,
        description:
          body.description !== undefined
            ? String(body.description)
            : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        category:
          body.category !== undefined ? String(body.category) : undefined,
        image: body.image !== undefined ? String(body.image) : undefined,
        available: isAvail,
      },
    });

    return NextResponse.json(
      { ...updated, isAvailable: updated.available },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let idParam = searchParams.get("id");

    if (!idParam) {
      const body = await request.json().catch(() => ({}));
      if (body.id !== undefined) {
        idParam = String(body.id);
      }
    }

    const targetId = Number(idParam);
    if (!targetId || Number.isNaN(targetId)) {
      return NextResponse.json({ error: "ID Menu tidak valid" }, { status: 400 });
    }

    await prisma.menu.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ success: true, id: targetId }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}