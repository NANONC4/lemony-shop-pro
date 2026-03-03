import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, price, gameId } = await req.json();

    console.log("Checking:", { code, price, gameId }); // ดู Log ใน Terminal

    // 1. ค้นหาคูปอง
    const coupon = await prisma.coupon.findUnique({
      where: { code: code?.toUpperCase() }, // ใส่ ? กัน error
    });

    // 2. เช็คพื้นฐาน
    if (!coupon) return NextResponse.json({ valid: false, message: "ไม่พบโค้ดส่วนลด" });
    if (!coupon.isActive) return NextResponse.json({ valid: false, message: "โค้ดถูกปิดใช้งานแล้ว" });
    if (coupon.used >= coupon.limit) return NextResponse.json({ valid: false, message: "สิทธิ์โค้ดส่วนลดเต็มแล้ว" });

    // ✅ 3. เช็คยอดขั้นต่ำ (แปลงเป็น Number เพื่อความชัวร์)
    if (coupon.minPrice > 0 && Number(price) < Number(coupon.minPrice)) {
        return NextResponse.json({ 
            valid: false, 
            message: `ต้องซื้อขั้นต่ำ ${coupon.minPrice} บาท` 
        }); // ⚠️ สังเกตผมใช้ key ว่า "message" ให้ตรงกับหน้าเว็บ
    }

    // ✅ 4. เช็คเกม (แปลงเป็น Number เพื่อความชัวร์)
    if (coupon.gameId && Number(coupon.gameId) !== Number(gameId)) {
        return NextResponse.json({ 
            valid: false, 
            message: "โค้ดนี้ใช้กับเกมนี้ไม่ได้" 
        });
    }

    // ผ่านทุกด่าน!
    return NextResponse.json({ 
      valid: true, 
      discount: coupon.discount,
      message: "ใช้โค้ดสำเร็จ!" // ส่ง message กลับไปบอกหน้าเว็บด้วย
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}