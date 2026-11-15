import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const APPROVAL_FILE = path.join(process.cwd(), "review-approvals.json");

function saveApproval(id: string | number, data: { showOnWebsite?: boolean; adminReply?: string }) {
  try {
    let current: Record<string, { showOnWebsite?: boolean; adminReply?: string }> = {};
    if (fs.existsSync(APPROVAL_FILE)) {
      current = JSON.parse(fs.readFileSync(APPROVAL_FILE, "utf-8")) as Record<
        string,
        { showOnWebsite?: boolean; adminReply?: string }
      >;
    }
    current[String(id)] = { ...current[String(id)], ...data };
    fs.writeFileSync(APPROVAL_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan status approval:", err);
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const rawId = resolvedParams.id;

    const body = (await request.json()) as {
      adminReply?: string;
      reply?: string;
      showOnWebsite?: boolean;
    };

    const replyVal = body.adminReply ?? body.reply;

    saveApproval(rawId, {
      ...(body.showOnWebsite !== undefined ? { showOnWebsite: body.showOnWebsite } : {}),
      ...(replyVal !== undefined ? { adminReply: replyVal } : {}),
    });

    try {
      const parsedId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const whereClause = { id: parsedId } as unknown as Parameters<
        typeof prisma.review.update
      >[0]["where"];

      if (replyVal !== undefined) {
        await prisma.review.update({
          where: whereClause,
          data: { reply: replyVal } as unknown as Parameters<
            typeof prisma.review.update
          >[0]["data"],
        });
      }
    } catch {
    }

    return NextResponse.json({ success: true, id: rawId, ...body }, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Gagal memperbarui ulasan: ${errMessage}` }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const rawId = resolvedParams.id;

    // Sembunyikan jika dihapus
    saveApproval(rawId, { showOnWebsite: false });

    try {
      const parsedId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const whereClause = { id: parsedId } as unknown as Parameters<
        typeof prisma.review.delete
      >[0]["where"];
      await prisma.review.delete({ where: whereClause });
    } catch {
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Gagal menghapus ulasan: ${errMessage}` }, { status: 500 });
  }
}