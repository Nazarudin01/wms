import { PrismaClient } from '@prisma/client'

// Test dengan prisma instance yang sama seperti di auth.ts
const prisma = new PrismaClient()

async function testPrismaConnection() {
  try {
    console.log('🧪 Testing Prisma connection from auth.ts perspective...')
    
    // Test 1: Cek koneksi
    console.log('\n1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test 2: Cek environment variables
    console.log('\n2. Testing environment variables...')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`)
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    
    // Test 3: Cek user dengan query yang sama seperti di auth.ts
    console.log('\n3. Testing user query (same as auth.ts)...')
    const email = 'sinarsagara@wms.com'
    
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        isActive: true,
      },
    })
    
    console.log('🔍 Query result:', {
      found: !!user,
      email: user?.email,
      name: user?.name,
      role: user?.role,
      isActive: user?.isActive
    })
    
    if (user) {
      console.log('✅ User found!')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
    } else {
      console.log('❌ User not found')
      
      // Test 4: Cek apakah user ada tanpa filter isActive
      console.log('\n4. Testing user query without isActive filter...')
      const userWithoutFilter = await prisma.user.findUnique({
        where: { email: email }
      })
      
      if (userWithoutFilter) {
        console.log('✅ User found without isActive filter:')
        console.log(`   ID: ${userWithoutFilter.id}`)
        console.log(`   Email: ${userWithoutFilter.email}`)
        console.log(`   Name: ${userWithoutFilter.name}`)
        console.log(`   Role: ${userWithoutFilter.role}`)
        console.log(`   isActive: ${userWithoutFilter.isActive}`)
      } else {
        console.log('❌ User not found even without filter')
      }
    }
    
    // Test 5: Cek semua user
    console.log('\n5. Testing all users...')
    const allUsers = await prisma.user.findMany()
    console.log(`   Total users: ${allUsers.length}`)
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role} - Active: ${user.isActive}`)
    })
    
  } catch (error) {
    console.error('❌ Error testing prisma connection:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaConnection() 