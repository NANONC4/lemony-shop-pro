import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ✅ อนุญาตให้ใช้ไฟล์ SVG (แก้ Error รูป placehold.co)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // ✅ ต้องเพิ่มอันนี้ ไม่งั้นรูปจาก UploadThing จะไม่ขึ้น
      { protocol: 'https', hostname: 'utfs.io' }, 
    ],
  },
};

export default nextConfig;