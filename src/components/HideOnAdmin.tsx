"use client";

import { usePathname } from "next/navigation";

export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // เช็คว่า URL ปัจจุบัน เริ่มต้นด้วย /admin หรือไม่
  const isAdminPage = pathname?.startsWith("/admin");

  // ถ้าเป็นหน้าแอดมิน ให้ return null (คือซ่อนไปเลย ไม่แสดงผล)
  if (isAdminPage) {
    return null;
  }

  // ถ้าเป็นหน้าปกติ ก็แสดงผล Navbar/Footer ตามปกติ
  return <>{children}</>;
}