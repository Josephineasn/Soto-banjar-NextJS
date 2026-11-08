import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Gagal mengambil ulasan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ulasan." },
      { status: 500 }
    );
  }
}

// POST: Menyimpan ulasan dari customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, city, rating, comment, menuId } = body;

    if (!name || !comment) {
      return NextResponse.json(
        { error: "Nama dan komentar ulasan wajib diisi." },
        { status: 400 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        name: String(name).trim(),
        city: city ? String(city).trim() : "Jakarta",
        rating: Number(rating) || 5,
        comment: String(comment).trim(),
        ...(menuId ? { menuId: Number(menuId) } : {}),
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan ulasan baru:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan ulasan ke database." },
      { status: 500 }
    );
  }
}

// PATCH: Membalas atau mengedit balasan ulasan dari admin
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, reply } = body;

    if (!id) {
      return NextResponse.json({ error: "ID ulasan wajib disertakan." }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: String(id) },
      data: {
        reply: reply ? String(reply).trim() : null,
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Gagal memperbarui ulasan:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui ulasan." },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus ulasan dari panel admin
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID ulasan tidak ditemukan." }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ message: "Ulasan berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus ulasan:", error);
    return NextResponse.json(
      { error: "Gagal menghapus ulasan dari database." },
      { status: 500 }
    );
  }
}