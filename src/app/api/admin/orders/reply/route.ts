import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 🔒 เช็คสิทธิ์ว่าเป็น ADMIN ถึงจะตอบกลับและส่งรูปได้
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ 1. รับค่า adminImageUrl ที่ส่งมาจากหน้าบ้าน
    const { orderId, message, adminImageUrl } = await req.json();

    // ✅ 2. เตรียมข้อมูลที่จะอัปเดต
    const updateData: any = { 
        adminMessage: message 
    };

    // ถ้าแอดมินมีการแนบรูปมาด้วย ให้เพิ่มเข้าไปในคำสั่งอัปเดต
    if (adminImageUrl !== undefined) {
        updateData.adminImageUrl = adminImageUrl;
    }

    // ✅ 3. อัปเดตลง Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reply" }, { status: 500 });
  }
}