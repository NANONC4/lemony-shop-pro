import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 1. GET: ดึงรายการโปรโมชั่นทั้งหมด
export async function GET(req: Request) {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }, // เอาอันใหม่สุดขึ้นก่อน
    });

    return NextResponse.json(promotions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

// 2. POST: สร้างโปรโมชั่นใหม่ (อันที่ Error อยู่ตอนนี้)
export async function POST(req: Request) {
  try {
    // เช็คสิทธิ์ Admin
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, imageUrl, isActive } = body;

    // ตรวจสอบค่าว่าง
    if (!imageUrl) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // บันทึกลง Database
    const newPromotion = await prisma.promotion.create({
      data: {
        title: title || "",
        description: description || "",
        imageUrl,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newPromotion);

  } catch (error) {
    console.error("Create Promotion Error:", error);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}

// 3. DELETE: ลบโปรโมชั่น
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.promotion.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 });
  }
}