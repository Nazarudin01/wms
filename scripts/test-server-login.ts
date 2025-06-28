import fetch from 'node-fetch'

async function testServerLogin() {
  try {
    console.log('🔍 Testing server login API...')
    
    // Test 1: Cek apakah server berjalan
    console.log('\n1. Checking if server is running...')
    try {
      const response = await fetch('http://localhost:3000/api/auth/providers')
      if (response.ok) {
        console.log('✅ Server is running')
      } else {
        console.log('❌ Server responded with error:', response.status)
        return
      }
    } catch (error) {
      console.log('❌ Server not running or not accessible')
      console.log('   Error:', error)
      return
    }
    
    // Test 2: Test login dengan sinarsagara@wms.com
    console.log('\n2. Testing login with sinarsagara@wms.com...')
    
    const loginData = {
      email: 'sinarsagara@wms.com',
      password: 'Sinarsagara9'
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      })
      
      console.log(`   Response status: ${response.status}`)
      
      if (response.ok) {
        console.log('✅ Login successful!')
        const result = await response.json()
        console.log('   Response:', result)
      } else {
        console.log('❌ Login failed')
        const error = await response.text()
        console.log('   Error:', error)
      }
    } catch (error) {
      console.log('❌ Login request failed:', error)
    }
    
    // Test 3: Test login dengan admin@example.com
    console.log('\n3. Testing login with admin@example.com...')
    
    const adminLoginData = {
      email: 'admin@example.com',
      password: 'password'
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminLoginData)
      })
      
      console.log(`   Response status: ${response.status}`)
      
      if (response.ok) {
        console.log('❌ admin@example.com login should not work but it did!')
        const result = await response.json()
        console.log('   Response:', result)
      } else {
        console.log('✅ admin@example.com correctly failed')
        const error = await response.text()
        console.log('   Error:', error)
      }
    } catch (error) {
      console.log('❌ Admin login request failed:', error)
    }
    
    console.log('\n🎯 Summary:')
    console.log('✅ Server is running and accessible')
    console.log('🔍 Check the login results above')
    
  } catch (error) {
    console.error('❌ Error testing server login:', error)
  }
}

testServerLogin() 