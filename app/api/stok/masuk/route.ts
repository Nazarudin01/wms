import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const stokMasuk = await prisma.$transaction(async (tx) => {
      // Create stok masuk record
      const stokMasuk = await tx.stokMasuk.create({
        data: {
          nomor: nomor || `SM-${Date.now()}`,
          tanggal: new Date(tanggal),
          pemasok,
          gudang,
          status: "COMPLETED",
          total: 0,
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

      return stokMasuk;
    });

    return NextResponse.json(stokMasuk);
  } catch (error) {
    console.error("Error creating stok masuk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 