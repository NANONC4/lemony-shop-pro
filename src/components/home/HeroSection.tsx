"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Reveal from "@/components/Reveal";

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

export default function HeroSection({ promotions }: { promotions: any[] }) {
  const SLIDES = promotions || [];
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = SLIDES.length > 0 ? Math.abs(page % SLIDES.length) : 0;

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  useEffect(() => {
    if (SLIDES.length === 0) return;
    const timer = setInterval(() => paginate(1), 7000);
    return () => clearInterval(timer);
  }, [paginate, SLIDES.length]);

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) paginate(1);
    else if (swipe > swipeConfidenceThreshold) paginate(-1);
  };

  if (SLIDES.length === 0) return null;

  return (
    <section className="relative w-full h-[500px] md:h-[600px] pt-16 md:pt-20 overflow-hidden bg-black cursor-grab active:cursor-grabbing select-none">
      
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

      <div className="relative z-10 w-full h-full container mx-auto px-0 md:px-12">
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
            className="relative w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between"
          >
            
            {/* 🖼️ Image Section */}
            <div className="w-full md:w-1/2 h-full flex items-center justify-center px-4 md:px-0">
                <Reveal direction="scale" duration={0.5} delay={0.1} width="100%">
                    <div className="relative w-full max-w-[380px] sm:max-w-[450px] md:max-w-none h-[350px] md:h-[450px] mx-auto"> 
                        <Image 
                            src={SLIDES[imageIndex].imageUrl} 
                            alt={SLIDES[imageIndex].title || "Promotion"}
                            fill
                            className="object-contain md:drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                            priority
                            unoptimized
                        />
                    </div>
                </Reveal>
            </div>

            {/* 📝 Text Section (แสดงเฉพาะในคอม ซ่อนในมือถือ) */}
            <div className="hidden md:flex md:w-1/2 flex-col items-start text-left pl-8">
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
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button 
            key={i}
            onClick={() => setPage([page + (i - imageIndex), i - imageIndex])}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === imageIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>
    </section>
  );
}