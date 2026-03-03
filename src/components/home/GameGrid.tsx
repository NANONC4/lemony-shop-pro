"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Megaphone, Lock } from "lucide-react";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase"; // ✅ 1. ดึงวิทยุสื่อสาร Supabase มาใช้

interface GameGridProps {
  games: any[];
  enableSearch?: boolean; // เปิด/ปิด โหมดแถบประกาศ
}

export default function GameGrid({ games, enableSearch = false }: GameGridProps) {
  // ✅ 2. สร้าง State สำหรับเก็บสถานะร้าน
  const [isOpen, setIsOpen] = useState(true);

  // ✅ 3. ฟังก์ชันและ Effect สำหรับดึงสถานะร้านแบบ Realtime
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/store/status");
        const data = await res.json();
        setIsOpen(data.isOpen);
      } catch (err) {
        console.error("Failed to fetch store status");
      }
    };

    checkStatus(); // เช็คครั้งแรกตอนโหลด

    // ดักฟังวิทยุจาก Supabase ถ้าแอดมินปิดร้าน ให้ล็อคเกมทันที!
    const channel = supabase
      .channel('gamegrid-store-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'StoreSetting' },
        () => { checkStatus(); }
      )
      .subscribe();

    const interval = setInterval(checkStatus, 30000); // เช็คเวลาออโต้ทุก 30 วิ

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="w-full" id="games-section">
      
      {/* CSS สำหรับข้อความวิ่งแบบไร้รอยต่อ */}
      <style>{`
        @keyframes scroll-text {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-scroll-text {
          display: flex;
          width: max-content;
          white-space: nowrap; 
          animation: scroll-text 20s linear infinite; 
        }
        .mask-image-fade {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>

      {/* =========================================
         ส่วน Header (ประกาศต่างๆ เหมือนเดิม)
         ========================================= */}
      {enableSearch ? (
        <div className="flex flex-col items-center mb-10 w-full px-2 overflow-hidden">
            <Reveal direction="scale" width="100%" className="w-full mb-8">
                <div className="relative group w-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-500 animate-pulse" />
                    <div className="relative flex items-center bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-xl py-2 px-3 shadow-2xl overflow-hidden w-full">
                        <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white p-1.5 rounded-lg mr-3 shadow-[0_0_10px_rgba(236,72,153,0.5)] z-10 relative">
                            <Megaphone className="w-4 h-4 animate-[bounce_2s_infinite]" />
                        </div>
                        <div className="flex-1 overflow-hidden relative mask-image-fade h-full flex items-center">
                            <div className="animate-scroll-text">
                                <div className="flex items-center text-slate-200 text-sm font-medium tracking-wide pr-8 whitespace-nowrap">
                                    <span className="text-pink-400 font-bold mr-2">⚡ Lemony Update:</span> 
                                    ⚞𓈒ׅ  Welcome to Our Service ♡𓈒  
                                    <span className="mx-4 text-white/20">|</span>
                                    <span className="text-blue-400 font-bold">Roblox</span>🥯 เรทดีต่อใจ มั่นใจได้ ปลอดภัยแน่นอน
                                    <span className="mx-4 text-white/20">|</span>
                                    หากพบปัญหาการใช้งาน สามารถติดต่อแอดมินได้ตลอดเวลา ✨
                                </div>
                                <div className="flex items-center text-slate-200 text-sm font-medium tracking-wide pr-8 whitespace-nowrap">
                                    <span className="text-pink-400 font-bold mr-2">⚡Lemony Update:</span> 
                                     ⚞𓈒ׅ  Welcome to Our Service ♡𓈒   
                                    <span className="mx-4 text-white/20">|</span>
                                    <span className="text-blue-400 font-bold">Roblox</span> 🥯 เรทดีต่อใจ มั่นใจได้ ปลอดภัยแน่นอน
                                    <span className="mx-4 text-white/20">|</span>
                                    <span className="mx-4 text-white/20">|</span>
                                    หากพบปัญหาการใช้งาน สามารถติดต่อแอดมินได้ตลอดเวลาครับ ✨
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
                <div className="w-full text-left mb-1 mt-1 pl-1">
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <Gamepad2 className="w-6 h-6 text-pink-500" />
                        เลือกเกมที่ต้องการเติม
                    </h2>
                </div>
            </Reveal>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center mb-10 space-y-3">
          <Reveal direction="down" delay={0.1} width="fit-content">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                  <Gamepad2 className="w-4 h-4 text-pink-400" />
                  <span className="text-xs md:text-sm font-bold text-pink-200 tracking-wider">GAME TOP-UP</span>
              </div>
          </Reveal>

          <Reveal direction="up" delay={0.2} width="fit-content">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  เลือกเกมที่ต้องการเติม
              </h2>
          </Reveal>
          
          <Reveal direction="scale" delay={0.3} duration={0.6} width="fit-content">
              <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
          </Reveal>
          
          <Reveal direction="up" delay={0.4} width="fit-content">
              <p className="text-slate-400 text-sm md:text-base max-w-lg">
                  เรทดี ราคาคุ้ม เติมไว ปลอดภัย 100% พร้อมดูแลตลอด 24 ชม.
              </p>
          </Reveal>
        </div>
      )}

      {/* =========================================
         ส่วน Grid แสดงผลเกม (✅ อัปเดตระบบล็อคเกมแล้ว)
         ========================================= */}
      
      {games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {games.map((game, index) => (
            <Reveal 
                key={game.id} 
                direction="up" 
                delay={index * 0.05} 
                width="100%" 
                overflow="visible"
            >
                <Link
                    // ถ้าร้านปิด ไม่ให้ลิงก์ทำงาน
                    href={isOpen ? `/games/${game.slug || game.id}` : "#"}
                    onClick={(e) => {
                      if (!isOpen) {
                        e.preventDefault(); // เบรก! ไม่ให้เด้งไปหน้าอื่น
                      }
                    }}
                    // ✅ ใส่ Effect รูปสีเทา ถ้าร้านปิด
                    className={`group relative block bg-[#121212] rounded-xl overflow-hidden border shadow-md transition-all duration-300 h-full ${
                      isOpen 
                        ? "border-white/5 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2" 
                        : "border-red-500/20 grayscale-[0.8] opacity-60 cursor-not-allowed"
                    }`}
                >
                    <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image
                        src={game.imageUrl}
                        alt={game.title}
                        fill
                        className={`object-cover object-center transition-transform duration-700 ${isOpen ? "group-hover:scale-110" : ""}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent opacity-90" />
                    
                    {/* ✅ ป้าย OPEN / CLOSED */}
                    <div className={`absolute top-2 right-2 transition-all duration-300 ${isOpen ? "translate-x-4 -translate-y-4 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" : "opacity-100"}`}>
                        {isOpen ? (
                          <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-md">
                              OPEN
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-md flex items-center gap-1">
                              <Lock className="w-3 h-3" /> CLOSED
                          </span>
                        )}
                    </div>

                    <div className={`absolute bottom-0 left-0 w-full p-4 transform transition-transform duration-300 ${isOpen ? "translate-y-2 group-hover:translate-y-0" : ""}`}>
                        <h3 className={`font-bold text-lg leading-tight drop-shadow-md transition-colors ${isOpen ? "text-white group-hover:text-pink-400" : "text-slate-300"}`}>
                            {game.title}
                        </h3>
                        <div className={`flex items-center justify-between mt-2 transition-opacity ${isOpen ? "opacity-80 group-hover:opacity-100" : "opacity-50"}`}>
                            <p className="text-slate-300 text-xs font-light">
                                บริการอัตโนมัติ
                            </p>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors ${isOpen ? "bg-white/20 backdrop-blur-sm group-hover:bg-pink-600" : "bg-red-500/20"}`}>
                                {isOpen ? <Gamepad2 className="w-3 h-3" /> : <Lock className="w-3 h-3 text-red-400" />}
                            </div>
                        </div>
                    </div>
                    </div>
                </Link>
            </Reveal>
            ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <h3 className="text-xl font-bold text-white">ยังไม่มีเกมในระบบ</h3>
            <p className="text-slate-400 mt-2">กรุณาเพิ่มเกมผ่านระบบแอดมินหลังบ้าน</p>
        </div>
      )}
    </section>
  );
}