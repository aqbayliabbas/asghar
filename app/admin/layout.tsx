'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowSquareOut,
  List,
  Package,
  SignOut,
  Storefront,
  X,
} from '@phosphor-icons/react'
import { logoutAdmin } from '@/app/actions/adminAuth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <div dir="ltr">{children}</div>
  }

  const handleLogout = async () => {
    await logoutAdmin()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div dir="ltr" className="min-h-screen bg-slate-100 text-slate-900 flex font-sans text-sm">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col justify-between bg-slate-900 text-slate-300 transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-slate-800 px-5">
            <Link href="/admin/dashboard" className="font-serif text-xl font-bold tracking-tight text-white">
              asyar<span className="text-slate-400 font-sans text-xs font-normal ml-1.5">admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white md:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            <Link
              href="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/admin/dashboard'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Package size={16} />
              <span>Commandes</span>
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <Storefront size={15} />
              <span>Voir le site</span>
            </span>
            <ArrowSquareOut size={13} />
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 px-1">
            <div className="text-xs">
              <p className="font-medium text-slate-200">Admin</p>
              <p className="text-[11px] text-slate-500">admin@asyar.dz</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Déconnexion"
            >
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex h-13 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1.5 text-slate-700 hover:bg-slate-100"
          >
            <List size={20} />
          </button>
          <span className="font-serif text-base font-bold text-slate-900">asyar admin</span>
          <div className="w-6" />
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
