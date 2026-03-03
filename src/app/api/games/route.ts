import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: ดึงรายชื่อเกม (อันเดิมของคุณ)
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        title: true,
        // order: true, // ถ้า error อีก ให้ลบ order บรรทัดนี้ออก (แต่ปกติน่าจะมี)
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching games" }, { status: 500 });
  }
}

// 2. POST: สร้างเกมใหม่ (ฉบับแก้ไข ลบ bgImage ออก)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title } = body;

    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // สร้าง Slug อัตโนมัติ
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // หา order ลำดับสุดท้าย
    const lastGame = await prisma.game.findFirst({
        orderBy: { order: 'desc' }
    });
    const newOrder = (lastGame?.order || 0) + 1;

    const newGame = await prisma.game.create({
      data: {
        title,
        slug,
        imageUrl: "", 
        // ❌ bgImage: "", <--- ผมลบบรรทัดนี้ออกให้แล้วครับ
        order: newOrder
      }
    });

    return NextResponse.json(newGame);

  } catch (error) {
    console.error("Create Game Error:", error);
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }
}