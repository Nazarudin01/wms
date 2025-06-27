"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Search } from "lucide-react";
import { useState } from "react";

export default function OpnameDetailClient({ data, opnameId }: { data: any, opnameId: string }) {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string|null>(null);
  const [editValue, setEditValue] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(data.details || []);

  const filteredDetails = details.filter((detail: any) =>
    detail.barang?.nama?.toLowerCase().includes(search.toLowerCase()) ||
    detail.barang?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string, value: number) => {
    setEditId(id);
    setEditValue(value);
  };

  const handleCancel = () => {
    setEditId(null);
    setEditValue(null);
  };

  const handleSave = async (detail: any) => {
    if (editValue === null) return;
    setLoading(true);
    try {
      // Panggil API update detail opname
      const res = await fetch(`/api/opname-detail/${detail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stokAktual: editValue }),
      });
      if (!res.ok) throw new Error("Gagal update stok aktual");
      const updated = await res.json();
      setDetails((prev: any[]) => prev.map(d => d.id === detail.id ? { ...d, stokAktual: editValue, selisih: editValue - d.stokSebelum } : d));
      setEditId(null);
      setEditValue(null);
    } catch (e) {
      alert("Gagal update stok aktual");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Detail Opname</h1>
          <div className="text-gray-600 space-y-1">
            <div><span className="font-semibold">Nomor:</span> {data.nomor}</div>
            <div><span className="font-semibold">Tanggal:</span> {data.tanggal?.slice(0, 10)}</div>
            <div><span className="font-semibold">Gudang:</span> {data.gudangNama || data.gudang}</div>
            <div><span className="font-semibold">Keterangan:</span> {data.keterangan}</div>
          </div>
        </div>
        <Link href="/opname">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Cari barang atau SKU..."
            className="border rounded px-3 py-2 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Barang</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Stok Sebelum</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Stok Aktual</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Selisih</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Satuan</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetails.map((detail: any, idx: number) => (
              <tr key={detail.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100 transition"}>
                <td className="px-4 py-2 border-b">{detail.barang?.nama || '-'}</td>
                <td className="px-4 py-2 border-b">{detail.barang?.sku || '-'}</td>
                <td className="px-4 py-2 border-b text-right">{detail.stokSebelum}</td>
                <td className="px-4 py-2 border-b text-right">
                  {editId === detail.id ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-20 text-right focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={editValue ?? detail.stokAktual}
                      onChange={e => setEditValue(Number(e.target.value))}
                      disabled={loading}
                    />
                  ) : (
                    detail.stokAktual
                  )}
                </td>
                <td className={`px-4 py-2 border-b text-right font-semibold ${detail.selisih < 0 ? 'text-red-600' : detail.selisih > 0 ? 'text-green-600' : 'text-gray-700'}`}>{editId === detail.id && editValue !== null ? (editValue - detail.stokSebelum) : detail.selisih}</td>
                <td className="px-4 py-2 border-b">{detail.satuan}</td>
                <td className="px-4 py-2 border-b text-center">
                  {editId === detail.id ? (
                    <>
                      <Button size="icon" variant="secondary" className="mr-1" onClick={() => handleSave(detail)} disabled={loading}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={handleCancel} disabled={loading}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-blue-600 cursor-pointer flex items-center gap-1" onClick={() => handleEdit(detail.id, detail.stokAktual)}>
                      <Pencil className="w-4 h-4" /> Edit
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 