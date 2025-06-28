import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugDatabase() {
  try {
    console.log('🔍 Debug database connection...')
    
    // Test 1: Cek environment variables
    console.log('\n1. Environment Variables:')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`)
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    
    // Test 2: Cek koneksi database
    console.log('\n2. Database Connection:')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test 3: Cek semua user
    console.log('\n3. All Users in Database:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    console.log(`   Total users: ${allUsers.length}`)
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role} - Active: ${user.isActive} - Created: ${user.createdAt}`)
    })
    
    // Test 4: Cek user sinarsagara@wms.com
    console.log('\n4. Testing sinarsagara@wms.com:')
    const sinarUser = await prisma.user.findUnique({
      where: { email: 'sinarsagara@wms.com' }
    })
    
    if (sinarUser) {
      console.log('✅ sinarsagara@wms.com found:')
      console.log(`   ID: ${sinarUser.id}`)
      console.log(`   Name: ${sinarUser.name}`)
      console.log(`   Role: ${sinarUser.role}`)
      console.log(`   Active: ${sinarUser.isActive}`)
    } else {
      console.log('❌ sinarsagara@wms.com NOT found')
    }
    
    // Test 5: Cek user admin@example.com
    console.log('\n5. Testing admin@example.com:')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (adminUser) {
      console.log('✅ admin@example.com found:')
      console.log(`   ID: ${adminUser.id}`)
      console.log(`   Name: ${adminUser.name}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Active: ${adminUser.isActive}`)
    } else {
      console.log('❌ admin@example.com NOT found')
    }
    
    // Test 6: Cek database info
    console.log('\n6. Database Info:')
    try {
      const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
      console.log('   Database info:', result)
    } catch (error) {
      console.log('   Could not get database info:', error)
    }
    
  } catch (error) {
    console.error('❌ Error debugging database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDatabase() 