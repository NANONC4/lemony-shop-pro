import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "ไม่พบ Token อ้างอิง" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { token: token },
      include: { product: true }
    });

    if (!order) {
      return NextResponse.json({ error: "ไม่พบรายการสั่งซื้อนี้ในระบบ" }, { status: 404 });
    }

    // 🚨 1. ดักเวลา: เช็คว่าออเดอร์สร้างมาเกิน 15 นาทีหรือยัง?
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - order.createdAt.getTime()) / 60000);

    if (diffMinutes >= 15 && order.status === "PENDING") {
      // หมดเวลาปุ๊บ ปรับสถานะเป็น CANCELLED ทันที โจรจะเอาไปทำอะไรต่อไม่ได้แล้ว
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" }
      });
      return NextResponse.json({ error: "ออเดอร์นี้หมดเวลาชำระเงินแล้ว (เกิน 15 นาที)" }, { status: 400 });
    }

    // ถ้าไม่ใช่ PENDING และไม่ได้กำลังจ่ายเงิน ให้เตะออก
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: `ออเดอร์นี้อยู่ในสถานะ ${order.status}` }, { status: 400 });
    }

    return NextResponse.json({
      id: order.id,
      amount: Number(order.price),
      productName: order.product.name,
      orderToken: order.token,
      createdAt: order.createdAt // ส่งเวลาสร้างไปให้หน้าบ้านทำนับถอยหลัง
    });

  } catch (error) {
    console.error("Payment Info Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}