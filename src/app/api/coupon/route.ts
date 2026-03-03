import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// ✅ เพิ่ม 2 บรรทัดนี้ครับ
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ตัวอย่าง: ดึงคูปองทั้งหมดที่เปิดใช้งานอยู่
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      select: { code: true, discount: true, minPrice: true, gameId: true } // เลือกส่งเฉพาะข้อมูลที่จำเป็น
    });

    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}