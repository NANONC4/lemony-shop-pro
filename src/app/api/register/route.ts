import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password, name, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    // 1. เช็คว่า Username ซ้ำไหม?
    const existingUser = await prisma.user.findUnique({
      where: { username: username }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username นี้มีผู้ใช้แล้ว" }, { status: 400 });
    }

    // 2. เข้ารหัสรหัสผ่าน (สำคัญมาก ห้ามเก็บเป็น Text ธรรมดา!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. สร้าง User ใหม่
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: name || username,
        email: email || null,
        role: "USER"
      }
    });

    return NextResponse.json({ success: true, userId: user.id });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "สมัครสมาชิกไม่สำเร็จ" }, { status: 500 });
  }
}