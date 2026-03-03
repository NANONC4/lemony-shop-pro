import { Megaphone } from "lucide-react";

export default function StatusBox() {
  return (
    <section className="max-w-4xl mx-auto mb-16">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 transition-transform duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Megaphone className="text-yellow-400 w-6 h-6" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ประกาศร้าน</span>
          </h2>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-green-500/30">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-green-400 font-bold text-sm">ร้านเปิดรับออเดอร์</span>
          </div>
        </div>
        <div className="space-y-2 text-slate-300 text-center md:text-left leading-relaxed">
          <p>✨ ยินดีต้อนรับสู่ <span className="text-white font-bold">Lemony Shop</span> รูปแบบใหม่!</p>
          <p>รับเติมเกม Roblox <span className="bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded text-sm border border-pink-500/30">ราคาถูกกว่าเติมเอง</span> ปลอดภัย 100%</p>
        </div>
      </div>
    </section>
  );
}