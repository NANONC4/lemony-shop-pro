"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, History, ShieldCheck, Gamepad2, Sparkles, ChevronDown, Home, Info, BookOpen, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen || isProfileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isProfileOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
            
            {/* --- 1. Mobile Menu Button --- */}
            <div className="flex-1 flex justify-start md:hidden">
               <button 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  onClick={() => setIsOpen(true)}
               >
                  <Menu className="w-5 h-5" />
               </button>
            </div>

            {/* --- 2. Logo --- */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-1 md:flex justify-start">
              <Link href="/" className="flex items-center gap-2 group">
                  <div className="group-hover:rotate-12 transition-transform duration-300">
                    <Gamepad2 className="w-6 h-6 md:w-7 md:h-7 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  </div>
                  <span className="flex items-center text-lg md:text-xl font-black tracking-tight drop-shadow-md">
                    <span className="text-white">Lemony</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 ml-0.5 md:ml-1">Shop</span>
                  </span>
              </Link>
            </div>

            {/* --- 3. Desktop Menu --- */}
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

            {/* --- 4. User Profile Toggle --- */}
            <div className="flex-1 flex justify-end items-center gap-3">
               {session ? (
                  <button 
                     onClick={() => setIsProfileOpen(true)}
                     className="hidden md:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10 transition-all group"
                  >
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 p-[2px] shadow-md group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                            {session.user?.image ? (
                               <Image src={session.user.image} alt="User" width={32} height={32} className="w-full h-full object-cover" />
                            ) : (
                               session.user?.name?.[0]?.toUpperCase() || "U"
                            )}
                        </div>
                     </div>
                     <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                        {session.user?.name}
                     </span>
                  </button>
               ) : (
                  <Link 
                     href="/login" 
                     className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-pink-600 text-white text-sm font-bold hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:-translate-y-0.5 transition-all"
                  >
                     <User className="w-4 h-4" /> เข้าสู่ระบบ
                  </Link>
               )}
               <div className="w-10 md:hidden"></div>
            </div>

        </div>
      </nav>

      {/* ======================================================== */}
      {/* 📱 MOBILE SIDEBAR */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              style={{ willChange: "transform" }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[320px] bg-[#0a0a0a] border-r border-white/10 z-50 md:hidden flex flex-col overflow-y-auto"
            >
              {/* เนื้อหาลิ้นชักมือถือคงเดิม */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-b from-purple-900/20 to-transparent relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>

                {session ? (
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 p-[2px] shadow-lg">
                       <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center text-xl font-bold text-white">
                           {session.user?.image ? (
                              <Image src={session.user.image} alt="User" width={64} height={64} className="w-full h-full object-cover" />
                           ) : (
                              session.user?.name?.[0]?.toUpperCase() || "U"
                           )}
                       </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-pink-400 uppercase tracking-wider font-bold mb-1">Lemony Member</p>
                      <h3 className="text-lg font-bold text-white leading-tight">{session.user?.name}</h3>
                      <p className="text-sm text-slate-400 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">ยินดีต้อนรับ</h3>
                      <Link href="/login" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-pink-600 text-white font-bold shadow-lg">
                        เข้าสู่ระบบ / สมัครสมาชิก
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 py-4 px-3 space-y-6">
                <div>
                  <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เมนูหลัก</p>
                  <div className="space-y-1">
                    {[
                      { name: "หน้าแรก", href: "/", icon: <Home className="w-5 h-5" /> },
                      { name: "เติมเกม", href: "/games", icon: <Gamepad2 className="w-5 h-5" /> },
                      { name: "เกี่ยวกับเรา", href: "/about", icon: <Info className="w-5 h-5" /> },
                    ].map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname === item.href ? "bg-white/10 text-white font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"}`}>
                          <span className={pathname === item.href ? "text-pink-400" : "text-slate-400"}>{item.icon}</span>{item.name}
                        </Link>
                    ))}
                  </div>
                </div>

                {session && (
                  <div>
                    <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ระบบสมาชิก</p>
                    <div className="space-y-1">
                      {(session.user as any).role === 'ADMIN' && (
                        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-purple-400 font-medium hover:bg-purple-500/10 transition-all">
                          <ShieldCheck className="w-5 h-5" />แอดมินหลังบ้าน
                        </Link>
                      )}
                      <Link href="/profile/history" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname === "/profile/history" ? "bg-white/10 text-white font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"}`}>
                        <span className={pathname === "/profile/history" ? "text-pink-400" : "text-slate-400"}><History className="w-5 h-5" /></span>ประวัติการสั่งซื้อ
                      </Link>
                    </div>
                  </div>
                )}

                <div>
                  <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ช่วยเหลือ</p>
                  <div className="space-y-1">
                    <Link href="/terms" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium transition-all">
                      <BookOpen className="w-4 h-4" /> เงื่อนไขการใช้งาน
                    </Link>
                    <Link href="/privacy" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium transition-all">
                      <Shield className="w-4 h-4" /> นโยบายความเป็นส่วนตัว
                    </Link>
                  </div>
                </div>
              </div>

              {session && (
                <div className="p-4 border-t border-white/10 mt-auto">
                  <button onClick={() => { signOut(); setIsOpen(false); }} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all">
                    <LogOut className="w-5 h-5" /> ออกจากระบบ
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 💻 DESKTOP PROFILE DRAWER */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isProfileOpen && session && (
          <>
            {/* พื้นหลังดำ (ถอด blur ออกเพื่อความลื่น) */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 hidden md:block"
            />
            
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }} // แอนิเมชันแบบเบา
              style={{ willChange: "transform" }} // เปิดการ์ดจอเร่งความเร็ว
              className="fixed top-0 right-0 bottom-0 w-[400px] bg-[#0a0a0a] border-l border-white/10 z-50 hidden md:flex flex-col shadow-2xl"
            >
               <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
               >
                  <X className="w-5 h-5" />
               </button>

               <div className="p-8 pt-16 border-b border-white/10 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-transparent relative overflow-hidden">
                  {/* เปลี่ยนแสงด้านหลังจาก blur เป็น radial-gradient เพื่อลดภาระเครื่อง */}
                  <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-64 h-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500/15 to-transparent pointer-events-none" />
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-pink-500" />
                  
                  <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 p-[3px] shadow-lg">
                       <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center text-3xl font-bold text-white">
                           {session.user?.image ? (
                              <Image src={session.user.image} alt="User" width={96} height={96} className="w-full h-full object-cover" />
                           ) : (
                              session.user?.name?.[0]?.toUpperCase() || "U"
                           )}
                       </div>
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold mb-3">
                         <Sparkles className="w-3 h-3" /> Lemony Member
                      </div>
                      <h3 className="text-2xl font-black text-white">{session.user?.name}</h3>
                      <p className="text-slate-400 mt-1 text-sm">{session.user?.email || "ไม่ได้ผูกอีเมล"}</p>
                    </div>
                  </div>
               </div>

               <div className="flex-1 p-6 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 ml-1">จัดการบัญชีของคุณ</p>
                  
                  {(session.user as any).role === 'ADMIN' && (
                    <Link href="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl text-purple-400 font-medium bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 group-hover:scale-110 transition-transform"><ShieldCheck className="w-5 h-5" /></div>
                      <div>
                         <p className="font-bold">ระบบแอดมินหลังบ้าน</p>
                         <p className="text-xs text-purple-400/70 mt-0.5">จัดการออเดอร์และตั้งค่าร้านค้า</p>
                      </div>
                    </Link>
                  )}
                  
                  <Link href="/profile/history" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl text-slate-200 hover:text-white font-medium bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                     <div className="p-2.5 rounded-xl bg-black group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors border border-white/10"><History className="w-5 h-5" /></div>
                     <div>
                         <p className="font-bold">ประวัติการสั่งซื้อ</p>
                         <p className="text-xs text-slate-500 mt-0.5">ตรวจสอบสถานะและประวัติการเติมเกม</p>
                     </div>
                  </Link>
               </div>

               <div className="p-6 border-t border-white/10 bg-black/40">
                  <button onClick={() => { signOut(); setIsProfileOpen(false); }} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:border-red-500/50">
                    <LogOut className="w-5 h-5" /> ออกจากระบบ
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}