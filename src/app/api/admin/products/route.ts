import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 1. API แก้ไขข้อมูลสินค้า (PUT)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // ✅ เพิ่ม cost (ต้นทุน) เข้ามาด้วย
    const { id, name, price, cost, imageUrl } = body; 

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        price: Number(price),
        cost: Number(cost || 0), // ✅ บันทึกต้นทุน (ถ้าไม่มีใส่ 0)
        imageUrl,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// 2. API สร้างสินค้าใหม่ (POST)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // ✅ รับ cost และ gameId
    const { name, price, cost, imageUrl, gameId } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        cost: Number(cost || 0), // ✅ บันทึกต้นทุน
        imageUrl,
        gameId: Number(gameId) // ผูกกับเกม ID นี้
      }
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Create Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// 3. API ลบสินค้า (DELETE) - อันนี้ถูกต้องแล้วครับ
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    await prisma.product.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}