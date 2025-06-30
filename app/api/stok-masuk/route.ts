import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function GET() {
  try {
    console.log("🔍 GET /api/stok-masuk called");
    
    const session = await getServerSession(authOptions);
    console.log("🔍 Session check:", { hasSession: !!session, userId: session?.user?.id });

    if (!session) {
      console.log("❌ Unauthorized - no session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔍 Fetching stok masuk data...");
    const data = await prisma.stokMasuk.findMany({
      select: {
        id: true,
        nomor: true,
        tanggal: true,
        pemasok: true,
        gudang: true,
        status: true,
        total: true,
        items: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        tanggal: "desc"
      }
    });

    console.log("✅ Successfully fetched stok masuk data:", { count: data.length });
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching stok masuk:", error);
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔍 POST /api/stok-masuk called");
    
    const session = await getServerSession(authOptions);
    console.log("🔍 Session check:", { hasSession: !!session, userId: session?.user?.id });

    if (!session) {
      console.log("❌ Unauthorized - no session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("🔍 Request body:", { 
      hasTanggal: !!body.tanggal,
      hasPemasok: !!body.pemasok,
      hasGudang: !!body.gudang,
      hasItems: !!body.items,
      itemsLength: body.items?.length || 0
    });

    const {
      tanggal,
      pemasok,
      gudang,
      status,
      total,
      items,
      nomor
    } = body;

    if (!tanggal || !pemasok || !gudang || !items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ Payload error: field utama tidak lengkap", { tanggal, pemasok, gudang, items });
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Validasi items
    for (const [i, item] of Array.from(items.entries())) {
      if (
        !item.sku ||
        !item.nama_barang ||
        item.qty === undefined || isNaN(Number(item.qty)) ||
        item.harga === undefined || isNaN(Number(item.harga))
      ) {
        console.error(`❌ Payload error: item ke-${i + 1} tidak valid`, item);
        return NextResponse.json(
          { error: `Data item ke-${i + 1} tidak lengkap atau tidak valid` },
          { status: 400 }
        );
      }
    }

    console.log("🔍 Starting database transaction...");
    // Hitung total jika tidak dikirim
    const calculatedTotal = total ?? items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.harga)), 0);

    // Transaksi: create stokMasuk, items, dan update stok gudang
    const result = await prisma.$transaction(async (tx) => {
      console.log("🔍 Creating stokMasuk record...");
      // 1. Create stokMasuk dan items
      const stokMasuk = await tx.stokMasuk.create({
        data: {
          nomor,
          tanggal: new Date(tanggal),
          pemasok,
          gudang,
          status: "COMPLETED",
          total: calculatedTotal,
          items: {
            create: items.map((item: any) => ({
              sku: item.sku,
              nama_barang: item.nama_barang,
              qty: Number(item.qty),
              harga: Number(item.harga),
              kodeRak: item.kodeRakId
                ? {
                    connect: {
                      id: item.kodeRakId,
                    },
                  }
                : undefined,
            })),
          }
        },
        select: {
          id: true,
          nomor: true,
          tanggal: true,
          pemasok: true,
          gudang: true,
          status: true,
          total: true,
          items: true,
          created_at: true,
          updated_at: true,
        }
      });

      console.log("✅ StokMasuk created:", { id: stokMasuk.id, nomor: stokMasuk.nomor });

      // 2. Update/insert stok gudang untuk setiap item
      for (const [index, item] of items.entries()) {
        console.log(`🔍 Processing item ${index + 1}/${items.length}:`, { sku: item.sku });
        
        // Cari barang dan gudang ID berdasarkan SKU dan ID gudang
        const barang = await tx.barang.findUnique({ where: { sku: item.sku } });
        const gudangData = await tx.gudang.findUnique({ where: { id: gudang } });
        const kodeRak = item.kodeRakId ? await tx.kodeRak.findUnique({ where: { id: item.kodeRakId } }) : null;
        
        console.log("🔍 Found references:", { 
          hasBarang: !!barang, 
          hasGudang: !!gudangData, 
          hasKodeRak: !!kodeRak 
        });
        
        if (!barang || !gudangData) {
          throw new Error(`Barang dengan SKU ${item.sku} atau gudang dengan ID ${gudang} tidak ditemukan`);
        }

        let stokGudang = await tx.stokGudang.findFirst({
          where: {
            barangId: barang.id,
            gudangId: gudangData.id,
            kodeRakId: item.kodeRakId,
          },
        });

        if (stokGudang) {
          console.log("🔍 Updating existing stokGudang:", { id: stokGudang.id, oldStok: stokGudang.stok, newStok: stokGudang.stok + Number(item.qty) });
          await tx.stokGudang.update({
            where: { id: stokGudang.id },
            data: { 
              stok: stokGudang.stok + Number(item.qty)
            },
          });
        } else {
          console.log("🔍 Creating new stokGudang");
          stokGudang = await tx.stokGudang.create({
            data: {
              barangId: barang.id,
              gudangId: gudangData.id,
              kodeRakId: item.kodeRakId,
              sku: item.sku,
              nama: item.nama_barang,
              stok: Number(item.qty)
            },
          });
          console.log("✅ New stokGudang created:", { id: stokGudang.id });
        }

        // Update stokMasukItem agar stokGudangId terisi
        await tx.stokMasukItem.updateMany({
          where: {
            stokMasukId: stokMasuk.id,
            sku: item.sku,
          },
          data: {
            stokGudangId: stokGudang?.id,
          },
        });

        // Update only updatedAt on Barang (optional)
        await tx.barang.update({
          where: { id: barang.id },
          data: {
            updatedAt: new Date()
          },
        });
      }

      console.log("✅ Transaction completed successfully");
      return stokMasuk;
    });

    console.log("✅ POST /api/stok-masuk completed successfully");
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error creating stok masuk:", error);
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 