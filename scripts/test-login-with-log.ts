import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'

const prisma = new PrismaClient()

async function testLoginWithLog() {
  try {
    console.log('🧪 Testing login dengan logging detail...')
    
    const email = 'sinarsagara@wms.com'
    const password = 'Sinarsagara9'
    
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    
    // Test 1: Cek koneksi database
    console.log('\n1. Testing koneksi database...')
    try {
      await prisma.$connect()
      console.log('✅ Database connected')
    } catch (error) {
      console.log('❌ Database connection failed:', error)
      return
    }
    
    // Test 2: Cek user di database
    console.log('\n2. Testing query user...')
    const user = await prisma.user.findUnique({
      where: { email: email }
    })
    
    if (!user) {
      console.log('❌ User tidak ditemukan di database')
      return
    }
    
    console.log('✅ User ditemukan:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Active: ${user.isActive}`)
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
    
    // Test 3: Cek password
    console.log('\n3. Testing password validation...')
    const isPasswordValid = await compare(password, user.password)
    console.log(`   Password valid: ${isPasswordValid}`)
    
    if (!isPasswordValid) {
      console.log('❌ Password tidak valid')
      return
    }
    
    // Test 4: Cek user dengan isActive filter
    console.log('\n4. Testing user dengan isActive filter...')
    const activeUser = await prisma.user.findUnique({
      where: {
        email: email,
        isActive: true,
      },
    })
    
    if (!activeUser) {
      console.log('❌ User tidak aktif atau tidak ditemukan dengan filter isActive')
      return
    }
    
    console.log('✅ User aktif ditemukan')
    
    // Test 5: Cek environment variables
    console.log('\n5. Testing environment variables...')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`)
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}`)
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    
    console.log('\n🎯 Kesimpulan:')
    console.log('✅ Semua test berhasil!')
    console.log('🔍 Jika masih 401, masalahnya di:')
    console.log('   - NextAuth configuration')
    console.log('   - Session/cookies browser')
    console.log('   - Environment variables tidak terbaca')
    
    console.log('\n📝 Langkah selanjutnya:')
    console.log('1. Buka browser ke http://localhost:3000')
    console.log('2. Login dengan email dan password di atas')
    console.log('3. Cek log di terminal server untuk melihat detail error')

  } catch (error) {
    console.error('❌ Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginWithLog() 