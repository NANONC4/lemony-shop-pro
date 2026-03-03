import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";
import PromotionManager from "@/components/admin/PromotionManager";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  // ดึงข้อมูลจริงจาก DB
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
            <div className="bg-purple-500/10 p-3 rounded-xl">
                <Megaphone className="w-8 h-8 text-purple-400" />
            </div>
            <div>
                <h1 className="text-3xl font-bold">จัดการแบนเนอร์โปรโมชั่น</h1>
                <p className="text-slate-400">ควบคุมภาพสไลด์หน้าแรก (Hero Slider)</p>
            </div>
        </div>

        {/* เรียกใช้ Component ที่เราเพิ่งสร้างในข้อ 2 */}
        <PromotionManager initialPromotions={promotions} />
      </div>
    </div>
  );
}