"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react"; // ✅ เพิ่ม useEffect

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  // ✅ แก้ไขเรื่อง Hydration ให้ถูกต้องตาม React Hook
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // หรือ return Skeleton loader
  }

  // ถ้ามีรูปแล้ว
  if (value) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-700 group">
        {/* ✅ ใส่ unoptimized เพื่อแก้ปัญหาเรื่องรูป SVG หรือรูปที่ Next.js process ไม่ทัน */}
        <Image 
          fill 
          src={value} 
          alt="Upload" 
          className="object-cover" 
          unoptimized 
        />
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={() => onRemove(value)}
            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg shadow-md transition-all opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่มีรูป (Dropzone)
  return (
    <div className="w-full bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-colors">
      <UploadDropzone
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          if (res?.[0]) {
            onChange(res[0].url);
            alert("อัปโหลดเรียบร้อย! ✅");
          }
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
        appearance={{
          button: "bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg mt-4",
          container: "p-8 flex flex-col items-center justify-center gap-2",
          label: "text-slate-400 text-sm hover:text-blue-400 cursor-pointer",
          allowedContent: "text-slate-600 text-xs"
        }}
        content={{
            label: "ลากรูปมาวาง หรือ คลิกเพื่อเลือกรูป",
            allowedContent: "รองรับ .JPG, .PNG (สูงสุด 4MB)"
        }}
      />
    </div>
  );
}