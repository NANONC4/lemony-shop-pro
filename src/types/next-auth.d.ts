import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * ขยายความสามารถของ Session เพื่อให้มี id และ role
   */
  interface Session {
    user: {
      id: string
      role?: string
      username?: string
    } & DefaultSession["user"]
  }

  /**
   * ขยายความสามารถของ User (ตอนดึงจาก Database)
   */
  interface User {
    id: string
    role?: string
    username?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * ขยายความสามารถของ JWT Token
   */
  interface JWT {
    id: string
    role?: string
  }
}