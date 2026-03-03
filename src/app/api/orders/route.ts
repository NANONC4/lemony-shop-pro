import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto"; // ✅ 1. เพิ่ม import นี้ไว้สร้าง Token

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. เช็คว่า Login หรือยัง
    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    // --- 🛡️ ระบบป้องกัน: จำกัดออเดอร์ค้างชำระ (เดิม) ---
    const pendingOrdersCount = await prisma.order.count({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (pendingOrdersCount >= 3) {
      return NextResponse.json(
        { error: "คุณมีรายการค้างชำระเกินกำหนด กรุณาเคลียร์ของเก่าก่อน" },
        { status: 400 }
      );
    }
    // ------------------------------------------

    const body = await req.json();
    // ✅ 2. รับ couponCode มาด้วย
    const { productId, uid, username, password, note, couponCode } = body;

    if (!productId) {
      return NextResponse.json({ error: "ไม่พบสินค้าที่เลือก" }, { status: 400 });
    }

    // ดึงข้อมูลสินค้า "ณ ปัจจุบัน"
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return NextResponse.json({ error: "สินค้าไม่ถูกต้อง หรือถูกลบไปแล้ว" }, { status: 404 });
    }

    // ✅ 3. คำนวณราคาสุทธิ (Logic คูปอง)
    let finalPrice = Number(product.price); // เริ่มต้นที่ราคาเต็ม
    let usedCouponId = null;
    let appliedCouponCode = null;

    if (couponCode) {
        // ค้นหาคูปอง
        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
        
        // เช็คเงื่อนไข (เปิดใช้งาน? / สิทธิ์เต็ม? / ขั้นต่ำ? / ถูกเกม?)
        if (coupon && coupon.isActive && coupon.used < coupon.limit) {
            const isValidMinPrice = coupon.minPrice === 0 || finalPrice >= coupon.minPrice;
            const isValidGame = !coupon.gameId || Number(coupon.gameId) === Number(product.gameId);

            if (isValidMinPrice && isValidGame) {
                // ลดราคา
                let discount = Number(coupon.discount);
                finalPrice = finalPrice - discount;
                if (finalPrice < 0) finalPrice = 0; // กันราคาติดลบ

                usedCouponId = coupon.id;
                appliedCouponCode = coupon.code;
            } else {
                 return NextResponse.json({ error: "เงื่อนไขคูปองไม่ถูกต้อง (ยอดไม่ถึง หรือ ผิดเกม)" }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: "โค้ดส่วนลดไม่ถูกต้องหรือสิทธิ์เต็มแล้ว" }, { status: 400 });
        }
    }

    // ✅ 4. สร้าง Token (สำคัญมาก สำหรับ QR Code)
    const orderToken = crypto.randomBytes(32).toString('hex');

    // ✅ 5. ใช้ Transaction (สร้างออเดอร์ + ตัดคูปอง พร้อมกัน)
    const newOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                userId: session.user.id,
                productId: Number(productId),
                status: "PENDING",
                
                // --- 💰 Snapshot ราคา ---
                price: finalPrice,        // บันทึกราคาหลังหักส่วนลด
                cost: product.cost || 0,  // บันทึกต้นทุน
                token: orderToken,        // ✅ บันทึก Token ลง DB
                couponCode: appliedCouponCode, // บันทึกโค้ดที่ใช้
                // -----------------------

                uid: uid || null,
                username: username || null,
                password: password || null,
                note: note || "",
            },
        });

        // อัปเดตจำนวนการใช้คูปอง (ถ้ามีการใช้)
        if (usedCouponId) {
            await tx.coupon.update({
                where: { id: usedCouponId },
                data: { used: { increment: 1 } }
            });
        }

        return order;
    });

    console.log(`✅ Order Created: #${newOrder.id} Price: ${finalPrice} Token: ${orderToken}`);

    return NextResponse.json({ 
        success: true, 
        orderId: newOrder.id,
        token: newOrder.token, // ✅ ส่ง Token กลับไปให้หน้าเว็บ redirect
        order: newOrder 
    });

  } catch (error) {
    console.error("❌ สร้างออเดอร์ไม่สำเร็จ:", error);
    return NextResponse.json({ error: "ระบบขัดข้อง กรุณาลองใหม่ภายหลัง" }, { status: 500 });
  }
}