// ไฟล์: src/lib/line.ts

export async function sendLineMessage(text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_ADMIN_USER_ID;

  // ถ้าลืมใส่คีย์ใน .env ให้เตือนใน Console แต่ไม่ต้องทำให้เว็บพัง
  if (!token || !userId) {
    console.error("🔴 ขาดตัวแปร LINE_CHANNEL_ACCESS_TOKEN หรือ LINE_ADMIN_USER_ID ใน .env");
    return;
  }

  try {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId, 
        messages: [{ type: "text", text: text }],
      }),
    });
  } catch (error) {
    console.error("🔴 LINE Messaging API Error:", error);
  }
}