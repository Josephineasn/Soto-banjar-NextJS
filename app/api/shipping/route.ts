import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_RATES = {
  jakarta: 10000,
  tangerang: 15000,
  depokBekasi: 18000,
  bogor: 24000,
};

function mapAreaKey(name: string): keyof typeof DEFAULT_RATES | null {
  const lower = name.toLowerCase();
  if (lower.includes("jakarta")) return "jakarta";
  if (lower.includes("tangerang")) return "tangerang";
  if (lower.includes("depok") || lower.includes("bekasi")) return "depokBekasi";
  if (lower.includes("bogor")) return "bogor";
  return null;
}

// GET: Mengambil tarif ongkir
export async function GET() {
  try {
    const areas = await prisma.deliveryArea.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });

    if (!areas || areas.length === 0) {
      return NextResponse.json(DEFAULT_RATES, { status: 200 });
    }

    const rates = { ...DEFAULT_RATES };

    for (const area of areas) {
      const key = mapAreaKey(area.name);
      if (key) {
        rates[key] = Number(area.price);
      }
    }

    return NextResponse.json(rates, { status: 200 });
  } catch (error) {
    console.error("GET /api/shipping error:", error);
    return NextResponse.json(DEFAULT_RATES, { status: 200 });
  }
}

// POST: Menyimpan perubahan tarif ongkir dari Admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedRates = {
      jakarta: Number(body.jakarta) || 0,
      tangerang: Number(body.tangerang) || 0,
      depokBekasi: Number(body.depokBekasi) || 0,
      bogor: Number(body.bogor) || 0,
    };

    const areaConfigs: {
      key: keyof typeof DEFAULT_RATES;
      label: string;
      keywords: string[];
    }[] = [
      { key: "jakarta", label: "Jakarta", keywords: ["jakarta"] },
      { key: "tangerang", label: "Tangerang", keywords: ["tangerang"] },
      {
        key: "depokBekasi",
        label: "Depok & Bekasi",
        keywords: ["depok", "bekasi"],
      },
      { key: "bogor", label: "Bogor", keywords: ["bogor"] },
    ];

    const existingAreas = await prisma.deliveryArea.findMany();

    for (const config of areaConfigs) {
      const priceValue = updatedRates[config.key];
      const matched = existingAreas.find((a) =>
        config.keywords.some((kw) => a.name.toLowerCase().includes(kw))
      );

      if (matched) {
        await prisma.deliveryArea.update({
          where: { id: matched.id },
          data: { price: priceValue, isActive: true },
        });
      } else {
        await prisma.deliveryArea.create({
          data: {
            name: config.label,
            price: priceValue,
            isActive: true,
          },
        });
      }
    }

    return NextResponse.json(updatedRates, { status: 200 });
  } catch (error) {
    console.error("Gagal menyimpan ongkir ke database:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan tarif ongkir ke database." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}