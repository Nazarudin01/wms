# Deployment Guide untuk Vercel

## Environment Variables yang Diperlukan

Pastikan semua environment variables berikut sudah diset di Vercel:

### Database
```
DATABASE_URL=postgresql://neondb_owner:npg_o87yzltfVJPR@ep-jolly-sun-a1usxj28-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### NextAuth
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=3f8b2c1e7d9a4b6c8d0e1f2a3b4c5d6e
```

### Redis (Upstash)
```
UPSTASH_REDIS_REST_URL=https://useful-grubworm-48604.upstash.io
UPSTASH_REDIS_REST_TOKEN=Ab3cAAIjcDFkMDBiNzUwN2I0OGM0YWY5YjU2ZTEyZDY3MGJkNDEzMHAxMA
```

### Cloudinary
```
CLOUDINARY_CLOUD_NAME=deeiwndhg
CLOUDINARY_API_KEY=883975569363344
CLOUDINARY_API_SECRET=sTriCJLnixLw_rMr5nB50QS1W00
```

### Environment
```
NODE_ENV=production
```

## Langkah Deployment

1. **Push code ke GitHub**
2. **Connect repository ke Vercel**
3. **Set environment variables di Vercel dashboard**
4. **Deploy**

## Troubleshooting

### Jika build gagal:
- Pastikan Node.js version >= 18.0.0
- Pastikan semua environment variables sudah diset
- Cek log build di Vercel dashboard

### Jika runtime error:
- Cek koneksi database
- Pastikan NEXTAUTH_URL sesuai dengan domain Vercel
- Cek log function di Vercel dashboard 