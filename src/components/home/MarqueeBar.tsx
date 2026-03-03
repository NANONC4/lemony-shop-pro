"use client";

import { AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function MarqueeBar() {
  return (
    // ปรับความสูงลดลงนิดนึง (h-10) และสีพื้นหลังให้จางลงเพื่อให้ดูกลมกลืน
    <div className="w-full bg-black/40 border-b border-white/5 backdrop-blur-md overflow-hidden flex items-center h-10 relative z-20">
      
      {/* เอฟเฟกต์ไล่สีจางๆ ที่ขอบซ้ายขวา เพื่อให้ตัวหนังสือดูเหมือนลอยออกมาและหายไปอย่างนุ่มนวล */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* ข้อความวิ่ง (CSS Animation) */}
      <div className="flex whitespace-nowrap overflow-hidden w-full">
        <div className="animate-marquee flex items-center gap-12 text-sm text-slate-300 px-4">
            
            {/* ข่าวที่ 1 */}
            <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>สวัสดียินดีต้อนรับสู่ร้าน Lemony Shop</span>
            </span>

            {/* ข่าวที่ 2 */}
            <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-100">ร้านเปิดให้บริการ 10.00 - 00.00</span>
            </span>

            {/* ข่าวที่ 3 */}
            <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 font-bold">
                    Promotion Robux มาแล้ว รีบเติมก่อนหมด!
                </span>
            </span>

             {/* --- (Copy ชุดเดิมมาต่อท้าย เพื่อให้วิ่งวนลูปเนียนๆ) --- */}
            <span className="flex items-center gap-2 text-slate-600">|</span>

            <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>มีปัญหาสามารถติดต่อแอดมินได้ที่ LINE หรือ Facebook</span>
            </span>

            <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-100">เกมอื่นๆทักสอบถามได้ที่ Facebook </span>
            </span>

            <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 font-bold">
                    ติดตามข่าวสารและโปรโมชั่นได้ที่ Facebook และ LINE ของเรา!
                </span>
            </span>
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite; /* ปรับเวลาให้ช้าลงนิดนึงเพื่อให้อ่านทัน */
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* เลื่อนแค่ 50% เพราะเราเบิ้ลข้อความไว้ 2 ชุด */
        }
        
    
      `}</style>
    </div>
  );
}