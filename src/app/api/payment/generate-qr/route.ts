import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// เรียกใช้ Omise
const omise = require("omise")({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. เช็ค Login
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. รับ Token
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "ไม่พบ Token" }, { status: 400 });
    }

    // 3. ค้นหาออเดอร์จาก Token
    const order = await prisma.order.findUnique({
      where: { token: token }, // ⚠️ ใน Schema ต้องมี field `token` และเป็น @unique นะครับ
      // include: { product: true } // ❌ ไม่ต้อง include product แล้ว เพราะเราจะเอาราคาจาก order โดยตรง
    });

    if (!order) {
      return NextResponse.json({ error: "ไม่พบรายการสั่งซื้อ" }, { status: 404 });
    }

    if (order.status === "COMPLETED" || order.status === "PAID") { // เช็คทั้ง 2 สถานะเผื่อไว้
        return NextResponse.json({ error: "รายการนี้ชำระเงินไปแล้ว" }, { status: 400 });
    }

    // ✅ 4. เอาราคาจาก Order (ราคาที่หักส่วนลดแล้ว)
    const amount = Number(order.price); 
    const amountSatang = Math.round(amount * 100); // Omise ต้องการหน่วยสตางค์

    // 5. สร้าง Charge กับ Omise
    const charge: any = await new Promise((resolve, reject) => {
      omise.charges.create({
        amount: amountSatang,
        currency: "thb",
        source: { type: "promptpay" },
        metadata: {
            orderId: order.id.toString(), // สำคัญ! เอาไว้เช็ค Webhook ภายหลัง
            token: token 
        }
      }, (err: any, resp: any) => {
        if (err) reject(err);
        else resolve(resp);
      });
    });

    // ดึงรูป QR
    const qrImage = charge.source.scannable_code.image.download_uri;

    return NextResponse.json({ 
        success: true,
        qrImage: qrImage,
        amount: amount, 
        chargeId: charge.id 
    });

  } catch (error: any) {
    console.error("Omise Error:", error);
    return NextResponse.json({ error: error.message || "สร้าง QR Code ไม่สำเร็จ" }, { status: 500 });
  }
}