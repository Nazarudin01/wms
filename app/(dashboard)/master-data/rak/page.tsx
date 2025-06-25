"use client"

import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type KodeRak = {
  id: string
  kode: string
  nama: string
  kategori: string
  createdAt: string
  updatedAt: string
}

type FormData = {
  kode: string
  keterangan: string
}

export default function RakPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [raks, setRaks] = useState<KodeRak[]>([])
  
  const form = useForm<FormData>()

  useEffect(() => {
    fetchRaks()
  }, [])

  const fetchRaks = async () => {
    try {
      const response = await fetch("/api/master-data/kode-rak")
      if (!response.ok) {
        throw new Error("Failed to fetch raks")
      }
      const data = await response.json()
      setRaks(data.data || [])
    } catch (error) {
      console.error("Error fetching raks:", error)
      toast.error("Gagal mengambil data rak")
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      console.log("Submitting data:", { kode: data.kode, keterangan: data.keterangan })
      
      const response = await fetch("/api/master-data/kode-rak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kode: data.kode,
          keterangan: data.keterangan,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("Error response:", error)
        throw new Error(error)
      }

      const result = await response.json()
      console.log("Success response:", result)
      
      toast.success("Rak berhasil ditambahkan")
      form.reset()
      setOpen(false)
      fetchRaks()
    } catch (error) {
      console.error("Error submitting:", error)
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  const onDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/master-data/kode-rak/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete rak")
      }

      toast.success("Rak berhasil dihapus")
      fetchRaks()
    } catch (error) {
      console.error("Error deleting rak:", error)
      toast.error("Gagal menghapus rak")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Master Data Rak</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Rak
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Rak Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="kode">Kode Rak</Label>
                <Input
                  id="kode"
                  {...form.register("kode", { required: "Kode rak harus diisi" })}
                  placeholder="Masukkan kode rak"
                />
                {form.formState.errors.kode && (
                  <p className="text-sm text-red-500">{form.formState.errors.kode.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  {...form.register("keterangan", { required: "Keterangan harus diisi" })}
                  placeholder="Masukkan keterangan rak"
                />
                {form.formState.errors.keterangan && (
                  <p className="text-sm text-red-500">{form.formState.errors.keterangan.message}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {raks.map((rak) => (
              <TableRow key={rak.id}>
                <TableCell>{rak.kode}</TableCell>
                <TableCell>{rak.nama}</TableCell>
                <TableCell>{rak.kategori}</TableCell>
                <TableCell>
                  {new Date(rak.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(rak.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 