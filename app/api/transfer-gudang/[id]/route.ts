import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    // Ambil data transfer dan detail
    const transfer = await prisma.transferGudang.findUnique({
      where: { id },
      include: { details: true },
    });
    if (!transfer) {
      return NextResponse.json({ error: "Transfer tidak ditemukan" }, { status: 404 });
    }
    // Kembalikan stok barang
    await prisma.$transaction(async (tx) => {
      for (const item of transfer.details) {
        // Tambah stok ke gudang asal
        await tx.stokGudang.updateMany({
          where: { gudangId: transfer.gudangAsalId, barangId: item.barangId },
          data: { stok: { increment: item.jumlahTransfer } },
        });
        // Kurangi stok dari gudang tujuan
        await tx.stokGudang.updateMany({
          where: { gudangId: transfer.gudangTujuanId, barangId: item.barangId },
          data: { stok: { decrement: item.jumlahTransfer } },
        });
      }
      // Hapus detail dan transfer
      await tx.transferGudangDetail.deleteMany({ where: { transferGudangId: id } });
      await tx.transferGudang.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRANSFER_GUDANG_DELETE]", error);
    return NextResponse.json({ error: "Gagal menghapus transfer gudang" }, { status: 500 });
  }
} 