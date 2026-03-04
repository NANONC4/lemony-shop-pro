import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js"; 
import { sendLineMessage } from "@/lib/line"; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ฟังก์ชันหน่วงเวลา (Delay)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    // ========================================================
    // 🔄 2. ระบบตรวจสอบสลิปแบบ 3-Retry (ลองซ้ำ 3 ครั้ง)
    // ========================================================
    let slipData: any = null;
    let isSlipReadSuccess = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const slipFormData = new FormData();
      slipFormData.append("file", file); // ต้อง append ใหม่ทุกรอบ

      try {
        const easySlipRes = await fetch("https://developer.easyslip.com/api/v1/verify", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.EASYSLIP_API_KEY}`,
          },
          body: slipFormData,
        });

        const tempSlipData = await easySlipRes.json();

        // ถ้าสแกนผ่านและได้ข้อมูลมา
        if (tempSlipData.status === 200 && tempSlipData.data) {
          slipData = tempSlipData;
          isSlipReadSuccess = true;
          break; // สแกนผ่านแล้ว ออกจากลูปได้เลย!
        }
      } catch (err) {
        console.log(`ตรวจสอบสลิปครั้งที่ ${attempt} ล้มเหลว (Network/API Error)`);
      }

      // ถ้ายังไม่ผ่าน และยังไม่ถึงรอบสุดท้าย ให้รอ 3 วินาทีแล้วลองใหม่
      if (attempt < 3) {
        await delay(3000); 
      }
    }

    // ========================================================
    // 🛡️ 3. ตรวจสอบความปลอดภัย (ทำเฉพาะถ้าอ่าน QR ออก)
    // ========================================================
    let finalStatus = "PAID";
    let slipRefToSave = null;
    let adminAlertMsg = "";

    if (isSlipReadSuccess && slipData) {
      const payload = slipData.data;

      // ด่าน 2: เช็คสลิปซ้ำ
      const isDuplicate = await prisma.order.findUnique({
        where: { slipRef: payload.transRef }
      });
      if (isDuplicate) {
        return NextResponse.json({ error: "❌ สลิปนี้ถูกใช้งานไปแล้วในระบบ (ห้ามใช้ซ้ำ)" }, { status: 400 });
      }

      // ✅ ด่าน 3: เช็คบัญชีถุงเงิน (อัปเดตรองรับทั้ง SCB และ KBank แล้ว)
      const VALID_PROXIES = ["010753700088205", "1711007057345009136"]; // ใส่เลขร้านค้า และเลข Wallet
      const VALID_NAMES = ["DININO", "LEMONYSHOP", "LEMONY", "ถุงเงิน"]; 
      
      const receiverProxy = payload.receiver.proxy?.value || payload.receiver.account?.value || ""; 
      const receiverName = (payload.receiver.account?.name?.th || payload.receiver.account?.name?.en || payload.receiver.name || "").toUpperCase();

      const isCorrectBiller = VALID_PROXIES.some(proxy => receiverProxy.includes(proxy));
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

      slipRefToSave = payload.transRef;
      finalStatus = "PAID";
      adminAlertMsg = `🔔 [ออเดอร์ใหม่]\nออเดอร์: #${order.id}\nยอดโอน: ${orderPrice} บ.\nสถานะ: จ่ายเงินแล้ว (รอเติมเกม)`;

    } else {
      // ⚠️ แผนสำรอง: ถ้าอ่าน QR ไม่ออก (เช่น พื้นหลังลายเยอะไป)
      // อนุญาตให้อัปโหลด แต่ให้แอดมินเช็คด้วยตาเปล่า
      finalStatus = "PENDING_MANUAL";
      adminAlertMsg = `⚠️ [ระบบสแกนสลิปไม่ผ่าน]\nออเดอร์: #${order.id}\nยอดที่ต้องโอน: ${order.price} บ.\n*กรุณาตรวจสอบสลิปด้วยตาเปล่าในระบบ*`;
    }

    // ========================================================
    // ☁️ 4. อัปโหลดรูปขึ้น Supabase
    // ========================================================
    
    // เตรียมไฟล์เป็นก้อน Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // สกัดนามสกุลไฟล์
    const ext = file.type.split('/')[1] || 'png';
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

    // ========================================================
    // 💾 5. อัปเดตข้อมูลลงฐานข้อมูล
    // ========================================================
    const updateData: any = {
        status: finalStatus, 
        imageUrl: finalImageUrl, 
    };

    // ใส่ Note เพิ่มเพื่อให้แอดมินรู้ว่าทำไมถึงเด้งมาโหมด Manual
    if (finalStatus === "PENDING_MANUAL") {
        const manualNote = "[ระบบสแกน QR Code ไม่ผ่าน กรุณาตรวจสอบยอดเงินด้วยตัวเอง]";
        updateData.note = order.note ? `${order.note}\n${manualNote}` : manualNote;
    }
    
    // ถ้ามี Ref (กรณีอ่านผ่าน) ก็บันทึกไว้กันคนเอามาใช้ซ้ำ
    if (slipRefToSave) {
        updateData.slipRef = slipRefToSave;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: updateData
    });

    // ส่งแจ้งเตือนเข้า LINE
    await sendLineMessage(adminAlertMsg);

    return NextResponse.json({ success: true, status: finalStatus });

  } catch (error) {
    console.error("Slip Verification Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบสลิป กรุณาลองใหม่" }, { status: 500 });
  }
}