import type { Metadata, Viewport } from 'next'
import '@/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/SessionProvider'
import Sidebar from "@/components/Sidebar"
import { usePathname } from 'next/navigation'
import AppShell from '@/components/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'WMS App',
  description: 'Warehouse Management System',
  keywords: 'manajemen gudang, sistem gudang, warehouse management',
  authors: [{ name: 'Tim Pengembang' }],
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={null}>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
} 