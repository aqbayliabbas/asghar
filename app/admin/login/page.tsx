'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/app/actions/adminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await loginAdmin(formData)

    setLoading(false)
    if (res.success) {
      router.push('/admin/dashboard')
      router.refresh()
    } else {
      setError(res.error || 'Adresse e-mail ou mot de passe incorrect.')
    }
  }

  return (
    <main dir="ltr" className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans text-sm text-slate-900">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">asyar admin</h1>
          <p className="mt-1 text-xs text-slate-500">Connectez-vous pour accéder au panneau d'administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
            <input
              required
              type="email"
              name="email"
              defaultValue="admin@asyar.dz"
              placeholder="admin@asyar.dz"
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe</label>
            <input
              required
              type="password"
              name="password"
              defaultValue="admin123"
              placeholder="••••••••"
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-3 text-center text-[11px] text-slate-400 font-mono">
          admin@asyar.dz / admin123
        </div>
      </div>
    </main>
  )
}
