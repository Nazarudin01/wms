"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Search, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StokKeluarFormModal } from "@/components/stok-keluar/form-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StokKeluarPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [detailModal, setDetailModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stok-keluar");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const result = await res.json();
      setData(result.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter((item: any) =>
    item.nomor.toLowerCase().includes(search.toLowerCase()) ||
    item.pelanggan.toLowerCase().includes(search.toLowerCase()) ||
    item.gudang.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = async (id: string) => {
    setDetailModal({ open: true, id });
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/stok-keluar/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil detail");
      const data = await res.json();
      setDetailData(data);
    } catch (e: any) {
      setDetailData({ error: e.message });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Stok Keluar</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Buat Stok Keluar
          </Button>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari stok keluar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>No Transaksi</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Gudang</TableHead>
              <TableHead>Jumlah Barang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.nomor}</TableCell>
                  <TableCell>{item.pelanggan}</TableCell>
                  <TableCell>{item.gudang}</TableCell>
                  <TableCell>{item.jumlahBarang}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 mx-auto" onClick={() => openDetail(item.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 mx-auto"
                      onClick={async () => {
                        if (confirm("Yakin ingin menghapus stok keluar ini?")) {
                          const res = await fetch(`/api/stok-keluar/${item.id}`, { method: "DELETE" });
                          if (res.ok) {
                            toast({ title: "Berhasil", description: "Stok keluar berhasil dihapus." });
                            fetchData();
                          } else {
                            let errMsg = "Gagal menghapus stok keluar.";
                            try {
                              const err = await res.json();
                              errMsg = err.error || errMsg;
                            } catch {}
                            toast({ title: "Error", description: errMsg, variant: "destructive" });
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StokKeluarFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />

      <Dialog open={detailModal.open} onOpenChange={open => setDetailModal({ open, id: open ? detailModal.id : undefined })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Stok Keluar</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div>Memuat detail...</div>
          ) : detailData?.error ? (
            <div className="text-red-500">{detailData.error}</div>
          ) : detailData ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><b>Nomor:</b> {detailData.nomor}</div>
                <div><b>Tanggal:</b> {detailData.tanggal?.slice(0,10)}</div>
                <div><b>Pelanggan:</b> {detailData.pelanggan}</div>
                <div><b>Gudang:</b> {detailData.gudang}</div>
              </div>
              <div className="mt-4">
                <b>Barang yang Dikeluarkan:</b>
                <table className="w-full border mt-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Nama</th>
                      <th className="border px-2 py-1">SKU</th>
                      <th className="border px-2 py-1">Satuan</th>
                      <th className="border px-2 py-1">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.items?.map((b: any, i: number) => (
                      <tr key={i}>
                        <td className="border px-2 py-1">{b.nama}</td>
                        <td className="border px-2 py-1">{b.sku}</td>
                        <td className="border px-2 py-1">{b.satuan}</td>
                        <td className="border px-2 py-1 text-right">{b.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
} 