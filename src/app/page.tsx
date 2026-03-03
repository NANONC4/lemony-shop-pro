import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/home/HeroSection";
import MarqueeBar from "@/components/home/MarqueeBar";
import GameGrid from "@/components/home/GameGrid";
import HowToUse from "@/components/HowToUse";
import Footer from "@/components/Footer";
import FacebookProfile from "@/components/FacebookProfile";
import Reveal from "@/components/Reveal"; // ✅ 1. Import เข้ามา

export const revalidate = 60; // 1. กำหนดให้ Next.js รีเฟรชข้อมูลใหม่ทุก 60 วินาที (ถ้าไม่มีการแก้ไขโค้ด) เพื่อให้ข้อมูลเกมและโปรโมชั่นอัพเดตอยู่เสมอ

export default async function Home() {
  const games = await prisma.game.findMany({ orderBy: { updatedAt: "desc" } });

  let promotions: any[] = [];
  try {
    promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
      where: { isActive: true },
    });
  } catch (e) {
    console.log("Promotion table not found or empty, using default slides.");
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative selection:bg-pink-500 selection:text-white">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[128px]" />
      </div>

      {/* ✅ 1. Hero: ใช้ Scale ขยายใหญ่ เปิดตัวอลังการ */}
      <Reveal direction="scale" duration={0.8}>
        <HeroSection promotions={promotions} />
      </Reveal>

      {/* ✅ 2. Marquee: แค่เฟดมาเฉยๆ (none) ไม่ต้องขยับเยอะ เดี๋ยวลายตา */}
      <Reveal direction="none" delay={0.2}>
        <MarqueeBar />
      </Reveal>

      {/* ✅ 3. How To Use: ให้ไหลมาจาก "ซ้าย" เหมือนเราอ่านหนังสือ */}
      <div className="py-12 md:py-24 relative z-10">
        <Reveal direction="left" duration={0.6}>
          <HowToUse />
        </Reveal>
      </div>

      {/* ✅ 4. Game Grid: ให้ลอย "ขึ้น" มาจากด้านล่าง (ดูสุภาพและเห็นสินค้าชัด) */}
      <section className="w-full py-12 md:py-24 bg-slate-900/40 border-y border-white/5 relative z-10">
        <div className="container mx-auto px-4">
          <Reveal direction="up" duration={0.6}>
            <GameGrid games={games} />
          </Reveal>
        </div>
      </section>

      {/* ✅ 5. Facebook: ให้ลอย "ขึ้น" มาปิดท้าย */}
      <div className="container mx-auto px-4 relative z-10 py-12 md:py-24">
        <Reveal direction="up" delay={0.1}>
          <FacebookProfile />
        </Reveal>
      </div>

     

    </div>
  );
}