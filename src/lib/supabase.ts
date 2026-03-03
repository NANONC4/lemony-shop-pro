import { createClient } from '@supabase/supabase-js'

// ดึงค่ามาจากไฟล์ .env
// ⚠️ สำคัญ: ต้องมีคำว่า NEXT_PUBLIC_ นำหน้า เพื่อให้ฝั่งหน้าเว็บ (Client) มองเห็นตัวแปรนี้ครับ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)