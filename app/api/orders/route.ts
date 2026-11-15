import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IncomingOrderItem {
  id?: number | string;
  menuId?: number | string;
  name?: string;
  title?: string;
  menuName?: string;
  qty?: number;
  quantity?: number;
  price?: number;
}

interface IncomingOrderBody {
  id?: string | number;
  orderNumber?: string;
  orderCode?: string;
  accountName?: string;
  username?: string;
  customerName?: string;
  recipientName?: string;
  name?: string;
  customerEmail?: string;
  userEmail?: string;
  email?: string;
  customerPhone?: string;
  phone?: string;
  phoneNumber?: string;
  telp?: string;
  address?: string;
  fullAddress?: string;
  addressBenchmark?: string;
  benchmark?: string;
  landmark?: string;
  patokan?: string;
  area?: string;
  deliveryArea?: string;
  service?: string;
  shippingService?: string;
  courier?: string;
  shippingFee?: number;
  shippingCost?: number;
  deliveryFee?: number;
  serviceFee?: number;
  thermalBagCost?: number;
  useThermalBag?: boolean;
  thermalBag?: boolean | string;
  discount?: number;
  discountAmount?: number;
  totalPrice?: number;
  totalAmount?: number;
  grandTotal?: number;
  total?: number;
  paymentMethod?: string;
  virtualAccount?: string;
  vaNumber?: string;
  orderNotes?: string;
  note?: string;
  notes?: string;
  catatan?: string;
  voucherCode?: string | null;
  items?: IncomingOrderItem[];
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

    const enriched = orders.map((ord) => {
      const rawNote = ord.orderNotes || "";
      const vaMatch = rawNote.match(/\[VA:\s*([^\]]+)\]/i);
      const hpMatch = rawNote.match(/\[HP:\s*([^\]]+)\]/i);
      const emailMatch = rawNote.match(/\[EMAIL:\s*([^\]]+)\]/i);
      const userMatch = rawNote.match(/\[USER:\s*([^\]]+)\]/i);

      const cleanNote = rawNote
        .replace(/\[VA:[^\]]*\]/gi, "")
        .replace(/\[HP:[^\]]*\]/gi, "")
        .replace(/\[EMAIL:[^\]]*\]/gi, "")
        .replace(/\[USER:[^\]]*\]/gi, "")
        .trim();

      const extractedVa = vaMatch?.[1]?.trim() || "807778778659726";
      const recordWithPhone = ord as unknown as { customerPhone?: string | null };
      const extractedPhone =
        recordWithPhone.customerPhone || hpMatch?.[1]?.trim() || "-";

      const cleanId = String(ord.id).replace(/^#/, "");
      const formattedId = cleanId.startsWith("SBN-")
        ? `#${cleanId}`
        : `#SBN-${cleanId.slice(-6).toUpperCase()}`;

      return {
        ...ord,
        orderNumber: formattedId,
        orderCode: formattedId,
        accountName: userMatch?.[1]?.trim() || "",
        customerPhone: extractedPhone,
        phone: extractedPhone,
        customerEmail: emailMatch?.[1]?.trim() || "",
        deliveryArea: ord.area,
        shippingService: ord.service,
        shippingCost: ord.shippingFee,
        totalAmount: ord.totalPrice,
        useThermalBag: ord.serviceFee > 0,
        thermalBag: ord.serviceFee > 0,
        thermalBagCost: ord.serviceFee,
        landmark: ord.addressBenchmark || "",
        patokan: ord.addressBenchmark || "",
        benchmark: ord.addressBenchmark || "",
        note: cleanNote,
        notes: cleanNote,
        vaNumber: extractedVa,
        virtualAccount: extractedVa,
        items: ord.items.map((it) => ({
          ...it,
          quantity: it.qty,
        })),
      };
    });

    return NextResponse.json(enriched, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/orders error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal memuat data pesanan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IncomingOrderBody;

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: "Keranjang pesanan kosong" },
        { status: 400 }
      );
    }

    const requestedId = String(
      body.orderNumber || body.orderCode || body.id || ""
    )
      .replace(/^#/, "")
      .trim();

    let finalOrderId = requestedId.startsWith("SBN-")
      ? requestedId
      : `SBN-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const existingOrder = await prisma.order.findUnique({
        where: { id: finalOrderId },
      });
      if (existingOrder) {
        finalOrderId = `SBN-${Math.floor(100000 + Math.random() * 900000)}`;
      }
    } catch {
      // Abaikan
    }

    const customerName = String(
      body.customerName ||
        body.recipientName ||
        body.name ||
        body.accountName ||
        "Pelanggan"
    ).trim();

    const accountName = String(
      body.accountName || body.username || customerName
    ).trim();

    const customerPhone = String(
      body.customerPhone ||
        body.phone ||
        body.phoneNumber ||
        body.telp ||
        ""
    ).trim();

    const customerEmail = String(
      body.customerEmail || body.userEmail || body.email || ""
    )
      .trim()
      .toLowerCase();

    const vaNumber = String(
      body.vaNumber || body.virtualAccount || "807778778659726"
    ).trim();

    const rawUserNote = String(
      body.note || body.notes || body.orderNotes || body.catatan || ""
    )
      .replace(/\[VA:[^\]]*\]/gi, "")
      .replace(/\[HP:[^\]]*\]/gi, "")
      .replace(/\[EMAIL:[^\]]*\]/gi, "")
      .replace(/\[USER:[^\]]*\]/gi, "")
      .trim();

    const metaTags: string[] = [`[VA: ${vaNumber}]`];
    if (customerPhone) metaTags.push(`[HP: ${customerPhone}]`);
    if (customerEmail) metaTags.push(`[EMAIL: ${customerEmail}]`);
    if (accountName) metaTags.push(`[USER: ${accountName}]`);

    const combinedOrderNotes = `${rawUserNote} ${metaTags.join(" ")}`.trim();

    const rawBenchmark = String(
      body.landmark ||
        body.patokan ||
        body.benchmark ||
        body.addressBenchmark ||
        ""
    ).trim();

    const shippingFee = Math.round(
      Number(body.shippingCost ?? body.shippingFee ?? body.deliveryFee ?? 0)
    );

    const wantsThermal =
      body.useThermalBag === true ||
      body.thermalBag === true ||
      body.thermalBag === "Ya" ||
      Number(body.thermalBagCost ?? body.serviceFee ?? 0) > 0;

    const serviceFee = wantsThermal
      ? Math.round(Number(body.thermalBagCost ?? body.serviceFee ?? 5000))
      : 0;

    const discount = Math.round(
      Number(body.discount ?? body.discountAmount ?? 0)
    );

    const itemsSubtotal = rawItems.reduce((sum, item) => {
      const q = Math.max(1, Math.round(Number(item.qty ?? item.quantity ?? 1)));
      const p = Math.round(Number(item.price ?? 0));
      return sum + q * p;
    }, 0);

    const totalPrice = Math.round(
      Number(
        body.totalAmount ??
          body.totalPrice ??
          body.grandTotal ??
          body.total ??
          itemsSubtotal + shippingFee + serviceFee - discount
      )
    );

    const mappedItems = rawItems.map((it) => {
      const quantityVal = Math.max(
        1,
        Math.round(Number(it.qty ?? it.quantity ?? 1))
      );
      return {
        name: String(
          it.name || it.title || it.menuName || "Menu Soto Banjar"
        ),
        qty: quantityVal,
        price: Math.round(Number(it.price ?? 0)),
      };
    });

    const created = await prisma.order.create({
      data: {
        id: finalOrderId,
        customerName,
        address: String(body.address || body.fullAddress || "-").trim(),
        addressBenchmark: rawBenchmark || null,
        area: String(body.area || body.deliveryArea || "Jakarta").trim(),
        service: String(
          body.shippingService ||
            body.service ||
            body.courier ||
            "Kurir Instant"
        ).trim(),
        shippingFee,
        serviceFee,
        discount,
        totalPrice,
        paymentMethod: String(
          body.paymentMethod || "BCA Virtual Account"
        ).trim(),
        orderNotes: combinedOrderNotes, // (Catatan voucher sudah otomatis digabung ke orderNotes)
        status: "PENDING",
        items: {
          create: mappedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        ...created,
        orderNumber: created.id,
        orderCode: `#${created.id}`,
        accountName,
        vaNumber,
        virtualAccount: vaNumber,
        customerPhone: customerPhone || "-",
        customerEmail,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/orders error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan pesanan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}