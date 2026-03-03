import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import { startOfMonth, endOfMonth, subMonths, format, eachMonthOfInterval } from "date-fns";
import { th } from "date-fns/locale";

export const dynamic = "force-dynamic";

// ✅ 1. ปรับ Type รองรับ Next.js ทุกเวอร์ชั่น
type PageProps = {
  searchParams: Promise<{ month?: string }> | { month?: string };
};

export default async function AdminDashboard({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/admin/login");

  // ✅ 2. ใส่ await ให้ searchParams เพื่อแก้อาการอ่านค่า URL ไม่เข้า
  const params = await searchParams;

  // --- 1. เตรียมตัวแปรเวลา ---
  // ✅ 3. เติม "-01" เข้าไป เพื่อบังคับให้ JS เข้าใจว่าเป็นวันที่ 1 ของเดือนนั้นๆ เสมอ (แก้ Timezone เพี้ยน)
  const selectedDate = params.month ? new Date(`${params.month}-01T00:00:00`) : new Date();
  
  const filterStart = startOfMonth(selectedDate);
  const filterEnd = endOfMonth(selectedDate);
  
  const lastMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const lastMonthEnd = endOfMonth(subMonths(selectedDate, 1));

  // ✅ 4. เปลี่ยนจาก new Date() เป็น selectedDate เพื่อให้กราฟ 12 เดือน ขยับตามเดือนที่เราเลือกดู
  const yearlyStart = subMonths(selectedDate, 11);

  // --- 2. ดึงข้อมูลแบบ Enterprise (Aggregation) ---

  // A. ยอดขายรวม & กำไร (Lifetime)
  const lifetimeStats = await prisma.order.aggregate({
    _sum: { price: true, cost: true },
    _count: { id: true },
    where: { status: 'COMPLETED' }
  });

  // B. ยอดเดือนนี้ (Selected Month)
  const thisMonthStats = await prisma.order.aggregate({
    _sum: { price: true, cost: true },
    where: { 
      createdAt: { gte: filterStart, lte: filterEnd },
      status: 'COMPLETED' 
    }
  });

  // C. ยอดเดือนก่อน (Growth Rate)
  const lastMonthStats = await prisma.order.aggregate({
    _sum: { price: true },
    where: { 
      createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      status: 'COMPLETED' 
    }
  });

  // D. จำนวน User
  const totalUsers = await prisma.user.count({ where: { role: 'USER' } });

  // --- 3. ดึงข้อมูลกราฟ ---

  // E. กราฟ Trend 12 เดือน
  const yearlyRaw = await prisma.order.findMany({
    where: { 
      createdAt: { gte: startOfMonth(yearlyStart), lte: filterEnd }, // ✅ ดึงมาสิ้นสุดแค่เดือนที่เลือก
      status: 'COMPLETED'
    },
    select: { createdAt: true, price: true, cost: true }
  });

  // F. สินค้าขายดี (Top Products)
  const topProductsRaw = await prisma.order.groupBy({
    by: ['productId'],
    where: {
      createdAt: { gte: filterStart, lte: filterEnd },
      status: 'COMPLETED'
    },
    _sum: { price: true },
    _count: { id: true },
    orderBy: { _sum: { price: 'desc' } },
    take: 5
  });

  const productIds = topProductsRaw.map(p => p.productId);
  const productsInfo = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { game: true }
  });

  // --- 4. ประมวลผลข้อมูล (Calculations) ---

  const revenueThisMonth = Number(thisMonthStats._sum.price || 0);
  const costThisMonth = Number(thisMonthStats._sum.cost || 0);
  const profitThisMonth = revenueThisMonth - costThisMonth; 

  const revenueLastMonth = Number(lastMonthStats._sum.price || 0);
  const growthRate = revenueLastMonth === 0 ? 100 : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

  const totalRevenue = Number(lifetimeStats._sum.price || 0);
  const totalCost = Number(lifetimeStats._sum.cost || 0);
  const totalProfit = totalRevenue - totalCost; 

  // เตรียมกราฟรายปี (เปลี่ยนเป้าหมายมาจบที่ selectedDate)
  const monthsList = eachMonthOfInterval({ start: yearlyStart, end: selectedDate });
  const yearlyTrend = monthsList.map(monthDate => {
      const monthKey = format(monthDate, 'MMM yyyy', { locale: th });
      
      const filteredOrders = yearlyRaw.filter(o => format(o.createdAt, 'MMM yyyy', { locale: th }) === monthKey);
      
      const revenue = filteredOrders.reduce((sum, o) => sum + Number(o.price), 0);
      const cost = filteredOrders.reduce((sum, o) => sum + Number(o.cost || 0), 0);
      
      return { 
          name: monthKey, 
          revenue: revenue,
          profit: revenue - cost 
      };
  });

  // เตรียม Top Products
  const topProducts = topProductsRaw.map(item => {
      const product = productsInfo.find(p => p.id === item.productId);
      return {
          name: product?.name || "สินค้าถูกลบ",
          game: product?.game.title || "-",
          value: item._count.id,
          revenue: Number(item._sum.price || 0)
      };
  });

  const summary = {
    totalRevenue,
    totalProfit,      
    revenueSelected: revenueThisMonth,
    profitSelected: profitThisMonth, 
    totalOrders: lifetimeStats._count.id,
    totalUsers,
    selectedMonth: format(selectedDate, 'MMMM yyyy', { locale: th }),
    growthRate
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-white">📊 แดชบอร์ด (Financial V4)</h1>
            <p className="text-slate-400">
                วิเคราะห์ยอดขายและกำไร ประจำเดือน <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4">{summary.selectedMonth}</span>
            </p>
         </div>
       </div>
       
       <AnalyticsDashboard 
          summary={summary} 
          yearlyTrend={yearlyTrend}
          topProducts={topProducts}
       />
    </div>
  );
}