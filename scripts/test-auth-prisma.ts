import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'

// Gunakan Prisma Client yang sama seperti di auth.ts
const prisma = new PrismaClient()

async function testAuthPrisma() {
  try {
    console.log('🔍 Testing with same Prisma Client as auth.ts...')
    
    // Test 1: Cek koneksi
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Test 2: Cek environment variables
    console.log('\n1. Environment Variables:')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    
    // Test 3: Cek semua user
    console.log('\n2. All Users:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })
    
    console.log(`   Total users: ${allUsers.length}`)
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role} - Active: ${user.isActive}`)
    })
    
    // Test 4: Test query yang sama persis seperti auth.ts
    console.log('\n3. Testing auth.ts exact query:')
    
    const testEmail = 'sinarsagara@wms.com'
    const testPassword = 'Sinarsagara9'
    
    console.log(`   Testing with email: ${testEmail}`)
    
    const user = await prisma.user.findUnique({
      where: {
        email: testEmail,
        isActive: true,
      },
    })
    
    console.log('🔍 Database query result:', {
      found: !!user,
      email: user?.email,
      name: user?.name,
      role: user?.role,
      isActive: user?.isActive
    })
    
    if (!user) {
      console.log('❌ User not found or not active')
      return
    }
    
    // Test 5: Test password validation
    console.log('\n4. Testing password validation:')
    const isPasswordValid = await compare(testPassword, user.password)
    console.log(`   Password valid: ${isPasswordValid}`)
    
    if (isPasswordValid) {
      console.log('✅ Login would be successful!')
      
      // Test 6: Create login log
      console.log('\n5. Creating login log:')
      const loginLog = await prisma.loginLog.create({
        data: {
          userId: user.id,
          email: user.email,
          status: "SUCCESS",
          ipAddress: "TEST_SCRIPT",
          userAgent: "TEST_SCRIPT",
        },
      })
      console.log(`   Login log created with ID: ${loginLog.id}`)
      
    } else {
      console.log('❌ Password invalid')
    }
    
    // Test 7: Test admin@example.com query
    console.log('\n6. Testing admin@example.com query:')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (adminUser) {
      console.log('❌ admin@example.com found (this should not happen!)')
      console.log(`   ID: ${adminUser.id}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Name: ${adminUser.name}`)
    } else {
      console.log('✅ admin@example.com NOT found (this is correct)')
    }
    
    console.log('\n🎯 Summary:')
    if (allUsers.length === 1 && allUsers[0].email === 'sinarsagara@wms.com' && !adminUser) {
      console.log('✅ Database is clean and consistent')
      console.log('🔍 NextAuth issue might be:')
      console.log('   - Different Prisma Client instance')
      console.log('   - Environment variables not loaded in NextAuth context')
      console.log('   - NextAuth cache issue')
    } else {
      console.log('❌ Database inconsistency detected')
    }
    
  } catch (error) {
    console.error('❌ Error testing auth prisma:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthPrisma() 