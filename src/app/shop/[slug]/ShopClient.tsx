"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SmartGameForm from "@/components/SmartGameForm";
import { CheckCircle2, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ พระเอกของเรา

interface ShopClientProps {
  game: any;
}

export default function ShopClient({ game }: ShopClientProps) {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันปิด Popup
  const handleClose = () => setSelectedPackage(null);

  const handleCheckout = async (formData: any) => {
    if (!selectedPackage) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedPackage.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
       router.push(`/payment/${data.order.token}`);
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      alert("เชื่อมต่อ Server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative min-h-screen">
      
      {/* 1. Header สินค้า */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl shadow-lg border-4 border-white">
          <Image src={game.imageUrl} alt={game.title} fill className="object-cover" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{game.title}</h1>
          <p className="text-slate-500 text-lg">เลือกแพ็กเกจราคาที่คุณต้องการเติม</p>
        </div>
      </div>

      {/* 2. Grid เลือกราคา (พอกดแล้ว Popup จะเด้ง) */}
      <div className="mb-20">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-yellow-400 pl-3">
          เลือกราคาแพ็กเกจ
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {game.products.map((product: any) => (
            <div
              key={product.id}
              onClick={() => setSelectedPackage(product)} // ✅ กดปุ๊บ set state ปั๊บ Popup เด้ง
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg hover:-translate-y-1 ${
                selectedPackage?.id === product.id
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 mb-3 rounded-lg overflow-hidden bg-slate-100">
                  <Image src={product.imageUrl || game.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm mb-1 line-clamp-2 h-10 flex items-center justify-center">
                  {product.name}
                </h3>
                <span className="text-lg font-bold text-blue-600">{Number(product.price).toLocaleString()}.-</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 🔥 Bottom Sheet / Popup Form (สไลด์ขึ้นมาเมื่อเลือกของ) */}
      <AnimatePresence>
        {selectedPackage && (
          <>
            {/* 3.1 ฉากหลังสีดำจางๆ (Backdrop) - กดแล้วปิด */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black z-40"
            />

            {/* 3.2 ตัวฟอร์มสไลด์ขึ้น (Sheet) */}
            <motion.div
              initial={{ y: "100%" }} // เริ่มจากข้างล่างจอ
              animate={{ y: 0 }}      // สไลด์ขึ้นมาที่เดิม
              exit={{ y: "100%" }}    // ตอนปิดสไลด์กลับลงไป
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.15)] border-t border-slate-100 max-h-[85vh] overflow-y-auto"
            >
              <div className="max-w-2xl mx-auto p-6 pb-10">
                
                {/* หัวข้อ Popup + ปุ่มปิด */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShoppingCart className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">ยืนยันรายการ</h3>
                      <p className="text-sm text-slate-500">{selectedPackage.name} - <span className="text-blue-600 font-bold">{selectedPackage.price} บาท</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {/* ฟอร์มกรอกข้อมูล (ดึง SmartGameForm มาใส่ตรงนี้) */}
                <div className="space-y-4">
                  <SmartGameForm
                    gameType={game.slug}
                    selectedPackage={selectedPackage}
                    onSubmit={handleCheckout}
                    loading={loading}
                  />
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}