import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rentang = searchParams.get("rentang") || "harian";
    const gudangId = searchParams.get("gudangId") || undefined;
    let startDate: Date;
    const now = new Date();
    if (rentang === "mingguan") {
      startDate = subDays(now, 6);
    } else if (rentang === "bulanan") {
      startDate = subDays(now, 29);
    } else {
      startDate = subDays(now, 6); // default 7 hari
    }

    // 1. Barang Masuk vs Keluar (per hari)
    const masuk = await prisma.stokMasuk.findMany({
      where: { 
        tanggal: { gte: startDate, lte: now },
        ...(gudangId ? { gudang: gudangId } : {}),
      },
      select: { tanggal: true, items: { select: { qty: true } } },
    });
    const keluar = await prisma.transaksiKeluar.findMany({
      where: { 
        tanggal: { gte: startDate, lte: now },
        ...(gudangId ? { gudangId } : {}),
      },
      select: { tanggal: true, details: { select: { qty: true } } },
    });
    // Group by tanggal
    const labelsSet = new Set<string>();
    masuk.forEach(m => labelsSet.add(format(m.tanggal, 'yyyy-MM-dd')));
    keluar.forEach(k => labelsSet.add(format(k.tanggal, 'yyyy-MM-dd')));
    const labels = Array.from(labelsSet).sort();
    const masukData = labels.map(label => masuk.filter(m => format(m.tanggal, 'yyyy-MM-dd') === label).reduce((a, b) => a + b.items.reduce((x, y) => x + y.qty, 0), 0));
    const keluarData = labels.map(label => keluar.filter(k => format(k.tanggal, 'yyyy-MM-dd') === label).reduce((a, b) => a + b.details.reduce((x, y) => x + y.qty, 0), 0));

    // 2. Barang Terbanyak Keluar (top 5)
    const barangKeluar = await prisma.transaksiKeluarDetail.groupBy({
      by: ['barangId'],
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5,
      where: gudangId ? { transaksiKeluar: { gudangId } } : undefined,
    });
    const barangKeluarIds = barangKeluar.map(b => b.barangId);
    const barangKeluarInfo = await prisma.barang.findMany({ where: { id: { in: barangKeluarIds } } });
    const barangKeluarLabels = barangKeluar.map(b => barangKeluarInfo.find(info => info.id === b.barangId)?.nama || 'Barang');
    const barangKeluarData = barangKeluar.map(b => b._sum.qty || 0);

    // 3. 10 Barang Stok Terbanyak
    let barangStok;
    if (gudangId) {
      // Ambil stok hanya dari gudang tertentu
      const stokGudang = await prisma.stokGudang.findMany({
        where: { gudangId },
        include: { barang: true },
      });
      const sorted = stokGudang
        .map(sg => ({ ...sg.barang, totalStok: sg.stok }))
        .sort((a, b) => (b.totalStok || 0) - (a.totalStok || 0))
        .slice(0, 10);
      barangStok = sorted;
    } else {
      // Semua gudang
      const allBarang = await prisma.barang.findMany({ include: { stokGudang: true } });
      barangStok = allBarang
        .map(b => ({ ...b, totalStok: b.stokGudang.reduce((sum, sg) => sum + sg.stok, 0) }))
        .sort((a, b) => b.totalStok - a.totalStok)
        .slice(0, 10);
    }
    const barangStokLabels = barangStok.map(b => b.nama);
    const barangStokData = barangStok.map(b => b.totalStok);

    // 4. Gudang Trafik Tertinggi (jumlah transaksi keluar per gudang)
    const gudangTrafik = await prisma.transaksiKeluar.groupBy({
      by: ['gudangId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const gudangIds = gudangTrafik.map(g => g.gudangId);
    const gudangInfo = await prisma.gudang.findMany({ where: { id: { in: gudangIds } } });
    const gudangLabels = gudangTrafik.map(g => gudangInfo.find(info => info.id === g.gudangId)?.nama || 'Gudang');
    const gudangData = gudangTrafik.map(g => g._count.id);

    return NextResponse.json({
      barangMasukKeluar: {
        labels: labels || [],
        masuk: masukData || [],
        keluar: keluarData || [],
      },
      barangKeluarTerbanyak: {
        labels: barangKeluarLabels || [],
        data: barangKeluarData || [],
      },
      barangStokTerbanyak: {
        labels: barangStokLabels || [],
        data: barangStokData || [],
      },
      gudangTrafik: {
        labels: gudangLabels || [],
        data: gudangData || [],
      },
    });
  } catch (error) {
    console.error("[DASHBOARD_CHARTS]", error);
    return NextResponse.json({
      barangMasukKeluar: { labels: [], masuk: [], keluar: [] },
      barangKeluarTerbanyak: { labels: [], data: [] },
      barangStokTerbanyak: { labels: [], data: [] },
      gudangTrafik: { labels: [], data: [] },
      error: "Internal server error"
    }, { status: 500 });
  }
} 