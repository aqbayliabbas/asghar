import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * GET /api/keepalive
 *
 * Keeps the Supabase project active by sending a lightweight query once a day.
 * Triggered automatically by Vercel Cron (see vercel.json).
 * Protected by a shared secret so only Vercel (or you) can call it.
 */
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // ── Security: require the cron secret ──────────────────────────────
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Supabase ping ───────────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase env vars missing' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Lightweight count query — touches the DB without reading real data
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })

    if (error) throw error

    console.log(`[keepalive] Supabase ping OK — orders count: ${count}`)

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      orders_count: count,
    })
  } catch (err: any) {
    console.error('[keepalive] Supabase ping failed:', err)
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}
