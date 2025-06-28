import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'

const prisma = new PrismaClient()

async function debugLogin() {
  try {
    console.log('🔍 Debug login process...')
    
    // Test dengan email yang benar
    const correctEmail = 'sinarsagara@wms.com'
    const correctPassword = 'Sinarsagara9'
    
    // Test dengan email yang salah (example)
    const wrongEmail = 'example@example.com'
    
    console.log('\n1. Testing dengan email yang benar:')
    console.log(`   Email: ${correctEmail}`)
    console.log(`   Password: ${correctPassword}`)
    
    const correctUser = await prisma.user.findUnique({
      where: { email: correctEmail }
    })
    
    if (correctUser) {
      console.log('✅ User ditemukan di database')
      const isPasswordValid = await compare(correctPassword, correctUser.password)
      console.log(`   Password valid: ${isPasswordValid}`)
      console.log(`   User details:`, {
        id: correctUser.id,
        name: correctUser.name,
        role: correctUser.role,
        isActive: correctUser.isActive
      })
    } else {
      console.log('❌ User tidak ditemukan di database')
    }
    
    console.log('\n2. Testing dengan email yang salah:')
    console.log(`   Email: ${wrongEmail}`)
    
    const wrongUser = await prisma.user.findUnique({
      where: { email: wrongEmail }
    })
    
    if (wrongUser) {
      console.log('❌ User example ditemukan (ini masalah!)')
      console.log(`   User details:`, {
        id: wrongUser.id,
        email: wrongUser.email,
        name: wrongUser.name,
        role: wrongUser.role
      })
    } else {
      console.log('✅ User example tidak ditemukan (ini benar)')
    }
    
    console.log('\n3. Semua user di database:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role} - Active: ${user.isActive}`)
    })
    
    console.log('\n🎯 Kesimpulan:')
    if (allUsers.length === 1 && allUsers[0].email === correctEmail) {
      console.log('✅ Database sudah benar, hanya ada user sinarsagara@wms.com')
      console.log('🔍 Masalah mungkin di:')
      console.log('   - Browser cache/cookies')
      console.log('   - Session yang tersimpan')
      console.log('   - Environment variables')
    } else {
      console.log('❌ Masih ada user lain di database')
    }

  } catch (error) {
    console.error('❌ Error debugging login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin() 