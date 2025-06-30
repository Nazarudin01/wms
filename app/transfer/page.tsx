"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Upload, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface TransferBarangItem {
  barangId: string;
  satuan: string;
  stok: number;
  jumlahTransfer: number;
}

interface TransferForm {
  nomor: string;
  tanggal: string;
  penanggungJawab: string;
  gudangAsalId: string;
  gudangTujuanId: string;
  items: TransferBarangItem[];
}

type BarangOption = {
  id: string;
  nama: string;
  satuan: string;
  stok: number;
};

export default function TransferGudangPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gudangList, setGudangList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [form, setForm] = useState<TransferForm>({
    nomor: "",
    tanggal: format(new Date(), "yyyy-MM-dd"),
    penanggungJawab: "",
    gudangAsalId: "",
    gudangTujuanId: "",
    items: [],
  });
  const [loadingBarang, setLoadingBarang] = useState(false);
  const [barangOptions, setBarangOptions] = useState<BarangOption[]>([]);
  const router = useRouter();

  // Fetch transfer list
  const fetchTransfers = async () => {
    const res = await fetch("/api/transfer-gudang");
    const json = await res.json();
    setData(json.data || []);
  };
  // Fetch gudang list
  const fetchGudangs = async () => {
    const res = await fetch("/api/master/gudang");
    const json = await res.json();
    setGudangList(json.data || []);
  };
  // Fetch barang by gudang asal
  const fetchBarangByGudang = async (gudangId: string) => {
    if (!gudangId) return setBarangOptions([]);
    setLoadingBarang(true);
    const res = await fetch(`/api/master-data/gudang/${gudangId}/barang`);
    const json = await res.json();
    setBarangOptions(json || []);
    setLoadingBarang(false);
  };
  // Generate nomor transfer
  const generateNomor = () => {
    const now = new Date(form.tanggal);
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    return `TRF-${dd}${mm}${yy}-PREVIEW`;
  };

  // Modal open: fetch gudang
  React.useEffect(() => {
    if (open) fetchGudangs();
  }, [open]);
  // Gudang asal change: fetch barang
  React.useEffect(() => {
    if (form.gudangAsalId) fetchBarangByGudang(form.gudangAsalId);
  }, [form.gudangAsalId]);
  // Tanggal change: update nomor
  React.useEffect(() => {
    setForm(f => ({ ...f, nomor: generateNomor() }));
  }, [form.tanggal]);

  // Handler tambah barang
  const handleAddBarang = () => {
    setForm(f => ({ ...f, items: [...f.items, { barangId: "", satuan: "", stok: 0, jumlahTransfer: 1 }] }));
  };
  // Handler hapus barang
  const handleRemoveBarang = (idx: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };
  // Handler barang change
  const handleBarangChange = (idx: number, barangId: string) => {
    const barang = barangOptions.find(b => b.id === barangId);
    setForm(f => {
      const items = [...f.items];
      items[idx] = {
        ...items[idx],
        barangId,
        satuan: barang?.satuan || "",
        stok: barang?.stok || 0,
        jumlahTransfer: 1,
      };
      return { ...f, items };
    });
  };
  // Handler jumlah transfer change
  const handleJumlahChange = (idx: number, val: string) => {
    setForm(f => {
      const items = [...f.items];
      items[idx].jumlahTransfer = Number(val);
      return { ...f, items };
    });
  };

  // Simpan transfer
  const handleSimpan = async () => {
    setConfirmOpen(false);
    const res = await fetch("/api/transfer-gudang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tanggal: form.tanggal,
        penanggungJawab: form.penanggungJawab,
        gudangAsalId: form.gudangAsalId,
        gudangTujuanId: form.gudangTujuanId,
        items: form.items.map(i => ({
          barangId: i.barangId,
          satuan: i.satuan,
          stok: i.stok,
          jumlahTransfer: i.jumlahTransfer,
        })),
      }),
    });
    if (res.ok) {
      setOpen(false);
      setForm({ nomor: "", tanggal: format(new Date(), "yyyy-MM-dd"), penanggungJawab: "", gudangAsalId: "", gudangTujuanId: "", items: [] });
      fetchTransfers();
    }
  };

  React.useEffect(() => { fetchTransfers(); }, []);

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transfer Gudang</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/transfer/buat")}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Buat Transfer Gudang
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto w-full">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>No Transfer</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Gudang Asal</TableHead>
              <TableHead>Gudang Tujuan</TableHead>
              <TableHead>Jumlah Barang</TableHead>
              <TableHead>Jumlah Stok</TableHead>
              <TableHead>Penanggung Jawab</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Belum ada data transfer
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.nomor}</TableCell>
                  <TableCell>{row.tanggal?.slice(0,10)}</TableCell>
                  <TableCell>{row.gudangAsal?.nama}</TableCell>
                  <TableCell>{row.gudangTujuan?.nama}</TableCell>
                  <TableCell>{row.details?.length}</TableCell>
                  <TableCell>{row.details?.reduce((a,b)=>a+(b.jumlahTransfer||0),0)}</TableCell>
                  <TableCell>{row.penanggungJawab}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => router.push(`/transfer/${row.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modal Buat Transfer Gudang */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Transfer Gudang</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); setConfirmOpen(true); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold">No Transfer</label>
                <Input value={form.nomor || generateNomor()} readOnly />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Tanggal</label>
                <Input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Penanggung Jawab</label>
                <Input value={form.penanggungJawab} onChange={e => setForm(f => ({ ...f, penanggungJawab: e.target.value }))} required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Gudang Asal</label>
                <select className="w-full border rounded px-2 py-2" value={form.gudangAsalId} onChange={e => setForm(f => ({ ...f, gudangAsalId: e.target.value, items: [] }))} required>
                  <option value="">Pilih Gudang</option>
                  {gudangList.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Gudang Tujuan</label>
                <select className="w-full border rounded px-2 py-2" value={form.gudangTujuanId} onChange={e => setForm(f => ({ ...f, gudangTujuanId: e.target.value }))} required>
                  <option value="">Pilih Gudang</option>
                  {gudangList.filter((g: any) => g.id !== form.gudangAsalId).map((g: any) => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Barang yang Ditransfer</span>
                <Button type="button" size="sm" onClick={handleAddBarang}>+ Tambah Barang</Button>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Jumlah Transfer</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">Belum ada barang</TableCell>
                      </TableRow>
                    ) : (
                      form.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="min-w-[200px]">
                            <Combobox
                              items={barangOptions}
                              value={item.barangId}
                              onChange={val => handleBarangChange(idx, val)}
                              placeholder="Pilih barang..."
                              getOptionLabel={b => b.nama}
                              getOptionValue={b => b.id}
                            />
                          </TableCell>
                          <TableCell>{item.satuan}</TableCell>
                          <TableCell>{item.stok}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              max={item.stok}
                              value={item.jumlahTransfer.toString()}
                              onChange={e => handleJumlahChange(idx, e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBarang(idx)}>
                              <span className="sr-only">Hapus</span>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Simpan Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal Konfirmasi Simpan */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Transfer</DialogTitle>
          </DialogHeader>
          <DialogDescription className="mb-4 text-center">
            Yakin akan melakukan transfer barang ke <b>{gudangList.find(g => g.id === form.gudangTujuanId)?.nama || "-"}</b>?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button onClick={handleSimpan}>Ya, Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 