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
    description:
      "Menu legendaris soto khas Kalimantan Selatan dengan racikan rempah murni pilihan.",
    price: 32000,
    category: "Makanan",
    image: "/soto1.jpg",
    available: true,
    isAvailable: true,
    rating: 4.9,
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Soto Banjar Susu / Kuah Kental",
    description:
      "Soto khas Banjar dengan kuah gurih creamy perpaduan susu/kentang tumbuk, suwiran ayam kampung, telur rebus, soun, dan perkedel.",
    price: 35000,
    category: "Makanan",
    image: "/soto2.jpg",
    available: true,
    isAvailable: true,
    rating: 4.9,
    isBestSeller: true,
  },
  {
    id: 3,
    name: "Sop Banjar Spesial",
    description:
      "Sop kuah bening kaya rempah pilihan khas Banjar dengan potongan ayam kampung.",
    price: 32000,
    category: "Makanan",
    image: "/soto3.jpg",
    available: true,
    isAvailable: true,
    rating: 4.8,
    isBestSeller: false,
  },
  {
    id: 4,
    name: "Sop Banjar (Nasi Terpisah)",
    description:
      "Racikan sop ayam kampung rempah otentik disajikan dengan nasi putih terpisah.",
    price: 35000,
    category: "Makanan",
    image: "/soto4.jpg",
    available: true,
    isAvailable: true,
    rating: 4.8,
    isBestSeller: true,
  },
  {
    id: 5,
    name: "Nasi Sop Banjar (Campur)",
    description:
      "Penyajian praktis khas lokal, nasi putih langsung dicampur di dalam wadah sop hangat.",
    price: 35000,
    category: "Makanan",
    image: "/soto1.jpg",
    available: true,
    isAvailable: true,
    rating: 4.7,
    isBestSeller: false,
  },
  {
    id: 6,
    name: "Sate Ayam Bumbu Banjar (5 Tusuk)",
    description:
      "Sate ayam empuk dengan bumbu kacang merah gurih manis khas Kalimantan Selatan.",
    price: 25000,
    category: "Cemilan",
    image: "/sate.jpg",
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
    image: "/ketupat.jpg",
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
    image: "/nasi.jpg",
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
    image: "/perkedel.jpg",
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
    image: "/telur.jpg",
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
    image: "/teh.jpg",
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
    image: "/jeruk.jpg",
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
      return NextResponse.json(dbMenus, { status: 200 });
    }

    return NextResponse.json(FALLBACK_MENUS, { status: 200 });
  } catch (error: unknown) {
    console.warn(
      "Menggunakan fallback menu karena database read-only/offline:",
      error
    );
    return NextResponse.json(FALLBACK_MENUS, { status: 200 });
  }
}

export async function POST(request: Request) {
  let body: Partial<MenuRecord> = {};
  try {
    body = (await request.json()) as Partial<MenuRecord>;
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
        image: String(body.image || "/soto1.jpg"),
        available: isAvail,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        id: Math.floor(100 + Math.random() * 900),
        name: String(body.name || "Menu Baru"),
        description: String(body.description || "Deskripsi menu"),
        price: Number(body.price || 25000),
        category: String(body.category || "Makanan"),
        image: String(body.image || "/soto1.jpg"),
        available: body.available !== false,
        isAvailable: body.isAvailable !== false,
      },
      { status: 201 }
    );
  }
}