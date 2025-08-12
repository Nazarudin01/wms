"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ComboboxSearch } from "@/components/stok-masuk/combobox-search";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

function generateNomorSPK(date: Date, lastUrut: number) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const urut = String(lastUrut).padStart(3, "0");
  return `SPK-${mm}${yy}-${urut}`;
}

export default function BuatTransaksiMasukPage() {
  const [tanggal, setTanggal] = useState(new Date());
  const [tenggat, setTenggat] = useState("");
  const [nomor, setNomor] = useState("");
  const [lastUrut, setLastUrut] = useState(1);
  const [pemasok, setPemasok] = useState("");
  const [pelanggan, setPelanggan] = useState("");
  const [matras, setMatras] = useState("");
  const [pemasokList, setPemasokList] = useState<any[]>([]);
  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [barangList, setBarangList] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch master data
  useEffect(() => {
    fetch("/api/master-data/pemasok").then(r => r.json()).then(d => setPemasokList(d.data || []));
    fetch("/api/master-data/pelanggan").then(r => r.json()).then(d => setPelangganList(d.data || []));
    fetch("/api/master-data/barang").then(r => r.json()).then(d => setBarangList(d.data || []));
  }, []);

  // Auto generate nomor SPK
  useEffect(() => {
    async function getLastUrut() {
      // Ambil transaksi bulan berjalan
      const mm = String(tanggal.getMonth() + 1).padStart(2, "0");
      const yy = String(tanggal.getFullYear()).slice(-2);
      const prefix = `SPK-${mm}${yy}-`;
      try {
        const res = await fetch("/api/transaksi-barang-masuk", { cache: "no-store" });
        const all = await res.json();
        const data = all.data || all;
        // Filter transaksi bulan berjalan
        const bulanIni = data.filter((t: any) => t.nomor && t.nomor.startsWith(prefix));
        // Cari urutan terakhir
        let lastUrut = 0;
        bulanIni.forEach((t: any) => {
          const match = t.nomor.match(/SPK-\d{4}-(\d+)/);
          if (match) {
            const urut = parseInt(match[1], 10);
            if (urut > lastUrut) lastUrut = urut;
          }
        });
        setLastUrut(lastUrut + 1);
        setNomor(generateNomorSPK(tanggal, lastUrut + 1));
      } catch {
        setLastUrut(1);
        setNomor(generateNomorSPK(tanggal, 1));
      }
    }
    getLastUrut();
  }, [tanggal]);

  // Handler tambah item
  const addItem = () => setItems([...items, { barangId: "", qty: 1 }]);
  // Handler hapus item
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  // Handler ubah item
  const updateItem = (idx: number, key: string, value: any) => setItems(items.map((item, i) => i === idx ? { ...item, [key]: value } : item));

  // Handler simpan data
  const handleSimpan = async () => {
    // Validasi field wajib
    const missingFields = [];
    if (!nomor) missingFields.push('No SPK');
    if (!tanggal) missingFields.push('Tanggal');
    if (!tenggat) missingFields.push('Tenggat Waktu');
    if (!pemasok) missingFields.push('Nama Pemasok');
    if (!pelanggan) missingFields.push('Nama Pelanggan');
    if (!matras) missingFields.push('Embos/Matras');
    if (items.length === 0) missingFields.push('Daftar Barang');
    if (items.some(item => !item.barangId)) missingFields.push('Nama Barang (pada item)');
    if (items.some(item => !item.qty || item.qty < 1)) missingFields.push('Kuantitas (pada item)');
    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Harap isi field berikut: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    // Siapkan payload
    const itemsPayload = items.map(item => {
      const barang = barangList.find((b: any) => b.id === item.barangId) || {};
      return {
        sku: barang.sku,
        nama_barang: barang.nama,
        qty: item.qty,
        satuan: barang.satuan || "",
      };
    });
    const payload = {
      nomor,
      tanggal: format(tanggal, "yyyy-MM-dd"),
      pelanggan,
      matras,
      pemasok,
      kategori: "-", // kategori tidak ada di form, default '-'
      items: itemsPayload,
    };
    try {
      const res = await fetch("/api/transaksi-barang-masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan data");
      toast({ title: "Berhasil", description: "Data berhasil disimpan." });
      // Reset form jika perlu
      setItems([]);
      router.push("/transaksi/masuk");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-center text-lg font-bold mb-1">SURAT PERINTAH KERJA</h2>
      <h3 className="text-center text-base font-semibold mb-6">PT. SINAR SAGARA SEJAHTERA</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">No SPK</label>
          <Input value={nomor} readOnly />
        </div>
        <div>
          <label className="block font-medium mb-1">Tanggal</label>
          <Input type="date" value={format(tanggal, "yyyy-MM-dd")}
            onChange={e => setTanggal(new Date(e.target.value))} />
        </div>
        <div>
          <label className="block font-medium mb-1">Tenggat Waktu</label>
          <Input type="date" value={tenggat} onChange={e => setTenggat(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Nama Pemasok</label>
          <ComboboxSearch
            options={pemasokList.map((p: any) => ({ id: p.id, nama: p.nama }))}
            value={pemasok}
            onChange={setPemasok}
            placeholder="Pilih pemasok"
            searchPlaceholder="Cari pemasok..."
            emptyMessage="Pemasok tidak ditemukan."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Nama Pelanggan</label>
          <ComboboxSearch
            options={pelangganList.map((p: any) => ({ id: p.id, nama: p.nama }))}
            value={pelanggan}
            onChange={setPelanggan}
            placeholder="Pilih pelanggan"
            searchPlaceholder="Cari pelanggan..."
            emptyMessage="Pelanggan tidak ditemukan."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Embos/Matras</label>
          <Input value={matras} onChange={e => setMatras(e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Daftar Barang</span>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Tambah Item</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Kuantitas</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-400">Belum ada item</TableCell></TableRow>
              ) : items.map((item, idx) => {
                const barang = barangList.find((b: any) => b.id === item.barangId) || {};
                return (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      {barang.gambar
                        ? (
                          <img
                            src={barang.gambar.startsWith("http") ? barang.gambar : `/uploads/${barang.gambar}`}
                            alt={barang.nama || "Gambar"}
                            className="w-12 h-12 object-cover rounded"
                            onError={e => { (e.target as HTMLImageElement).src = "/default-image.png"; }}
                          />
                        )
                        : (
                          <img src="/default-image.png" alt="-" className="w-12 h-12 object-cover rounded opacity-50" />
                        )}
                    </TableCell>
                    <TableCell>
                      <ComboboxSearch
                        options={barangList.map((b: any) => ({ id: b.id, nama: b.nama }))}
                        value={item.barangId}
                        onChange={v => updateItem(idx, "barangId", v)}
                        placeholder="Pilih barang"
                        searchPlaceholder="Cari barang..."
                        emptyMessage="Barang tidak ditemukan."
                      />
                    </TableCell>
                    <TableCell>{barang.satuan || '-'}</TableCell>
                    <TableCell>
                      <Input type="number" min={1} value={item.qty} onChange={e => updateItem(idx, "qty", Number(e.target.value))} className="w-24" />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Tombol simpan bisa ditambahkan di sini jika diperlukan */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSimpan} className="px-8">Simpan</Button>
      </div>
    </div>
  );
} 