import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = 'sinarsagara@wms.com'
    const password = 'Sinarsagara9'

    console.log('Testing login with:', { email })

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        isActive: true,
      },
    })

    if (!user) {
      console.log('❌ User tidak ditemukan')
      return
    }

    console.log('✅ User ditemukan:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    })

    // Cek password
    const isPasswordValid = await compare(password, user.password)

    if (isPasswordValid) {
      console.log('✅ Password valid')
      console.log('✅ Login berhasil!')
    } else {
      console.log('❌ Password tidak valid')
    }

  } catch (error) {
    console.error('Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin() 