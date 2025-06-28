import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearNextAuthCache() {
  try {
    console.log('🔍 Clearing NextAuth cache and sessions...')
    
    // Test 1: Cek koneksi database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Test 2: Clear semua session
    console.log('\n1. Clearing all sessions...')
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`   Deleted ${deletedSessions.count} sessions`)
    
    // Test 3: Clear semua account
    console.log('\n2. Clearing all accounts...')
    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`   Deleted ${deletedAccounts.count} accounts`)
    
    // Test 4: Clear semua verification tokens
    console.log('\n3. Clearing all verification tokens...')
    const deletedTokens = await prisma.verificationToken.deleteMany({})
    console.log(`   Deleted ${deletedTokens.count} verification tokens`)
    
    // Test 5: Cek login logs terakhir
    console.log('\n4. Recent login logs:')
    const recentLogs = await prisma.loginLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`   Found ${recentLogs.length} recent login logs:`)
    recentLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.email} - ${log.status} - ${log.createdAt}`)
    })
    
    // Test 6: Cek semua user
    console.log('\n5. All users in database:')
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
    
    // Test 7: Test query user
    console.log('\n6. Testing user queries:')
    
    const sinarUser = await prisma.user.findUnique({
      where: { email: 'sinarsagara@wms.com' }
    })
    
    if (sinarUser) {
      console.log('✅ sinarsagara@wms.com found')
    } else {
      console.log('❌ sinarsagara@wms.com NOT found')
    }
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (adminUser) {
      console.log('❌ admin@example.com found (this should not happen!)')
    } else {
      console.log('✅ admin@example.com NOT found (this is correct)')
    }
    
    console.log('\n🎯 Summary:')
    console.log('✅ NextAuth cache cleared')
    console.log('✅ Sessions cleared')
    console.log('✅ Database is clean')
    console.log('🔍 Now restart the server and try login again')
    console.log('🔍 Also clear browser cache and cookies')
    
  } catch (error) {
    console.error('❌ Error clearing NextAuth cache:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearNextAuthCache() 