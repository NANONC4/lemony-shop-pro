import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  // 1. ป้องกันคนอื่นแอบยิง API นี้ (เช็ค Secret Key)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (secret !== (process.env.CRON_SECRET || "lemony-clean-1234")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ ย้ายการสร้าง Supabase Client เข้ามาไว้ "ใน" ฟังก์ชัน
  // เพื่อให้ Next.js มั่นใจว่าโหลดไฟล์ .env เสร็จแล้วแน่นอน
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ลืมใส่ค่า Supabase URL หรือ Key ในไฟล์ .env ครับ");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 2. คำนวณเวลาย้อนหลัง 7 วัน
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 3. ค้นหาออเดอร์ที่เสร็จ/ยกเลิกแล้ว เกิน 7 วัน และยังมีรูปค้างอยู่
    const oldOrders = await prisma.order.findMany({
      where: {
        status: { in: ["COMPLETED", "CANCELLED"] },
        updatedAt: { lt: sevenDaysAgo },
        imageUrl: { not: null },
      },
      select: { id: true, imageUrl: true },
    });

    if (oldOrders.length === 0) {
      return NextResponse.json({ message: "ไม่มีไฟล์ขยะต้องเคลียร์ในวันนี้ครับ 🧹" });
    }

    // 4. สกัดเอาเฉพาะ "ชื่อไฟล์" ออกมาจากลิงก์ URL ยาวๆ
    const fileNamesToDelete = oldOrders.map((order) => {
      const parts = order.imageUrl!.split("/");
      return parts[parts.length - 1]; // จะได้เช่น slip-123-12345.png
    });

    // 5. สั่ง Supabase ให้ลบไฟล์พวกนี้ทิ้งพร้อมกันรวดเดียว!
    const { error: storageError } = await supabase.storage
      .from("order-slips")
      .remove(fileNamesToDelete);

    if (storageError) {
      console.error("Supabase Delete Error:", storageError);
      throw new Error("ลบไฟล์ใน Supabase ไม่สำเร็จ");
    }

    // 6. ลบข้อมูลลิงก์รูปออกจาก Database (เซ็ตเป็น null)
    await prisma.order.updateMany({
      where: {
        id: { in: oldOrders.map((o) => o.id) },
      },
      data: {
        imageUrl: null,
        note: "[ระบบ] ลบรูปภาพอัตโนมัติ (เกิน 7 วัน)", // แอบใส่ Note ไว้ให้แอดมินรู้
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `ทำความสะอาดสำเร็จ! ลบไป ${fileNamesToDelete.length} รูป 🗑️` 
    });

  } catch (error) {
    console.error("Cleanup API Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการทำความสะอาด" }, { status: 500 });
  }
}