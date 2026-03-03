import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ShopClient from "./ShopClient";

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;

  // 1. ดึงข้อมูลดิบจาก Database มาก่อน (ตั้งชื่อว่า gameData)
  const gameData = await prisma.game.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!gameData) return notFound();

  // 2. 🔧 แปลงร่าง Decimal ให้เป็น Number ธรรมดา เพื่อให้ส่งไปหน้าบ้านได้
  const game = {
    ...gameData,
    products: gameData.products.map((product) => ({
      ...product,
      // ตรงนี้คือหัวใจสำคัญครับ .toNumber() เปลี่ยน Object เป็นตัวเลขปกติ
      price: product.price.toNumber(), 
    })),
  };

  // 3. ส่งข้อมูลที่แปลงแล้ว (game) ไปให้ ShopClient
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <ShopClient game={game} />
    </div>
  );
}