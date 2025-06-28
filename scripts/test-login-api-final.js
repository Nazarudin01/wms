const fetch = require('node-fetch');

async function testLoginAPIFinal() {
  try {
    console.log('🧪 Testing NextAuth API after Prisma Client regenerate...');
    
    const email = 'sinarsagara@wms.com';
    const password = 'Sinarsagara9';
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
    // Test login melalui API NextAuth
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: email,
        password: password,
        callbackUrl: '/dashboard',
        json: 'true'
      })
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response status text: ${response.statusText}`);
    
    const result = await response.text();
    console.log(`📄 Response body: ${result}`);

    if (response.ok) {
      console.log('✅ NextAuth API login berhasil!');
      console.log('🎯 Sekarang coba login di browser dengan kredensial yang sama');
    } else {
      console.log('❌ NextAuth API login gagal');
      
      if (response.status === 401) {
        console.log('🔍 Error 401 - Unauthorized');
        console.log('   Kemungkinan penyebab:');
        console.log('   - Masih ada masalah dengan Prisma Client cache');
        console.log('   - Database connection issue');
        console.log('   - Environment variables tidak terbaca');
      }
    }

  } catch (error) {
    console.error('❌ Error testing NextAuth API:', error);
  }
}

// Tunggu sebentar agar server siap
setTimeout(testLoginAPIFinal, 3000); 