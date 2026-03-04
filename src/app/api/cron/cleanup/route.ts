import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (secret !== (process.env.CRON_SECRET || "lemony-clean-1234")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // ✅ 1. แก้ไขการค้นหา: ให้หาทั้ง imageUrl (ลูกค้า) และ adminImageUrl (แอดมิน)
    const oldOrders = await prisma.order.findMany({
      where: {
        status: { in: ["COMPLETED", "CANCELLED"] },
        updatedAt: { lt: sevenDaysAgo },
        OR: [
          { imageUrl: { not: null } },
          { adminImageUrl: { not: null } }
        ]
      },
      select: { id: true, imageUrl: true, adminImageUrl: true },
    });

    if (oldOrders.length === 0) {
      return NextResponse.json({ message: "ไม่มีไฟล์ขยะต้องเคลียร์ในวันนี้ครับ 🧹" });
    }

    // ✅ 2. สกัดชื่อไฟล์: รวบรวมชื่อไฟล์จากทั้งสองฝั่งใส่ใน Array เดียวกัน
    const fileNamesToDelete: string[] = [];
    oldOrders.forEach((order) => {
      if (order.imageUrl) {
        const parts = order.imageUrl.split("/");
        fileNamesToDelete.push(parts[parts.length - 1]);
      }
      if (order.adminImageUrl) {
        const parts = order.adminImageUrl.split("/");
        fileNamesToDelete.push(parts[parts.length - 1]);
      }
    });

    // 3. สั่ง Supabase ให้ลบไฟล์ทั้งหมดพร้อมกัน
    const { error: storageError } = await supabase.storage
      .from("order-slips")
      .remove(fileNamesToDelete);

    if (storageError) {
      throw new Error("ลบไฟล์ใน Supabase ไม่สำเร็จ");
    }

    // ✅ 4. ลบลิงก์ออกจาก DB: เซ็ตทั้ง imageUrl และ adminImageUrl เป็น null
    await prisma.order.updateMany({
      where: {
        id: { in: oldOrders.map((o) => o.id) },
      },
      data: {
        imageUrl: null,
        adminImageUrl: null,
        note: "[ระบบ] ลบรูปภาพและหลักฐานอัตโนมัติ (เกิน 7 วัน)", 
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `ทำความสะอาดสำเร็จ! ลบไปทั้งหมด ${fileNamesToDelete.length} รูป จาก ${oldOrders.length} ออเดอร์ 🗑️` 
    });

  } catch (error) {
    console.error("Cleanup API Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการทำความสะอาด" }, { status: 500 });
  }
}