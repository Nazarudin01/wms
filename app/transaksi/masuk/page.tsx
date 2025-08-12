"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Trash2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "@/components/ui/use-toast";

const BuatTransaksiMasukForm = dynamic(() => import("../masuk/buat/page").then(mod => mod.default), { ssr: false });

export default function TransaksiBarangMasukPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [pemasokList, setPemasokList] = useState<any[]>([]);
  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [barangList, setBarangList] = useState<any[]>([]); // Added barangList state

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/transaksi-barang-masuk");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const result = await res.json();
      setData(result.data || result); // support array or {data: array}
    } catch (error) {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Ambil data master pemasok dan pelanggan
    fetch("/api/master-data/pemasok").then(r => r.json()).then(d => setPemasokList(d.data || []));
    fetch("/api/master-data/pelanggan").then(r => r.json()).then(d => setPelangganList(d.data || []));
    // Ambil data master barang untuk gambar
    fetch("/api/master-data/barang").then(r => r.json()).then(d => setBarangList(d.data || []));
  }, [fetchData]);

  useEffect(() => {
    // Hapus seluruh kode terkait Dialog, DialogContent, DialogHeader, DialogFooter, dan state detailOpen/detailData.
  }, []);

  // Pencarian sangat responsif (langsung filter di client)
  const filtered = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.nomor?.toLowerCase().includes(q) ||
      item.pelanggan?.toLowerCase().includes(q) ||
      item.pemasok?.toLowerCase().includes(q) ||
      item.tanggal?.toLowerCase().includes(q)
    );
  });

  // Helper untuk dapatkan nama dari ID
  const getNamaPemasok = (id: string) => pemasokList.find((p: any) => p.id === id)?.nama || id;
  const getNamaPelanggan = (id: string) => pelangganList.find((p: any) => p.id === id)?.nama || id;

  // Handler hapus transaksi
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    try {
      const res = await fetch(`/api/transaksi-barang-masuk/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus data');
      toast({ title: 'Berhasil', description: 'Data berhasil dihapus.' });
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Transaksi Barang Masuk</h1>
        <Button className="flex items-center gap-2" onClick={() => router.push('/transaksi/masuk/buat')}>
          <Plus className="h-4 w-4" />
          Buat Transaksi Baru
        </Button>
      </div>
      <div className="flex items-center mb-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi barang masuk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No Transaksi</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Pemasok</TableHead>
              <TableHead>Jumlah Barang</TableHead>
              <TableHead>Kuantitas</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Memuat data...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400">Tidak ada data</TableCell>
              </TableRow>
            ) : (
              filtered.map((item, idx) => (
                <TableRow key={item.id || idx}>
                  <TableCell>{item.nomor}</TableCell>
                  <TableCell>{item.tanggal?.slice(0,10)}</TableCell>
                  <TableCell>{getNamaPelanggan(item.pelanggan) || '-'}</TableCell>
                  <TableCell>{getNamaPemasok(item.pemasok) || '-'}</TableCell>
                  <TableCell>{
                    Array.isArray(item.items)
                      ? new Set((item.items as any[]).map((i: any) => `${i.nama_barang}__${i.satuan}`)).size
                      : '-'
                  }</TableCell>
                  <TableCell>{item.items?.reduce((a: number, b: any) => a + (b.qty || 0), 0)}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 mx-auto" onClick={() => router.push(`/transaksi/masuk/${item.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 mx-auto" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modal '+ Buat Transaksi Baru' dihapus */}
      {/* Dialog Detail SPK */}
      {/* Hapus seluruh kode terkait Dialog, DialogContent, DialogHeader, DialogFooter, dan state detailOpen/detailData. */}
    </div>
  );
} 