import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, price, gameId } = await req.json(); // ✅ รับ gameId มาด้วย

    // 1. ค้นหาคูปอง
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    // 2. เช็คพื้นฐาน (มีไหม? เปิดอยู่ไหม? หมดหรือยัง?)
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "ไม่พบโค้ดส่วนลด หรือโค้ดถูกปิดใช้งาน" }, { status: 400 });
    }
    if (coupon.used >= coupon.limit) {
      return NextResponse.json({ valid: false, error: "สิทธิ์โค้ดส่วนลดเต็มแล้ว" }, { status: 400 });
    }

    // ✅ 3. เช็คยอดขั้นต่ำ (New Logic)
    if (price < coupon.minPrice) {
        return NextResponse.json({ 
            valid: false, 
            error: `โค้ดนี้ใช้ได้เมื่อซื้อขั้นต่ำ ${coupon.minPrice} บาท` 
        }, { status: 400 });
    }

    // ✅ 4. เช็คว่าใช้ถูกเกมไหม (New Logic)
    // ถ้า coupon.gameId มีค่า (ไม่เป็น null) และ ไม่ตรงกับเกมที่ลูกค้าเลือก
    if (coupon.gameId && coupon.gameId !== gameId) {
        return NextResponse.json({ 
            valid: false, 
            error: "โค้ดนี้ไม่สามารถใช้กับเกมนี้ได้" 
        }, { status: 400 });
    }

    // ผ่านทุกด่าน!
    return NextResponse.json({ 
      valid: true, 
      discount: coupon.discount,
      code: coupon.code 
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}