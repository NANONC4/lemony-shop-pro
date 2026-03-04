"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react"; // ✅ นำเข้า useSession
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Gamepad2, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { status } = useSession(); // ✅ เช็คสถานะการล็อกอิน
  const router = useRouter();
  
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 

  // ✅ ถ้าล็อกอินอยู่แล้ว ให้โชว์หน้าต่าง Popup กลางจอ แล้วพากลับหน้าแรก
  if (status === "authenticated") {
    setTimeout(() => {
      router.push("/");
    }, 2500); // หน่วงเวลา 2.5 วินาทีให้ลูกค้าอ่านข้อความก่อนเด้งกลับ

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden font-sans selection:bg-pink-500 selection:text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-white/10 text-center relative z-10 animate-in fade-in zoom-in duration-300">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_#10b981]" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">คุณเข้าสู่ระบบอยู่แล้ว</h2>
          <p className="text-slate-400 text-sm mb-8 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> กำลังพากลับไปยังหน้าแรก...
          </p>
          
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold transition-colors"
          >
            กลับหน้าแรกทันที
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username: form.username,
        password: form.password,
      });

      if (res?.error) {
        setError("รหัสผ่านไม่ถูกต้อง หรือไม่พบชื่อผู้ใช้นี้");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden font-sans selection:bg-pink-500 selection:text-white pb-10 pt-20">
      
      {/* แสงด้านหลัง (Glow Effect) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* กล่อง Login */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_#ec4899]" />
        
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-inner">
            <Gamepad2 className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-slate-400 text-sm mt-2">ยินดีต้อนรับกลับสู่ Lemony Shop</p>
        </div>

        {/* ✅ แสดง Error Box เมื่อพิมพ์รหัสผิด */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm font-bold animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Username / Email</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="ชื่อผู้ใช้งาน หรือ อีเมล"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1 pr-1">
              <label className="block text-sm font-bold text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> กำลังตรวจสอบ...</>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>

        <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-400 font-medium">หรือเข้าสู่ระบบด้วย</span>
            </div>
        </div>

        <div className="mt-6">
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center px-4 py-3.5 border border-white/10 rounded-xl bg-white text-sm font-bold text-slate-900 hover:bg-slate-200 transition shadow-lg hover:-translate-y-0.5"
            >
                <img 
                    className="h-5 w-5 mr-3" 
                    src="https://www.svgrepo.com/show/475656/google-color.svg" 
                    alt="Google" 
                />
                เข้าสู่ระบบด้วย Google
            </button>
        </div>

        <p className="text-center mt-8 text-sm text-slate-400">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-pink-400 font-bold hover:text-pink-300 transition-colors">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}