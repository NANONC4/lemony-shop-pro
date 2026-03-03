import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ เพิ่มบรรทัดนี้: เพื่อบังคับให้ API ดึงข้อมูลใหม่ทุกครั้ง (แก้ปัญหาหน้า Admin ไม่โชว์ของใหม่)
export const dynamic = "force-dynamic";

// GET: ดึงรายการคูปองทั้งหมด
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // เช็คสิทธิ์ Admin
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' } // เรียงจากใหม่ไปเก่า
    });

    return NextResponse.json(coupons);

  } catch (error) {
    return NextResponse.json({ error: "Error fetching coupons" }, { status: 500 });
  }
}

// POST: สร้างคูปองใหม่
// ... imports เดิม

// ส่วน POST
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    // ✅ รับค่า minPrice และ gameId เพิ่ม
    const { code, discount, limit, minPrice, gameId } = body;

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: Number(discount),
        limit: Number(limit),
        // ✅ บันทึกลง DB (แปลงเป็น Number ก่อน)
        minPrice: Number(minPrice) || 0,
        gameId: gameId ? Number(gameId) : null, // ถ้าไม่เลือกเกม ให้เป็น null
      }
    });

    return NextResponse.json(newCoupon);
  } catch (error) {
    return NextResponse.json({ error: "สร้างคูปองไม่สำเร็จ" }, { status: 500 });
  }
}

// DELETE: ลบคูปอง
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.coupon.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}