'use server'

import { createClient } from '@supabase/supabase-js'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderRecord {
  id: string
  created_at: string
  name: string
  phone: string
  wilaya: string
  commune: string
  address: string
  delivery: 'domicile' | 'desk'
  quantity: number
  product_price: number
  shipping_price: number
  total_price: number
  status: OrderStatus
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function getOrders(params?: { status?: string; search?: string; wilaya?: string }) {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return {
      success: false,
      error: 'Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) dans .env.local',
      data: [],
      unconfigured: true,
    }
  }

  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }
    if (params?.wilaya && params.wilaya !== 'all') {
      query = query.eq('wilaya', params.wilaya)
    }
    if (params?.search) {
      const q = params.search.trim()
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur Supabase getOrders :', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: (data || []) as OrderRecord[] }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur lors de la récupération des commandes', data: [] }
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { success: false, error: 'Supabase non configuré dans .env.local' }
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Erreur Supabase updateOrderStatus :', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur lors de la mise à jour' }
  }
}

export async function deleteOrder(orderId: string) {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { success: false, error: 'Supabase non configuré dans .env.local' }
  }

  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId)

    if (error) {
      console.error('Erreur Supabase deleteOrder :', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur lors de la suppression' }
  }
}

export async function getOrderStats() {
  const res = await getOrders()
  const orders = res.data || []

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_price : 0), 0)
  const totalOrders = orders.length
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length
  const shippedCount = orders.filter((o) => o.status === 'shipped').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length

  return {
    unconfigured: Boolean(res.unconfigured),
    error: res.error,
    totalRevenue,
    totalOrders,
    pendingCount,
    confirmedCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
  }
}
