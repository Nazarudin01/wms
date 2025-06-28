import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearSessions() {
  try {
    console.log('🧹 Membersihkan session dan login logs...')
    
    // Hapus semua login logs
    const deletedLogs = await prisma.loginLog.deleteMany()
    console.log(`🗑️  Deleted ${deletedLogs.count} login logs`)
    
    // Cek user yang ada
    const user = await prisma.user.findUnique({
      where: { email: 'sinarsagara@wms.com' }
    })
    
    if (user) {
      console.log('✅ User sinarsagara@wms.com ditemukan')
      console.log(`   ID: ${user.id}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
    } else {
      console.log('❌ User sinarsagara@wms.com tidak ditemukan')
    }
    
    console.log('\n📝 Langkah selanjutnya:')
    console.log('1. Buka browser dan akses http://localhost:3000')
    console.log('2. Logout jika masih login dengan user lain')
    console.log('3. Login dengan:')
    console.log('   Email: sinarsagara@wms.com')
    console.log('   Password: Sinarsagara9')
    console.log('4. Jika masih ada masalah, coba clear browser cache/cookies')

  } catch (error) {
    console.error('❌ Error clearing sessions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearSessions() 