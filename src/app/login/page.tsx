"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User } from "lucide-react";
import Image from "next/image"; // ✅ เพิ่ม Image เพื่อโหลดโลโก้

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username: form.username,
        password: form.password,
      });

      if (res?.error) {
        alert("รหัสผ่านไม่ถูกต้อง หรือไม่พบชื่อผู้ใช้นี้");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">เข้าสู่ระบบ</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ชื่อผู้ใช้งาน"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="รหัสผ่าน"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "กำลังโหลด..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* ✅ ส่วนที่เพิ่ม: Social Login */}
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">หรือเข้าสู่ระบบด้วย</span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                    {/* ใช้รูป SVG ออนไลน์ เพื่อความสะดวก */}
                    <img 
                        className="h-5 w-5 mr-2" 
                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                        alt="Google" 
                    />
                    Google
                </button>

                <button
                    type="button"
                    onClick={() => signIn("facebook", { callbackUrl: "/" })}
                    className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                     <img 
                        className="h-5 w-5 mr-2" 
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" 
                        alt="Facebook" 
                    />
                    Facebook
                </button>
            </div>
        </div>

        <p className="text-center mt-6 text-sm text-slate-600">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}