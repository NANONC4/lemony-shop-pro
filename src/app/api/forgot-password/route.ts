import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
    }

    // 1. ค้นหา User ในระบบ
    const user = await prisma.user.findFirst({
      where: { email },
    });

    // ถ้าไม่เจออีเมลนี้ เราจะยังคงตอบกลับว่า "ส่งแล้ว" เพื่อป้องกันคนมาสุ่มเดาอีเมลลูกค้าเราครับ (Security Best Practice)
    if (!user) {
      return NextResponse.json({ message: "หากอีเมลนี้อยู่ในระบบ ลิงก์รีเซ็ตรหัสจะถูกส่งไป" }, { status: 200 });
    }

    // 2. สร้างตั๋วผ่านทาง (Token) สุ่ม 64 ตัวอักษร
    const resetToken = crypto.randomBytes(32).toString("hex");
    // หมดอายุใน 15 นาที
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); 

    // 3. บันทึก Token ลง Database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 4. ตั้งค่าบุรุษไปรษณีย์ (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // อีเมลของร้าน
        pass: process.env.EMAIL_PASS, // รหัสผ่านพิเศษ (App Password)
      },
    });

    // 5. สร้างลิงก์สำหรับคลิก (ถ้าตอนพัฒนาจะเป็น localhost ถ้าขึ้น Vercel จะเป็นเว็บจริง)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // 6. หน้าตาและเนื้อหาของอีเมล
    const mailOptions = {
      from: `"Lemony Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "คำขอรีเซ็ตรหัสผ่าน - Lemony Shop 🍋",
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 500px; margin: 0 auto; padding: 20px; border: 1px solid #333; border-radius: 16px; background-color: #050505; color: #fff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ec4899; margin: 0;">Lemony Shop</h2>
          </div>
          <p style="color: #ccc;">สวัสดีคุณ <strong>${user.username || 'ลูกค้าที่รัก'}</strong>,</p>
          <p style="color: #ccc;">เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ หากคุณไม่ได้เป็นผู้ขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้ครับ</p>
          <p style="color: #ccc;">คุณสามารถตั้งรหัสผ่านใหม่ได้โดยคลิกที่ปุ่มด้านล่าง (ลิงก์นี้มีอายุ 15 นาที):</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ตั้งรหัสผ่านใหม่
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666; text-align: center;">
            หากปุ่มคลิกไม่ได้ ให้ก๊อปปี้ลิงก์นี้ไปวางในเบราว์เซอร์:<br/><br/>
            <span style="color: #ec4899; word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
      `,
    };

    // สั่งส่งอีเมล!
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "ส่งอีเมลเรียบร้อย" }, { status: 200 });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาติดต่อแอดมิน" }, { status: 500 });
  }
}