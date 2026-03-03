import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  // 🔒 4. เช็คสิทธิ์ Admin (Role Check)
  // ต้อง cast type ให้มันรู้จัก role (หรือเช็คจาก db ก็ได้ แต่นี้ไวสุด)
  const userRole = (session?.user as any)?.role;
  
  if (!session || userRole !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden: สำหรับ Admin เท่านั้น" }, { status: 403 });
  }

  try {
    const { orderId, status } = await req.json();

    // เตรียมข้อมูลที่จะอัปเดต
    let updateData: any = { status };

    // 🗑️ 5. Auto Delete Image: ถ้าสถานะคือ "เสร็จสิ้น" หรือ "ยกเลิก" ให้ลบรูปทิ้ง
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      updateData.imageUrl = null; // ล้างข้อมูล Base64 ออกจาก DB เพื่อประหยัดพื้นที่
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