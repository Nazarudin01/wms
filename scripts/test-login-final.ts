import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'

const prisma = new PrismaClient()

async function testLoginFinal() {
  try {
    console.log('🧪 Final login test after Prisma Client regenerate...')
    
    const email = 'sinarsagara@wms.com'
    const password = 'Sinarsagara9'
    
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    
    // Test 1: Cek koneksi database
    console.log('\n1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test 2: Cek semua user
    console.log('\n2. All users in database:')
    const allUsers = await prisma.user.findMany()
    console.log(`   Total users: ${allUsers.length}`)
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role} - Active: ${user.isActive}`)
    })
    
    // Test 3: Cek user dengan query yang sama seperti auth.ts
    console.log('\n3. Testing auth.ts query...')
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
    
    if (!user) {
      console.log('❌ User not found with auth.ts query')
      return
    }
    
    // Test 4: Cek password
    console.log('\n4. Testing password...')
    const isPasswordValid = await compare(password, user.password)
    console.log(`   Password valid: ${isPasswordValid}`)
    
    if (!isPasswordValid) {
      console.log('❌ Password invalid')
      return
    }
    
    console.log('\n✅ All tests passed!')
    console.log('📝 User details:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Active: ${user.isActive}`)
    
    console.log('\n🎯 Next steps:')
    console.log('1. Open browser to http://localhost:3000')
    console.log('2. Login with:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('3. If still 401, check server logs for detailed error')
    
  } catch (error) {
    console.error('❌ Error in final test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginFinal() 