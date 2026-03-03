import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ อย่าลืมเช็ค path ว่าชี้ไปไฟล์ auth ถูกต้องไหมนะครับ

export async function GET() {
  try {
    let setting = await prisma.storeSetting.findUnique({ where: { id: 1 } });
    
    if (!setting) {
      setting = { id: 1, mode: "AUTO", openTime: "10:00", closeTime: "00:00", message: "ร้านปิดให้บริการ เปิดทำการ 10:00 - 00:00 น." };
    }

    let isActuallyOpen = true;

    if (setting.mode === "CLOSED") {
      isActuallyOpen = false;
    } else if (setting.mode === "AUTO") {
      const now = new Date();
      const bkkTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
      const hours = bkkTime.getHours();

      // เช็คเวลา 10:00 ถึง 00:00 (10 โมงเช้า ถึง 5 ทุ่ม 59 นาที)
      if (hours >= 10) {
        isActuallyOpen = true;
      } else {
        isActuallyOpen = false; 
      }
    } else if (setting.mode === "OPEN") {
      isActuallyOpen = true; 
    }

    return NextResponse.json({
      isOpen: isActuallyOpen,
      message: setting.message,
      // ส่งข้อมูลดิบกลับไปด้วย เผื่อหน้าแอดมินต้องการดูว่าตั้งค่าอะไรไว้
      rawSetting: setting 
    });

  } catch (error) {
    console.error("Store Status Error:", error);
    return NextResponse.json({ isOpen: true, message: "" }); 
  }
}

// 🚀 เพิ่มฟังก์ชัน POST สำหรับแอดมินกดเซฟตั้งค่า
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 🛡️ ป้องกันแฮ็กเกอร์: ตรวจสอบว่าเป็นแอดมินจริงๆ ไหม
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: คุณไม่ใช่แอดมิน" }, { status: 401 });
    }

    const body = await request.json();
    const { mode, openTime, closeTime, message } = body;

    // อัปเดตข้อมูลลง Database (ถ้าไม่มีข้อมูล id:1 ให้สร้างใหม่)
    const updatedSetting = await prisma.storeSetting.upsert({
      where: { id: 1 },
      update: { mode, openTime, closeTime, message },
      create: { id: 1, mode, openTime, closeTime, message }
    });

    return NextResponse.json({ success: true, setting: updatedSetting });

  } catch (error) {
    console.error("Update Store Setting Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}