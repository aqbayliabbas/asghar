'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useState } from 'react'
import {
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Heart,
  Home,
  Loader2,
  MapPin,
  Minus,
  PackageCheck,
  Plane,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react'
import { createOrder } from './actions/createOrder'
import { getProductColors, getProductImages, getProductSettings, ProductColor, ProductImageItem } from './actions/adminProduct'

const defaultProductImages: ProductImageItem[] = [
  { id: '1', url: '/nouski/olive-look.png', alt: 'سيدة ترتدي طقم صلاة نُسكي الزيتوني', is_active: true },
  { id: '2', url: '/nouski/set-flatlay.png', alt: 'مكونات طقم صلاة نُسكي مرتبة على سجادة الصلاة', is_active: true },
  { id: '3', url: '/nouski/prayer-garments.png', alt: 'طقمَا صلاة نُسكي باللون الزيتوني', is_active: true },
  { id: '4', url: '/nouski/color-pouches.png', alt: 'حقائب نُسكي بألوان وردية وعنابية وبيج ولافندر', is_active: true },
]

const defaultColors: ProductColor[] = [
  { id: '1', name: 'وردي', hex: '#efa9ba', is_active: true },
  { id: '2', name: 'عنابي', hex: '#761d49', is_active: true },
  { id: '3', name: 'زيتوني', hex: '#666d4d', is_active: true },
  { id: '4', name: 'لافندر', hex: '#9d82c8', is_active: true },
  { id: '5', name: 'بيج', hex: '#e4c9a4', is_active: true },
  { id: '6', name: 'أزرق', hex: '#183552', is_active: true },
]

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
  'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
]

const shippingRates: Record<string, { domicile: number; desk: number }> = {
  Adrar: { domicile: 1100, desk: 650 },
  Alger: { domicile: 550, desk: 400 },
  Annaba: { domicile: 700, desk: 450 },
  Batna: { domicile: 700, desk: 450 },
  Béchar: { domicile: 1150, desk: 800 },
  Béjaïa: { domicile: 850, desk: 550 },
  Blida: { domicile: 600, desk: 450 },
  Boumerdès: { domicile: 700, desk: 450 },
  Constantine: { domicile: 700, desk: 450 },
  Ghardaïa: { domicile: 950, desk: 550 },
  Médéa: { domicile: 650, desk: 450 },
  Oran: { domicile: 700, desk: 600 },
  Ouargla: { domicile: 850, desk: 450 },
  Sétif: { domicile: 700, desk: 450 },
  Tamanrasset: { domicile: 1400, desk: 800 },
  Tindouf: { domicile: 1300, desk: 800 },
  Tipaza: { domicile: 650, desk: 450 },
  Tlemcen: { domicile: 800, desk: 450 },
  'Tizi Ouzou': { domicile: 700, desk: 450 },
  'El Oued': { domicile: 850, desk: 550 },
  'El Meniaa': { domicile: 950, desk: 550 },
  "El M'Ghair": { domicile: 850, desk: 550 },
}

const formatDzd = (value: number) => `${value.toLocaleString('fr-DZ')} دج`

export default function Page() {
  const [productPrice, setProductPrice] = useState<number>(2600)
  const [productTitle, setProductTitle] = useState<string>('صلاتكِ براحة، أينما كنتِ.')
  const [productSubtitle, setProductSubtitle] = useState<string>('طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.')
  const [brandName, setBrandName] = useState<string>('نُسكي — NOUSKI')
  const [footerText, setFooterText] = useState<string>('طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية')

  const [colors, setColors] = useState<ProductColor[]>(defaultColors)
  const [productImages, setProductImages] = useState<ProductImageItem[]>(defaultProductImages)

  const [selectedImage, setSelectedImage] = useState(0)
  const [colorsPerItem, setColorsPerItem] = useState<string[]>(['وردي'])
  const [quantity, setQuantity] = useState(1)
  const [wilaya, setWilaya] = useState('')
  const [delivery, setDelivery] = useState<'domicile' | 'desk'>('domicile')
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProductData() {
      const [settings, fetchedColors, fetchedImages] = await Promise.all([
        getProductSettings(),
        getProductColors(false), // only active
        getProductImages(false), // only active
      ])

      if (settings) {
        setProductPrice(settings.price)
        if (settings.title) setProductTitle(settings.title)
        if (settings.subtitle) setProductSubtitle(settings.subtitle)
        if (settings.brand_name) setBrandName(settings.brand_name)
        if (settings.footer_text) setFooterText(settings.footer_text)
      }
      if (fetchedColors && fetchedColors.length > 0) {
        setColors(fetchedColors)
        setColorsPerItem([fetchedColors[0].name])
      }
      if (fetchedImages && fetchedImages.length > 0) {
        setProductImages(fetchedImages)
      }
    }
    loadProductData()
  }, [])

  const shipping = wilaya
    ? shippingRates[wilaya]?.[delivery] ?? (delivery === 'domicile' ? 700 : 450)
    : 0
  const total = productPrice * quantity + shipping

  // Keep colorsPerItem in sync with quantity changes
  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty)
    setColorsPerItem((prev) => {
      if (newQty > prev.length) {
        // Extend array, filling new slots with the last selected color
        const lastColor = prev[prev.length - 1] || (colors[0]?.name ?? 'وردي')
        return [...prev, ...Array(newQty - prev.length).fill(lastColor)]
      }
      return prev.slice(0, newQty)
    })
  }

  const setColorForItem = (index: number, color: string) => {
    setColorsPerItem((prev) => {
      const next = [...prev]
      next[index] = color
      return next
    })
  }

  const currentImage = productImages[selectedImage] || productImages[0] || defaultProductImages[0]

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setOrderError(null)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '')
    const phone = String(formData.get('phone') || '')
    const commune = String(formData.get('commune') || '')
    const address = String(formData.get('address') || '')

    setCustomerName(name)

    const result = await createOrder({
      name,
      phone,
      wilaya,
      commune,
      address,
      delivery,
      quantity,
      productPrice,
      shippingPrice: shipping,
      totalPrice: total,
      colorsPerItem,
    })

    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
      if (typeof window !== 'undefined' && 'fbq' in window) {
        ;(window as Window & { fbq: (event: string, name: string, data: object) => void }).fbq(
          'track',
          'Purchase',
          { value: total, currency: 'DZD' },
        )
      }
    } else if ('limitReached' in result && result.limitReached) {
      setLimitReached(true)
    } else {
      setOrderError(
        'error' in result
          ? result.error || 'تعذّر تسجيل الطلب. حاولي مرة أخرى.'
          : 'تعذّر تسجيل الطلب. حاولي مرة أخرى.'
      )
    }
  }

  return (
    <div className="minimal-app">
      {/* 1. ANNOUNCEMENT BAR */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <span><Truck className="w-3.5 h-3.5 inline ml-1" /> توصيل إلى 69 ولاية</span>
          <span className="dot">•</span>
          <span><ShieldCheck className="w-3.5 h-3.5 inline ml-1" /> الدفع نقدًا عند الاستلام</span>
          <span className="dot">•</span>
          <span><PackageCheck className="w-3.5 h-3.5 inline ml-1" /> معاينة المنتج قبل الدفع</span>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="site-navbar">
        <div className="navbar-container">
          <a href="#" className="brand-logo">
            <span className="brand-title">نُسكي</span>
            <span className="brand-sub">NOUSKI</span>
          </a>

          <div className="navbar-reassurance">
            <span>طقم صلاة متنقل فاخر</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* 3. MAIN SECTION */}
        <section className="product-single-section">
          <div className="product-single-container">
            
            {/* COLUMN 1: SQUARE GALLERY */}
            <div className="product-gallery-col">
              <div className="gallery-main-square relative aspect-square w-full">
                <Image
                  src={currentImage.url || (currentImage as any).src}
                  alt={currentImage.alt || 'صورة المنتج'}
                  fill
                  priority
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="gallery-badge">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>الأكثر طلبًا</span>
                </div>
              </div>

              {/* SQUARE THUMBNAILS */}
              {productImages.length > 1 && (
                <div className="gallery-thumbnails">
                  {productImages.map((image, index) => (
                    <button
                      key={image.id || image.url}
                      type="button"
                      className={`thumb-square relative aspect-square ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`عرض الصورة ${index + 1}`}
                    >
                      <Image
                        src={image.url || (image as any).src}
                        alt=""
                        fill
                        className="object-cover rounded-lg"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* TRUST HIGHLIGHTS */}
              <div className="gallery-trust-list">
                <div className="trust-item">
                  <ShieldCheck className="w-4 h-4 text-burgundy shrink-0" />
                  <span>قماش ناعم وخفيف عالي الجودة</span>
                </div>
                <div className="trust-item">
                  <Truck className="w-4 h-4 text-burgundy shrink-0" />
                  <span>شحن سريع لجميع الولايات</span>
                </div>
                <div className="trust-item">
                  <PackageCheck className="w-4 h-4 text-burgundy shrink-0" />
                  <span>حقيبة مبطّنة مرفقة للطقم</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: PRODUCT INFO, PRICE, FORM & BUY BUTTON */}
            <div className="product-info-form-col">
              <div className="product-header">
                <span className="product-tag">طقم الصلاة المتنقل</span>
                <h1 className="product-title">{productTitle}</h1>
                <p className="product-subtitle">
                  {productSubtitle}
                </p>

                <div className="price-tag-wrapper flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-bold text-slate-900">{formatDzd(productPrice)}</span>
                  <span className="text-xs text-slate-500 font-medium">+ مصاريف التوصيل حسب الولاية</span>
                </div>
              </div>

              {/* FORM & SUBMIT */}
              {submitted ? (
                <div className="success-card">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2" />
                  <h3>تم تسجيل طلبكِ بنجاح!</h3>
                  <p>
                    {customerName ? `شكرًا لكِ يا ${customerName}.` : 'شكرًا لكِ.'} سيتواصل معكِ فريق نُسكي قريبًا لتأكيد اللون والعنوان والتوصيل.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSubmitted(false)}
                  >
                    طلب طقم آخر
                  </button>
                </div>
              ) : limitReached ? (
                <div className="limit-card">
                  <PackageCheck className="w-12 h-12 text-amber-600 mb-2" />
                  <h3>نفدت كمية هذه الدفعة</h3>
                  <p>شكرًا على اهتمامكِ. عودي قريبًا لمعرفة موعد الدفعة القادمة.</p>
                </div>
              ) : (
                <form className="product-order-form" onSubmit={submitOrder}>
                  
                  {/* COLOR PICKER */}
                  <div className="form-group">
                    {quantity === 1 ? (
                      /* ── Single item: classic single-color picker ─────────── */
                      <>
                        <div className="form-group-header">
                          <span className="step-num">1</span>
                          <span className="step-title">اختاري اللون:</span>
                          <strong className="selected-color-name">{colorsPerItem[0]}</strong>
                        </div>
                        <div className="color-swatches-grid">
                          {colors.map((c) => (
                            <button
                              key={c.id || c.name}
                              type="button"
                              className={`color-swatch-btn ${colorsPerItem[0] === c.name ? 'active' : ''}`}
                              onClick={() => setColorForItem(0, c.name)}
                              aria-label={c.name}
                            >
                              <span
                                className="swatch-circle"
                                style={{ backgroundColor: c.hex || (c as any).value }}
                              >
                                {colorsPerItem[0] === c.name && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                              </span>
                              <span className="swatch-label">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      /* ── Multiple items: one color picker per article ──────── */
                      <>
                        <div className="form-group-header">
                          <span className="step-num">1</span>
                          <span className="step-title">اختاري لون كل طقم:</span>
                        </div>
                        <div className="multi-color-list">
                          {Array.from({ length: quantity }, (_, i) => (
                            <div key={i} className="multi-color-item">
                              <div className="multi-color-item-header">
                                <span className="multi-color-badge">{i + 1}</span>
                                <span className="multi-color-label">الطقم {i + 1}:</span>
                                <strong className="selected-color-name">{colorsPerItem[i]}</strong>
                              </div>
                              <div className="color-swatches-grid">
                                {colors.map((c) => (
                                  <button
                                    key={c.id || c.name}
                                    type="button"
                                    className={`color-swatch-btn ${colorsPerItem[i] === c.name ? 'active' : ''}`}
                                    onClick={() => setColorForItem(i, c.name)}
                                    aria-label={c.name}
                                  >
                                    <span
                                      className="swatch-circle"
                                      style={{ backgroundColor: c.hex || (c as any).value }}
                                    >
                                      {colorsPerItem[i] === c.name && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                    </span>
                                    <span className="swatch-label">{c.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* CUSTOMER DETAILS */}
                  <div className="form-group">
                    <div className="form-group-header">
                      <span className="step-num">2</span>
                      <span className="step-title">معلومات التوصيل:</span>
                    </div>
                    <div className="inputs-grid">
                      <div className="input-field">
                        <label htmlFor="name">الاسم واللقب *</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="مثال: مريم بن علي"
                          required
                          autoComplete="name"
                        />
                      </div>

                      <div className="input-field">
                        <label htmlFor="phone">رقم الهاتف *</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="05 / 06 / 07..."
                          required
                          autoComplete="tel"
                          dir="ltr"
                        />
                      </div>

                      <div className="input-field">
                        <label htmlFor="wilaya">الولاية *</label>
                        <div className="select-wrapper">
                          <select
                            id="wilaya"
                            value={wilaya}
                            onChange={(e) => setWilaya(e.target.value)}
                            required
                          >
                            <option value="">اختاري الولاية</option>
                            {wilayas.map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="select-icon" />
                        </div>
                      </div>

                      <div className="input-field">
                        <label htmlFor="commune">البلدية *</label>
                        <input
                          id="commune"
                          name="commune"
                          type="text"
                          placeholder="اسم البلدية"
                          required
                          autoComplete="address-level2"
                        />
                      </div>

                      <div className="input-field full-width">
                        <label htmlFor="address">العنوان الكامل *</label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="الحي، الشارع، رقم المنزل..."
                          required
                          autoComplete="street-address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY TYPE */}
                  <div className="form-group">
                    <div className="form-group-header">
                      <span className="step-num">3</span>
                      <span className="step-title">طريقة التوصيل:</span>
                    </div>
                    <div className="delivery-radio-grid">
                      <label className={`delivery-card ${delivery === 'domicile' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="delivery"
                          value="domicile"
                          checked={delivery === 'domicile'}
                          onChange={() => setDelivery('domicile')}
                        />
                        <Home className="w-4 h-4 text-burgundy shrink-0" />
                        <div className="delivery-info">
                          <strong>توصيل للمنزل</strong>
                          <small>حتى باب بيتكِ</small>
                        </div>
                      </label>

                      <label className={`delivery-card ${delivery === 'desk' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="delivery"
                          value="desk"
                          checked={delivery === 'desk'}
                          onChange={() => setDelivery('desk')}
                        />
                        <MapPin className="w-4 h-4 text-burgundy shrink-0" />
                        <div className="delivery-info">
                          <strong>مكتب التوصيل</strong>
                          <small>استلام من المكتب</small>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* QUANTITY & SUMMARY */}
                  <div className="form-summary-card">
                    <div className="quantity-line">
                      <span className="qty-label">الكمية المطلوبة:</span>
                      <div className="qty-selector">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(Math.min(5, quantity + 1))}
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="total-calculation">
                      <div className="total-row">
                        <span>المجموع عند الاستلام:</span>
                        <strong className="total-price">{formatDzd(total)}</strong>
                      </div>
                      <small className="total-breakdown">
                        {wilaya
                          ? `(المنتج ${formatDzd(productPrice * quantity)} + التوصيل ${formatDzd(shipping)})`
                          : '(اختاري الولاية لحساب تكلفة الشحن والمجموع)'}
                      </small>
                    </div>
                  </div>

                  {orderError && <p className="error-message" role="alert">{orderError}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="submit-order-btn text-base font-bold flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري تسجيل الطلب...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>تأكيد الطلب والدفع عند الاستلام ({formatDzd(total)})</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 4. DETAILS / BENEFITS GRID */}
        <section className="details-section">
          <div className="details-container">
            <h2 className="section-title">لماذا ستعشقين طقم نُسكي؟</h2>
            
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <BriefcaseBusiness className="w-6 h-6 text-burgundy" />
                </div>
                <h3>حقيبة صغيرة متناسقة</h3>
                <p>تتسع في أي حقيبة يد دون أن تأخذ مساحة، ليكون طقمك معكِ أينما تنقلتِ.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <Sparkles className="w-6 h-6 text-burgundy" />
                </div>
                <h3>قماش ناعم ولا يتجعد</h3>
                <p>مصنوع من أقمشة مختارة بعناية توفر لكِ الراحة والانتعاش أثناء الصلاة.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <GraduationCap className="w-6 h-6 text-burgundy" />
                </div>
                <h3>مثالي للعمل والجامعة</h3>
                <p>تصميم عصري ساتر وأنيق يضمن لكِ الجاهزية التامة للصلوات في وقتها.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <Plane className="w-6 h-6 text-burgundy" />
                </div>
                <h3>رفيق السفر والرحلات</h3>
                <p>خفيف الوزن وسهل التوضيب، خياركِ الأمثل للمطارات والسفريات والمناسبات.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. FOOTER */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <strong>{brandName}</strong>
            <p>{footerText}</p>
          </div>
          <p className="copyright">© {new Date().getFullYear()} جميع الحقوق محفوظة لـ {brandName.split('—')[0]?.trim() || brandName}.</p>
        </div>
      </footer>
    </div>
  )
}
