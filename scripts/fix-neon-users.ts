import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function fixNeonUsers() {
  try {
    console.log('🔧 Memperbaiki user di database Neon...')
    
    // 1. Hapus semua user yang ada (termasuk example)
    console.log('🗑️  Menghapus semua user lama...')
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`✅ Deleted ${deletedUsers.count} users`)
    
    // 2. Hapus semua login logs
    console.log('🗑️  Menghapus semua login logs...')
    const deletedLogs = await prisma.loginLog.deleteMany()
    console.log(`✅ Deleted ${deletedLogs.count} login logs`)
    
    // 3. Buat user sinarsagara@wms.com yang baru
    console.log('👤 Membuat user sinarsagara@wms.com...')
    const password = await hash('Sinarsagara9', 12)
    
    const newUser = await prisma.user.create({
      data: {
        email: 'sinarsagara@wms.com',
        name: 'Sinar Sagara',
        password: password,
        role: 'ADMIN',
        isActive: true,
      },
    })
    
    console.log('✅ User baru berhasil dibuat:')
    console.log(`   ID: ${newUser.id}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Name: ${newUser.name}`)
    console.log(`   Role: ${newUser.role}`)
    console.log(`   Active: ${newUser.isActive}`)
    
    // 4. Verifikasi user yang ada
    console.log('\n🔍 Verifikasi user di database:')
    const allUsers = await prisma.user.findMany()
    console.log(`Total user: ${allUsers.length}`)
    
    allUsers.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
    })
    
    console.log('\n🎯 Langkah selanjutnya:')
    console.log('1. Restart aplikasi: npm run dev')
    console.log('2. Buka browser ke http://localhost:3000')
    console.log('3. Login dengan:')
    console.log('   Email: sinarsagara@wms.com')
    console.log('   Password: Sinarsagara9')
    console.log('4. Clear browser cache jika masih ada masalah')

  } catch (error) {
    console.error('❌ Error fixing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixNeonUsers() 