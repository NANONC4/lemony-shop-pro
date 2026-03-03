import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. เช็คว่าล็อกอินหรือยัง?
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. ดึงค่า page และ limit จาก URL (สำหรับการแบ่งหน้า)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 3. ดึงข้อมูลออเดอร์จาก Database
    // (ค้นหาเฉพาะของ User คนนี้ + เรียงจากใหม่ไปเก่า)
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            game: true, // ดึงข้อมูลเกมมาด้วย (จะได้เอารูปปกเกมมาโชว์)
          },
        },
      },
      orderBy: {
        createdAt: "desc", // ใหม่สุดขึ้นก่อน
      },
      skip: skip,
      take: limit,
    });

    // 4. นับจำนวนออเดอร์ทั้งหมด (เพื่อให้หน้าบ้านรู้ว่ามีกี่หน้า)
    const totalOrders = await prisma.order.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}