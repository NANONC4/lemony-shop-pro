"use client";

import { useState, useEffect } from "react";
import { Trash2, Ticket, Plus, Gamepad2 } from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]); // ✅ เก็บรายชื่อเกมสำหรับเลือก

  // Form Data
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    limit: "",
    minPrice: "", // ✅ เพิ่มยอดขั้นต่ำ
    gameId: "",   // ✅ เพิ่มเลือกเกม
  });

  // Fetch Coupons & Games
  useEffect(() => {
    fetchCoupons();
    fetchGames();
  }, []);

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons", { cache: 'no-store' });
    if (res.ok) setCoupons(await res.json());
  };

  // ✅ ดึงรายชื่อเกมมาใส่ Dropdown
  const fetchGames = async () => {
    const res = await fetch("/api/games"); // สมมติว่ามี API นี้ (หรือใช้ api/admin/games ก็ได้)
    if (res.ok) {
        const data = await res.json();
        // API เกมอาจจะ return { games: [...] } หรือ [...] เช็คดีๆ
        setGames(Array.isArray(data) ? data : data.games || []);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCoupon),
    });

    if (res.ok) {
      alert("✅ สร้างคูปองสำเร็จ");
      setNewCoupon({ code: "", discount: "", limit: "", minPrice: "", gameId: "" });
      fetchCoupons();
    } else {
      alert("❌ สร้างไม่สำเร็จ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบคูปองนี้?")) return;
    const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchCoupons();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Ticket className="text-yellow-500" /> จัดการคูปองส่วนลด
      </h1>

      {/* Form สร้างคูปอง */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-white font-bold mb-4">สร้างคูปองใหม่</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          
          <div className="lg:col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">รหัสโค้ด</label>
            <input 
              type="text" 
              placeholder="เช่น SALE50" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white uppercase"
              value={newCoupon.code}
              onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">ส่วนลด (บาท)</label>
            <input 
              type="number" 
              placeholder="0" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={newCoupon.discount}
              onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">จำนวนสิทธิ์</label>
            <input 
              type="number" 
              placeholder="100" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={newCoupon.limit}
              onChange={e => setNewCoupon({...newCoupon, limit: e.target.value})}
              required
            />
          </div>

          {/* ✅ ช่องกรอกยอดขั้นต่ำ */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">ขั้นต่ำ (บาท)</label>
            <input 
              type="number" 
              placeholder="0 = ไม่มี" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={newCoupon.minPrice}
              onChange={e => setNewCoupon({...newCoupon, minPrice: e.target.value})}
            />
          </div>

          {/* ✅ Dropdown เลือกเกม */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">เฉพาะเกม (Optional)</label>
            <select 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={newCoupon.gameId}
              onChange={e => setNewCoupon({...newCoupon, gameId: e.target.value})}
            >
                <option value="">ทุกเกม (Global)</option>
                {games.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                ))}
            </select>
          </div>

          <div className="lg:col-span-6 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
              <Plus size={18} /> สร้างคูปอง
            </button>
          </div>
        </form>
      </div>

      {/* ตารางแสดงคูปอง */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-400 text-sm">
            <tr>
              <th className="p-4">CODE</th>
              <th className="p-4">ส่วนลด</th>
              <th className="p-4">เงื่อนไข</th>
              <th className="p-4">ใช้ไป/จำกัด</th>
              <th className="p-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {coupons.map((c) => (
              <tr key={c.id} className="text-white hover:bg-slate-800/50">
                <td className="p-4 font-mono text-yellow-400 font-bold">{c.code}</td>
                <td className="p-4 text-green-400 font-bold">-{c.discount}฿</td>
                
                {/* ✅ แสดงเงื่อนไข */}
                <td className="p-4 text-slate-300"> 
                    <div className="flex flex-col gap-1">
                        {c.minPrice > 0 && <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">ขั้นต่ำ {c.minPrice}฿</span>}
                        {c.gameId ? (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30 flex items-center gap-1 w-fit">
                                <Gamepad2 size={10} /> เฉพาะเกม ID:{c.gameId}
                            </span>
                        ) : (
                            <span className="text-xs text-slate-500">ใช้ได้ทุกเกม</span>
                        )}
                    </div>
                </td>

                <td className="p-4">
                  <span className={`${c.used >= c.limit ? 'text-red-400' : 'text-blue-400'}`}>
                    {c.used}
                  </span>
                  <span className="text-slate-600"> / {c.limit}</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}