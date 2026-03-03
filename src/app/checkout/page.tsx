"use client";

import { useState, useEffect, Suspense } from "react"; // ✅ 1. เพิ่ม Suspense เข้ามา
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Upload, Loader2, CheckCircle2, AlertTriangle, ChevronLeft, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";

// ✅ 2. แยกเนื้อหาเดิมออกมาเป็น Component ชื่อ CheckoutContent
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // State
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrPayload, setQrPayload] = useState("");
  const [status, setStatus] = useState("PENDING");
  
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); 
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchOrderInfo = async () => {
      try {
        const res = await fetch(`/api/orders/payment-info?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setPrice(Number(data.amount));
          setOrderId(data.id);
          generateQR(Number(data.amount));
          
          if (data.createdAt) {
            const orderTime = new Date(data.createdAt).getTime();
            const expireTime = orderTime + (15 * 60 * 1000); 
            const now = new Date().getTime();
            const diffSeconds = Math.floor((expireTime - now) / 1000);

            if (diffSeconds <= 0) {
              setIsExpired(true);
              setStatus("EXPIRED");
            } else {
              setTimeLeft(diffSeconds);
            }
          }

          setLoading(false);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    fetchOrderInfo();
  }, [token, router]);

  useEffect(() => {
    if (status !== "PENDING" || isExpired || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          setStatus("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpired, status]);

  useEffect(() => {
    if (!token || status === "PAID" || isExpired) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/check-status?token=${token}`);
        const data = await res.json();
        if (data.status === "PAID" || data.status === "COMPLETED") {
          setStatus("PAID");
        }
      } catch (error) {
        console.error("Status check failed");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [token, status, isExpired]);

  const generateQR = (amount: number) => {
    const f = (id: string, val: string) => id + ('00' + val.length).slice(-2) + val;
    const crc16 = (data: string) => { 
        let crc = 0xFFFF; 
        for (let i = 0; i < data.length; i++) { 
            let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF; 
            x ^= x >> 4; 
            crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF; 
        } 
        return ('0000' + crc.toString(16).toUpperCase()).slice(-4); 
    };
    
    const aid = f('00', 'A000000677010112'); 
    const billerId = f('01', '010753700088205'); 
    const ref1 = f('02', '1711007057345009136'); 
    const ref2 = f('03', 'DININO'); 

    const tag30 = f('30', aid + billerId + ref1 + ref2);
    let p = [f('00', '01'), f('01', '12'), tag30, f('53', '764'), f('58', 'TH'), f('54', amount.toFixed(2))];
    let data = p.join('') + '6304'; 
    setQrPayload(data + crc16(data));
  };

  const handleUploadSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const selectedFile = fileList.item(0);
    if (!selectedFile || !orderId || isExpired) return;

    setFile(selectedFile); 
    setIsVerifying(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile); 
      formData.append("orderId", orderId.toString());

      const res = await fetch("/api/orders/verify-slip", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("PAID");
        setTimeout(() => router.push("/profile/history"), 3000);
      } else {
        setErrorMsg(data.error || "สลิปไม่ถูกต้อง");
        setFile(null);
      }
    } catch (err) {
      setErrorMsg("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!token) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Token Invalid</div>;
  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-pink-500 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 flex items-center justify-center selection:bg-pink-500 overflow-hidden font-sans">
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-8 max-w-md relative z-10 flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="bg-slate-900 border border-white/10 w-full p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_#ec4899] z-20" />
          
          <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors z-20">
            <ChevronLeft className="w-6 h-6" />
          </Link>

          {status === "EXPIRED" ? (
            <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500 z-10 relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20 border border-red-500/50">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">หมดเวลาชำระเงิน</h2>
                <p className="text-slate-400 mt-2">ออเดอร์นี้ถูกยกเลิกเนื่องจากเกิน 15 นาที<br/>กรุณาทำรายการสั่งซื้อใหม่อีกครั้งครับ</p>
              </div>
              <button onClick={() => router.push("/")} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition">
                กลับสู่หน้าหลัก
              </button>
            </div>
          ) : status === "PENDING" ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-6 text-orange-400 text-sm font-bold bg-orange-400/10 py-1.5 px-4 rounded-full w-fit mx-auto border border-orange-400/20">
                <Clock className="w-4 h-4 animate-pulse" /> กรุณาชำระเงินภายใน {formatTime(timeLeft)}
              </div>

              <div className="text-center mb-8">
                <p className="text-slate-400 text-sm mb-1">ยอดชำระทั้งสิ้น</p>
                <h2 className="text-4xl font-black text-white tracking-tight">฿{price.toLocaleString()}</h2>
              </div>

              <div className="bg-white p-6 rounded-3xl mb-6 flex flex-col items-center relative shadow-inner">
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px', textAlign: 'center' }}>สแกนด้วยแอพธนาคาร (ยอดจะขึ้นอัตโนมัติ)</p>
                
                <div className="relative w-[220px] h-[220px] overflow-hidden">
                  <QRCodeSVG value={qrPayload} size={220} level="M" className="block" />

                  <div 
                    className="absolute inset-0 flex items-center justify-center text-center font-sans font-black pointer-events-none select-none z-10 whitespace-nowrap leading-[1.3]"
                    style={{ 
                      fontSize: '1.2rem', 
                      color: 'rgba(220, 0, 0, 0.85)', 
                      textShadow: '1px 1px 3px rgba(255,255,255,1)' 
                    }}
                  >
                    ใช้สำหรับเติมเกม<br/>ร้าน Lemony เท่านั้น<br/>โปรดระวังบุคคลแอบอ้าง
                  </div>
                </div>

                <div className="mt-4 bg-red-50 border border-red-100 px-3 py-2 rounded-lg text-center w-full">
                  <p className="text-red-600 font-bold text-[11px] leading-relaxed">
                    ⚠️ รับชำระผ่านแอปธนาคารเท่านั้น
                    <br />
                    สลิปต้องมี QR Code ไม่งั้นระบบจะตรวจสอบไม่ได้
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-red-400 text-xs text-center font-bold animate-shake">
                  {errorMsg}
                </div>
              )}

              <label className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold cursor-pointer transition-all ${
                isVerifying ? "bg-slate-800 text-slate-500" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/20 hover:-translate-y-1"
              }`}>
                {isVerifying ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> กำลังตรวจสอบ...</>
                ) : (
                  <><Upload className="w-5 h-5" /> อัปโหลดสลิปโอนเงิน</>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadSlip} disabled={isVerifying || isExpired} />
              </label>
              
              <div className="mt-6 text-center">
                <a 
                  href={`https://m.me/yourfacebookpage?ref=${token}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-pink-400 text-sm underline decoration-slate-600 hover:decoration-pink-400 transition-colors"
                >
                  ระบบสแกนมีปัญหา? คลิกเพื่อส่งสลิปให้แอดมินโดยตรง
                </a>
              </div>
            </>
          ) : (
            <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500 z-10 relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 border border-green-500/50">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">ชำระเงินสำเร็จ!</h2>
                <p className="text-slate-400 mt-2">ระบบได้รับยอดเงินเรียบร้อยแล้วครับ</p>
              </div>
              <button onClick={() => router.push("/profile/history")} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition">
                ไปหน้าประวัติการซื้อ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ 3. สร้าง Component หลัก แล้วเอา Suspense ครอบ
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-pink-500" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}