import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil seluruh daftar DeliveryArea
export async function GET() {
    try {
        const areas = await prisma.deliveryArea.findMany({
        orderBy: { id: "asc" },
        });
        return NextResponse.json(areas);
    } catch (error) {
        console.error("Gagal mengambil data delivery area:", error);
        return NextResponse.json(
        { error: "Gagal mengambil data daerah pengiriman." },
        { status: 500 }
        );
    }
    }

    // PUT: Update harga atau status DeliveryArea
    export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, price, isActive, name } = body;

        if (!id) {
        return NextResponse.json({ error: "ID daerah wajib disertakan." }, { status: 400 });
        }

        const updated = await prisma.deliveryArea.update({
        where: { id: Number(id) },
        data: {
            ...(price !== undefined && { price: Number(price) }),
            ...(isActive !== undefined && { isActive: Boolean(isActive) }),
            ...(name && { name: String(name).trim() }),
        },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Gagal memperbarui delivery area:", error);
        return NextResponse.json(
        { error: "Gagal memperbarui tarif ongkir ke database Prisma." },
        { status: 500 }
        );
    }
    }

    // POST: Tambah daerah baru jika diperlukan
    export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, price } = body;

        if (!name || price === undefined) {
        return NextResponse.json({ error: "Nama daerah dan harga wajib diisi." }, { status: 400 });
        }

        const created = await prisma.deliveryArea.create({
        data: {
            name: String(name).trim(),
            price: Number(price),
            isActive: true,
        },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("Gagal menambah delivery area:", error);
        return NextResponse.json({ error: "Gagal menambah data." }, { status: 500 });
    }
}