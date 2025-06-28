const fetch = require('node-fetch');

async function testNextAuthLogin() {
  try {
    const email = 'sinarsagara@wms.com';
    const password = 'Sinarsagara9';

    console.log('Testing NextAuth login with:', { email });

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

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ NextAuth login berhasil!');
    } else {
      console.log('❌ NextAuth login gagal');
    }

  } catch (error) {
    console.error('Error testing NextAuth login:', error);
  }
}

// Tunggu sebentar agar server siap
setTimeout(testNextAuthLogin, 3000); 