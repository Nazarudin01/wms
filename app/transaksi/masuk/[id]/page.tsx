"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

export default function TransaksiMasukDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState<any>(null);
  const [barangList, setBarangList] = useState<any[]>([]);
  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [pemasokList, setPemasokList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/transaksi-barang-masuk/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d.data || d))
      .finally(() => setIsLoading(false));
    fetch("/api/master-data/barang")
      .then((r) => r.json())
      .then((d) => setBarangList(d.data || []));
    fetch("/api/master-data/pelanggan")
      .then((r) => r.json())
      .then((d) => setPelangganList(d.data || []));
    fetch("/api/master-data/pemasok")
      .then((r) => r.json())
      .then((d) => setPemasokList(d.data || []));
  }, [id]);

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Data tidak ditemukan</div>;

  // Helper untuk gambar barang
  const getGambar = (nama: string) => {
    const barang = barangList.find((b: any) => b.nama === nama);
    if (barang && barang.gambar) {
      return barang.gambar.startsWith("http") ? barang.gambar : `/uploads/${barang.gambar}`;
    }
    return null;
  };
  // Helper nama pelanggan/pemasok
  const getNamaPelanggan = (id: string) => pelangganList.find((p: any) => p.id === id)?.nama || id;
  const getNamaPemasok = (id: string) => pemasokList.find((p: any) => p.id === id)?.nama || id;

  // Gabungkan barang yang sama (nama_barang + satuan), qty dijumlahkan
  let items = data.items || [];
  const uniqMap = new Map<string, any>();
  items.forEach((item: any) => {
    const key = `${item.nama_barang}__${item.satuan}`;
    if (!uniqMap.has(key)) {
      uniqMap.set(key, { ...item });
    } else {
      uniqMap.get(key).qty += Number(item.qty || 0);
    }
  });
  const uniqItems = Array.from(uniqMap.values()).sort((a: any, b: any) => (a.nama_barang || '').localeCompare(b.nama_barang || ''));
  const totalQty = uniqItems.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0);

  // Ambil tenggat waktu dari data jika ada
  let tenggat = data.tenggat || data.tenggatWaktu || "-";
  // Jika tidak ada di root, cek di items
  if ((tenggat === "-" || !tenggat) && Array.isArray(data.items)) {
    tenggat = data.items.map((i: any) => i.tenggat || i.tenggatWaktu).find((v: any) => !!v) || "-";
  }
  // Format tanggal jika valid
  if (tenggat && tenggat !== "-" && tenggat.length >= 10) {
    tenggat = tenggat.slice(0, 10);
  }

  return (
    <div className="print-area w-full p-0 print:p-0" style={{ margin: 0, maxWidth: 'none' }}>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Detail Surat Perintah Kerja</h1>
        <Button variant="outline" onClick={() => router.push('/transaksi/masuk')}>Kembali</Button>
      </div>
      <div className="print-crop">
        <div className="text-center mb-2">
          <div className="text-lg font-bold">SURAT PERINTAH KERJA</div>
          <div className="text-base font-semibold mb-2">PT. SINAR SAGARA SEJAHTERA</div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div><b>No SPK:</b> {data.nomor}</div>
          <div><b>Tanggal:</b> {data.tanggal?.slice(0,10)}</div>
          <div><b>Tenggat Waktu:</b> {tenggat}</div>
          <div><b>Pelanggan:</b> {getNamaPelanggan(data.pelanggan)}</div>
          <div><b>Pemasok:</b> {getNamaPemasok(data.pemasok)}</div>
          <div><b>Embos/Matras:</b> {data.matras}</div>
        </div>
        <div className="mb-2 font-semibold">Daftar Barang</div>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-muted">
              <th className="px-2 py-1 border">No</th>
              <th className="px-2 py-1 border">Gambar</th>
              <th className="px-2 py-1 border">Nama Barang</th>
              <th className="px-2 py-1 border">Satuan</th>
              <th className="px-2 py-1 border">Kuantitas</th>
              <th className="px-2 py-1 border">Upper</th>
              <th className="px-2 py-1 border">Insole</th>
              <th className="px-2 py-1 border">Middle Sole</th>
              <th className="px-2 py-1 border">Assembling</th>
              <th className="px-2 py-1 border">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {uniqItems.map((item: any, idx: number) => {
              const gambar = getGambar(item.nama_barang);
              return (
                <tr key={idx}>
                  <td className="px-2 py-1 border text-center">{idx + 1}</td>
                  <td className="px-2 py-1 border text-center">
                    {gambar ? (
                      <img src={gambar} alt={item.nama_barang} className="w-12 h-12 object-cover rounded mx-auto" onError={e => { (e.target as HTMLImageElement).src = "/default-image.png"; }} />
                    ) : (
                      <span className="flex items-center justify-center w-12 h-12 mx-auto text-gray-400"><ImageIcon className="w-8 h-8" /></span>
                    )}
                  </td>
                  <td className="px-2 py-1 border">{item.nama_barang}</td>
                  <td className="px-2 py-1 border text-center">{item.satuan || '-'}</td>
                  <td className="px-2 py-1 border text-center">{item.qty}</td>
                  <td className="px-2 py-1 border"></td>
                  <td className="px-2 py-1 border"></td>
                  <td className="px-2 py-1 border"></td>
                  <td className="px-2 py-1 border"></td>
                  <td className="px-2 py-1 border"></td>
                </tr>
              );
            })}
            <tr key="total">
              <td className="px-2 py-1 border text-center font-bold" colSpan={4}>Jumlah</td>
              <td className="px-2 py-1 border text-center font-bold">{totalQty}</td>
              <td className="px-2 py-1 border" colSpan={5}></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Tombol kembali dan print tetap di luar print-crop */}
      <div className="mt-4 print:hidden flex gap-2">
        <Button variant="outline" onClick={() => window.print()}>Print</Button>
        <Button variant="outline" onClick={() => router.push('/transaksi/masuk')}>Tutup</Button>
      </div>
    </div>
  );
} 