import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js"; // ✅ 1. เพิ่ม Import Supabase
import { sendLineMessage } from "@/lib/line"; // ✅ 1. เพิ่ม Import ฟังก์ชันส่งข้อความ LINE
// ✅ 2. สร้างตัวแปรเชื่อมต่อ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // รับข้อมูลแบบ FormData (รูปภาพ + orderId)
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const orderId = Number(formData.get("orderId"));

    if (!file || !orderId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // 1. ดึงข้อมูลออเดอร์
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "ไม่พบออเดอร์ในระบบ" }, { status: 404 });

    // 🚨 ด่านป้องกัน ABC Scam (1): เช็คสถานะ และ เวลาออเดอร์
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: `ออเดอร์นี้อยู่ในสถานะ ${order.status} ไม่สามารถชำระเงินได้` }, { status: 400 });
    }

    const now = new Date();
    const orderAgeMinutes = (now.getTime() - order.createdAt.getTime()) / (1000 * 60);
    
    if (orderAgeMinutes > 15) {
      // ถ้าเกิน 15 นาที ยกเลิกออเดอร์นี้ทิ้งทันที! ป้องกันโจรดองออเดอร์ไว้หลอกคนอื่น
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      return NextResponse.json({ error: "❌ ออเดอร์นี้หมดเวลาชำระเงินแล้ว (เกิน 15 นาที)" }, { status: 400 });
    }

    // 2. ส่งรูปไปให้ Easy Slip ตรวจสอบ
    const slipFormData = new FormData();
    slipFormData.append("file", file);

    const easySlipRes = await fetch("https://developer.easyslip.com/api/v1/verify", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.EASYSLIP_API_KEY}`,
      },
      body: slipFormData,
    });

    const slipData = await easySlipRes.json();

    // ด่าน 1: เช็คว่าใช่สลิปไหม
    if (slipData.status !== 200 || !slipData.data) {
      return NextResponse.json({ error: "❌ สแกนไม่ผ่าน: ไม่ใช่รูปสลิป หรือ QR Code ไม่ชัด" }, { status: 400 });
    }

    const payload = slipData.data;

    // ----------------------------------------------------
    // 🛡️ ด่านตรวจสอบความปลอดภัย (Security Checks)
    // ----------------------------------------------------

    // ด่าน 2: เช็คสลิปซ้ำ
    const isDuplicate = await prisma.order.findUnique({
      where: { slipRef: payload.transRef }
    });
    if (isDuplicate) {
      return NextResponse.json({ error: "❌ สลิปนี้ถูกใช้งานไปแล้วในระบบ (ห้ามใช้ซ้ำ)" }, { status: 400 });
    }

    // ด่าน 3: เช็คบัญชีถุงเงิน (Biller ID หรือ ชื่อร้าน DININO)
    const MY_BILLER_ID = "010753700088205"; // เลขร้านค้าของคุณ
    const VALID_NAMES = ["DININO", "LEMONYSHOP", "LEMONY"]; 
    
    const receiverProxy = payload.receiver.proxy?.value || payload.receiver.account?.value || ""; 
    const receiverName = (payload.receiver.account?.name?.th || payload.receiver.account?.name?.en || payload.receiver.name || "").toUpperCase();

    const isCorrectBiller = receiverProxy.includes(MY_BILLER_ID);
    const isCorrectName = VALID_NAMES.some(name => receiverName.includes(name));

    if (!isCorrectBiller && !isCorrectName) {
      return NextResponse.json({ error: `❌ โอนผิดบัญชี (ไม่ใช่บิลของ Lemony Shop หรือ DININO)` }, { status: 400 });
    }

    // ด่าน 4: เช็คยอดเงิน
    const paidAmount = Number(payload.amount.amount);
    const orderPrice = Number(order.price);
    if (paidAmount < orderPrice) {
      return NextResponse.json({ error: `❌ ยอดเงินไม่ครบ (โอนมา ${paidAmount} บ. / ต้องจ่าย ${orderPrice} บ.)` }, { status: 400 });
    }

    // ด่าน 5: เช็คเวลาโอน (🚨 Ultimate ABC Killer 🗡️)
    const slipTime = new Date(payload.transDate || payload.date).getTime(); 
    const orderTime = order.createdAt.getTime();
    
    // 5.1 เวลาโอนต้อง "หลัง" จากที่สร้างออเดอร์ (ลบเผื่อเวลาเซิร์ฟเวอร์กับธนาคารไม่ตรงกันให้ 2 นาที)
    if (slipTime < (orderTime - 2 * 60 * 1000)) {
      return NextResponse.json({ error: "❌ สลิปไม่ถูกต้อง (รูปสลิปนี้โอนเงินก่อนที่จะกดสั่งซื้อ!)" }, { status: 400 });
    }

    // 5.2 ต้องส่งสลิปภายใน 15 นาทีหลังโอนเงิน
    const diffInMinutes = (now.getTime() - slipTime) / (1000 * 60);
    if (diffInMinutes > 15) {
      return NextResponse.json({ error: "❌ สลิปหมดอายุ (โอนเกิน 15 นาทีแล้ว)" }, { status: 400 });
    }

    // ----------------------------------------------------
    // ✅ 3. ผ่านทุกด่าน! เปลี่ยนจากเซฟ Base64 มาโยนขึ้น Supabase
    // ----------------------------------------------------
    
    // เตรียมไฟล์เป็นก้อน Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // สกัดนามสกุลไฟล์
    const ext = file.type.split('/') || 'png';
    const fileName = `slip-${order.id}-${Date.now()}.${ext}`;

    // โยนไฟล์เข้า Storage
    const { error: uploadError } = await supabase.storage
      .from('order-slips')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      throw new Error("ระบบฝากรูปภาพมีปัญหา");
    }

    // ดึง URL ตัวเต็มออกมา
    const { data: publicUrlData } = supabase.storage
      .from('order-slips')
      .getPublicUrl(fileName);

    const finalImageUrl = publicUrlData.publicUrl;

    // อัปเดตข้อมูลลง Prisma
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID", 
        imageUrl: finalImageUrl, // 🚀 เปลี่ยนเป็นเก็บ URL สั้นๆ แล้ว!
        slipRef: payload.transRef
      }
    });
await sendLineMessage(`🔔 [ออเดอร์ใหม่]\nออเดอร์: #${order.id}\nยอดโอน: ${orderPrice} บ.\nสถานะ: จ่ายเงินแล้ว (รอเติมเกม)`);

    return NextResponse.json({ success: true });
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Slip Verification Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบสลิป กรุณาลองใหม่" }, { status: 500 });
  }
}