import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 1. ดึงข้อมูลออเดอร์ทั้งหมด (สำหรับหน้า Dashboard)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // เช็คสิทธิ์ Admin
    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: {
          include: { game: true }
        },
      },
    });

    return NextResponse.json({ orders });

  } catch (error) {
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
  }
}

// ✅ 2. สร้างออเดอร์ใหม่ + ตัดโค้ดส่วนลด (POST)
// ✅ 2. สร้างออเดอร์ใหม่ + ตัดโค้ดส่วนลด (POST)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity, note, couponCode, uid, username, password } = body;
    const userId = (session.user as any).id;

    // 2.1 ดึงข้อมูลสินค้า
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });

    // 2.2 คำนวณราคาตั้งต้น (✅ แก้ตรงนี้: ใส่ Number() ครอบ)
    let finalPrice = Number(product.price) * (Number(quantity) || 1);
    let usedCouponId = null;
    let appliedCouponCode = null;

    // 2.3 ถ้ามีการส่งโค้ดส่วนลดมา ให้ตรวจสอบและคำนวณ
    if (couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
        
        if (coupon && coupon.isActive && coupon.used < coupon.limit) {
            // (✅ แก้ตรงนี้: ใส่ Number() ครอบ)
            let discount = Number(coupon.discount); 
            
            finalPrice = finalPrice - discount;
            if (finalPrice < 0) finalPrice = 0;
            usedCouponId = coupon.id;
            appliedCouponCode = coupon.code;
        } else {
            return NextResponse.json({ error: "โค้ดส่วนลดไม่ถูกต้องหรือสิทธิ์เต็มแล้ว" }, { status: 400 });
        }
    }

    // 2.4 ใช้ Transaction เพื่อบันทึกข้อมูล
    const result = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                userId: userId,
                productId: productId,
                price: finalPrice, 
                status: "PENDING",
                data: JSON.stringify({ 
                    uid, 
                    username, 
                    password, 
                    note, 
                    couponCode: appliedCouponCode 
                }),
            }
        });

        if (usedCouponId) {
            await tx.coupon.update({
                where: { id: usedCouponId },
                data: { used: { increment: 1 } }
            });

            await tx.couponUsage.create({
                data: {
                    userId: userId,
                    couponId: usedCouponId
                }
            });
        }

        return newOrder;
    });

    return NextResponse.json({ success: true, order: result });

  } catch (error) {
    console.error("Order Error:", error);
    return NextResponse.json({ error: "สั่งซื้อไม่สำเร็จ" }, { status: 500 });
  }
}

// 3. แก้ไขสถานะออเดอร์ (PATCH)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, status } = body;

    let updateData: any = { status: status };

    // Auto Delete Image ถ้างานจบ
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      updateData.imageUrl = null; 
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    }); 

    return NextResponse.json({ success: true, order: updatedOrder });

  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}