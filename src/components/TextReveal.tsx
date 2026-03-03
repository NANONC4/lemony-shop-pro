"use client";

import { motion, useInView, useAnimation, Variants } from "framer-motion";
import { useRef, useEffect } from "react";

interface Props {
  children: string;    // ข้อความที่จะใส่
  className?: string;  // เอาไว้ใส่พวก text-4xl font-bold
  delay?: number;      // เริ่มเล่นเมื่อไหร่ (วินาที)
  stagger?: number;    // ระยะห่างระหว่างตัวอักษร (ยิ่งน้อยยิ่งเร็ว)
}

export default function TextReveal({ 
  children, 
  className = "", 
  delay = 0, 
  stagger = 0.03 // ค่าเริ่มต้น 0.03 วิ ต่อตัวอักษร (กำลังสวย)
}: Props) {
  const ref = useRef(null);
  // once: false = ให้เล่นซ้ำเวลาเลื่อนกลับมาเจอ
  const isInView = useInView(ref, { once: false, margin: "-10%" }); 
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  // แยกข้อความเป้นตัวอักษร
  const characters = Array.from(children);

  // ท่าแม่: คุมจังหวะการปล่อยตัวลูก
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  // ท่าลูก: ท่าที่จะเล่นของแต่ละตัวอักษร
  const charVariants: Variants = {
    hidden: { opacity: 0, y: 20 }, // เริ่มต้น: จาง + อยู่ต่ำกว่าปกตินิดนึง
    visible: {
        opacity: 1,
        y: 0, // สิ้นสุด: ชัด + กลับที่เดิม
        transition: { type: "spring", damping: 12, stiffness: 100 } // เด้งดึ๋งนิดๆ
    },
  };

  return (
    // ใช้ motion.div หรือ h1, h2 แล้วแต่จะเอาไปครอบอะไร (ในที่นี้ใช้ div แทนบล็อกข้อความ)
    <motion.div 
      ref={ref}
      className={className} 
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      style={{ whiteSpace: "pre-wrap" }} // สำคัญ! ทำให้เว้นวรรคไม่หาย
    >
      {characters.map((char, index) => (
        // render ตัวอักษรทีละตัว
        <motion.span variants={charVariants} key={index} className="inline-block">
          {char === " " ? "\u00A0" : char} {/* ถ้าเป็นช่องว่าง ให้ใช้ space พิเศษ ไม่งั้นมันจะแฟบ */}
        </motion.span>
      ))}
    </motion.div>
  );
}