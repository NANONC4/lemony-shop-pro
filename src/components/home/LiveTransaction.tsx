"use client";

import { useEffect, useState } from "react";
import { User, Clock } from "lucide-react";

// ข้อมูลจำลอง (Mock Data)
const MOCK_DATA = [
  { user: "Tar***", game: "Roblox", item: "Robux 1,000", price: "100", time: "1 นาทีที่แล้ว" },
  { user: "Kik***", game: "RoV", item: "Coupons 35", price: "10", time: "2 นาทีที่แล้ว" },
  { user: "Bam***", game: "Valorant", item: "VP 365", price: "150", time: "5 นาทีที่แล้ว" },
  { user: "Jo***", game: "Roblox", item: "Premium", price: "250", time: "7 นาทีที่แล้ว" },
];

export default function LiveTransaction() {
  const [transactions, setTransactions] = useState(MOCK_DATA);

  // จำลองการไหลของข้อมูล (เหมือนมีคนซื้อจริง)
  useEffect(() => {
    const interval = setInterval(() => {
       const newItem = {
           user: `User${Math.floor(Math.random() * 999)}***`,
           game: ["Roblox", "RoV", "FreeFire"][Math.floor(Math.random() * 3)],
           item: "Topup Pack",
           price: Math.floor(Math.random() * 500 + 50).toString(),
           time: "เมื่อสักครู่"
       };
       setTransactions(prev => [newItem, ...prev.slice(0, 4)]); // เพิ่มใหม่ ลบเก่า
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mb-20 container mx-auto px-4">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    รายการสั่งซื้อล่าสุด
                 </h2>
                 <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Real-time Update
                 </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {transactions.map((tx, i) => (
                    <div key={i} className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 animate-in fade-in slide-in-from-right duration-500">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{tx.user}</p>
                            <p className="text-xs text-slate-400 truncate">เติม {tx.game} - ฿{tx.price}</p>
                        </div>
                        <div className="ml-auto text-xs text-slate-500 whitespace-nowrap">
                            {tx.time}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}