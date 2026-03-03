"use client";

import { useState } from "react";

const MOCK_PROMOTIONS = [
  {
    id: 1,
    title: "เติม Robux เรท 10",
    description: "คุ้มที่สุดในตลาด ปลอดภัย 100%",
    // รูป Robux ตารางๆ ของคุณ
    imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1000&auto=format&fit=crop", 
    isHot: true,
  },
  {
    id: 2,
    title: "Valorant Points",
    description: "โปรโมชั่นเฉพาะเดือนนี้เท่านั้น",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    isHot: false,
  },
  {
    id: 3,
    title: "Genshin Impact",
    description: "แถมโบนัสคริสตัล 2 เท่า",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop",
    isHot: true,
  },
];

export default function PromotionSlider() {
  const [promotions] = useState(MOCK_PROMOTIONS);

  return (
    <section className="mb-20">
      <div className="flex items-center gap-3 mb-6 px-4 md:px-0">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <div>
           <h2 className="text-2xl md:text-3xl font-bold text-white">โปรโมชั่นแนะนำ</h2>
           <p className="text-slate-400 text-sm">ดีลสุดพิเศษที่เราคัดมาเพื่อคุณ</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {promotions.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-[85vw] md:w-[600px] snap-center">
            
            <div className="aspect-[21/9] bg-slate-900 rounded-2xl overflow-hidden border border-white/10 relative group cursor-pointer shadow-xl">
              
              {/* 1. Background Layer (พื้นหลังเบลอๆ) */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />

              {/* 2. Dark Overlay */}
              <div className="absolute inset-0 bg-black/60" />

              {/* 3. ✅ แก้ใหม่: ใช้ Flexbox จัดกลาง แทนการบังคับ full width */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  // ✨ ท่าไม้ตาย: 
                  // max-w-full = กว้างได้มากสุดเท่ากรอบ (ห้ามเกิน)
                  // max-h-full = สูงได้มากสุดเท่ากรอบ (ห้ามเกิน)
                  // w-auto h-auto = ให้รักษาสัดส่วนรูปเดิมไว้
                  className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl z-10 rounded-lg"
                />
              </div>

              {/* 4. ข้อความ (Text) */}
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 z-20 pointer-events-none">
                <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                    {item.title}
                </h3>
                <p className="text-slate-300 text-sm opacity-90 line-clamp-1">
                    {item.description}
                </p>
              </div>

              {/* Hot Deal Badge */}
              {item.isHot && (
                <div className="absolute top-4 right-4 z-30">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-red-400/30 animate-pulse">
                    🔥 HOT
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}