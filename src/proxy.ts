import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ เปลี่ยนชื่อฟังก์ชันจาก middleware เป็น proxy
export async function proxy(req: NextRequest) {
  // ดึง Token เพื่อเช็คว่าตอนนี้ User ล็อกอินอยู่หรือไม่
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const { pathname } = req.nextUrl;

  // 🛡️ กฎสำหรับหน้า Admin
  // ถ้าพยายามเข้าหน้า /admin แต่ "ไม่มี Token" หรือ "ไม่ใช่ ADMIN" -> เตะกลับหน้าแรก
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ปล่อยผ่านให้เข้าหน้าอื่นๆ ได้ปกติ
  return NextResponse.next();
}

// ระบุ URL ที่ต้องการให้ Proxy มายืนเฝ้า (ส่วนนี้เหมือนเดิมครับ)
export const config = {
  matcher: [
    "/admin/:path*" // เฝ้าระบบหลังบ้าน
  ],
};