import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil semua kode gudang yang ada
    const existingKodes = await prisma.gudang.findMany({
      select: { kode: true },
      orderBy: { kode: 'asc' }
    });

    // Cari kode berikutnya yang belum digunakan
    let newKode = "G001";
    let counter = 1;

    while (true) {
      const testKode = "G" + String(counter).padStart(3, '0');
      
      // Cek apakah kode ini sudah ada
      const exists = existingKodes.some(gudang => gudang.kode === testKode);
      
      if (!exists) {
        newKode = testKode;
        break;
      }
      
      counter++;
      
      // Safety check untuk mencegah infinite loop
      if (counter > 9999) {
        console.error("Too many gudang codes generated");
        return NextResponse.json(
          { error: "Terlalu banyak kode gudang" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ kode: newKode });
  } catch (error) {
    console.error("Error generating kode gudang:", error);
    return NextResponse.json(
      { error: "Gagal generate kode gudang" },
      { status: 500 }
    );
  }
} 