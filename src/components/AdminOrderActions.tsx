"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  orderId: number;
  status: string;
}

export default function AdminOrderActions({ orderId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    if (!confirm(`ยืนยันเปลี่ยนสถานะเป็น ${newStatus}?`)) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        router.refresh(); // ✅ สั่งให้หน้า Dashboard โหลดข้อมูลใหม่ทันที
      } else {
        alert("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error(error);
      alert("เชื่อมต่อ Server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-slate-400" />;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* ปุ่มจบงาน (แสดงเมื่อยังไม่เสร็จ) */}
      {status !== "COMPLETED" && status !== "CANCELLED" && (
        <button
          onClick={() => updateStatus("COMPLETED")}
          title="เติมเสร็จแล้ว"
          className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
        >
          <Check className="w-4 h-4" />
        </button>
      )}

      {/* ปุ่มแจ้งปัญหา */}
      {status !== "ISSUE" && status !== "COMPLETED" && status !== "CANCELLED" && (
        <button
          onClick={() => updateStatus("ISSUE")}
          title="แจ้งปัญหา"
          className="p-1.5 bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
      )}

      {/* ปุ่มยกเลิก */}
      {status !== "CANCELLED" && status !== "COMPLETED" && (
        <button
          onClick={() => updateStatus("CANCELLED")}
          title="ยกเลิกรายการ"
          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}