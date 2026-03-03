import type { Metadata } from "next";
import { Prompt } from "next/font/google"; 
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";
import HideOnAdmin from "@/components/HideOnAdmin"; 
import StoreStatusBanner from "@/components/StoreStatusBanner"; // ✅ 1. Import ป้ายประกาศมา

const prompt = Prompt({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "Lemony Shop | เติมเกมราคาถูก ปลอดภัย 100%",
  description: "บริการเติมเกมออนไลน์ 24 ชม. สะดวก รวดเร็ว เชื่อถือได้",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.className} bg-slate-950 text-slate-200 antialiased selection:bg-yellow-500 selection:text-slate-900`}>
        <Providers>
          
          <HideOnAdmin>
            <Navbar />
          </HideOnAdmin>

          <main className="min-h-screen">
            {children}
          </main>
          
          <HideOnAdmin>
            <Footer />
            {/* ✅ 2. เอาป้ายประกาศมาวางใน HideOnAdmin แอดมินจะได้ไม่โดนป้ายบังตอนทำงานหลังบ้าน */}
            <StoreStatusBanner /> 
          </HideOnAdmin>

        </Providers>
      </body>
    </html>
  );
}