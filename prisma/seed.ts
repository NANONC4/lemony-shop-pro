import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs' // ✅ Import เพื่อแฮชรหัสผ่าน

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 กำลังล้างข้อมูลเก่า...')
  
  // 1. ลบข้อมูลเก่าให้เกลี้ยง (ต้องเรียงลำดับ Parent/Child ให้ถูก ไม่งั้น Error)
  try {
    await prisma.orderMessage.deleteMany() // ลบแชทก่อน
    await prisma.order.deleteMany()        // ลบออเดอร์
    await prisma.product.deleteMany()      // ลบสินค้า
    await prisma.game.deleteMany()         // ลบเกม
    // await prisma.user.deleteMany()      // (Optional: อยากลบ User ทั้งหมดด้วยไหม? ถ้าไม่ก็คอมเม้นไว้)
  } catch (error) {
    console.log('⚠️ ไม่สามารถลบข้อมูลเก่าบางส่วนได้ (อาจเพราะเป็นครั้งแรก)')
  }
  
  console.log('✨ ล้างข้อมูลเสร็จสิ้น เริ่มลงข้อมูลใหม่...')

  // 👑 2. สร้าง Super Admin (สำคัญ!)
  const password = await hash('admin123', 12) // ตั้งรหัสผ่านตรงนี้ (admin123)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lemonyshop.com' },
    update: { 
        role: 'ADMIN', // ถ้ามี user นี้อยู่แล้ว บังคับให้เป็น ADMIN
        password: password // อัปเดตรหัสผ่านใหม่ด้วย
    }, 
    create: {
      email: 'admin@lemonyshop.com',
      username: 'admin',
      name: 'Super Admin',
      role: 'ADMIN', // ✅ กำหนดสิทธิ์
      password: password,
    },
  })
  console.log(`👑 สร้าง Admin สำเร็จ: ${admin.username} (Pass: admin123)`)

  // 🎮 3. ลงข้อมูลเกม (ตามที่คุณให้มา)

  // 3.1 Roblox (Promotion)
  await prisma.game.create({
    data: {
      title: 'Roblox (Promotion)',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      slug: 'roblox-promotion',
      products: {
        create: [
          { name: '80 Robux', price: 29, imageUrl: 'https://placehold.co/400x400/orange/white?text=80+R' },
          { name: '400 Robux', price: 139, imageUrl: 'https://placehold.co/400x400/orange/white?text=400+R' },
          { name: '800 Robux', price: 279, imageUrl: 'https://placehold.co/400x400/orange/white?text=800+R' },
        ],
      },
    },
  })
  console.log('✅ สร้างเกม: Roblox Promotion')

  // 3.2 Roblox Premium
  await prisma.game.create({
    data: {
      title: 'Roblox Premium',
      imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=800&q=80',
      slug: 'roblox-premium',
      products: {
        create: [
          { name: 'Premium 450', price: 189, imageUrl: 'https://placehold.co/400x400/333/white?text=Prem+450' },
          { name: 'Premium 1000', price: 389, imageUrl: 'https://placehold.co/400x400/333/white?text=Prem+1000' },
        ],
      },
    },
  })
  console.log('✅ สร้างเกม: Roblox Premium')

  // 3.3 Roblox ID-Pass
  await prisma.game.create({
    data: {
      title: 'Roblox (ID-Pass)',
      imageUrl: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=800&q=80',
      slug: 'roblox-id-pass',
    },
  })
  console.log('✅ สร้างเกม: Roblox ID-Pass')

  // 3.4 RoV
  await prisma.game.create({
    data: {
      title: 'RoV: Arena of Valor',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      slug: 'rov',
      products: {
        create: [
          // ⚠️ แก้ราคาเป็น 25 บาท (Omise ขั้นต่ำ 20)
          { name: '31 Coupons', price: 25, imageUrl: 'https://placehold.co/400x400/blue/white?text=31+C' },
        ],
      },
    },
  })
  console.log('✅ สร้างเกม: RoV')

  // 3.5 Discord
  await prisma.game.create({
    data: {
      title: 'Discord Packages',
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
      slug: 'discord',
    },
  })
  console.log('✅ สร้างเกม: Discord')

  console.log('🏁 Seed ข้อมูลจริงและ Admin เสร็จสมบูรณ์!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })