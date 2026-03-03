import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function OrderManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/admin/login");

  // 1. ดึงข้อมูลออเดอร์ทั้งหมด
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: { include: { game: true } }
    }
  });

  // 2. ✅ แปลงข้อมูล (Decimal -> Number) ทั้งหมด
  const formattedOrders = orders.map((order) => ({
    ...order,
    
    // แปลงค่าเงินใน Order
    price: Number(order.price), 
    cost: Number(order.cost),

    // แปลงค่าเงินใน Product (สำคัญมาก! เพราะเพิ่งเพิ่ม cost เข้าไป)
    product: { 
        ...order.product, 
        price: Number(order.product.price),
        cost: Number(order.product.cost || 0) // ✅ เพิ่มบรรทัดนี้ แก้ Error ได้ทันที
    },

    totalPrice: Number(order.price) || Number(order.product.price),
  }));

  // Stats
  const stats = {
    totalSales: 0, 
    // 🚨 1. แก้ตรงนี้: เปลี่ยนจาก PENDING เป็น PAID
    pendingCount: orders.filter(o => o.status === 'PAID').length, 
    totalOrders: orders.length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">📦 จัดการออเดอร์ (Order Management)</h1>
      </div>
      
      <DashboardClient orders={formattedOrders as any} stats={stats} />
    </div>
  );
}