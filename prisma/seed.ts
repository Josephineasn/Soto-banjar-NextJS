
import { PrismaClient } from "@prisma/client";
import { INITIAL_MENU_ITEMS } from "../data/menu";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================");
  console.log("MEMULAI SEED DATABASE SOTO BANJAR");
  console.log("==================================");

  console.log(
    `Jumlah menu ditemukan: ${INITIAL_MENU_ITEMS.length}`
  );

  if (INITIAL_MENU_ITEMS.length === 0) {
    console.log("Tidak ada menu untuk dimasukkan.");
    return;
  }

  let berhasil = 0;

  for (const item of INITIAL_MENU_ITEMS) {
    console.log(`Memproses menu: ${item.name}`);

    await prisma.menu.upsert({
      where: {
        id: item.id,
      },

      update: {},

      create: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        rating: item.rating,
        spicyLevel: item.spicyLevel,
        calories: item.calories,
        packagingInfo: item.packagingInfo,
        description: item.description,
        spices: JSON.stringify(item.spices),
        image: item.image,
        popular: item.popular,
        available: item.available,
      },
    });

    berhasil++;

    console.log(`Berhasil: ${item.name}`);
  }

  const totalDatabase = await prisma.menu.count();

  console.log("");
  console.log("==================================");
  console.log("SEED DATABASE SELESAI");
  console.log("==================================");

  console.log(`Menu diproses: ${berhasil}`);
  console.log(`Total menu di database: ${totalDatabase}`);
}

main()
  .catch((error) => {
    console.error("TERJADI ERROR SAAT SEED:");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Koneksi Prisma ditutup.");
  });
