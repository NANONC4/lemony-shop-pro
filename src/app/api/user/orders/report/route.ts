import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js"; // ✅ 1. เพิ่ม Supabase
import { sendLineMessage } from "@/lib/line"; // ✅ 1. เพิ่ม Import ฟังก์ชันส่งข้อความ LINE  
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // ตรวจสอบ Login (ด่านแรก)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ 2. เปลี่ยนจากรับ JSON เป็นรับ FormData (เพราะมีไฟล์รูปส่งมาด้วย)
    const formData = await request.formData();
    const orderId = Number(formData.get("orderId"));
    const message = formData.get("message") as string;
    const twoFactorCode = formData.get("twoFactorCode") as string;
    const file = formData.get("file") as Blob | null; // อาจจะแนบหรือไม่แนบรูปมาก็ได้

    if (!orderId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // Validation: ป้องกัน Spam ข้อความยาวเกิน
    if (message && message.length > 100) {
      return NextResponse.json({ error: "ข้อความยาวเกินไป (สูงสุด 100 ตัวอักษร)" }, { status: 400 });
    }
    if (twoFactorCode && twoFactorCode.length > 20) {
      return NextResponse.json({ error: "รหัส 2 ชั้นยาวผิดปกติ" }, { status: 400 });
    }

    // ตรวจสอบว่าเป็นเจ้าของออเดอร์จริงไหม (ด่านสอง)
    const userId = (session.user as any).id;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: userId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order Not Found" }, { status: 404 });
    }

    // ✅ 3. ถ้ามีการแนบไฟล์รูปภาพมาด้วย ให้ API เป็นคนอัปโหลดขึ้น Supabase เอง
    let finalImageUrl = undefined;

    if (file && file.size > 0) {
      // ใช้ SERVICE_ROLE_KEY ข้ามกฎ RLS (เพราะเราเช็ค Next-Auth ผ่านแล้ว มั่นใจได้ว่าปลอดภัย)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // แปลงไฟล์เป็น Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const ext = file.type.split('/') || 'png';
      const fileName = `report-${order.id}-${Date.now()}.${ext}`;

      // โยนขึ้น Storage
      const { error: uploadError } = await supabase.storage
        .from('order-slips')
        .upload(fileName, buffer, { contentType: file.type });

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        throw new Error("ระบบฝากรูปภาพขัดข้อง");
      }

      // ดึง URL ตัวเต็มออกมา
      const { data: publicUrlData } = supabase.storage
        .from('order-slips')
        .getPublicUrl(fileName);

      finalImageUrl = publicUrlData.publicUrl;
    }

    // เตรียมข้อความ Note ใหม่ (บันทึกประวัติการแก้ไขต่อท้ายของเดิม)
    const newNote = `\n--- [ลูกค้าแก้ไขข้อมูล] ---\nMsg: ${message || "-"}\nCode: ${twoFactorCode || "-"}\nImg: ${finalImageUrl ? "แนบรูปใหม่" : "ไม่มี"}\n----------------`;

    // อัปเดตข้อมูลลง Database
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "PAID", 
        note: (order.note || "") + newNote,
        // ถ้ามีรูปลิงก์ใหม่ ให้ทับของเดิม ถ้าไม่มีใช้ของเดิม
        imageUrl: finalImageUrl || order.imageUrl,
        twoFactorCode: twoFactorCode || order.twoFactorCode
      }
    });
await sendLineMessage(`⚠️ [ลูกค้าแก้ไขข้อมูล]\nออเดอร์: #${order.id}\nลูกค้าอัปเดตข้อมูล/สลิปใหม่แล้ว กรุณาตรวจสอบครับ`);

    return NextResponse.json({ success: true });
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการส่งข้อมูล" }, { status: 500 });
  }
}