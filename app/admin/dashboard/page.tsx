'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  ArrowClockwise,
  Check,
  CheckCircle,
  CurrencyCircleDollar,
  DownloadSimple,
  Eye,
  Image as ImageIcon,
  MagnifyingGlass,
  Palette,
  PencilSimple,
  Phone,
  Plus,
  Printer,
  Trash,
  UploadSimple,
  WarningCircle,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react'
import { deleteOrder, getOrders, getOrderStats, OrderRecord, OrderStatus, updateOrderStatus } from '@/app/actions/adminOrders'
import {
  addProductColor,
  deleteProductColor,
  deleteProductImage,
  getProductColors,
  getProductImages,
  getProductPrice,
  getProductSettings,
  ProductColor,
  ProductImageItem,
  ProductSettings,
  toggleColorStatus,
  toggleImageStatus,
  updateProductPrice,
  updateProductSettings,
  uploadProductImage,
} from '@/app/actions/adminProduct'

const statusLabels: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'En attente', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  confirmed: { label: 'Confirmée', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
  shipped: { label: 'Expédiée', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
  delivered: { label: 'Livrée', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
  cancelled: { label: 'Annulée', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600' },
}

const formatDzd = (value: number) => `${value.toLocaleString('fr-FR')} DA`

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'product'>('orders')

  // Orders State
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

  // Product Management State
  const [priceInput, setPriceInput] = useState<string>('2600')
  const [titleInput, setTitleInput] = useState<string>('صلاتكِ براحة، أينما كنتِ.')
  const [subtitleInput, setSubtitleInput] = useState<string>('طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.')
  const [brandNameInput, setBrandNameInput] = useState<string>('نُسكي — NOUSKI')
  const [footerTextInput, setFooterTextInput] = useState<string>('طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية')
  
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [colors, setColors] = useState<ProductColor[]>([])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')
  const [addingColor, setAddingColor] = useState(false)

  const [images, setImages] = useState<ProductImageItem[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageAlt, setImageAlt] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageMsg, setImageMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const fetchProductData = async () => {
    const [settings, c, img] = await Promise.all([
      getProductSettings(),
      getProductColors(true),
      getProductImages(true),
    ])
    setPriceInput(String(settings.price))
    setTitleInput(settings.title)
    setSubtitleInput(settings.subtitle)
    setBrandNameInput(settings.brand_name)
    setFooterTextInput(settings.footer_text)
    setColors(c)
    setImages(img)
  }

  useEffect(() => {
    fetchDashboardData()
    fetchProductData()
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

  // --- PRODUCT MANAGEMENT HANDLERS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const numPrice = Number(priceInput)
    if (isNaN(numPrice) || numPrice <= 0) {
      setSettingsMsg({ type: 'error', text: 'Veuillez saisir un prix valide.' })
      return
    }

    setSavingSettings(true)
    setSettingsMsg(null)
    const res = await updateProductSettings({
      price: numPrice,
      title: titleInput.trim(),
      subtitle: subtitleInput.trim(),
      brand_name: brandNameInput.trim(),
      footer_text: footerTextInput.trim(),
    })
    setSavingSettings(false)

    if (res.success) {
      setSettingsMsg({ type: 'success', text: 'Informations du produit et pied de page mis à jour !' })
    } else {
      setSettingsMsg({ type: 'error', text: res.error || 'Erreur lors de la mise à jour.' })
    }
  }

  const handleToggleColor = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    const targetColor = colors.find((c) => c.id === id)
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: nextStatus } : c)))
    const res = await toggleColorStatus(id, nextStatus, targetColor ? { name: targetColor.name, hex: targetColor.hex } : undefined)
    if (!res.success) {
      setColors((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: currentStatus } : c)))
      alert(res.error || 'Erreur lors du changement de status.')
    }
  }

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColorName.trim()) return

    setAddingColor(true)
    const res = await addProductColor(newColorName.trim(), newColorHex)
    setAddingColor(false)

    if (res.success) {
      setNewColorName('')
      setNewColorHex('#000000')
      fetchProductData()
    } else {
      alert(res.error || 'Erreur lors de l\'ajout de la couleur.')
    }
  }

  const handleDeleteColor = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette couleur ?')) return
    setColors((prev) => prev.filter((c) => c.id !== id))
    const res = await deleteProductColor(id)
    if (!res.success) {
      fetchProductData()
      alert(res.error || 'Erreur lors de la suppression.')
    }
  }

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setImageMsg({ type: 'error', text: 'Veuillez sélectionner un fichier image.' })
      return
    }

    setUploadingImage(true)
    setImageMsg(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('alt', imageAlt.trim() || selectedFile.name)

    const res = await uploadProductImage(formData)
    setUploadingImage(false)

    if (res.success) {
      setSelectedFile(null)
      setImageAlt('')
      setImageMsg({ type: 'success', text: 'Image téléversée et ajoutée à la boutique !' })
      fetchProductData()
    } else {
      setImageMsg({ type: 'error', text: res.error || 'Erreur lors du téléversement.' })
    }
  }

  const handleToggleImage = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    const targetImg = images.find((img) => img.id === id)
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, is_active: nextStatus } : img)))
    const res = await toggleImageStatus(id, nextStatus, targetImg ? { url: targetImg.url, alt: targetImg.alt } : undefined)
    if (!res.success) {
      setImages((prev) => prev.map((img) => (img.id === id ? { ...img, is_active: currentStatus } : img)))
      alert(res.error || 'Erreur lors du changement de visibilité.')
    }
  }

  const handleDeleteImage = async (id: string, storagePath?: string) => {
    if (!confirm('Voulez-vous supprimer cette image ?')) return
    setImages((prev) => prev.filter((img) => img.id !== id))
    const res = await deleteProductImage(id, storagePath)
    if (!res.success) {
      fetchProductData()
      alert(res.error || 'Erreur lors de la suppression de l\'image.')
    }
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
        {/* Top Header & Main Navigation Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Tableau de bord Admin</h1>
            <p className="text-xs text-slate-500">Gérez les commandes, le prix du produit, les couleurs et les images</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchDashboardData()
                fetchProductData()
              }}
              className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowClockwise size={14} className={loading ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>

            {activeTab === 'orders' && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                <DownloadSimple size={14} />
                <span>Exporter CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Commandes ({stats.totalOrders})</span>
          </button>

          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'product'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Palette size={15} />
            <span>Gestion Produit (Prix, Couleurs & Images)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: COMMANDES / ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
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
                              {order.colors_per_item && order.colors_per_item.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {order.colors_per_item.map((color, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                                    >
                                      <span className="text-slate-500 font-mono">{idx + 1}.</span>
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              )}
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
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GESTION DU PRODUIT (PRIX, COULEURS & IMAGES) */}
        {/* ========================================================================= */}
        {activeTab === 'product' && (
          <div className="space-y-8">
            {/* 1. EDIT PRODUCT INFORMATIONS, PRICE & FOOTER */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <CurrencyCircleDollar size={22} className="text-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Informations Produit, Prix & Pied de page</h2>
                  <p className="text-xs text-slate-500">Modifiez le prix, la description et les textes du pied de page du site</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prix du produit (DA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-slate-900"
                        placeholder="2600"
                        min="1"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">DA</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la Marque (Brand Name)</label>
                    <input
                      type="text"
                      value={brandNameInput}
                      onChange={(e) => setBrandNameInput(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-xs font-medium outline-none focus:border-slate-900"
                      placeholder="نُسكي — NOUSKI"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre principal du produit (Title)</label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-xs font-medium outline-none focus:border-slate-900"
                    placeholder="صلاتكِ براحة، أينما كنتِ."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Sous-titre du produit (Subtitle / Description)</label>
                  <textarea
                    rows={2}
                    value={subtitleInput}
                    onChange={(e) => setSubtitleInput(e.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-xs font-medium outline-none focus:border-slate-900"
                    placeholder="طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Texte du Pied de Page (Footer Text)</label>
                  <input
                    type="text"
                    value={footerTextInput}
                    onChange={(e) => setFooterTextInput(e.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-xs font-medium outline-none focus:border-slate-900"
                    placeholder="طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="rounded bg-slate-900 px-6 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {savingSettings ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                  </button>

                  {settingsMsg && (
                    <p className={`text-xs font-medium ${settingsMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {settingsMsg.text}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* 2. COLOR MANAGEMENT */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Palette size={22} className="text-indigo-600" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Activer / Désactiver les Couleurs</h2>
                    <p className="text-xs text-slate-500">Seules les couleurs activées seront sélectionnables sur le site</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  {colors.filter(c => c.is_active).length} / {colors.length} Actives
                </span>
              </div>

              {/* Color list */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 mb-6">
                {colors.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition ${
                      c.is_active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-full border border-slate-300 shadow-sm shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.hex}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleColor(c.id, c.is_active)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded transition ${
                          c.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {c.is_active ? 'Activée' : 'Désactivée'}
                      </button>

                      <button
                        onClick={() => handleDeleteColor(c.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Supprimer"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Color Form */}
              <form onSubmit={handleAddColor} className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-end sm:items-center gap-3">
                <div className="w-full sm:w-auto">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nom de la couleur (ex: أخضر)</label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Nom de couleur"
                    className="w-full sm:w-44 rounded border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-slate-900"
                  />
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Code couleur (Hex)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-28 rounded border border-slate-300 px-2 py-1 text-xs font-mono outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingColor || !newColorName.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{addingColor ? 'Ajout...' : 'Ajouter Couleur'}</span>
                </button>
              </form>
            </div>

            {/* 3. IMAGE UPLOAD & GALLERY */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={22} className="text-emerald-600" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Images du Produit & Téléversement Storage</h2>
                    <p className="text-xs text-slate-500">Ajoutez de nouvelles photos depuis l'admin vers le bucket Supabase</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  {images.filter(i => i.is_active).length} / {images.length} Visibles
                </span>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleUploadImage} className="mb-6 p-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UploadSimple size={16} className="text-slate-600" />
                  <span>Téléverser une nouvelle image vers le Bucket Supabase (`product-images`)</span>
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fichier image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Alt Text</label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Ex: صورة طقم صلاة وردي"
                      className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploadingImage || !selectedFile}
                    className="flex items-center gap-1.5 rounded bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <UploadSimple size={14} />
                    <span>{uploadingImage ? 'Téléversement en cours...' : 'Téléverser l\'image'}</span>
                  </button>
                </div>

                {imageMsg && (
                  <p className={`text-xs font-medium ${imageMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {imageMsg.text}
                  </p>
                )}
              </form>

              {/* Images Grid */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`group relative rounded-lg border overflow-hidden transition flex flex-col justify-between ${
                      img.is_active ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {!img.is_active && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-slate-900/80 px-2 py-1 rounded">
                            Masquée
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <p className="text-[11px] text-slate-700 line-clamp-2 font-medium">{img.alt || 'Pas de description'}</p>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <button
                          onClick={() => handleToggleImage(img.id, img.is_active)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            img.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {img.is_active ? 'Affichée' : 'Masquée'}
                        </button>

                        <button
                          onClick={() => handleDeleteImage(img.id, img.storage_path)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Supprimer l'image"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

              <div className="border border-slate-200 rounded p-3 space-y-3">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Palette size={14} className="text-purple-600" />
                  Commande
                </p>

                {/* Quantity + delivery */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Quantité :</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedOrder.quantity} طقم{selectedOrder.quantity > 1 ? '' : ''}
                  </span>
                </div>

                {/* Per-item colors */}
                {selectedOrder.colors_per_item && selectedOrder.colors_per_item.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500 font-medium">اللون لكل طقم :</p>
                    {selectedOrder.colors_per_item.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded px-2 py-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 shrink-0 border border-purple-200">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-slate-500">الطقم {idx + 1}</span>
                        <span className="text-xs font-bold text-slate-900 mr-auto">{color}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Legacy orders: color embedded in address field */
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">اللون :</span>
                    <span className="font-bold text-slate-900">
                      {selectedOrder.address.match(/اللون:\s*([^—\-]+)/)?.[1]?.trim() || '—'}
                    </span>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="border-t border-slate-100 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix produit :</span>
                    <span className="font-medium">{formatDzd(selectedOrder.product_price * selectedOrder.quantity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Livraison :</span>
                    <span className="font-medium">{formatDzd(selectedOrder.shipping_price)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total à recouvrer :</span>
                    <span>{formatDzd(selectedOrder.total_price)}</span>
                  </div>
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

          {selectedOrder.colors_per_item && selectedOrder.colors_per_item.length > 0 && (
            <div className="border border-slate-300 p-4 rounded space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 text-[11px] tracking-wider">
                ألوان الطقم — COULEURS PAR ARTICLE
              </h3>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {selectedOrder.colors_per_item.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0 border border-slate-400">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-700">الطقم {idx + 1}:</span>
                    <span className="font-bold text-slate-900">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
