"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TransferGudangDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/transfer-gudang`);
      const json = await res.json();
      const found = (json.data || []).find((t: any) => t.id === id);
      setData(found || null);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/transfer-gudang/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/transfer");
    }
    setDeleting(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Data transfer tidak ditemukan.</div>;

  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Detail Transfer Gudang</h1>
          <div className="text-gray-600 space-y-1">
            <div><span className="font-semibold">No Transfer:</span> {data.nomor}</div>
            <div><span className="font-semibold">Tanggal:</span> {data.tanggal?.slice(0,10)}</div>
            <div><span className="font-semibold">Gudang Asal:</span> {data.gudangAsal?.nama}</div>
            <div><span className="font-semibold">Gudang Tujuan:</span> {data.gudangTujuan?.nama}</div>
            <div><span className="font-semibold">Penanggung Jawab:</span> {data.penanggungJawab}</div>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push("/transfer")}>Kembali</Button>
      </div>
      <div className="border rounded-lg overflow-x-auto w-full mb-6">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Stok Asal (sebelum)</TableHead>
              <TableHead>Jumlah Transfer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.details?.map((item: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{item.barang?.nama || '-'}</TableCell>
                <TableCell>{item.satuan}</TableCell>
                <TableCell>{item.stok}</TableCell>
                <TableCell>{item.jumlahTransfer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Menghapus..." : "Hapus Transfer"}
        </Button>
      </div>
    </div>
  );
} 