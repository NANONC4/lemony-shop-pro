import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center selection:bg-pink-500 overflow-hidden font-sans">
      {/* แสงวงกลมเรืองแสงพื้นหลัง (Glow Effect) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* กล่องใส่แอนิเมชัน Loading */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="relative">
          {/* แสงเงาด้านหลังไอคอน */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-lg opacity-40 rounded-full animate-pulse"></div>
          {/* ไอคอนหมุนๆ */}
          <div className="bg-[#0a0a0a] p-4 rounded-full border border-white/10 relative z-10 shadow-xl">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          </div>
        </div>

        {/* ข้อความและชื่อร้าน */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tracking-tight animate-pulse">
            Lemony Shop
          </h2>
          <p className="text-slate-400 text-sm font-medium tracking-wide flex items-center justify-center gap-2">
            กำลังโหลดข้อมูล <span className="flex space-x-1">
              <span className="animate-bounce delay-75">.</span>
              <span className="animate-bounce delay-150">.</span>
              <span className="animate-bounce delay-300">.</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}