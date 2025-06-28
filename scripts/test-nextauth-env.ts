import { PrismaClient } from '@prisma/client'
import { compare } from 'bcrypt'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Simulasi NextAuth environment
const prisma = new PrismaClient()

// Buat authOptions yang sama seperti di lib/auth.ts
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔍 NextAuth authorize called with:', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password 
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error("Email dan password diperlukan");
        }

        try {
          console.log('🔍 Looking for user in database...');
          console.log('🔍 Using prisma instance:', typeof prisma);
          console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
          
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
              isActive: true,
            },
          });

          console.log('🔍 Database query result:', {
            found: !!user,
            email: user?.email,
            name: user?.name,
            role: user?.role,
            isActive: user?.isActive
          });

          if (!user) {
            console.log('❌ User not found or not active');
            throw new Error("Email atau password salah");
          }

          console.log('🔍 Comparing password...');
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          console.log('🔍 Password validation result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Password invalid');
            throw new Error("Email atau password salah");
          }

          console.log('✅ Login successful, creating login log...');
          await prisma.loginLog.create({
            data: {
              userId: user.id,
              email: user.email,
              status: "SUCCESS",
              ipAddress: "TEST_SCRIPT",
              userAgent: "TEST_SCRIPT",
            },
          });

          console.log('✅ Returning user data:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.log('❌ Error in authorize:', error);
          if (error instanceof Error) {
            await prisma.loginLog.create({
              data: {
                email: credentials.email,
                status: "FAILED",
                ipAddress: "TEST_SCRIPT",
                userAgent: "TEST_SCRIPT",
                errorMessage: error.message,
              },
            });
          }
          throw error;
        }
      },
    }),
  ],
}

async function testNextAuthEnv() {
  try {
    console.log('🔍 Testing NextAuth environment...')
    
    // Test 1: Cek environment variables
    console.log('\n1. Environment Variables:')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`)
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    
    // Test 2: Cek koneksi database
    await prisma.$connect()
    console.log('\n2. Database Connection: ✅ Connected')
    
    // Test 3: Cek semua user
    console.log('\n3. All Users:')
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
    
    // Test 4: Test NextAuth authorize function
    console.log('\n4. Testing NextAuth authorize function:')
    
    const credentials = {
      email: 'sinarsagara@wms.com',
      password: 'Sinarsagara9'
    }
    
    const provider = authOptions.providers[0] as CredentialsProvider
    const authorize = provider.authorize!
    
    try {
      const result = await authorize(credentials, null)
      console.log('✅ NextAuth authorize successful!')
      console.log('   Result:', result)
    } catch (error) {
      console.log('❌ NextAuth authorize failed:', error)
    }
    
    // Test 5: Test admin@example.com
    console.log('\n5. Testing admin@example.com:')
    const adminCredentials = {
      email: 'admin@example.com',
      password: 'password'
    }
    
    try {
      const result = await authorize(adminCredentials, null)
      console.log('❌ admin@example.com should not work but it did!')
      console.log('   Result:', result)
    } catch (error) {
      console.log('✅ admin@example.com correctly failed:', error)
    }
    
    console.log('\n🎯 Summary:')
    if (allUsers.length === 1 && allUsers[0].email === 'sinarsagara@wms.com') {
      console.log('✅ Database is clean')
      console.log('✅ NextAuth environment is working correctly')
      console.log('🔍 If server NextAuth still fails, check:')
      console.log('   - Server restart needed')
      console.log('   - Browser cache')
      console.log('   - Different environment variables in server')
    } else {
      console.log('❌ Database inconsistency detected')
    }
    
  } catch (error) {
    console.error('❌ Error testing NextAuth environment:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNextAuthEnv() 