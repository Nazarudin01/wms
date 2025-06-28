import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'

const prisma = new PrismaClient()

async function testFinalLogin() {
  try {
    const email = 'sinarsagara@wms.com'
    const password = 'Sinarsagara9'

    console.log('🧪 Testing login dengan user baru...')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)

    // Cek user di database
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

    // Test password
    const isPasswordValid = await compare(password, user.password)

    if (isPasswordValid) {
      console.log('✅ Password valid!')
      console.log('✅ Login akan berhasil!')
      
      console.log('\n🎯 Sekarang silakan:')
      console.log('1. Buka browser ke http://localhost:3000')
      console.log('2. Login dengan:')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
      console.log('3. Jika masih ada masalah, clear browser cache/cookies')
    } else {
      console.log('❌ Password tidak valid')
    }

  } catch (error) {
    console.error('❌ Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFinalLogin() 