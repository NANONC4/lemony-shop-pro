"use client";

import { Facebook, CheckCircle, ThumbsUp, MessageCircle, Gift, Sparkles } from "lucide-react";
import Image from "next/image";

export default function FacebookPromo() {
  const facebookUrl = "https://www.facebook.com/gshsj.susis";

  return (
    <section className="w-full max-w-[90rem] mx-auto px-4 md:px-8 py-20">
      
      {/* ✅ เปลี่ยนจาก items-center เป็น items-start เพื่อจัดระดับความสูงเอง */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* =========================================
            🔴 ฝั่งซ้าย: Facebook Card
            ✅ เพิ่ม mt-12 เพื่อดันลงมาให้ตรงกับคำว่า "ติดตามเพจวันนี้"
           ========================================= */}
        <div className="relative group w-full lg:mt-12">
          
          {/* Effect แสงด้านหลัง */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <a 
            href={facebookUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="relative block w-full bg-[#18191a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transform transition-transform duration-500 hover:-translate-y-1"
          >
            {/* รูปปก (ความสูง h-40 md:h-52 ตามที่ชอบ) */}
            <div className="relative w-full h-40 md:h-52 bg-slate-900">
               <Image 
                 src="/images/fb-cover.jpg" 
                 alt="Cover" 
                 fill 
                 className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
               />
            </div>

            {/* ข้อมูลโปรไฟล์ */}
            <div className="relative px-5 pb-5">
               <div className="flex flex-row items-end gap-4 -mt-8 md:-mt-10">
                  
                  {/* รูปโปรไฟล์ (บังคับกลม) */}
                  <div className="relative flex-shrink-0 z-10">
                    <div className="p-1 bg-[#18191a] rounded-full">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-slate-800 border-[3px] border-[#18191a]">
                            <Image 
                              src="/images/fb-profile.jpg" 
                              alt="Profile" 
                              fill 
                              className="object-cover rounded-full" 
                            />
                        </div>
                    </div>
                    {/* จุดเขียว */}
                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-[4px] border-[#18191a] rounded-full z-20"></div>
                  </div>

                  {/* ข้อมูล + ปุ่ม */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-1">
                     <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 leading-tight">
                        Lemony
                        <CheckCircle className="text-blue-500 fill-blue-500 bg-white rounded-full" size={18} />
                        </h3>
                        <p className="text-slate-400 text-xs md:text-sm mt-1">@lemonyshop </p>
                     </div>

                     <div className="flex gap-2 w-full md:w-auto">
                        <div className="flex-1 md:flex-none bg-blue-600 px-5 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm gap-2 whitespace-nowrap hover:bg-blue-500 transition-colors">
                           <ThumbsUp size={16} fill="currentColor"/> ถูกใจ
                        </div>
                        <div className="flex-1 md:flex-none bg-[#3a3b3c] px-5 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm gap-2 whitespace-nowrap hover:bg-[#4e4f50] transition-colors">
                           <MessageCircle size={16} /> ส่งข้อความ
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </a>
        </div>


        {/* =========================================
            🔵 ฝั่งขวา: ข้อความ
            (ป้าย Community จะอยู่สูงกว่ากรอบรูปซ้ายมือ)
           ========================================= */}
        <div className="space-y-6 text-center lg:text-left lg:pl-8 pt-2">
           
           {/* ป้ายนี้จะลอยสูงกว่ากรอบรูป */}
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold animate-pulse mb-2">
              <Sparkles size={14} />
              Community & Giveaway
           </div>

           {/* หัวข้อนี้จะตรงกับขอบบนของกรอบรูปพอดี */}
           <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              ติดตามเพจหรือเฟซบุ๊กวันนี้ <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                รับโค้ด ฟรี!
              </span>
           </h2>

           <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              อัปเดตข่าวสารใหม่ๆ และแจก 
              <span className="text-yellow-400 font-bold"> Gift Voucher </span> 
              ทุกสัปดาห์ที่หน้าแฟนเพจหรือเฟซบุ๊กเท่านั้น
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a 
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-blue-900 rounded-lg font-bold text-base flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg shadow-white/10 w-full sm:w-auto justify-center"
              >
                 <Facebook size={20} />
                 ไปที่เฟซบุ๊ก
              </a>
              
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                 <Gift size={16} className="text-yellow-500" />
                 กดติดตามแคปรูปแล้วทักเพื่อรับโค้ดเฉพาะเท่านั้น
              </div>
           </div>

        </div>

      </div>
    </section>
  );
}