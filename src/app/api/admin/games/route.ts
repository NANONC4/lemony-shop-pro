import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// UPDATE: แก้ไขข้อมูลเกม หรือ อัปเดตลำดับ
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, imageUrl, slug, order } = body;

    // กรณี 1: ถ้าส่ง order มาอย่างเดียว = คือการ update ลำดับ (Reorder)
    // (เทคนิค: ถ้าส่งมาเป็น Array คือการเรียงลำดับหลายตัวพร้อมกัน)
    if (Array.isArray(body)) {
        // body เป็น [{id: 1, order: 0}, {id: 2, order: 1}, ...]
        const updates = body.map((item: any) => 
            prisma.game.update({
                where: { id: item.id },
                data: { order: item.order }
            })
        );
        await Promise.all(updates);
        return NextResponse.json({ success: true });
    }

    // กรณี 2: แก้ไขข้อมูลเกมปกติ
    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updatedGame = await prisma.game.update({
      where: { id },
      data: {
        title,
        imageUrl,
        slug,
        order // เผื่อแก้ลำดับทีละตัว
      }
    });

    return NextResponse.json(updatedGame);

  } catch (error) {
    console.error("Update Game Error:", error);
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
  }
}

// DELETE: ลบเกม (แถมให้)
export async function DELETE(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
      await prisma.game.delete({ where: { id: Number(id) } });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
  }