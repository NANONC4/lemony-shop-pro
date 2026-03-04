import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js"; 
import { sendLineMessage } from "@/lib/line"; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const orderId = Number(formData.get("orderId"));

    if (!file || !orderId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "ไม่พบออเดอร์ในระบบ" }, { status: 404 });

    if (order.status !== "PENDING") {
      return NextResponse.json({ error: `ออเดอร์นี้อยู่ในสถานะ ${order.status} ไม่สามารถชำระเงินได้` }, { status: 400 });
    }

    const now = new Date();
    const orderAgeMinutes = (now.getTime() - order.createdAt.getTime()) / (1000 * 60);
    
    if (orderAgeMinutes > 15) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      return NextResponse.json({ error: "❌ ออเดอร์นี้หมดเวลาชำระเงินแล้ว (เกิน 15 นาที)" }, { status: 400 });
    }

    let slipData: any = null;
    let isSlipReadSuccess = false;

    // Retry 3 รอบ
    for (let attempt = 1; attempt <= 3; attempt++) {
      const slipFormData = new FormData();
      slipFormData.append("file", file);

      try {
        const easySlipRes = await fetch("https://developer.easyslip.com/api/v1/verify", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.EASYSLIP_API_KEY}`,
          },
          body: slipFormData,
        });

        const tempSlipData = await easySlipRes.json();

        if (tempSlipData.status === 200 && tempSlipData.data) {
          slipData = tempSlipData;
          isSlipReadSuccess = true;
          break; 
        }
      } catch (err) {
        console.log(`ตรวจสอบสลิปครั้งที่ ${attempt} ล้มเหลว`);
      }

      if (attempt < 3) {
        await delay(3000); 
      }
    }

    // 🚨 ปิดช่องโหว่: ถ้าอ่าน QR ไม่ออก (หรือแนบรูปอื่นมา) ให้เตะออกทันที!
    if (!isSlipReadSuccess || !slipData) {
       return NextResponse.json({ error: "❌ สแกนไม่ผ่าน: ไม่ใช่รูปสลิป, ลวดลายเยอะเกินไป หรือ QR Code ไม่ชัดเจน" }, { status: 400 });
    }

    // --- ถ้ามาถึงตรงนี้ได้ แปลว่ารูปสลิปของจริงแน่นอน ---
    const payload = slipData.data;

    const isDuplicate = await prisma.order.findUnique({
      where: { slipRef: payload.transRef }
    });
    if (isDuplicate) {
      return NextResponse.json({ error: "❌ สลิปนี้ถูกใช้งานไปแล้วในระบบ (ห้ามใช้ซ้ำ)" }, { status: 400 });
    }

    const VALID_PROXIES = ["010753700088205", "1711007057345009136"]; 
    const VALID_NAMES = ["DININO", "LEMONYSHOP", "LEMONY", "ถุงเงิน"]; 
    
    const receiverProxy = payload.receiver.proxy?.value || payload.receiver.account?.value || ""; 
    const receiverName = (payload.receiver.account?.name?.th || payload.receiver.account?.name?.en || payload.receiver.name || "").toUpperCase();

    const isCorrectBiller = VALID_PROXIES.some(proxy => receiverProxy.includes(proxy));
    const isCorrectName = VALID_NAMES.some(name => receiverName.includes(name));

    if (!isCorrectBiller && !isCorrectName) {
      return NextResponse.json({ error: `❌ โอนผิดบัญชี (ไม่ใช่บิลของ Lemony Shop หรือ DININO)` }, { status: 400 });
    }

    const paidAmount = Number(payload.amount.amount);
    const orderPrice = Number(order.price);
    if (paidAmount < orderPrice) {
      return NextResponse.json({ error: `❌ ยอดเงินไม่ครบ (โอนมา ${paidAmount} บ. / ต้องจ่าย ${orderPrice} บ.)` }, { status: 400 });
    }

    const slipTime = new Date(payload.transDate || payload.date).getTime(); 
    const orderTime = order.createdAt.getTime();
    
    if (slipTime < (orderTime - 2 * 60 * 1000)) {
      return NextResponse.json({ error: "❌ สลิปไม่ถูกต้อง (รูปสลิปนี้โอนเงินก่อนที่จะกดสั่งซื้อ!)" }, { status: 400 });
    }

    const diffInMinutes = (now.getTime() - slipTime) / (1000 * 60);
    if (diffInMinutes > 15) {
      return NextResponse.json({ error: "❌ สลิปหมดอายุ (โอนเกิน 15 นาทีแล้ว)" }, { status: 400 });
    }

    // --- ผ่านทุกด่านฉลุย เตรียมอัปโหลดรูป ---
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const ext = file.type.split('/')[1] || 'png';
    const fileName = `slip-${order.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('order-slips')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      throw new Error("ระบบฝากรูปภาพมีปัญหา");
    }

    const { data: publicUrlData } = supabase.storage
      .from('order-slips')
      .getPublicUrl(fileName);

    const finalImageUrl = publicUrlData.publicUrl;

    // --- บันทึกลงฐานข้อมูล ---
    await prisma.order.update({
      where: { id: order.id },
      data: {
          status: "PAID", 
          imageUrl: finalImageUrl, 
          slipRef: payload.transRef
      }
    });

    await sendLineMessage(`🔔 [ออเดอร์ใหม่]\nออเดอร์: #${order.id}\nยอดโอน: ${orderPrice} บ.\nสถานะ: จ่ายเงินแล้ว (รอเติมเกม)`);

    return NextResponse.json({ success: true, status: "PAID" });

  } catch (error) {
    console.error("Slip Verification Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบสลิป กรุณาลองใหม่" }, { status: 500 });
  }
}