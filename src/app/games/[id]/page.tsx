import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCheck, HeartHandshake, Sparkles, Gamepad2, Coins, Zap, Swords } from "lucide-react"; 
import GameShopClient from "@/components/GameShopClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const gameId = parseInt(id);
  
  const gameRaw = await prisma.game.findFirst({
    where: {
        OR: [
            ...(isNaN(gameId) ? [] : [{ id: gameId }]),
            { slug: id }
        ]
    },
    include: {
      products: { orderBy: { price: "asc" } },
    },
  });

  if (!gameRaw) return notFound();

  const gamePayload = {
    ...gameRaw,
    products: gameRaw.products.map((p) => ({
      ...p,
      price: Number(p.price),
      cost: Number(p.cost || 0),
    })),
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-pink-500 selection:text-white pb-20 overflow-x-hidden">
      
      {/* ------------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* ------------------------------------------------------- */}
      <div className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden border-b border-white/5">
        
        {/* 🎨 Layer 0: Background Gradient */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.25) 0px, transparent 50%),   /* ฟ้า ซ้ายบน */
                radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.25) 0px, transparent 50%),  /* ม่วง ขวาบน */
                radial-gradient(at 0% 100%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),  /* ชมพู ซ้ายล่าง */
                radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), /* ฟ้า ขวาล่าง */
                #050505
              `
            }}
        />

        {/* 🎮 Layer 1: Floating Icons */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {/* ซ้าย */}
            <div className="absolute top-10 -left-10 md:left-10 opacity-[0.05] rotate-[-15deg] animate-pulse">
                <Gamepad2 className="w-48 h-48 md:w-64 md:h-64 text-white blur-[2px]" />
            </div>
            <div className="absolute bottom-20 left-10 md:left-32 opacity-[0.1] text-pink-500 rotate-[10deg] animate-bounce duration-[4000ms]">
                <Swords className="w-16 h-16 md:w-20 md:h-20 blur-[1px]" />
            </div>

            {/* ขวา */}
            <div className="absolute top-20 -right-10 md:right-10 opacity-[0.05] rotate-[15deg]">
                <Coins className="w-48 h-48 md:w-60 md:h-60 text-yellow-400 blur-[2px]" />
            </div>
            <div className="absolute bottom-10 right-10 md:bottom-20 md:right-32 opacity-[0.08] text-blue-400 rotate-[-10deg] animate-pulse">
                <ShieldCheck className="w-24 h-24 md:w-32 md:h-32 blur-[1px]" />
            </div>

            {/* ทั่วไป */}
            <div className="absolute top-1/4 right-1/3 opacity-[0.15] text-purple-400">
                <Sparkles className="w-10 h-10 animate-spin duration-[8000ms]" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 opacity-[0.1] text-yellow-300">
                <Zap className="w-8 h-8 animate-pulse" />
            </div>
        </div>

        {/* 🎨 Layer 2: Noise */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-0 pointer-events-none" />


        {/* ✅ ปุ่มย้อนกลับ (ขยับลงมาหลบ Navbar ให้กดง่ายขึ้น) */}
        <div className="absolute top-20 left-4 md:top-24 md:left-8 z-40">
             <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-[#0a0a0a]/50 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 group text-sm font-medium shadow-lg">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                <span>หน้าหลัก</span>
             </Link>
        </div>


        {/* --- Content Container (Center Aligned) --- */}
        <div className="relative z-10 container max-w-4xl mx-auto px-6 text-center space-y-8 py-16">
            
            {/* ข้อความหลัก */}
            <div className="space-y-6">
                 {/* ชื่อเกม */}
                 <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
                    {gameRaw.title}
                 </h1>

                 {/* Badges */}
                 <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-full text-pink-300 font-bold backdrop-blur-md text-sm shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                        <UserCheck className="w-4 h-4" />
                        <span>มีแอดมินดูแล</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-300 font-medium backdrop-blur-md text-sm shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <HeartHandshake className="w-4 h-4" />
                        <span>บริการเป็นกันเอง</span>
                    </div>
                 </div>
            </div>

            {/* คำโปรย */}
            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
               เลือกแพ็กเกจที่ถูกใจ กรอกข้อมูลให้ครบถ้วน แล้วรอเติมของได้เลย <br className="hidden md:block"/>
               <span className="text-white font-medium">แอดมินเติมเองกับมือทุกออเดอร์</span> ปลอดภัย หายห่วง
            </p>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* 2. CONTENT SECTION */}
      {/* ------------------------------------------------------- */}
      <div className="container max-w-5xl mx-auto px-4 relative z-10 mt-8">
         <GameShopClient game={gamePayload} />
      </div>

    </div>
  );
}