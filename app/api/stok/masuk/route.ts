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

    // Prepare all update queries for stock
    const updateStokQueries = items.map((item: any) =>
      prisma.barang.update({
        where: { sku: item.sku },
        data: {
          stok: {
            increment: Number(item.qty),
          },
        },
      })
    );

    // Prepare the stokMasuk creation query
    const createStokMasukQuery = prisma.stokMasuk.create({
      data: {
        nomor: nomor || `SM-${Date.now()}`,
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

    // Run all queries in a batch transaction
    const results = await prisma.$transaction([
      ...updateStokQueries,
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