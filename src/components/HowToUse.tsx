"use client";

import { motion } from "framer-motion";
// ✅ เพิ่ม Sparkles เข้ามาใน import
import { Gamepad2, QrCode, Clock, CheckCircle, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "เลือกแพ็กเกจ",
    desc: "เลือกเกมและราคาที่ต้องการ กรอก UID/ID & PASSWORD ให้ถูกต้อง",
    icon: Gamepad2,
    color: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/20",
  },
  {
    id: 2,
    title: "ชำระเงิน",
    desc: "สแกน QR Code  ผ่านแอปธนาคาร - อัพโหลดสลิปยืนยันการชำระเงิน",
    icon: QrCode,
    color: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/20",
  },
  {
    id: 3,
    title: "รอทำรายการ",
    desc: "รอแอดมินเติม 5-30 นาที",
    icon: Clock,
    color: "from-orange-400 to-red-500",
    shadow: "shadow-orange-500/20",
  },
  {
    id: 4,
    title: "เติมสำเร็จ!",
    desc: "เข้าเกมได้เลย! หากมีปัญหาติดต่อแอดมินได้ตลอด 24 ชม.",
    icon: CheckCircle,
    color: "from-green-400 to-emerald-600",
    shadow: "shadow-green-500/20",
  },
];

export default function HowToUse() {
  return (
    <section className="relative py-12 px-4 md:px-8 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container max-w-7xl mx-auto">
        
        {/* ✅ Header พร้อม Badge แบบที่ต้องการ */}
        <div className="text-center mb-16">
            
            {/* ✨ Badge Style */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur-md mb-6 hover:border-blue-400/50 transition-colors cursor-default shadow-lg shadow-blue-900/20">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs md:text-sm font-bold text-blue-400 tracking-widest uppercase">
                    EASY STEPS
                </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4">
                เติมง่ายใน 4 ขั้นตอน
            </h2>
            <p className="text-slate-400 text-sm md:text-lg">
                 รวดเร็ว ปลอดภัย 100% ไม่ต้องรอนาน
            </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
          
          {/* เส้นเชื่อม (Connectors) - ซ่อนในมือถือ */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-blue-500/20 via-orange-500/20 to-green-500/20 -z-10"></div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative group"
            >
              {/* Card Container */}
              <div className="flex flex-col items-center text-center p-6 rounded-3xl border border-white/5 bg-[#0f0f13]/50 backdrop-blur-sm transition-all duration-300 hover:bg-[#1a1a20]/80 hover:border-white/10 hover:-translate-y-2 h-full">
                
                {/* Icon Circle */}
                <div className={`relative mb-6 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.color} shadow-lg ${step.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-2xl`} />
                    
                    {/* Icon */}
                    <step.icon className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10 drop-shadow-md" />

                    {/* Badge Number */}
                    <div className="absolute -top-3 -right-3 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md">
                        {step.id}
                    </div>
                </div>

                {/* Text */}
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                    {step.title}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    {step.desc}
                </p>

                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                    <div className="md:hidden mt-4 text-slate-700">
                        <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                )}
              </div>

              {/* Desktop Arrow */}
              {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-0 text-slate-700/30">
                      <ChevronRight className="w-6 h-6" />
                  </div>
              )}

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}