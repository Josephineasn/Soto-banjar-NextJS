import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";

    const dbReviews = await prisma.review.findMany({
      where: publicOnly ? { showOnWebsite: true } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const formatted = dbReviews.map((r) => ({
      ...r,
      customerName: r.name,
      adminReply: r.reply || "",
      reply: r.reply || "",
      createdAt: r.createdAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/reviews error:", errMessage);
    return NextResponse.json([], { status: 500 });
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
      menuId?: number;
    };

    const authorName = String(body.customerName || body.name || "Pelanggan");
    const authorCity = String(body.city || "Jakarta");

    const newReview = await prisma.review.create({
      data: {
        rating: Number(body.rating || 5),
        comment: String(body.comment || ""),
        name: authorName,
        city: authorCity,
        showOnWebsite: false,
        menuId: body.menuId ? Number(body.menuId) : undefined,
      },
    });

    return NextResponse.json(
      {
        ...newReview,
        customerName: newReview.name,
        adminReply: newReview.reply || "",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/reviews error:", errMessage);
    return NextResponse.json(
      { error: `Gagal mengirim ulasan: ${errMessage}` },
      { status: 500 }
    );
  }
}