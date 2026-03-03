"use client";

import { useRef } from "react";
import { Code2, Target, Rocket, Cpu, Terminal } from "lucide-react";
import { motion, useScroll, useSpring, Variants } from "framer-motion";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 80%"] 
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // ตั้งค่า Animation มาตรฐานให้ออกมาเหมือนกันทุกกล่อง (โผล่ขึ้นมาและจางหายไปได้เรื่อยๆ)
  const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 pt-32 pb-20 relative selection:bg-pink-500 selection:text-white font-sans overflow-hidden">
      
      {/* Background Glow จางๆ */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-8 max-w-3xl relative z-10">
        
        {/* --- ส่วนหัว --- */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }} // once: false คือให้ทำซ้ำได้เรื่อยๆ
          variants={fadeUpVariant}
          className="mb-12 pb-8 border-b border-white/10 text-center md:text-left"
        >
          {/* ✅ เอา ~/about/developer-story ออกไปแบบถาวรแล้วครับ! */}
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Developer Story
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            เรื่องราวการพัฒนา <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-bold">Lemony Shop Pro</span>
          </p>
        </motion.div>

        {/* --- เนื้อหาหลัก (Timeline) --- */}
        <div 
          ref={containerRef} 
          className="relative pl-8 md:pl-12 ml-4 border-l-2 border-white/10 pb-10"
        >
          {/* เส้นแสงไฟ (Scroll Indicator) */}
          <motion.div 
            className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 origin-top shadow-[0_0_10px_rgba(168,85,247,0.5)] z-0"
            style={{ scaleY }}
          />

          {/* Section 1: แนะนำตัว */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-15%" }}
            variants={fadeUpVariant}
            className="relative mb-16 group"
          >
            <div className="absolute -left-[49px] md:-left-[65px] top-1 w-8 h-8 rounded-full bg-[#050505] border-2 border-slate-700 flex items-center justify-center group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-500 z-10">
                <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform" />
            </div>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-slate-300">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                สวัสดีครับ ผม "ฉัตรชัย ด่านรุ่งเรือง" 👋
              </h2>
              <p>
                ปัจจุบันผมกำลังศึกษาอยู่ในคณะ <strong>อินเตอร์แอคทีฟและเกมดีไซน์ (Interactive and Game Design)</strong> ด้วยความหลงใหลในการพัฒนาเว็บไซต์ ผมจึงเริ่มต้นศึกษาโครงสร้างการเขียนโปรแกรม Web Development ด้วยตัวเองจากศูนย์ และได้พัฒนาเว็บไซต์นี้ขึ้นมาเพื่อใช้เป็น Portfolio ครับ
              </p>
            </div>
          </motion.div>

          {/* Section 2: ทำเว็บยังไง */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-15%" }}
            variants={fadeUpVariant}
            className="relative mb-16 group"
          >
            <div className="absolute -left-[49px] md:-left-[65px] top-1 w-8 h-8 rounded-full bg-[#050505] border-2 border-slate-700 flex items-center justify-center group-hover:border-purple-500 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all duration-500 z-10">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-slate-300">
              <h3 className="text-xl font-bold text-purple-400">การพัฒนาเอง</h3>
              <p>
                เว็บไซต์นี้เป็นโปรเจ็กต์ที่ผมฝึกออกแบบและพัฒนาขึ้นมาเองจาก 0 โดยไม่ได้เรียนจากหลักสูตรโดยตรง ทั้งระบบหน้าบ้าน (Frontend) ระบบหลังบ้าน (Backend) รวมไปถึงการเชื่อมต่อ API ต่างๆ อาศัยการหาข้อมูลโครงสร้างด้วยตัวเอง และได้ผู้ช่วยอย่าง <strong>Gemini AI</strong> เข้ามามีส่วนช่วยในการให้คำปรึกษาด้านการเขียนโค้ดและแนะนำแนวทางการพัฒนาระบบครับ
              </p>
            </div>
          </motion.div>

          {/* Section 3: สเกลและระบบ */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-15%" }}
            variants={fadeUpVariant}
            className="relative mb-16 group"
          >
            <div className="absolute -left-[49px] md:-left-[65px] top-1 w-8 h-8 rounded-full bg-[#050505] border-2 border-slate-700 flex items-center justify-center group-hover:border-cyan-500 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-500 z-10">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-slate-300">
              <h3 className="text-xl font-bold text-cyan-400">ขยายสเกลเพื่อใช้งานจริง</h3>
              <p>
                โปรเจ็กต์นี้ได้รับการอัปเกรดและต่อยอดจากระบบเวอร์ชันแรก สู่การประยุกต์ใช้เทคโนโลยีที่ทันสมัยยิ่งขึ้น ได้แก่ <strong className="text-white">Next.js, Framer Motion, Prisma</strong> และระบบฐานข้อมูล <strong className="text-white">Supabase (PostgreSQL)</strong> 
              </p>
              <p>
                เป้าหมายหลักคือการสร้างแพลตฟอร์มที่ <strong>ใช้งานได้จริง</strong> เพื่อมารองรับธุรกิจรับเติมเกมผ่านทาง Facebook ที่ผมดำเนินการอยู่แล้วให้มีประสิทธิภาพมากยิ่งขึ้น โดยเว็บไซต์นี้จะช่วยอำนวยความสะดวกในฝั่งการรับข้อมูลหน้าบ้าน
              </p>
              <div className="p-4 mt-2 bg-pink-500/5 border border-pink-500/20 rounded-xl">
                <p className="text-sm md:text-base text-pink-200">
                  <span className="font-bold text-pink-400">🔒 Security Note:</span> แต่ในส่วนของความปลอดภัย <strong>ทุกออเดอร์ยังคงเป็นการดูแลโดยผมเอง</strong> เพื่อให้ลูกค้ามั่นใจได้สูงสุดครับ
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 4: เป้าหมาย */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-15%" }}
            variants={fadeUpVariant}
            className="relative mb-4 group"
          >
            <div className="absolute -left-[49px] md:-left-[65px] top-1 w-8 h-8 rounded-full bg-[#050505] border-2 border-slate-700 flex items-center justify-center group-hover:border-orange-500 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.6)] transition-all duration-500 z-10">
                <Target className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-slate-300">
              <h3 className="text-xl font-bold text-orange-400">เป้าหมาย & โอกาส</h3>
              <p>
                ปัจจุบัน เว็บไซต์นี้ถูกจัดทำขึ้นเพื่อเป็นแฟ้มสะสมผลงาน (Portfolio) สำหรับยื่นนำเสนอผลงาน โดยผมกำลังมองหาโอกาสใน <strong>การฝึกงาน (Internship)</strong> ในสายงาน Web Development หรือ Game Design และ <strong className="text-white font-bold underline decoration-white/20 underline-offset-4">เปิดรับงาน Freelance</strong> เพื่อฝึกฝนและเก็บเกี่ยวประสบการณ์เพิ่มเติมครับ 
              </p>
            </div>
          </motion.div>

        </div>

        {/* --- Tech Stack Section --- */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          variants={fadeUpVariant}
          className="mt-8 pt-8 border-t border-white/10"
        >
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> เทคโนโลยีที่ใช้พัฒนาระบบนี้ (Tech Stack)
          </h4>
          <div className="flex flex-wrap gap-3">
            {['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Prisma ORM', 'PostgreSQL', 'NextAuth', 'Gemini AI'].map((tech, i) => (
              <span key={i} className="px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-xs md:text-sm font-bold text-slate-400 hover:text-white hover:border-white/30 transition-all cursor-default shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer เล็กๆ */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          variants={fadeUpVariant}
          className="mt-12 text-center md:text-left bg-white/5 p-4 rounded-xl border border-white/5"
        >
          <p className="text-sm text-slate-400 italic">
            *หากการใช้งานเว็บไซต์มีข้อผิดพลาด (Bug) หรือดีไซน์จุดใดที่ยังไม่สมบูรณ์ ผมต้องขออภัยมา ณ ที่นี้ และยินดีรับฟังทุกคำติชมเพื่อนำไปพัฒนาต่อครับ
          </p>
        </motion.div>

      </div>
    </div>
  );
}