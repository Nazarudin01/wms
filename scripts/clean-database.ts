import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🧹 Cleaning database...')
    
    // 1. Hapus semua user
    console.log('\n1. Deleting all users...')
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`   Deleted ${deletedUsers.count} users`)
    
    // 2. Hapus semua login logs
    console.log('\n2. Deleting all login logs...')
    const deletedLogs = await prisma.loginLog.deleteMany()
    console.log(`   Deleted ${deletedLogs.count} login logs`)
    
    // 3. Buat user sinarsagara@wms.com yang baru
    console.log('\n3. Creating sinarsagara@wms.com user...')
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
    
    console.log('✅ User created:')
    console.log(`   ID: ${newUser.id}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Name: ${newUser.name}`)
    console.log(`   Role: ${newUser.role}`)
    console.log(`   Active: ${newUser.isActive}`)
    
    // 4. Verifikasi database
    console.log('\n4. Verifying database...')
    const allUsers = await prisma.user.findMany()
    console.log(`   Total users: ${allUsers.length}`)
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role} - Active: ${user.isActive}`)
    })
    
    // 5. Test query yang sama seperti di auth.ts
    console.log('\n5. Testing auth.ts query...')
    const authUser = await prisma.user.findUnique({
      where: {
        email: 'sinarsagara@wms.com',
        isActive: true,
      },
    })
    
    if (authUser) {
      console.log('✅ User found with auth.ts query:')
      console.log(`   ID: ${authUser.id}`)
      console.log(`   Email: ${authUser.email}`)
      console.log(`   Name: ${authUser.name}`)
      console.log(`   Role: ${authUser.role}`)
    } else {
      console.log('❌ User NOT found with auth.ts query')
    }
    
    console.log('\n🎯 Database cleaned successfully!')
    console.log('📝 Next steps:')
    console.log('1. Restart the server')
    console.log('2. Clear browser cache/cookies')
    console.log('3. Login with sinarsagara@wms.com')
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase() 