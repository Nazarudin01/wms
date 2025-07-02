import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stokMasuk = await prisma.stokMasuk.findMany({
      include: {
        items: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    return NextResponse.json(stokMasuk);
  } catch (error) {
    console.error("Error fetching stok masuk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper untuk generate nomor transaksi unik dan berurutan
async function generateNomorTransaksi(prisma: PrismaClient) {
  for (let i = 0; i < 5; i++) { // coba 5x
    const last = await prisma.stokMasuk.findFirst({
      orderBy: { nomor: 'desc' },
      where: { nomor: { startsWith: 'SM-' } }
    });
    let newNomor;
    if (last && last.nomor) {
      // Ambil angka terakhir, lalu +1
      const lastNumber = parseInt(last.nomor.split('-')[1], 10);
      newNomor = `SM-${(lastNumber + 1).toString().padStart(4, '0')}`;
    } else {
      newNomor = 'SM-0001';
    }
    // Cek apakah sudah ada
    const exists = await prisma.stokMasuk.findUnique({ where: { nomor: newNomor } });
    if (!exists) return newNomor;
    // Jika sudah ada, ulangi
  }
  throw new Error('Gagal generate nomor transaksi unik');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tanggal, pemasok, gudang, items, nomor } = body;

    if (!tanggal || !pemasok || !gudang || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // 1. Resolve gudangId from kode
    const gudangRecord = await prisma.gudang.findUnique({ where: { kode: gudang } });
    if (!gudangRecord) {
      return NextResponse.json({ error: "Gudang tidak ditemukan" }, { status: 400 });
    }
    const gudangId = gudangRecord.id;

    // 2. Check existing StokGudang records and prepare queries
    const stokGudangQueries = [];
    
    for (const item of items) {
      // Cari barangId dari sku
      const barangRecord = await prisma.barang.findUnique({ where: { sku: item.sku } });
      if (!barangRecord) throw new Error(`Barang dengan SKU ${item.sku} tidak ditemukan`);
      const barangId = barangRecord.id;
      
      // Cek apakah sudah ada stokGudang (tanpa kodeRak)
      const existingStokGudang = await prisma.stokGudang.findFirst({
        where: {
          barangId,
          gudangId,
          kodeRakId: null,
        },
      });
      
      if (existingStokGudang) {
        // Update stok yang sudah ada
        stokGudangQueries.push(
          prisma.stokGudang.update({
            where: { id: existingStokGudang.id },
            data: { stok: { increment: Number(item.qty) } },
          })
        );
      } else {
        // Buat stokGudang baru
        stokGudangQueries.push(
          prisma.stokGudang.create({
            data: {
              sku: item.sku,
              nama: item.nama_barang,
              gudangId,
              barangId,
              stok: Number(item.qty),
              kodeRakId: null,
            },
          })
        );
      }
    }

    // 3. Generate nomor transaksi jika tidak ada
    let nomorTransaksi = nomor;
    if (!nomorTransaksi) {
      nomorTransaksi = await generateNomorTransaksi(prisma);
    }

    // 4. Prepare the stokMasuk creation query
    const createStokMasukQuery = prisma.stokMasuk.create({
      data: {
        nomor: nomorTransaksi,
        tanggal: new Date(tanggal),
        pemasok,
        gudang,
        status: "COMPLETED",
        total: items.reduce((acc: number, item: any) => acc + (Number(item.qty) * Number(item.harga)), 0),
        items: {
          create: items.map((item: any) => ({
            sku: item.sku,
            nama_barang: item.nama_barang,
            qty: Number(item.qty),
            harga: Number(item.harga) || 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 5. Run all queries in a batch transaction
    const results = await prisma.$transaction([
      ...stokGudangQueries,
      createStokMasukQuery,
    ]);

    // The last result is the stokMasuk record
    const stokMasuk = results[results.length - 1];

    return NextResponse.json(stokMasuk);
  } catch (error) {
    console.error("Error creating stok masuk:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
} 