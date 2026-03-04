// src/lib/line.ts

export async function sendLineMessage(text: string) {
  // 1. ดึง Token และ ID จากไฟล์ .env (เพื่อความปลอดภัย)
  const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN; 
  const MY_LINE_ID = process.env.MY_LINE_ID;

  if (!LINE_ACCESS_TOKEN || !MY_LINE_ID) {
    console.error("❌ ส่ง LINE ไม่ได้: ลืมใส่ LINE_ACCESS_TOKEN หรือ MY_LINE_ID ในไฟล์ .env");
    return { success: false };
  }

  if (!text) return { success: false, message: "No text provided" };

  try {
    // 2. ยิงคำสั่งไปที่ LINE Messaging API แบบเดียวกับที่เคยทำใน Firebase
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: MY_LINE_ID, // ส่งเข้าแชทส่วนตัวแอดมินโดยตรง
        messages: [{ type: 'text', text: text }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ LINE API Error:", errorData);
      return { success: false };
    }

    console.log("✅ ส่งแจ้งเตือน LINE สำเร็จ!");
    return { success: true };

  } catch (error) {
    console.error("❌ โค้ดส่ง LINE มีปัญหา:", error);
    // ไม่ throw error เพื่อไม่ให้เว็บล่ม แม้ LINE จะมีปัญหา
    return { success: false };
  }
}