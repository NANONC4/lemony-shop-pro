import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // 1. ค้นหา User ที่มี Token นี้และยังไม่หมดอายุ (gt = greater than เวลาปัจจุบัน)
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), 
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ลิงก์นี้ไม่ถูกต้อง หรือหมดอายุไปแล้ว (เกิน 15 นาที) กรุณาขอลิงก์ใหม่ครับ" },
        { status: 400 }
      );
    }

    // 2. แปลงรหัสผ่านใหม่เป็นภาษาเอเลี่ยน (Hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. อัปเดตรหัสผ่านใหม่ และ "ล้างตั๋วผ่านทางทิ้ง" (เพื่อไม่ให้เอาลิงก์เดิมมากดซ้ำได้อีก)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0, // ✅ แถม: ปลดล็อคบัญชีให้ด้วยเลยเผื่อลูกค้าเคยใส่รหัสผิดจนโดนแบน
        lockedUntil: null,
      },
    });

    return NextResponse.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" }, { status: 200 });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "ระบบขัดข้อง กรุณาติดต่อแอดมิน" }, { status: 500 });
  }
}