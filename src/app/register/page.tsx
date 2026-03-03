"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Mail, UserPlus, Gamepad2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", email: "" });
  const [loading, setLoading] = useState(false);
  
  // ✅ เพิ่ม State จัดการ Error และ Success
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // เช็ครหัสผ่านให้ตรงกันก่อน
    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับ");
      return;
    }

    if (form.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          email: form.email
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // ดีเลย์ 2 วินาทีให้ลูกค้าอ่านข้อความสำเร็จก่อน แล้วค่อยเด้งไปหน้า Login
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "ไม่สามารถสมัครสมาชิกได้ ชื่อผู้ใช้นี้อาจมีคนใช้แล้ว");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden font-sans selection:bg-pink-500 selection:text-white pb-10 pt-20">
      
      {/* แสงพื้นหลัง */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* กล่อง Form สมัครสมาชิก */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_#ec4899]" />
        
        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-inner">
            <UserPlus className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">สมัครสมาชิก</h1>
          <p className="text-slate-400 text-sm mt-2">เข้าร่วมเป็นส่วนหนึ่งของ Lemony Shop</p>
        </div>

        {/* ✅ กล่องแจ้งเตือน Error */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm font-bold animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ✅ กล่องแจ้งเตือน Success */}
        {success && (
          <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-400 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>สมัครสมาชิกสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Username <span className="text-red-400">*</span></label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="ตั้งชื่อผู้ใช้งาน (สำหรับ Login)"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={loading || success}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Email <span className="text-slate-500 font-normal">(ไม่บังคับ)</span></label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="example@mail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading || success}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="ตั้งรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading || success}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Confirm Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                disabled={loading || success}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> กำลังสมัครสมาชิก...</>
            ) : success ? (
              <><CheckCircle2 className="w-5 h-5" /> สำเร็จแล้ว!</>
            ) : (
              <><UserPlus className="w-5 h-5" /> ยืนยันการสมัคร</>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-pink-400 font-bold hover:text-pink-300 transition-colors">
            เข้าสู่ระบบเลย
          </Link>
        </p>
      </div>
    </div>
  );
}