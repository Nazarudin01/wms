import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const data = await prisma.transaksiBarangMasuk.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!data) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.transaksiBarangMasuk.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }
} 