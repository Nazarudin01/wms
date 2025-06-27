"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/components/ui/use-toast"
import { Package, Truck, Users, Warehouse, BarChart2, TrendingUp, Star, Activity } from 'lucide-react'
// @ts-ignore
import { Bar, Doughnut } from 'react-chartjs-2'
// @ts-ignore
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function DashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    totalWarehouses: 0,
    totalStock: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'harian'|'mingguan'|'bulanan'>('harian')
  const [chartData, setChartData] = useState<any>(null)
  const [chartLoading, setChartLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedWeek, setSelectedWeek] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [warehouses, setWarehouses] = useState<{id: string, nama: string}[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("")

  useEffect(() => {
    // Fetch daftar gudang
    fetch("/api/master/gudang")
      .then(res => res.json())
      .then(res => setWarehouses(res.data || []))
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (!res.ok) throw new Error("Gagal mengambil data statistik")
        const data = await res.json()
        setStats(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memuat data dashboard",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [toast])

  useEffect(() => {
    setChartLoading(true)
    const params = new URLSearchParams()
    params.set("rentang", filter)
    if (filter === "harian" && selectedDate) params.set("tanggal", selectedDate)
    if (filter === "mingguan" && selectedWeek) params.set("minggu", selectedWeek)
    if (filter === "bulanan" && selectedMonth) params.set("bulan", selectedMonth)
    if (selectedWarehouse) params.set("gudangId", selectedWarehouse)
    fetch(`/api/dashboard/charts?${params.toString()}`)
      .then(res => res.json())
      .then(res => setChartData(res))
      .finally(() => setChartLoading(false))
  }, [filter, selectedDate, selectedWeek, selectedMonth, selectedWarehouse])

  return (
    <div className="flex-1 space-y-6 p-6 bg-ivorySand min-h-screen">
      <h2 className="text-3xl font-bold tracking-tight text-deepOcean mb-4">Dashboard</h2>
      
      {/* Filter Rentang & Gudang */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <select
          className="border rounded px-2 py-1 h-9 text-xs text-midnight bg-skyMist min-w-[120px]"
          value={selectedWarehouse}
          onChange={e => setSelectedWarehouse(e.target.value)}
        >
          <option value="">Semua Gudang</option>
          {warehouses.map(g => (
            <option key={g.id} value={g.id}>{g.nama}</option>
          ))}
        </select>
        <select 
          className="border rounded px-2 py-1 h-9 text-xs text-midnight bg-skyMist min-w-[100px]" 
          value={filter} 
          onChange={e => setFilter(e.target.value as any)}
        >
          <option value="harian">Harian</option>
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
        </select>
        {filter === "harian" && (
          <input 
            type="date" 
            className="border rounded px-2 py-1 h-9 text-xs text-midnight bg-skyMist min-w-[120px]" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
          />
        )}
        {filter === "mingguan" && (
          <input 
            type="week" 
            className="border rounded px-2 py-1 h-9 text-xs text-midnight bg-skyMist min-w-[120px]" 
            value={selectedWeek} 
            onChange={e => setSelectedWeek(e.target.value)} 
          />
        )}
        {filter === "bulanan" && (
          <input 
            type="month" 
            className="border rounded px-2 py-1 h-9 text-xs text-midnight bg-skyMist min-w-[120px]" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
          />
        )}
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-tidalBlue border-none shadow-md rounded-2xl flex flex-row items-center p-4">
          <div className="p-3 rounded-full bg-deepOcean mr-4">
            <Package className="h-7 w-7 text-ivorySand" />
          </div>
          <div>
            <div className="text-lg font-bold text-ivorySand">{stats.totalProducts}</div>
            <div className="text-xs text-skyMist font-semibold">Total Barang Terdaftar</div>
          </div>
        </Card>
        
        <Card className="bg-goldanDune border-none shadow-md rounded-2xl flex flex-row items-center p-4">
          <div className="p-3 rounded-full bg-blueAsh mr-4">
            <Users className="h-7 w-7 text-midnight" />
          </div>
          <div>
            <div className="text-lg font-bold text-midnight">{stats.totalSuppliers}</div>
            <div className="text-xs text-midnight font-semibold">Total Supplier</div>
          </div>
        </Card>
        
        <Card className="bg-skyMist border-none shadow-md rounded-2xl flex flex-row items-center p-4">
          <div className="p-3 rounded-full bg-midnight mr-4">
            <Warehouse className="h-7 w-7 text-ivorySand" />
          </div>
          <div>
            <div className="text-lg font-bold text-midnight">{stats.totalWarehouses}</div>
            <div className="text-xs text-midnight font-semibold">Total Gudang</div>
          </div>
        </Card>
        
        <Card className="bg-blueAsh border-none shadow-md rounded-2xl flex flex-row items-center p-4">
          <div className="p-3 rounded-full bg-goldanDune mr-4">
            <BarChart2 className="h-7 w-7 text-ivorySand" />
          </div>
          <div>
            <div className="text-lg font-bold text-ivorySand">{stats.totalStock}</div>
            <div className="text-xs text-ivorySand font-semibold">Total Stok Keseluruhan</div>
          </div>
        </Card>
      </div>
      
      {/* Grafik Barang Masuk vs Keluar */}
      <Card className="bg-white border-none shadow-md rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="font-bold text-lg text-tidalBlue flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-deepOcean" /> 
            Grafik Barang Masuk vs Keluar
          </div>
        </div>
        <div className="h-64">
          {chartLoading || !chartData ? (
            <div className="flex items-center justify-center h-full text-blueAsh">Loading...</div>
          ) : (
            <Bar 
              data={{
                labels: chartData.barangMasukKeluar?.labels || [],
                datasets: [
                  {
                    label: 'Barang Masuk',
                    backgroundColor: '#18607F',
                    data: chartData.barangMasukKeluar?.masuk || [],
                  },
                  {
                    label: 'Barang Keluar',
                    backgroundColor: '#1A4C56',
                    data: chartData.barangMasukKeluar?.keluar || [],
                  },
                ],
              }} 
              options={{ 
                responsive: true, 
                plugins: { 
                  legend: { position: 'top', labels: { color: '#1A4C56' } }, 
                  title: { display: false } 
                } 
              }} 
            />
          )}
        </div>
      </Card>
      
      {/* 2 Kolom: Barang Terbanyak Keluar & 10 Barang Stok Terbanyak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white border-none shadow-md rounded-2xl p-6">
          <div className="font-bold text-lg text-tidalBlue flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-deepOcean" /> 
            Barang Terbanyak Keluar
          </div>
          <div className="h-56">
            {chartLoading || !chartData ? (
              <div className="flex items-center justify-center h-full text-blueAsh">Loading...</div>
            ) : (
              <Bar 
                data={{
                  labels: chartData.barangKeluarTerbanyak.labels,
                  datasets: [{
                    label: 'Keluar',
                    data: chartData.barangKeluarTerbanyak.data,
                    backgroundColor: '#D4C4A8',
                  }],
                }} 
                options={{ responsive: true, plugins: { legend: { display: false } } }} 
              />
            )}
          </div>
        </Card>
        
        <Card className="bg-white border-none shadow-md rounded-2xl p-6">
          <div className="font-bold text-lg text-tidalBlue flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-goldanDune" /> 
            10 Barang Stok Terbanyak
          </div>
          <div className="h-56">
            {chartLoading || !chartData ? (
              <div className="flex items-center justify-center h-full text-blueAsh">Loading...</div>
            ) : (
              <Bar 
                data={{
                  labels: chartData.barangStokTerbanyak.labels,
                  datasets: [{
                    label: 'Stok',
                    data: chartData.barangStokTerbanyak.data,
                    backgroundColor: '#1F2D33',
                  }],
                }} 
                options={{ responsive: true, plugins: { legend: { display: false } } }} 
              />
            )}
          </div>
        </Card>
      </div>
      
      {/* Gudang Trafik Tertinggi */}
      <Card className="bg-white border-none shadow-md rounded-2xl p-6">
        <div className="font-bold text-lg text-tidalBlue flex items-center gap-2 mb-2">
          <Warehouse className="w-5 h-5 text-goldanDune" /> 
          Gudang Trafik Tertinggi
        </div>
        <div className="h-64 flex items-center justify-center">
          {chartLoading || !chartData ? (
            <div className="flex items-center justify-center h-full text-blueAsh">Loading...</div>
          ) : (
            <Doughnut 
              data={{
                labels: chartData.gudangTrafik.labels,
                datasets: [{
                  label: 'Transaksi',
                  data: chartData.gudangTrafik.data,
                  backgroundColor: ['#D4C4A8', '#18607F', '#5A7381', '#9CB7C7', '#1F2D33'],
                }],
              }} 
              options={{ 
                responsive: true, 
                plugins: { 
                  legend: { position: 'bottom', labels: { color: '#1A4C56' } } 
                } 
              }} 
            />
          )}
        </div>
      </Card>
    </div>
  )
} 