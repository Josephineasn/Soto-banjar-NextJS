import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const APPROVAL_FILE = path.join(process.cwd(), "review-approvals.json");

function getApprovals(): Record<string, { showOnWebsite?: boolean; adminReply?: string }> {
  try {
    if (fs.existsSync(APPROVAL_FILE)) {
      return JSON.parse(fs.readFileSync(APPROVAL_FILE, "utf-8")) as Record<
        string,
        { showOnWebsite?: boolean; adminReply?: string }
      >;
    }
  } catch {
    // Abaikan jika gagal baca
  }
  return {};
}

function saveApproval(id: string | number, data: { showOnWebsite?: boolean; adminReply?: string }) {
  try {
    const current = getApprovals();
    current[String(id)] = { ...current[String(id)], ...data };
    fs.writeFileSync(APPROVAL_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan status approval:", err);
  }
}

const INITIAL_REVIEWS = [
  {
    id: 101,
    name: "sherlyly",
    city: "Jakarta Selatan",
    rating: 5,
    comment: "makanan nya enak bangett",
    adminReply: "terimakasih",
    showOnWebsite: true,
    createdAt: "Hari ini",
  },
  {
    id: 102,
    name: "josephine",
    city: "Jakarta Selatan",
    rating: 5,
    comment: "makanan nya enak sekali dan sangat mengenyangkan",
    adminReply: "Terimakasih",
    showOnWebsite: true,
    createdAt: "Hari ini",
  },
  {
    id: 103,
    name: "Marcello Sihol",
    city: "Jakarta Utara",
    rating: 5,
    comment: "Makanan nya enak sekali dan minuman nya juga segar harganya sangat worth it",
    adminReply: "",
    showOnWebsite: true,
    createdAt: "Hari ini",
  },
  {
    id: 104,
    name: "Marcello Sihol",
    city: "Jakarta barat",
    rating: 5,
    comment: "Soto nya enak sekali dan dagingnya empuk beserta hidangan penutupnya itu sangat worth it dengan harga segitu",
    adminReply: "",
    showOnWebsite: true,
    createdAt: "Hari ini",
  },
  {
    id: 105,
    name: "Josephine Sherly",
    city: "Jakarta Selatan",
    rating: 5,
    comment: "Kuah kaldunya beneran wangi kayu manis dan kapulaga asli Banjar. Pas sampai di rumah masih panas banget dan kuahnya dipisah rapi, ga tumpah sama sekali!",
    adminReply: "Terima kasih banyak Kak! Kami selalu memisahkan kuah panas dalam wadah kedap agar rasa rempahnya tetap maksimal.",
    showOnWebsite: true,
    createdAt: "2 hari lalu",
  },
  {
    id: 106,
    name: "Calvin Marcello",
    city: "Tangerang Kota",
    rating: 5,
    comment: "Porsi ayamnya melimpah, telur bebek rebusnya gurih berpadu pas dengan perkedel kentang. Pengiriman ke Tangerang cepet banget cuma 35 menitan.",
    adminReply: "",
    showOnWebsite: true,
    createdAt: "Seminggu lalu",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";

    const dbReviews = await prisma.review.findMany({
      orderBy: { id: "desc" },
    });

    const approvals = getApprovals();

    const formattedDbReviews = dbReviews.map((r) => {
      const rec = r as unknown as Record<string, unknown>;
      const strId = String(rec.id);
      const savedMeta = approvals[strId];

      // Default untuk review dari DB: jika ada di file approvals pakai itu, jika tidak cek properti DB
      const isShown =
        savedMeta?.showOnWebsite !== undefined
          ? savedMeta.showOnWebsite
          : rec.showOnWebsite !== undefined
          ? Boolean(rec.showOnWebsite)
          : true;

      const replyText =
        savedMeta?.adminReply !== undefined
          ? savedMeta.adminReply
          : String(rec.adminReply || rec.reply || "");

      return {
        ...rec,
        id: rec.id,
        name: String(rec.name || rec.customerName || "Pelanggan"),
        customerName: String(rec.customerName || rec.name || "Pelanggan"),
        city: String(rec.city || "Jakarta Selatan"),
        rating: Number(rec.rating || 5),
        comment: String(rec.comment || ""),
        reply: replyText,
        adminReply: replyText,
        showOnWebsite: isShown,
        createdAt: String(rec.createdAt || "Baru saja"),
      };
    });

    const dbComments = new Set(
      formattedDbReviews.map((r) => r.comment.toLowerCase().trim())
    );

    const missingInitial = INITIAL_REVIEWS.filter(
      (init) => !dbComments.has(init.comment.toLowerCase().trim())
    ).map((init) => {
      const savedMeta = approvals[String(init.id)];
      return {
        ...init,
        customerName: init.name,
        reply: savedMeta?.adminReply !== undefined ? savedMeta.adminReply : init.adminReply,
        adminReply: savedMeta?.adminReply !== undefined ? savedMeta.adminReply : init.adminReply,
        showOnWebsite:
          savedMeta?.showOnWebsite !== undefined ? savedMeta.showOnWebsite : init.showOnWebsite,
      };
    });

    const allReviews = [...formattedDbReviews, ...missingInitial];

    // Jika diakses oleh halaman customer (?public=true), saring HANYA yang showOnWebsite === true
    const finalReviews = publicOnly
      ? allReviews.filter((rev) => rev.showOnWebsite === true)
      : allReviews;

    return NextResponse.json(finalReviews, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/reviews error:", errMessage);
    return NextResponse.json(INITIAL_REVIEWS, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      rating?: number;
      comment?: string;
      customerName?: string;
      name?: string;
      city?: string;
    };

    const authorName = String(body.customerName || body.name || "Pelanggan");
    const authorCity = String(body.city || "Jakarta");

    const newReview = await prisma.review.create({
      data: {
        rating: Number(body.rating || 5),
        comment: String(body.comment || ""),
        name: authorName,
        city: authorCity,
      } as unknown as Parameters<typeof prisma.review.create>[0]["data"],
    });

    const createdRecord = newReview as unknown as Record<string, unknown>;
    // Otomatis set FALSE (menunggu di-acc admin dulu baru muncul di web customer)
    saveApproval(String(createdRecord.id), { showOnWebsite: false });

    return NextResponse.json(
      { ...createdRecord, showOnWebsite: false },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/reviews error:", errMessage);
    return NextResponse.json({ error: `Gagal mengirim ulasan: ${errMessage}` }, { status: 500 });
  }
}