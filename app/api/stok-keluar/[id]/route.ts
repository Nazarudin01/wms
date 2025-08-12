import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    // Jalankan dalam transaksi
    await prisma.$transaction(async (tx) => {
      // 1. Ambil semua detail transaksi keluar
      const details = await tx.transaksiKeluarDetail.findMany({
        where: { transaksiKeluarId: id },
      });
      // 2. Kembalikan stok ke gudang
      for (const detail of details) {
        await tx.stokGudang.updateMany({
          where: {
            gudangId: (await tx.transaksiKeluar.findUnique({ where: { id } }))?.gudangId,
            barangId: detail.barangId,
          },
          data: {
            stok: { increment: detail.qty },
          },
        });
      }
      // 3. Hapus detail transaksi keluar
      await tx.transaksiKeluarDetail.deleteMany({ where: { transaksiKeluarId: id } });
      // 4. Hapus transaksi keluar utama
      await tx.transaksiKeluar.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STOK_KELUAR_DELETE]", error);
    return NextResponse.json({ error: "Gagal menghapus stok keluar." }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const transaksi = await prisma.transaksiKeluar.findUnique({
      where: { id },
      include: {
        pelanggan: true,
        gudang: true,
        details: {
          include: {
            barang: true,
          },
        },
      },
    });
    if (!transaksi) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({
      id: transaksi.id,
      nomor: transaksi.nomor,
      tanggal: transaksi.tanggal,
      pelanggan: transaksi.pelanggan?.nama || null,
      gudang: transaksi.gudang?.nama || null,
      items: transaksi.details.map((d) => ({
        nama: d.barang?.nama || "-",
        sku: d.barang?.sku || "-",
        satuan: d.barang?.satuan || "-",
        qty: d.qty,
      })),
    });
  } catch (error) {
    console.error("[STOK_KELUAR_DETAIL_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 