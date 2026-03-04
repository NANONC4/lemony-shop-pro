import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// ✅ ใช้ SERVICE_ROLE_KEY ที่ซ่อนอยู่ฝั่งเซิร์ฟเวอร์ ปลอดภัย 100%
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 🔒 1. ด่านตรวจ NextAuth: ไม่ใช่แอดมิน เตะออกทันที!
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized: ปฏิเสธการเข้าถึง" }, { status: 401 });
    }

    // ✅ 2. รับข้อมูลแบบ FormData (ทั้งข้อความและไฟล์รูป)
    const formData = await req.formData();
    const orderId = Number(formData.get("orderId"));
    const message = formData.get("message") as string;
    const file = formData.get("file") as Blob | null;

    if (!orderId) {
       return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    let adminImageUrl = null;

    // ✅ 3. ถ้าแอดมินแนบรูปมา ให้อัปโหลดเข้า Supabase จากหลังบ้าน
    if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = file.type.split('/')[1] || 'png';
        const fileName = `admin-replies/reply-${orderId}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('order-slips')
          .upload(fileName, buffer, { contentType: file.type });

        if (uploadError) throw new Error("อัปโหลดรูปลง Supabase ไม่สำเร็จ");

        const { data: publicUrlData } = supabase.storage
          .from('order-slips')
          .getPublicUrl(fileName);

        adminImageUrl = publicUrlData.publicUrl;
    }

    // ✅ 4. อัปเดตข้อมูลลง Prisma
    const updateData: any = {};
    if (message !== undefined) updateData.adminMessage = message;
    if (adminImageUrl) updateData.adminImageUrl = adminImageUrl;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Admin Reply Error:", error);
    return NextResponse.json({ error: "ระบบตอบกลับขัดข้อง กรุณาลองใหม่" }, { status: 500 });
  }
}