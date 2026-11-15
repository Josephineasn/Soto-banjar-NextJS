import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_MENU_ITEMS = [
  {
    name: "Soto Banjar Otentik",
    description: "Menu legendaris soto khas Kalimantan Selatan dengan racikan rempah murni pilihan.",
    price: 32000,
    category: "Makanan",
    image: "/soto1.jpg",
    isAvailable: true,
  },
  {
    name: "Sop Banjar Spesial",
    description: "Sop kuah bening kaya rempah pilihan khas Banjar dengan potongan ayam kampung.",
    price: 32000,
    category: "Makanan",
    image: "/soto2.jpg",
    isAvailable: true,
  },
  {
    name: "Soto Banjar (Nasi Terpisah)",
    description: "Racikan sop ayam kampung murni berpadu kayu manis, kapulaga, cengkeh, dan bunga lawang.",
    price: 35000,
    category: "Makanan",
    image: "/soto3.jpg",
    isAvailable: true,
  },
  {
    name: "Nasi Sop Banjar (Campur)",
    description: "Penyajian praktis khas lokal, nasi putih langsung dicampur di dalam wadah sop hangat.",
    price: 35000,
    category: "Makanan",
    image: "/soto4.jpg",
    isAvailable: true,
  },
  {
    name: "Ekstrak Ketupat Lembut",
    description: "Ketupat matang berbungkus daun pisang yang legit.",
    price: 10000,
    category: "Cemilan",
    image: "/ketupat.jpg",
    isAvailable: true,
  },
  {
    name: "Perkedel Singkong / Kentang",
    description: "Perkedel empuk gurih pelengkap nikmat bersantap soto.",
    price: 6000,
    category: "Pendamping",
    image: "/perkedel.jpg",
    isAvailable: true,
  },
];

async function main(): Promise<void> {
  console.log("Memulai proses seeding database Soto Banjar...");

  for (const item of INITIAL_MENU_ITEMS) {
    await prisma.menu
      .create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          isAvailable: item.isAvailable,
        },
      })
      .catch(() => {
        // Abaikan jika data sudah ada
      });
  }

  console.log("Seeding database berhasil diselesaikan!");
}

main()
  .catch((error: unknown) => {
    console.error("TERJADI ERROR SAAT SEED:", error);
  })
  .finally(() => {
    void prisma.$disconnect().then(() => {
      console.log("Koneksi Prisma ditutup.");
    });
  });