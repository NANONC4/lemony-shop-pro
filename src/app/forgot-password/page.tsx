"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย (หรือ Junk mail)");
      } else {
        setError(data.error || "ไม่พบอีเมลนี้ในระบบ หรือเกิดข้อผิดพลาด");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden font-sans selection:bg-pink-500 selection:text-white">
      
      {/* แสงพื้นหลัง */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_#ec4899]" />
        
        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-inner">
            <KeyRound className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ลืมรหัสผ่าน?</h1>
          <p className="text-slate-400 text-sm mt-2">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm font-bold animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center space-y-6">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex flex-col items-center gap-3 text-green-400">
              <CheckCircle2 className="w-10 h-10" />
              <p className="text-sm font-bold leading-relaxed">{message}</p>
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 text-pink-400 font-bold hover:text-pink-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Email <span className="text-red-400">*</span></label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  placeholder="กรอกอีเมลที่ใช้สมัครบัญชี"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> กำลังส่งอีเมล...</>
              ) : (
                "ส่งลิงก์รีเซ็ตรหัสผ่าน"
              )}
            </button>

            <div className="text-center mt-6">
              <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 text-sm hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}