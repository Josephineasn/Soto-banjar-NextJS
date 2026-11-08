import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "shipping_rates.json");

const defaultRates = {
  jakarta: 10000,
  tangerang: 15000,
  depokBekasi: 18000,
  bogor: 24000,
};

function getRates() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e);
  }
  return defaultRates;
}

// GET: Mengambil tarif ongkir
export async function GET() {
  const rates = getRates();
  return NextResponse.json(rates);
}

// POST / PUT: Mengubah tarif ongkir dari admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = {
      jakarta: Number(body.jakarta) || 0,
      tangerang: Number(body.tangerang) || 0,
      depokBekasi: Number(body.depokBekasi) || 0,
      bogor: Number(body.bogor) || 0,
    };
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal menyimpan ongkir:", error);
    return NextResponse.json({ error: "Gagal menyimpan tarif ongkir." }, { status: 500 });
  }
}