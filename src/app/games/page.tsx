import { prisma } from "@/lib/prisma"; // ✅ ดึงข้อมูลจริงจาก DB
import GameGrid from "@/components/home/GameGrid"; // ✅ ใช้ Grid ตัวเดิม
import Reveal from "@/components/Reveal"; 

// บังคับให้โหลดข้อมูลใหม่ทุกครั้งที่เข้าหน้า (เหมือนหน้าแรก)
export const dynamic = "force-dynamic";

export default async function GamesPage() {
  // 1. ดึงข้อมูลเกมทั้งหมดจาก Database (เหมือนหน้าแรกเป๊ะ)
  const games = await prisma.game.findMany({ 
    orderBy: { updatedAt: "desc" } 
  });

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-pink-500 selection:text-white pt-28 pb-10">
      
      {/* 🎨 Background Glow (เอามาจากหน้าแรกให้ธีมเหมือนกัน) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* หัวข้อหน้า */}
        <div className="text-center mb-10 space-y-4">
          <Reveal direction="down">
            {/* ✅ แก้ตรงนี้ครับ! เพิ่ม leading-relaxed และ p-2 เพื่อขยายกรอบไม่ให้สระโดนตัด */}
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-relaxed p-2">
              เกม <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 py-2">ทั้งหมด</span>
            </h1>
          </Reveal>
        </div>

        {/* ✅ แสดงรายการเกม (ใช้ GameGrid ตัวเดิม + ข้อมูลจริง) */}
        <Reveal direction="up" delay={0.1}>
           <GameGrid games={games} enableSearch={true} />
        </Reveal>

      </div>
    </div>
  );
}