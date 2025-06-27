import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { stokAktual } = await req.json();
    if (typeof stokAktual !== "number") {
      return NextResponse.json({ error: "stokAktual harus berupa angka" }, { status: 400 });
    }
    // Ambil detail lama
    const detail = await prisma.stokOpnameDetail.findUnique({ where: { id: params.id } });
    if (!detail) return NextResponse.json({ error: "Detail tidak ditemukan" }, { status: 404 });
    // Update stokAktual dan selisih
    const updated = await prisma.stokOpnameDetail.update({
      where: { id: params.id },
      data: {
        stokAktual,
        selisih: stokAktual - detail.stokSebelum,
      },
    });
    // Update stokGudang juga (jika perlu, Anda bisa tambahkan logic di sini)
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update detail opname" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Hapus detail opname
    await prisma.stokOpnameDetail.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus detail opname" }, { status: 500 });
  }
} 