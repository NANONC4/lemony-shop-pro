"use client";

import { useState, useEffect } from "react";
import { format, isToday } from "date-fns";
import { th } from "date-fns/locale";
import { Search, Filter, CheckCircle, XCircle, Clock, MessageSquare, Send, X, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminOrderActions from "@/components/AdminOrderActions";
import { supabase } from "@/lib/supabase"; // ✅ 1. Import Supabase

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  slipUrl: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  user: {
    username: string;
    email: string;
  };
  product: {
    name: string;
    price: number;
    game: {
        title: string;
    }
  };
  note?: string;      
  adminMessage?: string; 
  adminImageUrl?: string | null; // ✅ 2. เพิ่มฟิลด์รูปแอดมินใน Interface
  uid?: string;       
  password?: string;
  username?: string;  
}

interface DashboardClientProps {
  orders: Order[];
  stats: {
    pendingCount: number;
    totalOrders: number;
  };
}

export default function DashboardClient({ orders: initialOrders, stats }: DashboardClientProps) {
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);
  
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "COMPLETED" | "CANCELLED">("PAID");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // ✅ 3. State สำหรับจัดการรูปภาพแอดมิน
  const [adminImageFile, setAdminImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh(); 
    }, 5000); 
    return () => clearInterval(interval);
  }, [router]);

  const filteredOrders = orders.filter((order) => {
    const statusMatch = filterStatus === "ALL" ? true : order.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = 
        order.id.toString().includes(searchLower) ||
        order.user.username.toLowerCase().includes(searchLower) ||
        order.user.email.toLowerCase().includes(searchLower);
    return statusMatch && searchMatch;
  });

  const completedCount = orders.filter(o => o.status === "COMPLETED").length;

  const openReplyModal = (order: Order) => {
    setSelectedOrder(order);
    setReplyMessage(order.adminMessage || ""); 
    // เคลียร์ค่ารูปภาพเก่าทุกครั้งที่เปิด Modal ใหม่
    setAdminImageFile(null);
    setPreviewUrl(null);
  };

  // ✅ 4. ฟังก์ชันเมื่อแอดมินเลือกรูป
  const handleAdminFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setAdminImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
      }
  };

  const handleReply = async () => {
    if (!selectedOrder) return;
    setIsReplying(true);
    try {
      let uploadedUrl = null;

      // ✅ 5. ถ้ามีการแนบรูป ให้อัปโหลดขึ้น Supabase ก่อน
      if (adminImageFile) {
          const fileExt = adminImageFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `admin-replies/${fileName}`; // สร้างโฟลเดอร์ admin-replies (หรือใช้ชื่ออื่นได้)

          // อัปโหลดเข้า Bucket ชื่อ 'images' (เปลี่ยนให้ตรงกับชื่อ Bucket ของคุณ)
          const { error: uploadError } = await supabase.storage
              .from('images') 
              .upload(filePath, adminImageFile);

          if (uploadError) throw new Error("อัปโหลดรูปไม่สำเร็จ");

          // ดึง URL กลับมา
          const { data: publicUrlData } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);

          uploadedUrl = publicUrlData.publicUrl;
      }

      // ✅ 6. ส่งข้อมูลข้อความ + ลิงก์รูป ไปที่ API
      const res = await fetch("/api/admin/orders/reply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            orderId: selectedOrder.id, 
            message: replyMessage,
            adminImageUrl: uploadedUrl // ส่ง URL รูปไปด้วย
        }),
      });

      if (res.ok) {
        alert("ส่งข้อความและรูปภาพเรียบร้อย ✅");
        setOrders(prev => prev.map(o => 
            o.id === selectedOrder.id ? { ...o, adminMessage: replyMessage, adminImageUrl: uploadedUrl } : o
        ));
        setSelectedOrder(null); 
        router.refresh(); 
      } else {
        alert("ส่งข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      alert("Error processing your request");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-6">
        
        {/* 1. Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
                <p className="text-slate-400 text-sm mb-1">ทำรายการสำเร็จ</p>
                <div className="flex items-center gap-2 mt-1">
                   <h3 className="text-3xl font-bold text-green-400">{completedCount}</h3>
                   <span className="text-slate-500 text-sm">รายการ</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                <p className="text-slate-400 text-sm mb-1">รอตรวจสอบ / มีปัญหา</p>
                <div className="flex items-center gap-2 mt-1">
                   <h3 className="text-3xl font-bold text-orange-400">{stats.pendingCount}</h3>
                   <span className="text-slate-500 text-sm">รายการ</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <p className="text-slate-400 text-sm mb-1">ออเดอร์ทั้งหมด</p>
                <div className="flex items-center gap-2 mt-1">
                   <h3 className="text-3xl font-bold text-blue-400">{stats.totalOrders}</h3>
                   <span className="text-slate-500 text-sm">รายการ</span>
                </div>
            </div>
        </div>

        {/* 2. Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
                <button onClick={() => setFilterStatus("PAID")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === 'PAID' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <Clock className="w-4 h-4" /> รอตรวจสอบ
                </button>
                <button onClick={() => setFilterStatus("COMPLETED")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === 'COMPLETED' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <CheckCircle className="w-4 h-4" /> สำเร็จ
                </button>
                <button onClick={() => setFilterStatus("CANCELLED")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === 'CANCELLED' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <XCircle className="w-4 h-4" /> ยกเลิก
                </button>
                <div className="w-px h-6 bg-slate-700 mx-1 self-center" />
                <button onClick={() => setFilterStatus("ALL")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <Filter className="w-4 h-4" /> ทั้งหมด
                </button>
            </div>

            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="ค้นหาเลข Order, ชื่อ..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
            </div>
        </div>

        {/* 3. Order Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase">
                            <th className="p-4 font-medium">Order Info</th>
                            <th className="p-4 font-medium">ลูกค้า / ข้อมูลเกม</th>
                            <th className="p-4 font-medium">ราคา</th>
                            <th className="p-4 font-medium">สถานะ</th>
                            <th className="p-4 font-medium text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-lg">#{order.id}</span>
                                            <span className="text-slate-500 text-xs">
                                                {format(new Date(order.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium text-sm">{order.product.game.title} - {order.product.name}</span>
                                            <span className="text-slate-500 text-xs">{order.user.username}</span>
                                            
                                            <div className="mt-1 space-y-0.5">
                                                 {order.uid && <div className="text-[10px] text-slate-400">UID: <span className="text-blue-400 font-mono">{order.uid}</span></div>}
                                                 {order.username && <div className="text-[10px] text-slate-400">ID: <span className="text-slate-300 font-mono">{order.username}</span></div>}
                                                 {order.password && <div className="text-[10px] text-slate-400">PW: <span className="text-red-400 font-mono">{order.password}</span></div>}
                                            </div>

                                            {order.note && order.note.includes("---") && (
                                                <div className="mt-1 flex items-center gap-1 text-xs text-orange-400 font-bold animate-pulse">
                                                    <MessageSquare className="w-3 h-3" /> ลูกค้าแจ้งปัญหา!
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-green-400">฿{order.totalPrice.toLocaleString()}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            order.status === 'PAID' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                                            order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <AdminOrderActions orderId={order.id} status={order.status} />

                                            <button 
                                                onClick={() => openReplyModal(order)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                                            >
                                                <MessageSquare className="w-3 h-3" /> ดูข้อมูล/ตอบ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-slate-500">
                                    ไม่พบรายการสั่งซื้อในหมวดนี้
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- Modal ตอบกลับ --- */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    
                    {/* Header */}
                    <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            📝 รายละเอียด Order #{selectedOrder.id}
                        </h3>
                        <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6"/>
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                            
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">ข้อความจากลูกค้า / Note</h4>
                            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
                                {selectedOrder.note || "ไม่มีข้อความเพิ่มเติม"}
                            </pre>
                            
                            {/* แสดงสลิป */}
                            {selectedOrder.imageUrl && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs font-bold text-pink-400 mb-3 flex items-center gap-2 uppercase">
                                        📸 รูปสลิปโอนเงิน (หลักฐาน)
                                    </p>
                                    <a 
                                        href={selectedOrder.imageUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="block relative w-full h-48 md:h-64 rounded-lg overflow-hidden border border-slate-700 hover:border-pink-500 transition-colors group"
                                    >
                                        <img 
                                            src={selectedOrder.imageUrl} 
                                            alt="Attached Evidence" 
                                            className="w-full h-full object-contain bg-black/80"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-bold text-sm bg-black/70 px-4 py-2 rounded-full">
                                                คลิกเพื่อดูรูปเต็ม
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            )}

                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                ตอบกลับลูกค้า <span className="text-xs text-slate-600">(จะแสดงที่หน้าประวัติของลูกค้า)</span>
                            </label>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-600"
                                rows={4}
                                placeholder="เช่น กำลังดำเนินการครับ, รหัสผิดรบกวนเช็คใหม่..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                            ></textarea>

                            {/* ✅ กล่องแนบรูปให้ลูกค้า */}
                            <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                                    <ImageIcon className="w-4 h-4"/> แนบรูปภาพให้ลูกค้า
                                </label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAdminFileChange} 
                                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                />
                                
                                {/* พรีวิวรูปก่อนส่ง */}
                                {previewUrl && (
                                    <div className="mt-4 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-600 shadow-lg">
                                        <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                                        <button 
                                            type="button"
                                            onClick={() => { setAdminImageFile(null); setPreviewUrl(null); }} 
                                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 transition-colors shadow-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-4">
                                <button 
                                    onClick={handleReply}
                                    disabled={isReplying}
                                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isReplying ? "กำลังดำเนินการ..." : <> <Send className="w-4 h-4"/> ส่งข้อความ / อัปเดต </>}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}

    </div>
  );
}