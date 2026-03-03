"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload"; // ✅ Import เข้ามา

interface Promotion {
  id: number;
  title: string | null;
  description: string | null;
  imageUrl: string;
}

export default function PromotionManager({ initialPromotions }: { initialPromotions: Promotion[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", imageUrl: "" });

  const handleAdd = async () => {
    if (!formData.imageUrl) return alert("กรุณาอัปโหลดรูปภาพ");
    
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("เพิ่มโปรโมชั่นสำเร็จ ✅");
      setIsOpen(false);
      setFormData({ title: "", description: "", imageUrl: "" });
      router.refresh();
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("ต้องการลบแบนเนอร์นี้?")) return;
    const res = await fetch(`/api/admin/promotions?id=${id}`, { method: "DELETE" });
    if(res.ok) router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* ปุ่มเพิ่ม */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center">
        <button 
            onClick={() => setIsOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all hover:scale-105 shadow-lg shadow-purple-900/20"
        >
            <Plus className="w-5 h-5" /> เพิ่มแบนเนอร์ใหม่
        </button>
      </div>

      {/* รายการแบนเนอร์ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialPromotions.map((promo) => (
          <div key={promo.id} className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="aspect-[21/9] bg-slate-800 relative">
              <img src={promo.imageUrl} alt="Promo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </div>
            <div className="absolute bottom-0 left-0 p-4 w-full">
               <h3 className="text-white font-bold text-lg">{promo.title || "ไม่มีหัวข้อ"}</h3>
               <p className="text-slate-400 text-sm truncate">{promo.description || "-"}</p>
            </div>
            <button 
                onClick={() => handleDelete(promo.id)}
                className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            >
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal เพิ่มข้อมูล */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">✨ เพิ่มโปรโมชั่นใหม่</h3>
                <div className="space-y-4">
                    {/* ✅ ส่วนอัปโหลดรูป */}
                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">รูปแบนเนอร์ (แนะนำแนวนอน 21:9)</label>
                        <ImageUpload 
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({...formData, imageUrl: url})}
                            onRemove={() => setFormData({...formData, imageUrl: ""})}
                        />
                    </div>
                    <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white" placeholder="หัวข้อโปรโมชั่น (เช่น ลดราคา 50%)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white" placeholder="รายละเอียดสั้นๆ" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">ยกเลิก</button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500">บันทึก</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}