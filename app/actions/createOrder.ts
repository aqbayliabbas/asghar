'use server'

import { createClient } from '@supabase/supabase-js'

export interface OrderData {
  name: string
  phone: string
  wilaya: string
  commune: string
  address: string
  delivery: 'domicile' | 'desk'
  quantity: number
  productPrice: number
  shippingPrice: number
  totalPrice: number
}

export async function createOrder(data: OrderData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
    return {
      success: false,
      error: 'Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env.local',
    }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // ── Limit: maximum 15 orders ──────────────────────────────────────
    const { count, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      console.error('Erreur lors du comptage des commandes :', countError)
      return { success: false, error: `Erreur Supabase: ${countError.message}` }
    }

    if ((count ?? 0) >= 15) {
      return {
        success: false,
        limitReached: true,
        error: 'نأسف، لقد وصلنا إلى الحد الأقصى من الطلبات. يُرجى المحاولة لاحقاً.',
      }
    }
    // ─────────────────────────────────────────────────────────────────

    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          name: data.name,
          phone: data.phone,
          wilaya: data.wilaya,
          commune: data.commune,
          address: data.address,
          delivery: data.delivery,
          quantity: data.quantity,
          product_price: data.productPrice,
          shipping_price: data.shippingPrice,
          total_price: data.totalPrice,
          status: 'pending',
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Erreur Supabase lors de la création de la commande :', error)
      return { success: false, error: `Erreur Supabase: ${error.message}` }
    }

    return { success: true, id: order?.id }
  } catch (err: any) {
    console.error('Erreur inattendue Supabase :', err)
    return { success: false, error: err?.message || 'Erreur inattendue lors de la sauvegarde.' }
  }
}
