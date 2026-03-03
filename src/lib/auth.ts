import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // ✅ 1. Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    // ✅ 2. Facebook
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    // ✅ 3. Credentials (Login ปกติ + กัน Brute Force)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username/Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. เช็คว่ากรอกข้อมูลมาไหม
        if (!credentials?.username || !credentials?.password) return null;

        // ✅ 2. ค้นหา User (อัปเดตใหม่ให้หาได้ทั้ง Username และ Email)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          }
        });

        // 3. ถ้าไม่เจอ User หรือไม่มี Password (เช่น ล็อกอินผ่าน Google มาก่อนแล้วเพิ่งมาตั้งรหัส)
        if (!user || !user.password) return null;

        // 4. 🛑 เช็คว่าบัญชีถูกล็อคอยู่ไหม?
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error("บัญชีถูกระงับชั่วคราวเนื่องจากใส่รหัสผิดเกินกำหนด กรุณาลองใหม่ภายหลัง");
        }

        // 5. ตรวจสอบรหัสผ่าน
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
            // ❌ รหัสผิด: เพิ่มจำนวนครั้งที่ผิด
            const attempts = (user.loginAttempts || 0) + 1;
            let lockTime = null;

            // ถ้าผิดครบ 5 ครั้ง -> ล็อค 15 นาที
            if (attempts >= 5) {
                lockTime = new Date(Date.now() + 15 * 60 * 1000); 
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { 
                    loginAttempts: attempts,
                    lockedUntil: lockTime
                }
            });

            return null; // NextAuth จะมองว่าเป็น Error (รหัสผิด)
        }

        // ✅ รหัสถูก: รีเซ็ตค่าการเดาเป็น 0
        if ((user.loginAttempts || 0) > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: { loginAttempts: 0, lockedUntil: null }
            });
        }

        // 6. ส่งข้อมูล User กลับไปให้ NextAuth
        return { 
            id: user.id, 
            name: user.name, 
            role: user.role, 
            username: user.username || undefined,
            email: user.email 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
};