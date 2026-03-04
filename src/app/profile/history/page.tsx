"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {Loader2, MessageSquare, ChevronDown, ChevronUp, Send, AlertCircle, Upload, Image as ImageIcon, Trash2, Clock, CheckCircle2, XCircle, Gamepad2, Receipt, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase"; 

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  
  const [message, setMessage] = useState("");
  const [twoFactor, setTwoFactor] = useState("");
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchOrders(true);
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(() => {
      if (expandedOrderId === null && !isPollingRef.current) {
         fetchOrders(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status, expandedOrderId]);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    isPollingRef.current = true;
    try {
      const res = await fetch(`/api/user/orders?page=1&limit=20`);
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setLoading(false);
      isPollingRef.current = false;
    }
  };

  const toggleAccordion = (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      setMessage("");
      setTwoFactor("");
      setSelectedFile(null); 
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    const file = e.target.files.item(0); 
    if (!file) return;

    setSelectedFile(file); 
    setPreviewUrl(URL.createObjectURL(file)); 
  };

  const handleSendReport = async (orderId: number) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId.toString());
      if (message) formData.append("message", message);
      if (twoFactor) formData.append("twoFactorCode", twoFactor); 
      
      if (selectedFile) {
        formData.append("file", selectedFile); 
      }

      const res = await fetch("/api/user/orders/report", {
        method: "POST",
        body: formData, 
      });

      if (res.ok) {
        alert("✅ ส่งข้อมูลแก้ไขเรียบร้อย! แอดมินจะตรวจสอบอีกครั้งครับ");
        setExpandedOrderId(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchOrders(true);
      } else {
        const errorData = await res.json();
        alert(`❌ ส่งไม่สำเร็จ: ${errorData.error || "กรุณาลองใหม่"}`);
      }
    } catch (e) {
      alert("Error เชื่อมต่อ Server ไม่ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: <Clock className="w-3.5 h-3.5" />, label: "รอการชำระเงิน" };
      case "PAID":
        return { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, label: "กำลังดำเนินการ (รอเติมเกม)" };
      case "COMPLETED":
        return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "เติมเกมสำเร็จ" };
      case "CANCELLED":
        return { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: <XCircle className="w-3.5 h-3.5" />, label: "ยกเลิก" };
      case "ISSUE":
        return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]", icon: <AlertCircle className="w-3.5 h-3.5" />, label: "มีปัญหา / รอแก้ไข" };
      default:
        return { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: <History className="w-3.5 h-3.5" />, label: status };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] pt-32 flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 animate-pulse">กำลังโหลดประวัติ...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 relative selection:bg-pink-500 selection:text-white">
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        <div className="flex flex-col items-center text-center mb-12 space-y-3 relative">
          <Reveal direction="up" delay={0.1}>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3 mt-6 md:mt-0">
              ประวัติ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">การสั่งซื้อ</span>
            </h1>
          </Reveal>
          <Reveal direction="scale" delay={0.2} duration={0.6}>
            <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-2" />
          </Reveal>
        </div>

        <div className="space-y-4">
          {orders.map((order, index) => {
            const statusStyle = getStatusStyle(order.status);
            
            return (
              <Reveal key={order.id} direction="up" delay={index * 0.05} width="100%">
                <div className="rounded-2xl shadow-lg border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 group hover:border-pink-500/30 hover:bg-white/[0.07]">
                  
                  <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                          {statusStyle.icon}
                          {statusStyle.label}
                        </span>
                        <span className="text-slate-400 text-xs font-mono bg-black/40 px-2 py-1 rounded-md border border-white/5">
                          #{order.id}
                        </span>
                        <span className="text-slate-500 text-xs hidden md:inline flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleString('th-TH')}
                        </span>
                      </div>

                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-pink-300 transition-colors flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors" />
                        {order.product?.game?.title} - {order.product?.name}
                      </h3>

                      <p className="text-sm text-slate-400 font-mono">
                        UID/ID: <span className="text-blue-300 font-medium">{order.uid || order.username || '-'}</span>
                      </p>
                    </div>

                    <div className="flex items-center self-start md:self-center border-t border-white/10 md:border-none pt-3 md:pt-0 w-full md:w-auto mt-2 md:mt-0">
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => router.push(`/checkout?token=${order.token}`)}
                          className="w-full md:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-pink-600 text-white shadow-lg shadow-pink-500/20 hover:-translate-y-0.5 hover:shadow-pink-500/40 transition-all duration-300"
                        >
                          <Upload className="w-4 h-4" />
                          <span>ชำระเงิน / แนบสลิป</span>
                        </button>
                      )}
                      {order.status === 'ISSUE' && (
                        <button 
                          onClick={() => toggleAccordion(order.id)}
                          className={`w-full md:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                            ${expandedOrderId === order.id 
                              ? "bg-white/10 text-slate-300 border border-white/20" 
                              : "bg-white/5 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"}`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{expandedOrderId === order.id ? "ปิดฟอร์มแก้ไข" : "ตอบแอดมิน / แก้ไข"}</span>
                          {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrderId === order.id && order.status === 'ISSUE' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border-t border-white/5"
                      >
                        <div className="p-5 md:p-6 space-y-5">
                          
                          {/* ✅ ตรงนี้คือจุดที่เพิ่มเข้ามา: แสดงข้อความและรูปภาพจากแอดมิน */}
                          {(order.adminMessage || order.adminImageUrl) && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl shadow-inner">
                               <h4 className="text-xs font-bold text-red-400 uppercase mb-1.5 flex items-center gap-1.5">
                                 <AlertCircle className="w-4 h-4"/> แอดมินแจ้งว่า:
                               </h4>
                               {order.adminMessage && (
                                 <p className="text-slate-200 text-sm font-medium leading-relaxed">{order.adminMessage}</p>
                               )}
                               {/* รูปภาพที่แอดมินแนบมา */}
                               {order.adminImageUrl && (
                                 <div className="mt-4 rounded-xl overflow-hidden border border-red-500/30 bg-black/50">
                                   <img 
                                      src={order.adminImageUrl} 
                                      alt="ภาพจากแอดมิน" 
                                      className="w-full max-h-64 object-contain" 
                                   />
                                 </div>
                               )}
                            </div>
                          )}

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">รหัส 2 ชั้น (ถ้ามี)</label>
                                <input 
                                  type="text" 
                                  placeholder="OTP / Backup Code"
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                  value={twoFactor}
                                  onChange={(e) => setTwoFactor(e.target.value)}
                                />
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">แนบรูปภาพให้แอดมิน</label>
                                {!previewUrl ? (
                                  <label className="flex flex-col items-center justify-center w-full h-[46px] border border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 hover:border-pink-500 transition-all">
                                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                                          <Upload className="w-4 h-4" />
                                          <span>คลิกเพื่อเลือกรูป</span>
                                      </div>
                                      <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                  </label>
                                ) : (
                                  <div className="relative w-full h-[46px] border border-white/20 rounded-lg flex items-center bg-black/40 px-3 justify-between">
                                      <div className="flex items-center gap-2 text-slate-300 text-sm truncate">
                                          <ImageIcon className="w-4 h-4 text-pink-400" />
                                          <span className="truncate">รูปภาพพร้อมส่ง</span>
                                      </div>
                                      <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="text-red-400 hover:bg-red-500/20 p-1.5 rounded-full transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                                )}
                                {previewUrl && (
                                  <div className="mt-3 relative h-32 w-full rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                            </div>
                          </div>

                          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">ข้อความถึงแอดมิน</label>
                              <textarea 
                                placeholder="พิมพ์ข้อความตอบกลับที่นี่..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all min-h-[100px]" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                              ></textarea>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button 
                              onClick={() => toggleAccordion(order.id)}
                              className="flex-1 py-3 px-4 rounded-xl text-slate-300 font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                              ยกเลิก
                            </button>
                            <button 
                              onClick={() => handleSendReport(order.id)}
                              disabled={isSubmitting || (!message && !twoFactor && !selectedFile)}
                              className="flex-[2] py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              {isSubmitting ? "กำลังส่ง..." : <><Send className="w-5 h-5" /> ยืนยันการส่งข้อมูล</>}
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                </div>
              </Reveal>
            );
          })}

          {orders.length === 0 && !loading && (
             <Reveal direction="scale">
               <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed backdrop-blur-md">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 shadow-inner">
                   <Receipt className="w-8 h-8 text-slate-500" />
                 </div>
                 <h3 className="text-xl font-bold text-white">ยังไม่มีประวัติการสั่งซื้อ</h3>
                 <p className="text-slate-400 mt-2">คุณยังไม่ได้ทำการสั่งซื้อใดๆ ในระบบ</p>
               </div>
             </Reveal>
          )}
        </div>

      </div>
    </div>
  );
}