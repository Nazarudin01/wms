const fs = require('fs');
const path = require('path');

// Konfigurasi environment variables
const envConfig = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wms_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here-$(date +%s)"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  // Tulis file .env
  fs.writeFileSync(envPath, envConfig);
  console.log('✅ File .env berhasil dibuat di:', envPath);
  console.log('📝 Konfigurasi environment variables:');
  console.log(envConfig);
} catch (error) {
  console.error('❌ Error membuat file .env:', error);
} 