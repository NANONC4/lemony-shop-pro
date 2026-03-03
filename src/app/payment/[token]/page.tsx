"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, CheckCircle2, QrCode, AlertTriangle } from "lucide-react";

interface Props {
  params: Promise<{ token: string }>;
}

export default function PaymentPage({ params }: Props) {
  // ✅ 1. แกะ Token ออกมา (วิธีใหม่ Next.js 15)
  const { token } = use(params);
  const router = useRouter();

  // State ต่างๆ
  const [loading, setLoading] = useState(true);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("PENDING"); // PENDING | PAID

  // ✅ 2. Logic เก่า: เรียก API generate-qr (เหมือนโค้ดเก่าคุณเป๊ะ)
  useEffect(() => {
    if (!token) return;

    const initPayment = async () => {
      try {
        // ใช้ Path ตามโค้ดเก่าของคุณที่ทำงานได้
        const res = await fetch("/api/payment/generate-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }), 
        });

        const data = await res.json();

        if (data.success) {
          // ถ้าสำเร็จ เก็บค่าลง State (รองรับทั้งชื่อ image และ qrImage)
          setQrImage(data.image || data.qrImage);
          setPrice(data.amount);
          setLoading(false);
        } else {
          setError(data.error || "สร้าง QR Code ไม่สำเร็จ");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError("เชื่อมต่อ Server ไม่ได้ (API Error)");
        setLoading(false);
      }
    };

    initPayment();
  }, [token]);

  // ✅ 3. Logic เก่า: เช็คสถานะ (จำลองว่าถ้าจ่ายแล้วให้เด้งกลับ)
  useEffect(() => {
    if (status === "PAID") {
      const timer = setTimeout(() => {
        router.push("/profile/history");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  // --- ส่วนแสดงผล (UI ใหม่: Dark Theme) ---

  if (loading) return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center items-center text-white gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-lemon-400" />
        <p className="text-slate-400">กำลังเชื่อมต่อ Omise สร้าง QR Code...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center items-center text-white gap-4 p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold">เกิดข้อผิดพลาด</h2>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => router.push("/")} className="mt-4 px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">กลับหน้าหลัก</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 py-10 px-4 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
               <QrCode className="text-lemon-400" /> สแกนจ่ายเงิน
            </h1>
            <p className="text-slate-500 text-xs font-mono">TOKEN: {token.slice(0, 12)}...</p>
        </div>

        {status === "PENDING" ? (
            <>
                {/* QR Code Box */}
                <div className="bg-white p-4 rounded-xl mx-auto w-64 h-64 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative group">
                    {qrImage ? (
                        <Image 
                          src={qrImage} 
                          alt="PromptPay QR" 
                          width={250} 
                          height={250}
                          className="object-contain w-full h-full"
                          unoptimized 
                        />
                    ) : (
                        <div className="text-center text-slate-400">
                            <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2" />
                            โหลดรูปภาพ...
                        </div>
                    )}
                    
                    {/* เอฟเฟกต์มุม */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black/20" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black/20" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-black/20" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-black/20" />
                </div>

                {/* Amount */}
                <div className="text-center mb-8">
                    <p className="text-slate-400 mb-1 text-sm uppercase tracking-wider">ยอดชำระทั้งหมด</p>
                    <p className="text-5xl font-extrabold text-lemon-400 drop-shadow-lg">
                        ฿{Number(price).toLocaleString()}
                    </p>
                </div>

                {/* ปุ่ม Test Mode (ใช้ทดสอบ) */}
                <button 
                    onClick={() => setStatus("PAID")}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white py-3 rounded-xl transition text-sm font-mono border border-slate-700"
                >
                    [TEST MODE] จำลองการโอนสำเร็จ
                </button>
            </>
        ) : (
            // หน้าจอสำเร็จ (Success State)
            <div className="py-10 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">ชำระเงินเรียบร้อย!</h2>
                <p className="text-slate-400 text-sm">ขอบคุณที่ใช้บริการครับ</p>
                <p className="text-lemon-400 text-xs mt-4 animate-pulse">กำลังกลับสู่หน้าประวัติ...</p>
                
                <button 
                    onClick={() => router.push("/profile/history")}
                    className="mt-6 w-full bg-lemon-400 hover:bg-lemon-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-lemon-400/20"
                >
                    ไปดูสินค้าทันที
                </button>
            </div>
        )}

      </div>
    </div>
  );
}