import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import {
  DELIVERY_AREAS,
  COURIER_SERVICES,
} from "@/data/menu";

// Menyimpan pesanan pelanggan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (
      !body.recipientName?.trim() ||
      !/^\+?[0-9 -]{8,18}$/.test(body.recipientPhone || "") ||
      !body.fullAddress?.trim() ||
      !Array.isArray(body.items) ||
      !body.items.length
    ) {
      return NextResponse.json(
        { error: "Lengkapi data pemesan" },
        { status: 400 }
      );
    }

    const area = DELIVERY_AREAS.find(
      (a) => a.id === body.areaId
    );

    const courier = COURIER_SERVICES.find(
      (c) => c.id === body.courierId
    );

    if (!area || !courier) {
      return NextResponse.json(
        { error: "Pengiriman tidak valid" },
        { status: 400 }
      );
    }

    const quantities = new Map<number, number>();

    for (const item of body.items) {
      if (
        !Number.isInteger(item.id) ||
        !Number.isInteger(item.qty) ||
        item.qty < 1 ||
        item.qty > 50
      ) {
        return NextResponse.json(
          { error: "Item invalid" },
          { status: 400 }
        );
      }

      quantities.set(
        item.id,
        (quantities.get(item.id) || 0) + item.qty
      );
    }

    const menus = await prisma.menu.findMany({
      where: {
        id: { in: [...quantities.keys()] },
        available: true,
      },
    });

    if (menus.length !== quantities.size) {
      return NextResponse.json(
        { error: "Menu tidak tersedia" },
        { status: 400 }
      );
    }

    // Harga dihitung ulang berdasarkan database
    const subtotal = menus.reduce(
      (sum, menu) =>
        sum + menu.price * quantities.get(menu.id)!,
      0
    );

    const shippingFee = area.fee + courier.extra;
    const serviceFee = 2000;

    const order = await prisma.order.create({
      data: {
        recipientName: body.recipientName.trim(),
        recipientPhone: body.recipientPhone,
        fullAddress: body.fullAddress.trim(),
        addressBenchmark: String(
          body.addressBenchmark || ""
        ),
        areaName: area.name,
        courierName: courier.name,
        deliveryTime: String(
          body.deliveryTime || "Secepatnya"
        ),
        paymentMethod: String(
          body.paymentMethod || "COD"
        ),
        notes: String(body.notes || ""),
        subtotal,
        shippingFee,
        serviceFee,
        discount: 0,
        total: subtotal + shippingFee + serviceFee,

        items: {
          create: menus.map((menu) => ({
            menuId: menu.id,
            name: menu.name,
            price: menu.price,
            qty: quantities.get(menu.id)!,
          })),
        },
      },

      include: {
        items: true,
      },
    });

    return NextResponse.json(order, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan pesanan" },
      { status: 500 }
    );
  }
}

// Mengambil seluruh pesanan (Admin)
export async function GET(req: NextRequest) {
  if (
    !process.env.ADMIN_KEY ||
    req.headers.get("x-admin-key") !== process.env.ADMIN_KEY
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(orders);
}