"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, ShoppingBag, Users, Calendar, Award, TrendingUp, ChevronLeft, ChevronRight, ChevronDown, Coins } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface AnalyticsProps {
  summary: {
    totalRevenue: number;
    totalProfit: number;
    revenueSelected: number;
    profitSelected: number;
    totalOrders: number;
    totalUsers: number;
    selectedMonth: string;
  };
  yearlyTrend: { name: string; revenue: number; profit: number }[];
  topProducts: { name: string; value: number; revenue: number; game: string }[];
}

const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const START_YEAR = 2026; 

export default function AnalyticsDashboard({ summary, yearlyTrend, topProducts }: AnalyticsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const currentMonthParam = searchParams.get('month'); 
  const selectedDate = currentMonthParam ? new Date(currentMonthParam) : new Date();
  const realToday = new Date();
  const currentYear = realToday.getFullYear();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear()); 

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) { setIsOpen(false); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMonth = (monthIndex: number) => {
     const newDate = new Date(viewYear, monthIndex, 1);
     const dateString = format(newDate, 'yyyy-MM');
     router.push(`/admin/dashboard?month=${dateString}`);
     setIsOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 0. Month Picker */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/20 z-20 relative">
          <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400"><Calendar className="w-5 h-5" /></div>
              <div>
                 <span className="font-bold block text-sm md:text-base">เลือกเดือนที่จะดูรายละเอียด:</span>
                 <span className="text-xs text-slate-400">ดูยอดขายและกำไรของเดือนที่คุณเลือก</span>
              </div>
          </div>
          <div className="relative" ref={pickerRef}>
              <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded-lg hover:border-blue-500 transition-all min-w-[220px] justify-between">
                  <span className="capitalize">{format(selectedDate, 'MMMM yyyy', { locale: th })}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                  <div className="absolute right-0 top-12 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                          <button onClick={() => setViewYear(viewYear - 1)} disabled={viewYear <= START_YEAR} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
                          <span className="font-bold text-white text-lg">{viewYear + 543}</span>
                          <button onClick={() => setViewYear(viewYear + 1)} disabled={viewYear >= currentYear} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          {THAI_MONTHS.map((monthName, index) => {
                              const isSelected = viewYear === selectedDate.getFullYear() && index === selectedDate.getMonth();
                              const isFuture = viewYear === currentYear && index > realToday.getMonth();
                              return (
                                  <button key={monthName} onClick={() => handleSelectMonth(index)} disabled={isFuture} className={`py-2 px-1 text-sm rounded-lg transition-all font-medium ${isSelected ? 'bg-blue-600 text-white shadow-lg' : isFuture ? 'text-slate-700 cursor-not-allowed bg-slate-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{monthName}</button>
                              );
                          })}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* รายได้เดือนนี้ */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
           <p className="text-slate-400 text-sm">รายได้เดือนนี้ (Revenue)</p>
           <h3 className="text-3xl font-bold text-white mt-2">฿{summary.revenueSelected.toLocaleString()}</h3>
           <div className="absolute top-4 right-4 p-3 bg-blue-600/20 rounded-xl text-blue-400"><DollarSign /></div>
        </div>

        {/* 💰 กำไรเดือนนี้ */}
        <div className="bg-gradient-to-br from-green-600 to-green-900 border border-green-500 p-6 rounded-2xl text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
           <p className="text-green-100 text-sm font-medium relative z-10">กำไรสุทธิเดือนนี้ (Net Profit)</p>
           <h3 className="text-4xl font-bold mt-2 relative z-10">฿{summary.profitSelected.toLocaleString()}</h3>
           <div className="mt-2 text-xs bg-black/20 w-fit px-2 py-1 rounded flex items-center gap-1">
               <TrendingUp className="w-3 h-3" /> 
               Margin: {summary.revenueSelected > 0 ? ((summary.profitSelected / summary.revenueSelected) * 100).toFixed(1) : 0}%
           </div>
        </div>

        {/* รายได้รวม */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group hover:border-orange-500/50 transition-all">
           <p className="text-slate-400 text-sm">รายได้รวมทั้งหมด (Lifetime)</p>
           <h3 className="text-3xl font-bold text-orange-400 mt-2">฿{summary.totalRevenue.toLocaleString()}</h3>
           <div className="absolute top-4 right-4 p-3 bg-orange-500/10 rounded-xl text-orange-400"><Award /></div>
        </div>

        {/* กำไรรวม */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group hover:border-emerald-500/50 transition-all">
           <p className="text-slate-400 text-sm">กำไรสุทธิรวม (Total Profit)</p>
           <h3 className="text-3xl font-bold text-emerald-400 mt-2">฿{summary.totalProfit.toLocaleString()}</h3>
           <div className="absolute top-4 right-4 p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Coins /></div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📈 กราฟ 2 แท่ง: รายได้ vs กำไร */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl relative z-10">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                เปรียบเทียบ รายได้ vs กำไร
             </h3>
             <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> รายได้</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> กำไร</div>
             </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${val/1000}k`} />
                <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                    // ✅ แก้ตรงนี้แล้ว (เปลี่ยน name: string เป็น name: any)
                    formatter={(value: any, name: any) => [
                        `฿${Number(value).toLocaleString()}`, 
                        name === 'revenue' ? 'รายได้' : 'กำไรสุทธิ'
                    ]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🏆 สินค้าขายดี */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col relative z-10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <Award className="w-5 h-5 text-yellow-400" />
             Top 5 ขายดี (by ยอดเงิน)
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {topProducts.length > 0 ? topProducts.map((item, index) => (
                 <div key={index} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition group">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 min-w-[2rem] rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-400 text-black' : index === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'}`}>#{index + 1}</div>
                        <div className="min-w-0">
                           <p className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">{item.name}</p>
                           <p className="text-slate-500 text-xs truncate">{item.game}</p>
                        </div>
                    </div>
                    <div className="text-right pl-2">
                        <p className="text-white font-bold text-sm">฿{item.revenue.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{item.value.toLocaleString()} ชิ้น</p>
                    </div>
                 </div>
             )) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 bg-slate-950/30 rounded-xl border border-dashed border-slate-800"><ShoppingBag className="w-8 h-8 mb-2 opacity-50" /><p className="text-sm">ไม่มีข้อมูลการขายในเดือนนี้</p></div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}