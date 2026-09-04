'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  ArrowClockwise,
  DownloadSimple,
  Eye,
  MagnifyingGlass,
  Phone,
  Printer,
  Trash,
  WarningCircle,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react'
import { deleteOrder, getOrders, getOrderStats, OrderRecord, OrderStatus, updateOrderStatus } from '@/app/actions/adminOrders'

const statusLabels: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'En attente', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  confirmed: { label: 'Confirmée', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
  shipped: { label: 'Expédiée', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
  delivered: { label: 'Livrée', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
  cancelled: { label: 'Annulée', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600' },
}

const formatDzd = (value: number) => `${value.toLocaleString('fr-FR')} DA`

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingCount: 0,
    confirmedCount: 0,
    shippedCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [unconfigured, setUnconfigured] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    const [ordersRes, statsRes] = await Promise.all([
      getOrders({ status: statusFilter, search: searchQuery }),
      getOrderStats(),
    ])

    if (ordersRes.success) {
      setOrders(ordersRes.data || [])
      setUnconfigured(false)
    } else if (ordersRes.unconfigured) {
      setUnconfigured(true)
      setOrders([])
    }
    setStats(statsRes)
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDashboardData()
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }

    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus)
      const updatedStats = await getOrderStats()
      setStats(updatedStats)
    })
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette commande ?')) return

    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null)
    }
    startTransition(async () => {
      await deleteOrder(orderId)
      const updatedStats = await getOrderStats()
      setStats(updatedStats)
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const exportCSV = () => {
    if (orders.length === 0) return

    const headers = ['ID', 'Date', 'Nom & Prénom', 'Téléphone', 'Wilaya', 'Commune', 'Adresse', 'Livraison', 'Quantité', 'Total (DA)', 'Statut']
    const rows = orders.map((o) => [
      o.id,
      new Date(o.created_at).toLocaleDateString('fr-FR'),
      `"${o.name}"`,
      `"${o.phone}"`,
      `"${o.wilaya}"`,
      `"${o.commune}"`,
      `"${o.address}"`,
      o.delivery === 'domicile' ? 'À domicile' : 'Point relais',
      o.quantity,
      o.total_price,
      statusLabels[o.status]?.label || o.status,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `commandes_asyar_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatWhatsAppUrl = (phone: string, name: string) => {
    let cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.slice(1)
    const msg = encodeURIComponent(`Bonjour ${name}, nous vous contactons depuis Asyar concernant votre commande.`)
    return `https://wa.me/${cleanPhone}?text=${msg}`
  }

  return (
    <>
      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-bordereau, #printable-bordereau * {
            visibility: visible;
          }
          #printable-bordereau {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-height: 100vh;
            background: white !important;
            color: black !important;
            padding: 12mm !important;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Commandes</h1>
            <p className="text-xs text-slate-500">Gérez les ventes et expéditions de votre boutique</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowClockwise size={14} className={loading ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              <DownloadSimple size={14} />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Supabase Unconfigured Warning */}
        {unconfigured && (
          <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <WarningCircle size={18} className="shrink-0 text-amber-600" />
            <span>
              Supabase n'est pas encore configuré dans <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env.local</code>. Veuillez renseigner vos clés pour charger vos commandes.
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs text-slate-500 font-medium">Chiffre d'affaires</span>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatDzd(stats.totalRevenue)}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs text-slate-500 font-medium">Total commandes</span>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.totalOrders}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs text-slate-500 font-medium">En attente</span>
            <p className="mt-1 text-xl font-bold text-amber-600">{stats.pendingCount}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs text-slate-500 font-medium">Livrées</span>
            <p className="mt-1 text-xl font-bold text-emerald-600">{stats.deliveredCount}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-200 bg-white p-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 text-xs">
            {[
              { id: 'all', label: `Toutes (${stats.totalOrders})` },
              { id: 'pending', label: `En attente (${stats.pendingCount})` },
              { id: 'confirmed', label: `Confirmées (${stats.confirmedCount})` },
              { id: 'shipped', label: `Expédiées (${stats.shippedCount})` },
              { id: 'delivered', label: `Livrées (${stats.deliveredCount})` },
              { id: 'cancelled', label: `Annulées (${stats.cancelledCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Nom ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-56 rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-xs outline-none focus:border-slate-900"
              />
              <MagnifyingGlass size={14} className="absolute left-2.5 top-2 text-slate-400" />
            </div>
            <button
              type="submit"
              className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Filtrer
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Chargement des commandes...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const st = statusLabels[order.status] || statusLabels.pending

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{order.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <a
                              href={`tel:${order.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:underline"
                            >
                              <Phone size={11} />
                              <span>{order.phone}</span>
                            </a>
                            <a
                              href={formatWhatsAppUrl(order.phone, order.name)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-medium text-emerald-600 hover:underline"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{order.wilaya} ({order.commune})</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{order.address}</p>
                        </td>

                        <td className="px-4 py-3">
                          <p>Organiseur × <strong>{order.quantity}</strong></p>
                          <span className="text-[10px] text-slate-500">
                            {order.delivery === 'domicile' ? 'À domicile' : 'Point relais'}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                          {formatDzd(order.total_price)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`rounded text-xs font-medium px-2.5 py-1 border outline-none cursor-pointer ${st.bg} ${st.text}`}
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmée</option>
                            <option value="shipped">Expédiée</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                          >
                            <Eye size={12} />
                            <span>Détails</span>
                          </button>

                          <button
                            onClick={() => handleDelete(order.id)}
                            className="rounded p-1 text-slate-400 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50">
              <h2 className="font-bold text-sm text-slate-900">Détails de la commande</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-3">
                <span className="font-medium text-slate-600">Statut actuel :</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="rounded border border-slate-300 bg-white px-2.5 py-1 font-medium outline-none"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div className="border border-slate-200 rounded p-3 space-y-1.5">
                <p className="font-semibold text-slate-900">Information client</p>
                <p><span className="text-slate-500">Nom :</span> {selectedOrder.name}</p>
                <p><span className="text-slate-500">Téléphone :</span> <span dir="ltr" className="font-mono">{selectedOrder.phone}</span></p>
              </div>

              <div className="border border-slate-200 rounded p-3 space-y-1.5">
                <p className="font-semibold text-slate-900">Livraison</p>
                <p><span className="text-slate-500">Wilaya / Commune :</span> {selectedOrder.wilaya} ({selectedOrder.commune})</p>
                <p><span className="text-slate-500">Adresse :</span> {selectedOrder.address}</p>
                <p><span className="text-slate-500">Mode :</span> {selectedOrder.delivery === 'domicile' ? 'À domicile' : 'Point relais'}</p>
              </div>

              <div className="border border-slate-200 rounded p-3 space-y-1.5">
                <p className="font-semibold text-slate-900">Montant</p>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                  <span>Total à recouvrer :</span>
                  <span>{formatDzd(selectedOrder.total_price)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Fermer
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                <Printer size={14} />
                <span>Imprimer bordereau</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT BORDEREAU */}
      {selectedOrder && (
        <div id="printable-bordereau" className="hidden print:block font-sans text-slate-900 bg-white p-6 space-y-6">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">asyar.</h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mt-1">Artisanat & Objets en Bois</p>
              <p className="text-[11px] text-slate-500">Alger, Algérie · Tél: +213 550 00 00 00</p>
            </div>

            <div className="text-right">
              <div className="inline-block border-2 border-slate-900 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
                BORDEREAU D'EXPÉDITION
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Date: {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="border border-slate-300 p-4 rounded space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 text-[11px] tracking-wider">
                EXPÉDITEUR
              </h3>
              <p className="font-bold text-sm">ASYAR ALGÉRIE</p>
              <p className="text-slate-600">Service Logistique & Expéditions</p>
              <p className="text-slate-600">Alger, Algérie</p>
              <p className="font-mono text-slate-600">Tél: 0550 00 00 00</p>
            </div>

            <div className="border-2 border-slate-900 p-4 rounded space-y-2 text-xs bg-slate-50">
              <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 text-[11px] tracking-wider">
                DESTINATAIRE (CLIENT)
              </h3>
              <p className="font-bold text-base text-slate-900">{selectedOrder.name}</p>
              <p className="font-mono font-bold text-sm text-slate-900" dir="ltr">Tél: {selectedOrder.phone}</p>
              <p className="font-bold text-sm text-slate-800">Wilaya: {selectedOrder.wilaya} ({selectedOrder.commune})</p>
              <p className="text-slate-700">Adresse: {selectedOrder.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-center border-2 border-slate-900 p-4 rounded bg-amber-50">
            <div>
              <p className="text-xs uppercase font-bold text-slate-600">Mode d'Expédition</p>
              <p className="text-base font-bold text-slate-900 mt-1">
                {selectedOrder.delivery === 'domicile' ? 'LIVRAISON À DOMICILE' : 'LIVRAISON POINT RELAIS'}
              </p>
            </div>

            <div className="text-right border-l-2 border-slate-900 pl-4">
              <p className="text-xs uppercase font-bold text-slate-600">MONTANT À RECOUVRER (C.O.D)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{formatDzd(selectedOrder.total_price)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
