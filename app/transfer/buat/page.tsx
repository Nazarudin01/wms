"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

type FormEvent = React.FormEvent<HTMLFormElement>;

export default function BuatTransferGudangPage() {
  const [gudangList, setGudangList] = useState([]);
  const [barangOptions, setBarangOptions] = useState<BarangOption[]>([]);
  const [form, setForm] = useState<TransferForm>({
    nomor: "",
    tanggal: format(new Date(), "yyyy-MM-dd"),
    penanggungJawab: "",
    gudangAsalId: "",
    gudangTujuanId: "",
    items: [],
  });
  const [nomorPreview, setNomorPreview] = useState("");
  const [loadingBarang, setLoadingBarang] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

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
  // Fetch nomor transfer preview dari API
  const fetchNomorPreview = async () => {
    if (!form.tanggal) return;
    const now = new Date(form.tanggal);
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const prefix = `TRF-${dd}${mm}${yy}-`;
    const res = await fetch(`/api/transfer-gudang?prefix=${prefix}`);
    const json = await res.json();
    setNomorPreview(json.nomorPreview || `${prefix}001`);
  };

  React.useEffect(() => { fetchGudangs(); }, []);
  React.useEffect(() => { if (form.gudangAsalId) fetchBarangByGudang(form.gudangAsalId); }, [form.gudangAsalId]);
  React.useEffect(() => { fetchNomorPreview(); }, [form.tanggal, form.gudangAsalId, form.gudangTujuanId]);

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
  const handleSimpan = async (e: FormEvent) => {
    e.preventDefault();
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
      router.push("/transfer");
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Buat Transfer Gudang</h1>
      <form className="space-y-4" onSubmit={handleSimpan}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">No Transfer</label>
            <Input value={nomorPreview} readOnly />
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
          <div className="overflow-x-visible overflow-y-visible">
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
                      <TableCell className="min-w-[200px] max-w-xs w-full">
                        <Combobox
                          items={barangOptions}
                          value={item.barangId}
                          onChange={val => handleBarangChange(idx, val)}
                          placeholder="Pilih barang..."
                          getOptionLabel={b => b.nama}
                          getOptionValue={b => b.id}
                          className="w-full min-w-[300px]"
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
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/transfer")}>Batal</Button>
          <Button type="submit">Simpan Transfer</Button>
        </div>
      </form>
    </div>
  );
} 