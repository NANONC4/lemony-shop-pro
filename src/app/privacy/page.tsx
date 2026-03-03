import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-white mb-2">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
            <p className="text-sm text-slate-500">
                มีผลบังคับใช้ตั้งแต่วันที่: 10 กุมภาพันธ์ 2024
            </p>
        </header>

        {/* Document Content */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed">
            
            <section>
                <p>
                    Lemony Shop Pro ("เรา") ให้ความสำคัญอย่างยิ่งต่อการคุ้มครองข้อมูลส่วนบุคคลของลูกค้า นโยบายความเป็นส่วนตัวฉบับนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลของท่าน เมื่อท่านใช้บริการเว็บไซต์ของเรา
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
                <p className="mb-2">ในการให้บริการเติมเกม เราจำเป็นต้องเก็บรวบรวมข้อมูลบางประการจากท่าน ดังนี้:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>ข้อมูลบัญชีเกม:</strong> User ID (UID), ชื่อตัวละคร (Character Name), Server หรือข้อมูลการล็อกอิน (ID/Password) เฉพาะในกรณีที่เกมนั้นจำเป็นต้องใช้ในการเติม</li>
                    <li><strong>ข้อมูลการติดต่อ:</strong> ชื่อผู้ใช้งาน (Username), เบอร์โทรศัพท์ หรือช่องทางติดต่อกลับอื่นๆ</li>
                    <li><strong>ข้อมูลการชำระเงิน:</strong> หลักฐานการโอนเงิน (Slip), เวลาที่โอนเงิน และจำนวนเงิน</li>
                    <li><strong>ข้อมูลทางเทคนิค:</strong> ที่อยู่ IP Address, ประเภทของอุปกรณ์ที่ใช้เข้าถึงเว็บไซต์ (เพื่อความปลอดภัยและป้องกันการทุจริต)</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. วัตถุประสงค์การใช้ข้อมูล</h2>
                <p>เราใช้ข้อมูลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้เท่านั้น:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>เพื่อดำเนินการเติมเงินเกมตามคำสั่งซื้อของท่านให้สำเร็จ</li>
                    <li>เพื่อตรวจสอบสถานะการชำระเงินและป้องกันการฉ้อโกง</li>
                    <li>เพื่อติดต่อประสานงานในกรณีที่คำสั่งซื้อมีปัญหา</li>
                    <li>เพื่อปรับปรุงคุณภาพการให้บริการของเว็บไซต์</li>
                </ul>
                <p className="mt-2 text-white font-medium">
                    *เรายืนยันว่าจะไม่มีการนำข้อมูลส่วนตัวของท่านไปจำหน่าย จ่ายแจก หรือแลกเปลี่ยนให้กับบุคคลภายนอกโดยเด็ดขาด เว้นแต่จะได้รับความยินยอมจากท่าน หรือเป็นไปตามข้อบังคับทางกฎหมาย
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. มาตรการความปลอดภัยของข้อมูล</h2>
                <p>
                    เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง การใช้ หรือการเปิดเผยข้อมูลส่วนบุคคลโดยไม่ได้รับอนุญาต สำหรับข้อมูลที่มีความละเอียดอ่อนสูง เช่น ID/Password ของบัญชีเกม (สำหรับแพ็กเกจ ID Pass) ทางร้านมีมาตรการปฏิบัติงานที่เคร่งครัด:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>เจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้นที่จะเข้าถึงข้อมูลดังกล่าวได้เพื่อทำการเติมเงิน</li>
                    <li>ข้อมูล ID/Password จะไม่ถูกบันทึกถาวรในระบบ และจะถูกทำลายหลังจากคำสั่งซื้อเสร็จสมบูรณ์</li>
                    <li>เราแนะนำให้ลูกค้าทำการเปลี่ยนรหัสผ่านทันทีหลังจากได้รับสินค้าเรียบร้อยแล้ว</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. ระยะเวลาการจัดเก็บข้อมูล</h2>
                <p>
                    เราจะจัดเก็บข้อมูลส่วนบุคคลของท่านเท่าที่จำเป็นตามระยะเวลาที่กฎหมายกำหนด หรือตามความจำเป็นเพื่อวัตถุประสงค์ในการให้บริการและการตรวจสอบย้อนหลัง (เช่น ประวัติการสั่งซื้อเพื่อการเคลมสินค้า)
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. ช่องทางการติดต่อ</h2>
                <p>
                    หากท่านมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติมเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อเราได้ที่:
                    <br />
                    Facebook Page: Lemony Shop
                    <br />
                    Line Official: @lemonyshop
                </p>
            </section>

        </div>

    </div>
    </div>
  );
}