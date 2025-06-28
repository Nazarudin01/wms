import { PrismaClient } from '@prisma/client'

// Test dengan prisma instance yang sama seperti di auth.ts
const prisma = new PrismaClient()

async function compareDatabases() {
  try {
    console.log('🔍 Comparing databases...')
    
    // Test 1: Cek environment variables
    console.log('\n1. Environment Variables:')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`)
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    
    // Test 2: Cek koneksi database
    console.log('\n2. Database Connection:')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test 3: Cek database info
    console.log('\n3. Database Info:')
    try {
      const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
      console.log('   Database info:', result)
    } catch (error) {
      console.log('   Could not get database info:', error)
    }
    
    // Test 4: Cek semua user
    console.log('\n4. All Users in Database:')
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
    
    // Test 5: Cek user sinarsagara@wms.com dengan query yang sama seperti auth.ts
    console.log('\n5. Testing sinarsagara@wms.com with auth.ts query:')
    const sinarUser = await prisma.user.findUnique({
      where: {
        email: 'sinarsagara@wms.com',
        isActive: true,
      },
    })
    
    console.log('🔍 Query result:', {
      found: !!sinarUser,
      email: sinarUser?.email,
      name: sinarUser?.name,
      role: sinarUser?.role,
      isActive: sinarUser?.isActive
    })
    
    if (sinarUser) {
      console.log('✅ sinarsagara@wms.com found with auth.ts query')
    } else {
      console.log('❌ sinarsagara@wms.com NOT found with auth.ts query')
    }
    
    // Test 6: Cek user admin@example.com
    console.log('\n6. Testing admin@example.com:')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (adminUser) {
      console.log('✅ admin@example.com found:')
      console.log(`   ID: ${adminUser.id}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Name: ${adminUser.name}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Active: ${adminUser.isActive}`)
    } else {
      console.log('❌ admin@example.com NOT found')
    }
    
    // Test 7: Cek apakah ada database lain
    console.log('\n7. Checking for other databases:')
    try {
      const databases = await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datistemplate = false`
      console.log('   Available databases:', databases)
    } catch (error) {
      console.log('   Could not get databases list:', error)
    }
    
    console.log('\n🎯 Conclusion:')
    if (allUsers.length === 1 && allUsers[0].email === 'sinarsagara@wms.com' && !adminUser) {
      console.log('✅ Database is clean - only sinarsagara@wms.com exists')
      console.log('🔍 If NextAuth still finds admin@example.com, there might be:')
      console.log('   - Different database connection')
      console.log('   - Prisma Client cache issue')
      console.log('   - Environment variables not loaded correctly')
    } else {
      console.log('❌ Database is not clean - multiple users or wrong user found')
    }
    
  } catch (error) {
    console.error('❌ Error comparing databases:', error)
  } finally {
    await prisma.$disconnect()
  }
}

compareDatabases() 