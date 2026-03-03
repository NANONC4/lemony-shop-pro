"use client";

import { useState, useEffect } from "react";
import { Store, Clock, PowerOff, Save, Loader2 } from "lucide-react";

export default function StoreSettingsPage() {
  const [mode, setMode] = useState("AUTO");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ดึงค่าปัจจุบันจาก Server
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/store/status");
        const data = await res.json();
        if (data.rawSetting) {
          setMode(data.rawSetting.mode);
          setMessage(data.rawSetting.message || "");
        }
      } catch (error) {
        console.error("Error fetching store settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // บันทึกการตั้งค่า
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/store/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: mode,
          openTime: "10:00", // ล็อกตายตัวตามโจทย์ที่คุยกัน
          closeTime: "00:00",
          message: message,
        }),
      });

      if (res.ok) {
        alert("✅ บันทึกการตั้งค่าร้านสำเร็จ!");
      } else {
        alert("❌ ไม่สามารถบันทึกได้ กรุณาลองใหม่");
      }
    } catch (error) {
      alert("Error เชื่อมต่อ Server ไม่ได้");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-white">กำลังโหลดข้อมูลร้าน...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Store className="w-8 h-8 text-pink-500" />
          ระบบเปิด-ปิดร้าน
        </h1>
        <p className="text-slate-400 mb-8">ตั้งค่าสถานะการรับออเดอร์ของ Lemony Shop</p>

        {/* เลือกโหมด */}
        <div className="space-y-4 mb-8">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">เลือกโหมดการทำงาน</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* โหมด OPEN */}
            <button 
              onClick={() => setMode("OPEN")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                mode === "OPEN" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-800 bg-slate-800/50 text-slate-500 hover:border-slate-600"
              }`}
            >
              <Store className="w-6 h-6" />
              <span className="font-bold">เปิดตลอดเวลา</span>
              <span className="text-xs opacity-70">รับออเดอร์ 24 ชม.</span>
            </button>

            {/* โหมด AUTO */}
            <button 
              onClick={() => setMode("AUTO")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                mode === "AUTO" ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-slate-800 bg-slate-800/50 text-slate-500 hover:border-slate-600"
              }`}
            >
              <Clock className="w-6 h-6" />
              <span className="font-bold">อัตโนมัติตามเวลา</span>
              <span className="text-xs opacity-70">เปิด 10:00 - 00:00 น.</span>
            </button>

            {/* โหมด CLOSED */}
            <button 
              onClick={() => setMode("CLOSED")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                mode === "CLOSED" ? "border-red-500 bg-red-500/10 text-red-400" : "border-slate-800 bg-slate-800/50 text-slate-500 hover:border-slate-600"
              }`}
            >
              <PowerOff className="w-6 h-6" />
              <span className="font-bold">ปิดชั่วคราว</span>
              <span className="text-xs opacity-70">ไม่รับออเดอร์ทุกกรณี</span>
            </button>

          </div>
        </div>

        {/* ข้อความประกาศ */}
        <div className="space-y-4 mb-8">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">ข้อความประกาศให้ลูกค้าทราบ</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="เช่น: ขออภัย แอดมินไปกินข้าว 1 ชั่วโมงครับ..."
            className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none min-h-[120px]"
          />
          <p className="text-xs text-slate-500">ข้อความนี้จะไปโชว์ในป้ายประกาศลอย และตรงปุ่มสั่งซื้อ</p>
        </div>

        {/* ปุ่มบันทึก */}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] flex justify-center items-center gap-2 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>

      </div>
    </div>
  );
}