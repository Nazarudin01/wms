import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List transfer gudang
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix");
    if (prefix) {
      // Untuk preview nomor urut berikutnya
      const lastTransfer = await prisma.transferGudang.findFirst({
        where: { nomor: { startsWith: prefix } },
        orderBy: { nomor: "desc" },
        select: { nomor: true },
      });
      let newSequence = 1;
      if (lastTransfer) {
        const lastSequence = parseInt(lastTransfer.nomor.split("-")[2], 10);
        newSequence = lastSequence + 1;
      }
      const nomorPreview = `${prefix}${String(newSequence).padStart(3, "0")}`;
      return NextResponse.json({ nomorPreview });
    }
    // Default: list transfer
    const transfers = await prisma.transferGudang.findMany({
      orderBy: { tanggal: "desc" },
      include: {
        gudangAsal: true,
        gudangTujuan: true,
        details: {
          include: { barang: true },
        },
      },
    });
    return NextResponse.json({ data: transfers });
  } catch (error) {
    console.error("[TRANSFER_GUDANG_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil data transfer gudang" }, { status: 500 });
  }
}

// POST: Buat transfer gudang baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tanggal, penanggungJawab, gudangAsalId, gudangTujuanId, items } = body;
    if (!tanggal || !penanggungJawab || !gudangAsalId || !gudangTujuanId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Generate nomor transfer: TRF-DDMMYY-XXX
    const now = new Date(tanggal);
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const prefix = `TRF-${dd}${mm}${yy}-`;
    const lastTransfer = await prisma.transferGudang.findFirst({
      where: { nomor: { startsWith: prefix } },
      orderBy: { nomor: "desc" },
      select: { nomor: true },
    });
    let newSequence = 1;
    if (lastTransfer) {
      const lastSequence = parseInt(lastTransfer.nomor.split("-")[2], 10);
      newSequence = lastSequence + 1;
    }
    const nomor = `${prefix}${String(newSequence).padStart(3, "0")}`;

    // Simpan transfer dan detail, lalu update stok
    const transfer = await prisma.$transaction(async (tx) => {
      const created = await tx.transferGudang.create({
        data: {
          nomor,
          tanggal: new Date(tanggal),
          penanggungJawab,
          gudangAsalId,
          gudangTujuanId,
          details: {
            create: items.map((item: any) => ({
              barangId: item.barangId,
              satuan: item.satuan,
              stok: item.stok,
              jumlahTransfer: item.jumlahTransfer,
            })),
          },
        },
        include: {
          gudangAsal: true,
          gudangTujuan: true,
          details: { include: { barang: true } },
        },
      });
      // Update stok untuk setiap barang
      for (const item of items) {
        // Kurangi stok di gudang asal
        await tx.stokGudang.updateMany({
          where: { gudangId: gudangAsalId, barangId: item.barangId },
          data: { stok: { decrement: item.jumlahTransfer } },
        });
        // Tambah stok di gudang tujuan (atau insert jika belum ada)
        const tujuan = await tx.stokGudang.findFirst({
          where: { gudangId: gudangTujuanId, barangId: item.barangId },
        });
        if (tujuan) {
          await tx.stokGudang.update({
            where: { id: tujuan.id },
            data: { stok: { increment: item.jumlahTransfer } },
          });
        } else {
          await tx.stokGudang.create({
            data: {
              gudangId: gudangTujuanId,
              barangId: item.barangId,
              stok: item.jumlahTransfer,
              nama: item.barangNama || "", // fallback jika perlu
              sku: item.barangSku || "", // fallback jika perlu
            },
          });
        }
      }
      return created;
    });
    return NextResponse.json({ data: transfer });
  } catch (error) {
    console.error("[TRANSFER_GUDANG_POST]", error);
    return NextResponse.json({ error: "Gagal menyimpan transfer gudang" }, { status: 500 });
  }
} 