"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Shield, Sparkles, Gamepad2, Check, TicketPercent, Lock } from "lucide-react"; // ✅ เพิ่ม Lock
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase"; // ✅ นำเข้าวิทยุสื่อสาร Supabase

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface Game {
  id: number;
  title: string;
  slug: string;
  imageUrl: string;
  products: Product[];
}

export default function GameShopClient({ game }: { game: Game }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ 1. State สำหรับเก็บสถานะเปิด/ปิดร้าน
  const [isOpen, setIsOpen] = useState(true);

  // State Form
  const [formData, setFormData] = useState({
    uid: "",
    username: "",
    password: "",
    note: "",
  });

  // State Coupon
  const [couponCode, setCouponCode] = useState(""); 
  const [discount, setDiscount] = useState(0);     
  const [isCouponValid, setIsCouponValid] = useState(false); 
  const [couponMsg, setCouponMsg] = useState("");  

  // Logic เช็คเกม
  const gameCheck = (keyword: string) => {
    const slug = game.slug?.toLowerCase() || "";
    const title = game.title?.toLowerCase() || "";
    return slug.includes(keyword) || title.includes(keyword);
  };

  const isRoblox = gameCheck("roblox");
  const isRov = gameCheck("rov");

  // ✅ 2. ฟังก์ชันเช็คสถานะและดักฟังวิทยุ Realtime
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/store/status");
        const data = await res.json();
        setIsOpen(data.isOpen);
        
        // 🚨 ถ้าร้านปิด ให้หุบฟอร์ม Popup ที่เปิดค้างไว้อยู่ทันที!
        if (!data.isOpen) {
          setSelectedProduct(null); 
        }
      } catch (err) {
        console.error("Failed to fetch store status");
      }
    };

    checkStatus();

    const channel = supabase
      .channel('gameshopclient-store-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'StoreSetting' },
        () => { checkStatus(); }
      )
      .subscribe();

    const interval = setInterval(checkStatus, 30000); 

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // เช็คคูปอง
  const handleCheckCoupon = async () => {
    if (!selectedProduct) return alert("กรุณาเลือกแพ็กเกจก่อนครับ");
    if (!couponCode) return;

    setLoading(true);
    setCouponMsg("");

    try {
      const res = await fetch("/api/coupon/check", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            code: couponCode, 
            price: selectedProduct.price, 
            gameId: game.id 
        }),
      });

      const data = await res.json();

      if (data.valid) { 
        setDiscount(data.discount);
        setIsCouponValid(true);
        setCouponMsg(`✅ ใช้โค้ดสำเร็จ! ลด ${data.discount} บาท`);
      } else {
        setDiscount(0);
        setIsCouponValid(false);
        setCouponMsg(`❌ ${data.message}`); 
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเช็คโค้ด");
    } finally {
      setLoading(false);
    }
  };

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      if (confirm("กรุณาเข้าสู่ระบบก่อนสั่งซื้อครับ")) router.push("/login");
      return;
    }

    if (!selectedProduct) return alert("กรุณาเลือกแพ็กเกจก่อนครับ");
    if (!isOpen) return alert("ขออภัย ร้านปิดให้บริการชั่วคราวครับ"); // 🛡️ ดักกันเหนียว

    let payload: any = {
      productId: selectedProduct.id,
      quantity: 1,
      note: formData.note || "",
      couponCode: isCouponValid ? couponCode : null, 
    };

    if (isRoblox) {
      if (!formData.username || !formData.password) return alert("กรุณากรอก ID และ Password");
      payload.username = formData.username;
      payload.password = formData.password;
    } else {
      if (!formData.uid) return alert("กรุณากรอก OpenID / UID");
      payload.uid = formData.uid;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          router.push(`/checkout?token=${data.token}`); 
        } else {
           alert("สร้างออเดอร์สำเร็จ แต่ไม่พบ Token อ้างอิง");
        }
      } else {
        alert(data.error || "สั่งซื้อไม่สำเร็จ");
      }
    } catch (error) {
      alert("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-pink-500 selection:text-white p-4 flex justify-center">
      
      <div className="relative z-10 w-full max-w-6xl space-y-8 pb-32 md:pb-0"> 
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 border-b border-white/10 pb-8">
            <div className={`p-4 rounded-2xl w-fit transition-all duration-300 ${isOpen ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-red-500/20 grayscale border border-red-500/30"}`}>
                {isOpen ? <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-white" /> : <Lock className="w-8 h-8 md:w-10 md:h-10 text-red-400" />}
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight leading-tight">
                        {game.title}
                    </h1>
                    {/* 🔴 ป้ายกำกับถ้าร้านปิด */}
                    {!isOpen && (
                        <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> ปิดรับออเดอร์
                        </span>
                    )}
                </div>
                <p className={`text-sm md:text-lg mt-2 flex items-center gap-2 ${isOpen ? "text-slate-400" : "text-red-300/80"}`}>
                    <Sparkles className={`w-4 h-4 ${isOpen ? "text-pink-500" : "text-red-400"}`} />
                    {isOpen ? "เลือกแพ็กเกจที่คุณต้องการเติม" : "ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถทำรายการได้"}
                </p>
            </div>
        </div>

        {/* --- Grid สินค้า --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {game.products.map((product) => {
            const isSelected = selectedProduct?.id === product.id;
            return (
              <button
                key={product.id}
                onClick={() => {
                    // ✅ ถ้าร้านเปิดอยู่ ถึงจะยอมให้กดได้
                    if (isOpen) {
                        setSelectedProduct(product);
                        setIsCouponValid(false);
                        setDiscount(0);
                        setCouponMsg("");
                    }
                }}
                className={`relative group rounded-2xl p-4 text-left flex flex-col transition-all duration-200 border overflow-hidden
                  ${!isOpen 
                    ? "bg-red-950/20 border-red-500/20 grayscale-[0.8] opacity-60 cursor-not-allowed" 
                    : isSelected
                        ? "bg-slate-800 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-[1.02] z-10"
                        : "bg-[#121212] border-white/5 hover:border-white/20 hover:bg-[#181818]"
                  }`}
              >
                {/* Check Icon */}
                {isSelected && isOpen && (
                  <div className="absolute top-3 right-3 bg-pink-500 text-white rounded-full p-1 shadow-lg z-20 animate-in zoom-in">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                
                {/* Lock Icon */}
                {!isOpen && (
                  <div className="absolute top-3 right-3 text-red-500 z-20">
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                {/* Product Image */}
                <div className="relative w-full h-32 md:h-40 bg-slate-900/50 rounded-xl mb-3 overflow-hidden group-hover:bg-slate-900 transition-colors">
                  {product.imageUrl ? (
                    <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        className={`object-contain p-3 transition-transform duration-300 ${isOpen ? "group-hover:scale-110" : ""}`} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Image</div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-auto w-full">
                    <h3 className={`font-bold text-sm md:text-base line-clamp-1 mb-1 transition-colors
                        ${!isOpen ? "text-slate-500" : isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                        <div className={`text-sm md:text-base font-bold px-2 py-1 rounded-lg
                            ${!isOpen
                                ? "text-slate-400 bg-slate-900/50"
                                : isSelected 
                                    ? "bg-pink-500 text-white" 
                                    : "text-cyan-400 bg-cyan-950/30 border border-cyan-500/20"}`}>
                            ฿{product.price.toLocaleString()}
                        </div>
                    </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* --- Form Section --- */}
        <AnimatePresence>
          {selectedProduct && isOpen && ( // 🛡️ เช็คซ้อนอีกชั้น ต้องเปิดร้านอยู่ถึงจะโชว์ฟอร์ม
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 p-4 md:static md:p-0 md:mt-12"
            >
              <div className="w-full bg-[#0f0f13]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_#ec4899]" />

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Summary */}
                    <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                        <div className="relative w-20 h-20 md:w-32 md:h-32 bg-slate-900 rounded-2xl border border-white/10 flex-shrink-0 p-2">
                             {selectedProduct.imageUrl && (
                                 <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} fill className="object-contain" />
                             )}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-1">แพ็กเกจที่เลือก</p>
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{selectedProduct.name}</h3>
                            <div className="mt-2">
                                {discount > 0 && (
                                    <span className="text-sm text-slate-400 line-through mr-2 block">
                                        ฿{selectedProduct.price.toLocaleString()}
                                    </span>
                                )}
                                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                    ฿{(Math.max(0, selectedProduct.price - discount)).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-purple-400" />
                            <h3 className="font-bold text-white text-lg">กรอกข้อมูล </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isRoblox ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 ml-1">USERNAME</label>
                                        <input type="text" required 
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none placeholder:text-slate-600 transition-all focus:bg-slate-900"
                                            placeholder="ชื่อผู้ใช้ Roblox"
                                            value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 ml-1">PASSWORD</label>
                                        <input type="text" required 
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none placeholder:text-slate-600 transition-all focus:bg-slate-900"
                                            placeholder="รหัสผ่าน Roblox"
                                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">{isRov ? "OPENID" : "UID / PLAYER ID"}</label>
                                    <input type="text" required 
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-wider focus:border-purple-500 outline-none placeholder:text-slate-600 transition-all focus:bg-slate-900"
                                        placeholder={isRov ? "กรอก OpenID" : "กรอกเลข UID"}
                                        value={formData.uid} onChange={e => setFormData({...formData, uid: e.target.value})} 
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">NOTE (OPTIONAL)</label>
                                <input type="text" 
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none placeholder:text-slate-600 transition-all focus:bg-slate-900"
                                    placeholder="เบอร์โทร, ชื่อตัวละคร, หรือข้อความถึงแอดมิน"
                                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} 
                                />
                            </div>

                            {/* Coupon Code Section */}
                            <div className="space-y-1 md:col-span-2 pt-4 border-t border-white/10 mt-2">
                                <label className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1">
                                    <TicketPercent className="w-3 h-3 text-yellow-500" />
                                    โค้ดส่วนลด (ถ้ามี)
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none placeholder:text-slate-600 transition-all uppercase font-mono tracking-wide"
                                        placeholder="กรอกโค้ดที่นี่"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value.toUpperCase());
                                            setIsCouponValid(false);
                                            setDiscount(0);
                                            setCouponMsg("");
                                        }}
                                        disabled={isCouponValid} 
                                    />
                                    {isCouponValid ? (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setIsCouponValid(false);
                                                setCouponCode("");
                                                setDiscount(0);
                                                setCouponMsg("");
                                            }}
                                            className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 rounded-xl hover:bg-red-500/20 font-bold transition-colors"
                                        >
                                            ยกเลิก
                                        </button>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={handleCheckCoupon}
                                            disabled={!couponCode}
                                            className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-6 rounded-xl hover:bg-yellow-500/20 font-bold transition-colors disabled:opacity-50"
                                        >
                                            ใช้โค้ด
                                        </button>
                                    )}
                                </div>
                                {couponMsg && (
                                    <p className={`text-xs mt-1 ml-1 font-medium ${isCouponValid ? "text-green-400" : "text-red-400"}`}>
                                        {couponMsg}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button type="submit" disabled={loading} 
                            className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-pink-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                            <span className="text-lg">
                                ชำระเงิน 
                                {(discount > 0) && ` ฿${(Math.max(0, selectedProduct.price - discount)).toLocaleString()}`}
                            </span>
                        </button>
                    </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}