"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, User, LogOut, History, ShieldCheck, Gamepad2, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  return (
    // ✅ แก้ปัญหา "กินจอ": ใช้ความสูงคงที่ (h-16) และพื้นหลังกระจกติดขอบบน ไม่ให้มีพื้นที่ใสๆ ตกลงมาทับเนื้อหาด้านล่าง
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      
      {/* ✅ แก้ปัญหา "ไม่สมส่วน": แบ่งพื้นที่เป็น 3 ส่วนเท่าๆ กัน (flex-1) เพื่อให้เมนูอยู่ตรงกลางเป๊ะๆ */}
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* --- 1. Logo (ฝั่งซ้าย) --- */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="group-hover:rotate-12 transition-transform duration-300">
                  <Gamepad2 className="w-7 h-7 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                </div>
                <span className="hidden sm:flex items-center text-xl font-black tracking-tight drop-shadow-md">
                  <span className="text-white">Lemony</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 ml-1">Shop</span>
                </span>
            </Link>
          </div>

          {/* --- 2. Menu (ตรงกลาง) --- */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 shadow-lg">
                {[
                  { name: "หน้าแรก", href: "/" },
                  { name: "เติมเกม", href: "/games", icon: <Sparkles className="w-3 h-3" /> },
                  { name: "เกี่ยวกับเรา", href: "/about" },
                ].map((item) => {
                  const isActive = pathname === item.href;
                  return (
                      <Link 
                          key={item.href} 
                          href={item.href}
                          className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${
                              isActive 
                              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                              : "text-slate-300 hover:text-white hover:bg-white/5"
                          }`}
                      >
                          {item.icon}
                          {item.name}
                      </Link>
                  );
                })}
            </div>
          </div>

          {/* --- 3. User Profile (ฝั่งขวา) --- */}
          <div className="flex-1 flex justify-end items-center gap-3">
             {session ? (
                <div className="relative">
                   <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group"
                   >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 p-[2px]">
                         <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                             {session.user?.image ? (
                                <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                             ) : (
                                session.user?.name?.[0]?.toUpperCase() || "U"
                             )}
                         </div>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                   </button>

                   {/* Dropdown Menu */}
                   <AnimatePresence>
                      {isProfileOpen && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                         >
                            <div className="p-4 border-b border-white/5 bg-white/5">
                               <p className="text-[10px] text-pink-400 uppercase tracking-wider mb-0.5 font-bold">Lemony Member</p>
                               <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
                            </div>
                            
                            <div className="p-2 space-y-1">
                               {(session.user as any).role === 'ADMIN' && (
                                  <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors">
                                     <ShieldCheck className="w-4 h-4" /> แอดมินหลังบ้าน
                                  </Link>
                               )}
                               <Link href="/profile/history" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors">
                                  <History className="w-4 h-4" /> ประวัติการสั่งซื้อ
                               </Link>
                               <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left">
                                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                               </button>
                            </div>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             ) : (
                <Link 
                   href="/login" 
                   className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
                >
                   <User className="w-4 h-4" /> เข้าสู่ระบบ
                </Link>
             )}

             {/* Mobile Menu Toggle Button */}
             <button 
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
             >
                {isOpen ? <X className="w-4 h-4 text-pink-400" /> : <Menu className="w-4 h-4" />}
             </button>
          </div>

      </div>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {isOpen && (
           <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl overflow-hidden"
           >
              <div className="px-4 py-4 space-y-2">
                 {[
                    { name: "หน้าแรก", href: "/" },
                    { name: "เติมเกม", href: "/games", highlight: true },
                    { name: "ประวัติการซื้อ", href: "/profile/history" },
                    { name: "ติดต่อเรา", href: "/contact" },
                 ].map((item) => (
                    <Link 
                       key={item.href}
                       href={item.href} 
                       className={`block px-4 py-3 rounded-xl text-center text-sm font-bold transition-all ${
                          item.highlight 
                          ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
                       }`}
                       onClick={() => setIsOpen(false)}
                    >
                       {item.name}
                    </Link>
                 ))}
                 
                 {/* แสดงปุ่ม Login ในมือถือกรณีที่ไม่ได้ Login */}
                 {!session && (
                    <Link 
                        href="/login"
                        className="block px-4 py-3 rounded-xl text-center text-sm font-bold text-white bg-white/5 border border-white/10 mt-4"
                        onClick={() => setIsOpen(false)}
                    >
                        เข้าสู่ระบบ
                    </Link>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}