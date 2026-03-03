import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // เช็ค path import ให้ถูกนะครับ

const f = createUploadthing();

// ฟังก์ชันเช็คสิทธิ์ (Middleware)
const auth = async (req: Request) => {
  const session = await getServerSession(authOptions);
  // ต้องล็อกอิน และต้องเป็น ADMIN เท่านั้นถึงจะอัปโหลดได้
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");
  return { userId: (session.user as any).id };
};

// FileRouter สำหรับแอปเรา
export const ourFileRouter = {
  // 1. Uploader สำหรับรูปสินค้า/โปรโมชั่น
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } }) // จำกัดขนาด 4MB, ทีละ 1 รูป
    .middleware(async ({ req }) => {
      // โค้ดตรงนี้จะรันก่อนอัปโหลด (เช็คสิทธิ์)
      const user = await auth(req);
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // โค้ดตรงนี้จะรันหลังอัปโหลดเสร็จ (Server Side)
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      
      // ตรงนี้สามารถเขียน Logic เพิ่มได้ เช่น บันทึกลง Database ทันที (แต่เดี๋ยวเราไปทำหน้าบ้านดีกว่า)
      return { uploadedBy: metadata.userId };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;