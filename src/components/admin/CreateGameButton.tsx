"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateGameButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title) return;
    setLoading(true);
    try {
      const res = await fetch("/api/games", { // ยิงไป API สร้างเกม
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug: title.toLowerCase().replace(/\s+/g, '-') })
      });
      if (res.ok) {
        setTitle("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) { alert("Error"); } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg">
        <Plus size={20} /> เพิ่มเกมใหม่
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">สร้างเกมใหม่</h3>
            <input autoFocus type="text" placeholder="ชื่อเกม..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white mb-4" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-400">ยกเลิก</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}