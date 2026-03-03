"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // เรียกใช้ระบบ NextAuth เพื่อล็อกอิน
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // ไม่ให้เปลี่ยนหน้าเอง เราจะคุมเอง
    });

    if (result?.error) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      // ถ้าผ่าน ให้พาไปหน้า Dashboard
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-yellow-400 p-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Lock className="h-6 w-6 text-yellow-700" />
          </div>
          <h1 className="text-xl font-bold text-yellow-900">Admin Access</h1>
          <p className="text-sm text-yellow-800">เข้าสู่ระบบจัดการร้าน</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-slate-900 py-2.5 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}