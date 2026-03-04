"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// ✅ เพิ่ม Home เข้ามาเพื่อใช้เป็นไอคอนกลับหน้าร้าน
import { LayoutDashboard, Package, LogOut, Megaphone, ShoppingCart, Ticket, Store, Menu, X, Home } from "lucide-react"; 
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ปิดเมนูอัตโนมัติเมื่อกดเลือกลิงก์ (เฉพาะในมือถือ)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ล็อคหน้าจอไม่ให้เลื่อนเวลาเปิดเมนูในมือถือ
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      
      {/* 📱 Mobile Header Navbar (โชว์เฉพาะมือถือ) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
         <h1 className="text-lg font-bold flex items-center gap-2 text-white">🍋 Admin Pro</h1>
         <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
         >
            <Menu className="w-6 h-6" />
         </button>
      </div>

      {/* --------------------------------------------------- */}
      {/* 💻 DESKTOP SIDEBAR (โชว์ถาวรในคอม ซ่อนในมือถือ) */}
      {/* --------------------------------------------------- */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col fixed h-full z-50">
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold flex items-center gap-2 text-white">🍋 Admin Pro</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
           <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-800'}`}>
              <LayoutDashboard className="w-5 h-5" /> ภาพรวม (Analytics)
           </Link>

           <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname.startsWith('/admin/orders') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-800'}`}>
              <ShoppingCart className="w-5 h-5" /> จัดการออเดอร์
           </Link>
           
           <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-800'}`}>
              <Package className="w-5 h-5" /> จัดการสินค้า
           </Link>

           <Link href="/admin/promotions" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/promotions' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'hover:bg-slate-800'}`}>
              <Megaphone className="w-5 h-5" /> จัดการโปรโมชั่น
           </Link>

           <Link href="/admin/coupons" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/coupons' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/20' : 'hover:bg-slate-800'}`}>
              <Ticket className="w-5 h-5" /> จัดการคูปอง
           </Link>

           <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/settings' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'hover:bg-slate-800'}`}>
              <Store className="w-5 h-5" /> เปิด-ปิดร้านค้า
           </Link>
        </nav>

        {/* ✅ เพิ่มปุ่ม กลับสู่หน้าร้าน และ จัดกลุ่มไว้ด้านล่าง */}
        <div className="p-4 border-t border-slate-800 mt-auto space-y-2">
           <Link href="/" className="flex items-center gap-3 px-4 py-3 text-cyan-400 hover:bg-cyan-500/10 w-full rounded-xl transition font-medium">
              <Home className="w-5 h-5" /> กลับสู่หน้าร้าน
           </Link>
           <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 w-full rounded-xl transition font-medium">
              <LogOut className="w-5 h-5" /> ออกจากระบบ
           </button>
        </div>
      </aside>

      {/* --------------------------------------------------- */}
      {/* 📱 MOBILE SIDEBAR DRAWER (สไลด์ออกมาในมือถือ) */}
      {/* --------------------------------------------------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* พื้นหลังดำคลิกเพื่อปิด */}
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsMobileMenuOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            
            {/* ตัวลิ้นชัก */}
            <motion.div 
               initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
               transition={{ type: "tween", duration: 0.3 }}
               className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-[300px] bg-slate-900 border-r border-slate-800 flex flex-col z-50 md:hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                 <h1 className="text-xl font-bold flex items-center gap-2 text-white">🍋 Admin Pro</h1>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                 <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <LayoutDashboard className="w-5 h-5" /> ภาพรวม
                 </Link>

                 <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname.startsWith('/admin/orders') ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <ShoppingCart className="w-5 h-5" /> จัดการออเดอร์
                 </Link>
                 
                 <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/products' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Package className="w-5 h-5" /> จัดการสินค้า
                 </Link>

                 <Link href="/admin/promotions" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/promotions' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Megaphone className="w-5 h-5" /> จัดการโปรโมชั่น
                 </Link>

                 <Link href="/admin/coupons" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/coupons' ? 'bg-yellow-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Ticket className="w-5 h-5" /> จัดการคูปอง
                 </Link>

                 <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/settings' ? 'bg-pink-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Store className="w-5 h-5" /> เปิด-ปิดร้านค้า
                 </Link>
              </nav>

              {/* ✅ เพิ่มปุ่ม กลับสู่หน้าร้าน สำหรับมือถือ */}
              <div className="p-4 border-t border-slate-800 mt-auto space-y-2">
                 <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-cyan-400 hover:bg-cyan-500/10 w-full rounded-xl transition font-medium">
                    <Home className="w-5 h-5" /> กลับสู่หน้าร้าน
                 </Link>
                 <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 w-full rounded-xl transition font-medium">
                    <LogOut className="w-5 h-5" /> ออกจากระบบ
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------- */}
      {/* 📦 MAIN CONTENT (เนื้อหาหลัก) */}
      {/* --------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-h-screen bg-slate-950 w-full transition-all duration-300 pt-20 px-4 pb-8 md:pl-64 md:pt-8 md:px-8">
         <div className="max-w-7xl mx-auto w-full">
            {children}
         </div>
      </main>

    </div>
  );
}