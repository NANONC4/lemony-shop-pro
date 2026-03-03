import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// สร้าง API Route มาตรฐาน
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  // config: { ... }, // อนาคตถ้าจะ config เพิ่ม
});