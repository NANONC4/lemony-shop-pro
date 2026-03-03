import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductManager from "@/components/admin/ProductManager"; 
// ✅ 1. Import ปุ่มเข้ามา
import CreateGameButton from "@/components/admin/CreateGameButton"; 

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  
  // เช็คสิทธิ์ Admin
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/admin/login");
  }

  // 1. ดึงข้อมูลเกมและสินค้าทั้งหมด
  const games = await prisma.game.findMany({
    include: {
      products: {
        orderBy: { price: 'asc' } // เรียงสินค้าตามราคา
      }
    },
    orderBy: { order: 'asc' }
  });

  // 2. ✅ แปลงข้อมูล Decimal -> Number
  const sanitizedGames = games.map((game) => ({
    ...game,
    products: game.products.map((product) => ({
      ...product,
      // แปลงราคาขาย
      price: Number(product.price),
      // ✅ แปลงต้นทุนสินค้า
      cost: Number(product.cost || 0), 
    })),
  }));

  return (
    <div className="space-y-6">
      {/* ส่วนหัวข้อ และ ปุ่มเพิ่มเกม */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">📦 จัดการสินค้า (Products)</h1>
          <p className="text-slate-400">เพิ่ม ลบ แก้ไข เกมและแพ็กเกจสินค้า</p>
        </div>

        {/* ✅ 2. วางปุ่มเพิ่มเกมตรงนี้ (มุมขวาบน) */}
        <div>
           <CreateGameButton />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
         {/* ส่งข้อมูลที่แปลงแล้วเข้าไป */}
         <ProductManager initialGames={sanitizedGames} />
      </div>
    </div>
  );
}