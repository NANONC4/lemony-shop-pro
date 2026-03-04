import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden: สำหรับ Admin เท่านั้น" }, { status: 403 });
  }

  try {
    const { orderId, status, adminMessage } = await req.json();

    // เตรียมข้อมูลที่จะอัปเดต
    let updateData: any = { status };
    if (adminMessage !== undefined) updateData.adminMessage = adminMessage;

    // ❌ เอาคำสั่งลบรูป (imageUrl = null) ออกแล้ว เพื่อเก็บรูปไว้เป็นหลักฐาน 7 วัน!
    // ระบบ 7 วันที่คุณชัชชัยทำไว้ (Cron Job) จะมาดึงรูปลบออกเองเมื่อถึงเวลาครับ

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}