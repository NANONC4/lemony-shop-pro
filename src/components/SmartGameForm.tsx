"use client";

import { useState } from "react";
import { User, Key, Mail, Info, Gamepad2 } from "lucide-react";

interface SmartGameFormProps {
  gameType: string; 
  selectedPackage: any | null; // รับข้อมูลแพ็กเกจที่เลือกมาโชว์
  onSubmit: (formData: any) => void;
  loading: boolean;
}

export default function SmartGameForm({ gameType, selectedPackage, onSubmit, loading }: SmartGameFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    uid: "",
    email: "",
    note: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) {
      alert("กรุณาเลือกแพ็กเกจราคาก่อนครับ");
      return;
    }
    onSubmit(formData);
  };

  // ถ้ายังไม่เลือกราคา ให้แสดงข้อความบอก
  if (!selectedPackage) {
    return (
      <div className="mt-8 p-8 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-500">
        👆 กรุณาเลือก <strong>แพ็กเกจราคา</strong> ด้านบนก่อนกรอกข้อมูลครับ
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        📝 กรอกข้อมูลสำหรับ: <span className="text-yellow-600">{selectedPackage.name}</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 1. ROBLOX FORM */}
        {gameType.includes("roblox") && (
          <>
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-200 flex gap-2">
              <Info className="w-5 h-5 shrink-0" />
              <span>อย่าลืมปิด <strong>2-Step Verification</strong> ก่อนเติมนะครับ</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input name="username" required placeholder="Roblox Username" onChange={handleChange}
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none" />
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="password" name="password" required placeholder="Roblox Password" onChange={handleChange}
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none" />
              </div>
            </div>
          </>
        )}

        {/* 2. ROV FORM */}
        {gameType.includes("rov") && (
          <>
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-200 flex gap-2">
              <Info className="w-5 h-5 shrink-0" />
              <span>ใช้แค่ <strong>OpenID</strong> (ดูในตั้งค่าเกม) ปลอดภัย ไม่ต้องขอรหัสผ่าน</span>
            </div>
            <div className="relative">
              <Gamepad2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input name="uid" required placeholder="กรอก OpenID" onChange={handleChange}
                className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
          </>
        )}

        {/* 3. DISCORD / OTHER FORM */}
        {!gameType.includes("roblox") && !gameType.includes("rov") && (
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input name="email" required placeholder="Email / Discord ID / เบอร์โทร" onChange={handleChange}
              className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-400 outline-none" />
          </div>
        )}

        {/* ปุ่มชำระเงิน */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 bg-yellow-400 text-yellow-900 font-bold py-4 rounded-xl hover:bg-yellow-500 transition-all shadow-md active:scale-95 disabled:opacity-50 text-lg"
        >
          {loading ? "⏳ กำลังสร้างรายการ..." : `ชำระเงิน ${Number(selectedPackage.price).toLocaleString()} บาท`}
        </button>

      </form>
    </div>
  );
}