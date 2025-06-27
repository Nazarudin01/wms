import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const barang = await prisma.barang.findMany({
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json({
      data: barang,
    });
  } catch (error) {
    console.error("Error fetching barang:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data barang" },
      { status: 500 }
    );
  }
}

const barangSchema = z.object({
  sku: z.string(),
  nama: z.string(),
  kategori: z.string(),
  satuan: z.string(),
  jenis: z.string(),
  hargaBeli: z.coerce.number(),
  gambar: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, any> = {};
    for (const [key, value] of Array.from(formData.entries())) {
      if (key !== 'gambar') data[key] = value;
    }

    const file = formData.get('gambar') as File | null;
    if (file) {
      // Convert File ke Buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      // Upload ke Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'barang' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      // Simpan URL gambar dari Cloudinary
      data.gambar = (uploadResult as any).secure_url;
    }

    const validatedData = barangSchema.parse(data);

    const newBarang = await prisma.barang.create({
      data: validatedData,
    });

    return NextResponse.json(newBarang, { status: 201 });
  } catch (error) {
    console.error("Error creating barang:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Gagal membuat data barang" },
      { status: 500 }
    );
  }
} 