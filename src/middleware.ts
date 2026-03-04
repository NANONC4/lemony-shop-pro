import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // ดึง Token เพื่อเช็คว่าตอนนี้ User ล็อกอินอยู่หรือไม่
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const { pathname } = req.nextUrl;

  // 🛑 1. กฎสำหรับหน้า Login / Register
  // ถ้าเข้าหน้า auth แล้วพบว่า "มี Token (ล็อกอินแล้ว)" -> เตะกลับหน้าแรก
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 🛡️ 2. (ของแถม) กฎสำหรับหน้า Admin
  // ถ้าพยายามเข้าหน้า /admin แต่ "ไม่มี Token" หรือ "ไม่ใช่ ADMIN" -> เตะกลับหน้าแรก
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ปล่อยผ่านให้เข้าหน้าอื่นๆ ได้ปกติ
  return NextResponse.next();
}

// ระบุ URL ที่ต้องการให้ยาม (Middleware) มายืนเฝ้า
// เลื่อนลงมาล่างสุดของไฟล์ middleware.ts แล้วแก้เป็นแบบนี้ครับ
export const config = {
  matcher: [
    "/admin/:path*" // เฝ้าแค่ระบบหลังบ้านพอครับ
  ],
};