import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-slate-300 pb-20 pt-10">
      <div className="container max-w-3xl mx-auto px-6">
        
        {/* Navigation */}
        <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าหลัก
            </Link>
        </div>

        {/* Document Header */}
        <header className="border-b border-white/10 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">เงื่อนไขการให้บริการ (Terms of Service)</h1>
            <p className="text-sm text-slate-500">
                อัปเดตล่าสุดเมื่อ: 10 กุมภาพันธ์ 2024 | โดย Lemony Shop Pro
            </p>
        </header>

        {/* Document Content */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed">
            
            <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. ข้อตกลงทั่วไป</h2>
                <p>
                    เว็บไซต์ Lemony Shop Pro ("ผู้ให้บริการ") ให้บริการเติมเงินเกมออนไลน์และจำหน่ายบัตรเติมเงิน การเข้าใช้บริการผ่านเว็บไซต์นี้ถือว่าผู้ใช้บริการ ("ลูกค้า") ได้อ่าน เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขฉบับนี้โดยสมบูรณ์ หากท่านไม่ยอมรับเงื่อนไขส่วนใดส่วนหนึ่ง กรุณายุติการใช้บริการทันที
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. การสั่งซื้อและการชำระเงิน</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>ลูกค้ามีหน้าที่ตรวจสอบความถูกต้องของข้อมูลการสั่งซื้อ ได้แก่ UID (User ID), Server, ชื่อตัวละคร และแพ็กเกจที่เลือก ก่อนทำการยืนยันรายการ</li>
                    <li>ทางร้านขอสงวนสิทธิ์ไม่รับผิดชอบ และไม่คืนเงินทุกกรณี หากความผิดพลาดเกิดจากการกรอกข้อมูลไม่ถูกต้องของลูกค้าเอง</li>
                    <li>การชำระเงินจะต้องดำเนินการผ่านช่องทางที่ทางร้านกำหนดเท่านั้น (เช่น การสแกน QR Code) และต้องแนบหลักฐานการชำระเงินที่ถูกต้องและตรวจสอบได้</li>
                    <li>หากตรวจพบการทุจริต เช่น การใช้สลิปปลอม หรือการฉ้อโกง ทางร้านจะระงับบัญชีผู้ใช้ทันทีและดำเนินคดีตามกฎหมาย</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. นโยบายการคืนเงิน (Refund Policy)</h2>
                <p className="mb-2">ทางร้านมีนโยบายคืนเงินเต็มจำนวนให้แก่ลูกค้าเฉพาะในกรณีดังต่อไปนี้:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>สินค้าหมดสต็อก หรือไม่สามารถจัดส่งสินค้าได้ภายในระยะเวลา 24 ชั่วโมงหลังจากได้รับแจ้งโอนเงิน</li>
                    <li>เกิดข้อผิดพลาดจากระบบของทางร้านที่ทำให้ไม่สามารถเติมเงินเข้าสู่บัญชีของลูกค้าได้</li>
                </ul>
                <p className="mt-4 p-4 bg-[#111] border border-white/10 rounded-lg text-slate-400">
                    <strong>ข้อยกเว้น:</strong> เมื่อสถานะคำสั่งซื้อระบุว่า "สำเร็จ" (Success) หรือ "เสร็จสิ้น" (Completed) ซึ่งหมายถึงระบบได้ทำการเติมไอเทมหรือพอยท์เข้าสู่บัญชีเกมเรียบร้อยแล้ว จะไม่สามารถยกเลิกหรือขอคืนเงินได้ในทุกกรณี
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. ข้อจำกัดความรับผิดชอบ</h2>
                <p>
                    Lemony Shop Pro เป็นเพียงตัวกลางในการให้บริการเติมเงินเท่านั้น ทางร้านไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดขึ้นกับบัญชีเกมของลูกค้า อันเนื่องมาจากการกระทำของผู้พัฒนาเกม (Game Developer) หรือกฎระเบียบของเกมนั้นๆ เช่น การถูกระงับบัญชี (Ban) อย่างไรก็ตาม ทางร้านยืนยันว่ากระบวนการเติมเงินของเราใช้วิธีการที่ถูกต้องและปลอดภัย (White Method) ไม่มีการ Refund หรือดึงยอดคืนภายหลัง
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. การเปลี่ยนแปลงเงื่อนไข</h2>
                <p>
                    ทางร้านขอสงวนสิทธิ์ในการแก้ไข เปลี่ยนแปลง หรือยกเลิกข้อกำหนดและเงื่อนไขฉบับนี้ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า โดยเงื่อนไขใหม่จะมีผลบังคับใช้ทันทีที่ประกาศบนเว็บไซต์
                </p>
            </section>

        </div>

        {/* Footer Signature */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-600 text-sm">
            <p>เอกสารฉบับนี้ถือเป็นลิขสิทธิ์ของ Lemony Shop Pro ห้ามคัดลอกหรือดัดแปลงโดยไม่ได้รับอนุญาต</p>
        </div>

      </div>
    </div>
  );
}