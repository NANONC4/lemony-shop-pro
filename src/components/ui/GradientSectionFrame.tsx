import React, { ReactNode } from 'react';

interface GradientSectionFrameProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const GradientSectionFrame: React.FC<GradientSectionFrameProps> = ({ children, className = "", id }) => {
  return (
    // ✅ 1. Wrapper หลัก: w-full (กว้างเต็มจอ), bg-[#0f0b1e] (สีพื้นหลังทึบ), ตัดขอบบนล่างด้วย border
    <div 
      id={id} 
      className={`relative w-full py-20 my-10 bg-[#0f0b1e] border-y border-white/5 transform-gpu ${className}`}
    >

      {/* === 🔖 Layer 1: แถบสี "สันที่คั่นหนังสือ" (ด้านซ้ายสุด) === */}
      {/* ลากยาวจากบนลงล่าง ชิดขอบซ้ายจอเลย */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 md:w-2 bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] z-20" />

      {/* === 🌌 Layer 2: Decoration (แสงเงาพื้นหลัง) === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* แสง Gradient จางๆ ให้แถบนี้ดูไม่แบนเกินไป */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-900/10 to-transparent opacity-50" />
        
        {/* แสงฟุ้งมุมขวาล่าง */}
        <div className="absolute -bottom-[50%] -right-[10%] w-[50%] h-[200%] bg-blue-900/10 blur-[100px] rounded-full transform -rotate-12" />
      </div>

      {/* === 🎮 Layer 3: Content (เนื้อหา) === */}
      {/* เนื้อหาจะยังคงอยู่ตรงกลาง (Container) ตามปกติ */}
      <div className="container mx-auto px-4 relative z-10">
        {children}
      </div>

    </div>
  );
};

export default GradientSectionFrame;