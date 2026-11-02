import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      address,
      addressBenchmark,
      area,
      service,
      orderNotes,
      voucher,
      discount,
      shippingFee,
      serviceFee,
      paymentMethod,
      items,
      totalPrice,
    } = body;

    if (!address || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Data pesanan belum lengkap." },
        { status: 400 }
      );
    }

    // Buat pesanan baru di SQLite via Prisma
    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName || "Pelanggan",
        customerPhone: customerPhone || "",
        address: address || "",
        addressBenchmark: addressBenchmark || "",
        area: area || "",
        service: service || "",
        orderNotes: orderNotes || "",
        voucher: voucher || null,
        discount: Number(discount) || 0,
        shippingFee: Number(shippingFee) || 0,
        serviceFee: Number(serviceFee) || 2000,
        paymentMethod: paymentMethod || "gopay",
        totalPrice: Number(totalPrice) || 0,
        status: "PENDING",
        items: {
          create: items.map(
            (item: {
              menuId?: number;
              name: string;
              price: number;
              qty: number;
            }) => ({
              menuId: item.menuId ? Number(item.menuId) : null,
              name: item.name,
              price: Number(item.price),
              qty: Number(item.qty),
            })
          ),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat pesanan:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pesanan di database." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil daftar pesanan." },
      { status: 500 }
    );
  }
}