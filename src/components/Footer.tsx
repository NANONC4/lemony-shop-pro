import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Gamepad2, ShieldCheck, CreditCard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#020205] border-t border-purple-900/30 pt-12 pb-8 overflow-hidden">
      
      {/* 🎨 Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- Main Section: Grid 3 Columns (แก้ปัญหาตรงกลางโล่ง) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-10">
          
          {/* Column 1: Brand & Social (ชิดซ้าย) */}
          <div className="space-y-4">
             <Link href="/" className="inline-block">
                <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                    LemonyShop
                </h2>
             </Link>
             
             <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                บริการเติมเกมออนไลน์ 24 ชม. ระบบอัตโนมัติ รวดเร็ว ปลอดภัย 100% ดูแลโดยทีมงานมืออาชีพ
             </p>

             <div className="flex gap-3 pt-2">
                <Link href="#" className="p-2.5 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#3b82f6]">
                    <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="p-2.5 rounded-xl bg-green-900/20 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white hover:border-green-400 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#22c55e]">
                    <MessageCircle className="w-5 h-5" />
                </Link>
                <Link href="#" className="p-2.5 rounded-xl bg-pink-900/20 border border-pink-500/30 text-pink-400 hover:bg-pink-600 hover:text-white hover:border-pink-400 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#ec4899]">
                    <Instagram className="w-5 h-5" />
                </Link>
             </div>
          </div>

          {/* Column 2: Main Menu (ย้ายมาถมที่ตรงกลาง) */}
          <div className="md:pl-10">
            <h3 className="text-white font-bold mb-5 text-base border-l-4 border-blue-500 pl-3">เมนูหลัก</h3>
            <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">หน้าแรก</Link></li>
                <li><Link href="/topup" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">เติมเกม</Link></li>
                <li><Link href="/history" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">ประวัติการซื้อ</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">เข้าสู่ระบบ / สมัครสมาชิก</Link></li>
            </ul>
          </div>

          {/* Column 3: Help & Policy (ชิดขวาหรือต่อท้าย) */}
          <div>
            <h3 className="text-white font-bold mb-5 text-base border-l-4 border-pink-500 pl-3">ช่วยเหลือ</h3>
            <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/contact" className="hover:text-pink-400 hover:translate-x-1 transition-all inline-block">ติดต่อเรา</Link></li>
                <li><Link href="/terms" className="hover:text-pink-400 hover:translate-x-1 transition-all inline-block">เงื่อนไขการใช้งาน</Link></li>
                <li><Link href="/privacy" className="hover:text-pink-400 hover:translate-x-1 transition-all inline-block">นโยบายความเป็นส่วนตัว</Link></li>
                <li><Link href="/refund" className="hover:text-pink-400 hover:translate-x-1 transition-all inline-block">นโยบายการคืนเงิน</Link></li>
            </ul>
          </div>

        </div>

        {/* --- Bottom Section --- */}
        <div className="border-t border-white/5 pt-6 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <p className="text-slate-500 text-sm">
                © {new Date().getFullYear()} <span className="text-white font-medium">Lemony Shop Pro</span>. All Rights Reserved.
            </p>

            <div className="flex gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] border border-green-900/30 shadow-sm">
                    <CreditCard className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-slate-300">QR Payment</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] border border-blue-900/30 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-300">Secure 100%</span>
                 </div>
            </div>
        </div>

      </div>
    </footer>
  );
}