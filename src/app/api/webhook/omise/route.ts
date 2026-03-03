import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // 1. อ่านข้อมูลแบบ Text (Raw Body) เพื่อตรวจสอบลายเซ็น
    const text = await request.text();
    const signature = request.headers.get("x-omise-signature");

    if (!signature) {
      console.error("🚨 Webhook Error: No Signature found");
      return NextResponse.json({ error: "No Signature" }, { status: 401 });
    }

    // 2. 🔐 คำนวณลายเซ็น (HMAC SHA-256) เพื่อยืนยันว่ามาจาก Omise จริง
    const secret = process.env.OMISE_SECRET_KEY || "";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    // 3. เทียบรหัส (ถ้าไม่ตรง แปลว่ามีคนพยายามปลอมตัวมา)
    if (signature !== expectedSignature) {
      console.error("🚨 Warning: Invalid Signature! Potential spoofing attempt.");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
    }

    // 4. แปลง Text กลับเป็น JSON
    const body = JSON.parse(text);

    // 5. ตรวจสอบ Event: charge.complete (ชำระเงินเสร็จสิ้น)
    if (body.key === "charge.complete") {
      const charge = body.data;
      const metadata = charge.metadata;
      const orderId = metadata?.orderId;

      if (orderId && charge.status === "successful") {
        console.log(`🔍 Processing Webhook for Order #${orderId}`);

        // ดึงข้อมูลออเดอร์และสินค้ามาตรวจสอบซ้ำ
        const order = await prisma.order.findUnique({
          where: { id: Number(orderId) },
          include: { product: true }
        });

        if (!order) {
          console.error(`❌ Order #${orderId} not found in database.`);
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 🛡️ เช็คความถูกต้อง 1: ยอดเงินต้องตรงกัน (Omise ส่งมาเป็นสตางค์)
        const orderAmountSatang = Math.round(Number(order.product.price) * 100);
        if (charge.amount !== orderAmountSatang) {
          console.error(`🚨 ALERT: Amount Mismatch! Order: ${orderAmountSatang}, Paid: ${charge.amount}`);
          return NextResponse.json({ error: "Amount Mismatch" }, { status: 400 });
        }

        // 🛡️ เช็คความถูกต้อง 2: ป้องกันการรันซ้ำ (ถ้าจ่ายแล้วไม่ต้องทำอะไร)
        if (order.status === "PAID" || order.status === "COMPLETED") {
          console.log(`ℹ️ Order #${orderId} already marked as paid.`);
          return NextResponse.json({ received: true });
        }

        // ✅ ทุกอย่างถูกต้อง -> อัปเดตสถานะเป็น PAID
        await prisma.order.update({
          where: { id: Number(orderId) },
          data: { status: "PAID" },
        });

        console.log(`✅ Order #${orderId} status updated to PAID successfully.`);
      }
    }

    // ตอบกลับ Omise ว่าเราได้รับข้อมูลแล้ว (Status 200)
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("🔥 Webhook Server Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}