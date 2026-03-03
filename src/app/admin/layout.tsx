"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
// ✅ 1. เพิ่มไอคอน Store (รูปร้านค้า) เข้ามาใน import
import { LayoutDashboard, Package, LogOut, Megaphone, ShoppingCart, Ticket, Store } from "lucide-react"; 
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold flex items-center gap-2 text-white">🍋 Admin Pro</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           {/* 1. Dashboard (Analytics) */}
           <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
              <LayoutDashboard className="w-5 h-5" />
              ภาพรวม (Analytics)
           </Link>

           {/* 2. จัดการออเดอร์ */}
           <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname.startsWith('/admin/orders') ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
              <ShoppingCart className="w-5 h-5" />
              จัดการออเดอร์
           </Link>
           
           {/* 3. จัดการสินค้า */}
           <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/products' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
              <Package className="w-5 h-5" />
              จัดการสินค้า
           </Link>

           {/* 4. โปรโมชั่น */}
           <Link href="/admin/promotions" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/promotions' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800'}`}>
              <Megaphone className="w-5 h-5" />
              จัดการโปรโมชั่น
           </Link>

           {/* 5. จัดการคูปอง */}
           <Link href="/admin/coupons" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/coupons' ? 'bg-yellow-600 text-white' : 'hover:bg-slate-800'}`}>
              <Ticket className="w-5 h-5" />
              จัดการคูปอง
           </Link>

           {/* ✅ 6. เปิด-ปิดร้านค้า (เพิ่มใหม่ตรงนี้!) */}
           <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/admin/settings' ? 'bg-pink-600 text-white' : 'hover:bg-slate-800'}`}>
              <Store className="w-5 h-5" />
              เปิด-ปิดร้านค้า
           </Link>

        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
           <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 w-full rounded-xl transition">
              <LogOut className="w-5 h-5" />
              ออกจากระบบ
           </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 bg-slate-950 min-h-screen">
         {children}
      </main>
    </div>
  );
}