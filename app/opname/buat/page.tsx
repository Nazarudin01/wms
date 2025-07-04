"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { useRouter } from "next/navigation";
import { PlusCircle, Upload, Eye, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

// Dummy data gudang dan barang
const gudangList = [
  { id: "g1", nama: "Gudang Utama" },
  { id: "g2", nama: "Gudang Cabang" },
];
const barangList = [
  {
    id: "b1",
    gambar: "https://via.placeholder.com/40",
    kodeRak: "R01",
    sku: "SKU-001",
    nama: "Barang A",
    stok: 100,
    satuan: "pcs",
  },
  {
    id: "b2",
    gambar: "https://via.placeholder.com/40",
    kodeRak: "R02",
    sku: "SKU-002",
    nama: "Barang B",
    stok: 50,
    satuan: "pcs",
  },
];

function generateNomorOpname(lastNomor: string | null) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  let urut = 1;
  if (lastNomor && lastNomor.startsWith(`OPN-${mm}${yy}-`)) {
    const last = parseInt(lastNomor.split("-")[2], 10);
    urut = last + 1;
  }
  return `OPN-${mm}${yy}-${String(urut).padStart(3, "0")}`;
}

export default function BuatOpnamePage() {
  const [gudangId, setGudangId] = useState<string | null>(null);
  const [gudangList, setGudangList] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [tanggal, setTanggal] = useState<Date | undefined>(undefined);
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [nomorOpname, setNomorOpname] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [loadingBarang, setLoadingBarang] = useState(false);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [search, setSearch] = useState("");

  // Fetch gudang
  useEffect(() => {
    fetch("/api/master/gudang")
      .then((res) => res.json())
      .then((res) => setGudangList(res.data || []));
  }, []);

  // Fetch barang di gudang
  useEffect(() => {
    if (!gudangId) return;
    setLoadingBarang(true);
    fetch(`/api/stok-gudang/${gudangId}`)
      .then((res) => res.json())
      .then((res) => {
        setData(
          (res.data || []).map((b: any) => ({ ...b, stokAktual: b.stok, selisih: 0 }))
        );
        setLoadingBarang(false);
      });
  }, [gudangId]);

  // Generate nomor opname dari API
  useEffect(() => {
    fetch("/api/opname/generate-nomor")
      .then((res) => res.json())
      .then((res) => setNomorOpname(res.nomor || ""));
  }, []);

  // Update stok aktual dan selisih
  const handleStokAktualChange = (id: string, value: string) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              stokAktual: Number(value),
              selisih: Number(value) - row.stok,
            }
          : row
      )
    );
  };

  const handleSimpan = () => {
    if (!penanggungJawab) {
      toast.error("Penanggung Jawab wajib diisi");
      return;
    }
    setShowModal(true);
  };

  const handleKonfirmasi = async () => {
    setShowModal(false);
    // Validasi barangId
    const validItems = data.filter(row => row.barangId);
    if (validItems.length !== data.length) {
      toast.error("Ada barang tanpa barangId, data tidak valid!");
      return;
    }
    // Pastikan tanggal string ISO
    const tanggalStr = tanggal instanceof Date ? tanggal.toISOString().slice(0, 10) : tanggal;
    const payload = {
          nomor: nomorOpname,
      tanggal: tanggalStr,
          gudangId,
          penanggungJawab,
      items: validItems.map((row) => ({
            id: row.id,
            barangId: row.barangId,
            stok: row.stok,
            stokAktual: row.stokAktual,
            selisih: row.selisih,
            satuan: row.satuan,
          })),
    };
    console.log("Kirim opname:", payload);
    try {
      const res = await fetch("/api/opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "Gagal menyimpan opname");
        return;
      }
      toast.success("Opname berhasil disimpan dan stok gudang terupdate!");
      router.push("/opname");
    } catch (error: any) {
      const msg = error?.message || error?.toString() || "Gagal menyimpan opname";
      toast.error(msg);
    }
  };

  // Filter dan paginasi data
  const filteredData = data.filter(row => {
    const q = search.toLowerCase();
    return (
      (row.kodeRak || "").toLowerCase().includes(q) ||
      (row.sku || "").toLowerCase().includes(q) ||
      (row.nama || "").toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const pagedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page jika filter berubah
  useEffect(() => { setPage(1); }, [search, rowsPerPage, gudangId]);

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Buat Stok Opname</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
        <div>
          <label className="block mb-2 font-semibold">No Opname</label>
          <Input value={nomorOpname} readOnly className="max-w-xs" />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Tanggal</label>
          <DatePicker selected={tanggal} onSelect={setTanggal} className="max-w-xs" />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Penanggung Jawab</label>
          <Input
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
            required
            placeholder="Nama Penanggung Jawab"
            className="max-w-xs"
          />
        </div>
      </div>
      <div className="mb-6 w-full md:max-w-xs">
        <label className="block mb-2 font-semibold">Pilih Gudang</label>
        <Select onValueChange={setGudangId} value={gudangId || undefined}>
          <SelectTrigger className="w-full md:max-w-xs">
            <SelectValue placeholder="Pilih Gudang" />
          </SelectTrigger>
          <SelectContent>
            {gudangList.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {gudangId && (
        <div className="border rounded-lg overflow-x-auto w-full">
          {/* Search & Rows per page */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4">
            <Input
              placeholder="Cari Rak, SKU, atau Nama Barang..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-72"
            />
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <span className="mr-2">Tampilkan</span>
              <Select value={rowsPerPage.toString()} onValueChange={v => setRowsPerPage(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 25, 50, 100].map(opt => (
                    <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-2">/ halaman</span>
            </div>
          </div>
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Kode Rak</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Stok Aktual</TableHead>
                <TableHead>Selisih</TableHead>
                <TableHead>Satuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBarang ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : pagedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Tidak ada barang di gudang ini
                  </TableCell>
                </TableRow>
              ) : (
                pagedData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.gambar ? (
                        <img
                          src={row.gambar.startsWith('http') ? row.gambar : `/uploads/${row.gambar}`}
                          alt={row.nama}
                          className="w-10 h-10 object-cover rounded"
                          onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>{row.kodeRak}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>{row.nama}</TableCell>
                    <TableCell>{row.stok}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={row.stokAktual}
                        onChange={(e) => handleStokAktualChange(row.id, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{row.selisih}</TableCell>
                    <TableCell>{row.satuan}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4">
            <div className="text-sm text-muted-foreground">
              Menampilkan {pagedData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}
              -{(page - 1) * rowsPerPage + pagedData.length} dari {filteredData.length} data
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end p-4">
            <Button onClick={handleSimpan}>Simpan Opname</Button>
          </div>
        </div>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Simpan Opname</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            Apakah kamu yakin ingin menyimpan hasil opname dan akan merubah hasil akhir gudang?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button onClick={handleKonfirmasi}>
              Ya, Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 