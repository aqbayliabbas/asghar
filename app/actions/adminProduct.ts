'use server'

import { createClient } from '@supabase/supabase-js'

export interface ProductColor {
  id: string
  name: string
  hex: string
  is_active: boolean
  display_order?: number
}

export interface ProductImageItem {
  id: string
  url: string
  alt: string
  storage_path?: string
  is_active: boolean
  display_order?: number
}

const DEFAULT_PRICE = 2600

const DEFAULT_COLORS: ProductColor[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'وردي', hex: '#efa9ba', is_active: true, display_order: 1 },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'عنابي', hex: '#761d49', is_active: true, display_order: 2 },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'زيتوني', hex: '#666d4d', is_active: true, display_order: 3 },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'لافندر', hex: '#9d82c8', is_active: true, display_order: 4 },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'بيج', hex: '#e4c9a4', is_active: true, display_order: 5 },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'أزرق', hex: '#183552', is_active: true, display_order: 6 },
]

const DEFAULT_IMAGES: ProductImageItem[] = [
  { id: 'f1000000-0000-0000-0000-000000000001', url: '/nouski/olive-look.png', alt: 'سيدة ترتدي طقم صلاة نُسكي الزيتوني', is_active: true, display_order: 1 },
  { id: 'f1000000-0000-0000-0000-000000000002', url: '/nouski/set-flatlay.png', alt: 'مكونات طقم صلاة نُسكي مرتبة على سجادة الصلاة', is_active: true, display_order: 2 },
  { id: 'f1000000-0000-0000-0000-000000000003', url: '/nouski/prayer-garments.png', alt: 'طقمَا صلاة نُسكي باللون الزيتوني', is_active: true, display_order: 3 },
  { id: 'f1000000-0000-0000-0000-000000000004', url: '/nouski/color-pouches.png', alt: 'حقائب نُسكي بألوان وردية وعنابية وبيج ولافندر', is_active: true, display_order: 4 },
]

export interface ProductSettings {
  price: number
  title: string
  subtitle: string
  brand_name: string
  footer_text: string
}

const DEFAULT_SETTINGS: ProductSettings = {
  price: 2600,
  title: 'صلاتكِ براحة، أينما كنتِ.',
  subtitle: 'طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.',
  brand_name: 'نُسكي — NOUSKI',
  footer_text: 'طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية',
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

// ---------------------------------------------------------------------
// PRODUCT SETTINGS (PRICE, TITLE, DESCRIPTION, FOOTER)
// ---------------------------------------------------------------------
export async function getProductSettings(): Promise<ProductSettings> {
  const supabase = getSupabaseClient()
  if (!supabase) return DEFAULT_SETTINGS

  try {
    const { data, error } = await supabase
      .from('product_settings')
      .select('*')
      .eq('id', 'default')
      .single()

    if (error || !data) {
      return DEFAULT_SETTINGS
    }

    return {
      price: Number(data.price) || DEFAULT_SETTINGS.price,
      title: data.title || DEFAULT_SETTINGS.title,
      subtitle: data.subtitle || DEFAULT_SETTINGS.subtitle,
      brand_name: data.brand_name || DEFAULT_SETTINGS.brand_name,
      footer_text: data.footer_text || DEFAULT_SETTINGS.footer_text,
    }
  } catch (err) {
    console.error('Error fetching product settings:', err)
    return DEFAULT_SETTINGS
  }
}

export async function getProductPrice(): Promise<number> {
  const settings = await getProductSettings()
  return settings.price
}

export async function updateProductSettings(settings: Partial<ProductSettings>) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase URL and Key are missing in .env.local' }
  }

  try {
    const { error } = await supabase
      .from('product_settings')
      .upsert({ id: 'default', ...settings, updated_at: new Date().toISOString() })

    if (error) {
      console.error('Error updating product settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update settings' }
  }
}

export async function updateProductPrice(newPrice: number) {
  return updateProductSettings({ price: newPrice })
}

// ---------------------------------------------------------------------
// COLOR MANAGEMENT
// ---------------------------------------------------------------------
export async function getProductColors(includeInactive = true): Promise<ProductColor[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return includeInactive ? DEFAULT_COLORS : DEFAULT_COLORS.filter(c => c.is_active)

  try {
    let query = supabase.from('product_colors').select('*').order('display_order', { ascending: true })
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return includeInactive ? DEFAULT_COLORS : DEFAULT_COLORS.filter(c => c.is_active)
    }

    return data as ProductColor[]
  } catch (err) {
    console.error('Error fetching colors:', err)
    return includeInactive ? DEFAULT_COLORS : DEFAULT_COLORS.filter(c => c.is_active)
  }
}

export async function toggleColorStatus(id: string, isActive: boolean, colorInfo?: { name: string; hex: string }) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    // Try updating existing row
    const { data, error } = await supabase
      .from('product_colors')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()

    if (error) {
      // If error (e.g. row not existing or syntax issue), try upserting with color details
      if (colorInfo) {
        const { error: upsertError } = await supabase
          .from('product_colors')
          .upsert({ id, name: colorInfo.name, hex: colorInfo.hex, is_active: isActive })
        if (upsertError) return { success: false, error: upsertError.message }
        return { success: true }
      }
      return { success: false, error: error.message }
    }

    // If no row was updated (e.g. fallback color not in DB yet)
    if (!data || data.length === 0) {
      if (colorInfo) {
        const { error: insertError } = await supabase
          .from('product_colors')
          .upsert({ id, name: colorInfo.name, hex: colorInfo.hex, is_active: isActive })
        if (insertError) return { success: false, error: insertError.message }
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update color status' }
  }
}

export async function addProductColor(name: string, hex: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('product_colors')
      .insert([{ name, hex, is_active: true }])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add color' }
  }
}

export async function deleteProductColor(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase
      .from('product_colors')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete color' }
  }
}

// ---------------------------------------------------------------------
// IMAGE MANAGEMENT & SUPABASE BUCKET UPLOAD
// ---------------------------------------------------------------------
export async function getProductImages(includeInactive = true): Promise<ProductImageItem[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return includeInactive ? DEFAULT_IMAGES : DEFAULT_IMAGES.filter(i => i.is_active)

  try {
    let query = supabase.from('product_images').select('*').order('display_order', { ascending: true })
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return includeInactive ? DEFAULT_IMAGES : DEFAULT_IMAGES.filter(i => i.is_active)
    }

    return data as ProductImageItem[]
  } catch (err) {
    console.error('Error fetching images:', err)
    return includeInactive ? DEFAULT_IMAGES : DEFAULT_IMAGES.filter(i => i.is_active)
  }
}

export async function uploadProductImage(formData: FormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase not configured in .env.local' }
  }

  try {
    const file = formData.get('file') as File | null
    const alt = (formData.get('alt') as string) || 'Product Image'

    if (!file || file.size === 0) {
      return { success: false, error: 'No file selected for upload' }
    }

    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const storagePath = `uploads/${fileName}`

    // Upload to Supabase Storage bucket 'product-images'
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return {
        success: false,
        error: `Storage upload failed: ${uploadError.message}. Make sure you ran the SQL setup to create 'product-images' bucket.`,
      }
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath)

    const publicUrl = publicUrlData.publicUrl

    // Insert record into product_images table
    const { data, error: dbError } = await supabase
      .from('product_images')
      .insert([
        {
          url: publicUrl,
          alt,
          storage_path: storagePath,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      return { success: false, error: `DB Save failed: ${dbError.message}` }
    }

    return { success: true, image: data }
  } catch (err: any) {
    console.error('Unexpected upload error:', err)
    return { success: false, error: err?.message || 'Failed to upload image' }
  }
}

export async function toggleImageStatus(id: string, isActive: boolean, imageInfo?: { url: string; alt: string }) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('product_images')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()

    if (error) {
      if (imageInfo) {
        const { error: upsertError } = await supabase
          .from('product_images')
          .upsert({ id, url: imageInfo.url, alt: imageInfo.alt, is_active: isActive })
        if (upsertError) return { success: false, error: upsertError.message }
        return { success: true }
      }
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      if (imageInfo) {
        const { error: insertError } = await supabase
          .from('product_images')
          .upsert({ id, url: imageInfo.url, alt: imageInfo.alt, is_active: isActive })
        if (insertError) return { success: false, error: insertError.message }
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update image status' }
  }
}

export async function deleteProductImage(id: string, storagePath?: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    if (storagePath) {
      const { error: storageErr } = await supabase.storage
        .from('product-images')
        .remove([storagePath])
      if (storageErr) {
        console.warn('Storage delete warning:', storageErr.message)
      }
    }

    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete image' }
  }
}
