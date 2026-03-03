"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

// ✅ แยก Component ย่อยออกมา เพื่อให้ใช้ useSearchParams() ได้อย่างปลอดภัยตอน Build ขึ้น Vercel
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // ดึง Token จาก URL

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ถ้าไม่มี Token ใน URL ให้ด่าเลยว่าเข้าผิดทาง
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col items-center gap-2 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <p className="font-bold">ลิงก์ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึงหน้านี้ครับ</p>
        </div>
        <Link href="/login" className="inline-block text-pink-400 hover:text-pink-300 font-bold">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับ");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-2">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
        <p className="text-slate-400 text-sm">รหัสผ่านบัญชีของคุณถูกอัปเดตเรียบร้อยแล้ว</p>
        <button
          onClick={() => router.push("/login")}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          ไปหน้าเข้าสู่ระบบ <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6 mt-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-inner">
          <KeyRound className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-slate-400 text-sm mt-2">กรุณาตั้งรหัสผ่านใหม่ที่จำได้ง่ายแต่ปลอดภัย</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm font-bold animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
              placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> กำลังบันทึก...</>
          ) : (
            "เปลี่ยนรหัสผ่าน"
          )}
        </button>
      </form>
    </>
  );
}

// ✅ หน้าหลักครอบด้วย Suspense (บังคับใช้สำหรับ Vercel ป้องกัน Build Error)
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden font-sans selection:bg-pink-500 selection:text-white">
      {/* แสงพื้นหลัง */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_#ec4899]" />
        
        <Suspense fallback={<div className="text-center text-pink-500 py-10"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}