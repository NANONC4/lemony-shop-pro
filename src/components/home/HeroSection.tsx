"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Reveal from "@/components/Reveal";
// ❌ ลบ TextReveal ออก ไม่ใช้แล้ว

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

export default function HeroSection({ promotions }: { promotions: any[] }) {
  const SLIDES = promotions && promotions.length > 0 ? promotions : [
    { id: 1, imageUrl: "/Promo.JPG", title: "Robux เรท 10 คุ้มที่สุด!", description: "เติมไว ได้จริง ปลอดภัย 100% ระบบอัตโนมัติ 24 ชม." },
    { id: 2, imageUrl: "/rov.JPG", title: "RoV คูปองลด 30%", description: "สกินใหม่มาแรงต้องจัด! เติมปุ๊บเข้าปั๊บ รับประกันไม่โดนแบน" }
  ];

  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = Math.abs(page % SLIDES.length);

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 7000);
    return () => clearInterval(timer);
  }, [paginate]);

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) paginate(1);
    else if (swipe > swipeConfidenceThreshold) paginate(-1);
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-black cursor-grab active:cursor-grabbing select-none">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.35) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.35) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(147, 51, 234, 0.2) 0px, transparent 50%),
            #000000
          `
        }}
      >
        <div className="absolute inset-0 opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full h-full container mx-auto px-4 md:px-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
              center: { zIndex: 1, x: 0, opacity: 1 },
              exit: (d: number) => ({ zIndex: 0, x: d < 0 ? "100%" : "-100%", opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="relative w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between pt-12 md:pt-0"
          >
            
            {/* 🖼️ Image Section */}
            <div className="w-full md:w-1/2 h-full flex items-center justify-center">
                {/* ✅ แก้ไข: ใช้ Reveal ครอบ div ที่มีความสูง (h-[450px]) ไม่ใช่ครอบ Image โดยตรง */}
                <Reveal direction="scale" duration={0.5} delay={0.1} width="100%">
                    <div className="relative w-full h-[250px] md:h-[450px]"> 
                        <Image 
                            src={SLIDES[imageIndex].imageUrl} 
                            alt="Promo"
                            fill
                            className="object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                            priority
                            unoptimized
                        />
                    </div>
                </Reveal>
            </div>

            {/* 📝 Text Section */}
            <div className="hidden md:flex md:w-1/2 flex-col items-start text-left pl-8">
                
                {/* ✅ แก้ไข: ใช้ Reveal ครอบข้อความธรรมดา (เลิกใช้ TextReveal) */}
                <Reveal direction="right" delay={0.3} duration={0.6}>
                    <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                        {SLIDES[imageIndex].title}
                    </h1>
                </Reveal>
                
                <Reveal direction="up" delay={0.5} duration={0.6}>
                    <p className="text-slate-400 text-xl max-w-md">
                      {SLIDES[imageIndex].description}
                    </p>
                </Reveal>

            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button 
            key={i}
            onClick={() => setPage([page + (i - imageIndex), i - imageIndex])}
            className={`h-1 rounded-full transition-all duration-300 ${i === imageIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'}`}
          />
        ))}
      </div>
    </section>
  );
}