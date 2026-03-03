"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useRef, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "none";
  overflow?: "hidden" | "visible";
  // ✅ 1. เพิ่มบรรทัดนี้: เพื่อให้ TypeScript ไม่แดง เวลาส่ง className มา
  className?: string; 
}

export default function Reveal({ 
  children, 
  width = "100%", 
  delay = 0.25, 
  duration = 0.5,
  direction = "up",
  overflow = "hidden",
  // ✅ 2. รับค่า className เข้ามา (ถ้าไม่ส่งมา ให้เป็นค่าว่าง "")
  className = "" 
}: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    } else {
      mainControls.start("hidden");
    }
  }, [isInView, mainControls]);

  const getVariants = () => {
    const distance = 50; 
    switch (direction) {
      case "up":    return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } };
      case "down":  return { hidden: { opacity: 0, y: -distance }, visible: { opacity: 1, y: 0 } };
      case "left":  return { hidden: { opacity: 0, x: -distance }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { opacity: 0, x: distance }, visible: { opacity: 1, x: 0 } };
      case "scale": return { hidden: { opacity: 0, scale: 0.8 },  visible: { opacity: 1, scale: 1 } };
      case "none":  return { hidden: { opacity: 0 },              visible: { opacity: 1 } };
      default:      return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    // ✅ 3. เอา className มาแปะตรงนี้ 
    // (Logic: style ยังคุม width/overflow เหมือนเดิม ไม่เบี้ยวแน่นอน แต่ยอมให้ className จากข้างนอกมาผสมด้วย)
    <div ref={ref} style={{ position: "relative", width, overflow }} className={className}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration, delay: delay, type: "spring", stiffness: 50 }}
      >
        {children}
      </motion.div>
    </div>
  );
}