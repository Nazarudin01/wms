import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Mengecek semua user di database...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    console.log(`📊 Total user: ${users.length}`)
    
    if (users.length === 0) {
      console.log('❌ Tidak ada user di database')
      return
    }

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Created: ${user.createdAt}`)
    })

    // Cek user yang bisa login
    const activeUsers = users.filter(user => user.isActive)
    console.log(`\n✅ User aktif: ${activeUsers.length}`)
    
    const adminUsers = users.filter(user => user.role === 'ADMIN' && user.isActive)
    console.log(`👑 Admin aktif: ${adminUsers.length}`)

  } catch (error) {
    console.error('❌ Error mengecek users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers() 