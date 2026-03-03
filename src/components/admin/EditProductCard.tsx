"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload"; // ✅ Import เข้ามา

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

export default function EditProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, ...formData }),
      });

      if (res.ok) {
        alert("✅ บันทึกข้อมูลสำเร็จ!");
        window.location.reload(); 
      } else {
        alert("❌ บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col gap-3 shadow-lg">
      
      {/* ✅ ส่วนอัปโหลดรูป (แทนที่รูปเก่า + ช่องกรอก URL เดิม) */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block">รูปสินค้า</label>
        <ImageUpload 
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            onRemove={() => setFormData({ ...formData, imageUrl: "" })}
        />
      </div>

      {/* ชื่อแพ็กเกจ */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">ชื่อแพ็กเกจ</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white font-bold focus:border-yellow-400 outline-none"
        />
      </div>

      {/* ราคา */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">ราคา (บาท)</label>
        <input 
          type="number" 
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-lg text-green-400 font-mono font-bold focus:border-green-400 outline-none"
        />
      </div>

      {/* ปุ่ม Save */}
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="mt-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>บันทึกการแก้ไข</span>
      </button>

    </div>
  );
}