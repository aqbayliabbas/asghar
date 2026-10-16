import Storefront from '@/components/storefront'
import { getProductColors, getProductImages, getProductSettings } from './actions/adminProduct'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const [settings, colors, images] = await Promise.all([
    getProductSettings(),
    getProductColors(false),
    getProductImages(false),
  ])

  return <Storefront settings={settings} initialColors={colors} initialImages={images} />
}
