import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomor, tanggal, pelanggan, matras, pemasok, kategori, items } = body;
    if (!nomor || !tanggal || !pelanggan || !matras || !pemasok || !kategori || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }
    // Simpan ke tabel transaksiBarangMasuk dan detailnya
    const result = await prisma.transaksiBarangMasuk.create({
      data: {
        nomor,
        tanggal: new Date(tanggal),
        pelanggan,
        matras,
        pemasok,
        kategori,
        items: {
          create: items.map((item: any) => ({
            sku: item.sku,
            nama_barang: item.nama_barang,
            qty: Number(item.qty),
            satuan: item.satuan || null,
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[TRANS_BARANG_MASUK_POST]", error);
    return NextResponse.json({ error: "Gagal menyimpan catatan transaksi barang masuk." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await prisma.transaksiBarangMasuk.findMany({
      orderBy: { tanggal: 'desc' },
      include: { items: true },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[TRANS_BARANG_MASUK_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi barang masuk." }, { status: 500 });
  }
} 