"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase"; // ✅ ดึง Supabase มาเป็นวิทยุสื่อสาร

export default function StoreStatusBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/store/status");
      const data = await res.json();
      setIsOpen(data.isOpen);
      setMessage(data.message);
    } catch (err) {
      console.error("Failed to fetch store status");
    }
  };

  useEffect(() => {
    // 1. เช็คสถานะ 1 ครั้งตอนลูกค้าเพิ่งโหลดเข้าเว็บมาใหม่ๆ
    checkStatus();

    // 2. 🟢 ไม้ตายลับ: ดักฟังวิทยุสื่อสารจาก Supabase Realtime
    // พอแอดมินกดปิด/เปิดร้านปุ๊บ สัญญาณจะส่งมาเข้าบล็อกนี้ทันทีใน 0.1 วิ!
    const channel = supabase
      .channel('store-setting-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'StoreSetting' },
        (payload) => {
          // ทราบแล้วเปลี่ยน! มีแอดมินเปลี่ยนสถานะร้าน สั่งอัปเดตป้ายเดี๋ยวนี้!
          checkStatus(); 
        }
      )
      .subscribe();

    // 3. ตั้งเวลาเช็คเบาๆ ทุก 30 วินาที 
    // (เอาไว้รองรับโหมด AUTO เช่น พอถึงเวลา 10.00 น. ป้ายจะได้หายไปเองโดยไม่ต้องมีใครไปกดปุ่ม)
    const interval = setInterval(checkStatus, 30000); 

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (isOpen) return null; 

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-red-500/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(239,68,68,0.4)] border border-red-400/50 flex items-center gap-3.5 max-w-xs md:max-w-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-inner">
          <AlertCircle className="w-5 h-5 text-white" />
        </span>
        <div className="flex flex-col">
          <h4 className="text-sm font-black tracking-wide">ร้านปิดให้บริการชั่วคราว</h4>
          <p className="text-xs text-red-100 mt-0.5 leading-snug font-medium">
            {message || "ขออภัย ปิดทำการในขณะนี้ กรุณารอแอดมินเปิดระบบครับ"}
          </p>
        </div>
      </div>
    </div>
  );
}