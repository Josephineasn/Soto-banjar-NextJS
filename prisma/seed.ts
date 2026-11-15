import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_MENU_ITEMS = [
  {
    name: "Soto Banjar Otentik",
    description: "Menu legendaris soto khas Kalimantan Selatan dengan racikan rempah murni pilihan.",
    price: 32000,
    category: "Makanan",
    image: "/soto1.jpg",
    available: true,
  },
  {
    name: "Sop Banjar Spesial",
    description: "Sop kuah bening kaya rempah pilihan khas Banjar dengan potongan ayam kampung.",
    price: 32000,
    category: "Makanan",
    image: "/soto2.jpg",
    available: true,
  },
];

async function main(): Promise<void> {
  for (const item of INITIAL_MENU_ITEMS) {
    await prisma.menu
      .create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          available: item.available,
        },
      })
      .catch(() => {});
  }
}

main()
  .catch((error: unknown) => {
    console.error("TERJADI ERROR SAAT SEED:", error);
  })
  .finally(() => {
    void prisma.$disconnect();
  });