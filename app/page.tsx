'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'
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

const productImages = [
  { src: '/nouski/olive-look.png', alt: 'سيدة ترتدي طقم صلاة نُسكي الزيتوني' },
  { src: '/nouski/set-flatlay.png', alt: 'مكونات طقم صلاة نُسكي مرتبة على سجادة الصلاة' },
  { src: '/nouski/prayer-garments.png', alt: 'طقمَا صلاة نُسكي باللون الزيتوني' },
  { src: '/nouski/color-pouches.png', alt: 'حقائب نُسكي بألوان وردية وعنابية وبيج ولافندر' },
]

const colors = [
  { name: 'وردي', value: '#efa9ba' },
  { name: 'عنابي', value: '#761d49' },
  { name: 'زيتوني', value: '#666d4d' },
  { name: 'لافندر', value: '#9d82c8' },
  { name: 'بيج', value: '#e4c9a4' },
  { name: 'أزرق', value: '#183552' },
]

const productPrice = 2600

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
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('وردي')
  const [quantity, setQuantity] = useState(1)
  const [wilaya, setWilaya] = useState('')
  const [delivery, setDelivery] = useState<'domicile' | 'desk'>('domicile')
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  const shipping = wilaya
    ? shippingRates[wilaya]?.[delivery] ?? (delivery === 'domicile' ? 700 : 450)
    : 0
  const total = productPrice * quantity + shipping

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
      address: `اللون: ${selectedColor} — ${address}`,
      delivery,
      quantity,
      productPrice,
      shippingPrice: shipping,
      totalPrice: total,
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

      {/* 2. NAVBAR (Immediately after announcement bar) */}
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
        {/* 3. SINGLE MAIN SECTION: SQUARE GALLERY + PRODUCT INFO + FORM + PRICE + CTA */}
        <section className="product-single-section">
          <div className="product-single-container">
            
            {/* COLUMN 1: SQUARE GALLERY */}
            <div className="product-gallery-col">
              <div className="gallery-main-square relative aspect-square w-full">
                <Image
                  src={productImages[selectedImage].src}
                  alt={productImages[selectedImage].alt}
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
              <div className="gallery-thumbnails">
                {productImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    className={`thumb-square relative aspect-square ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`عرض الصورة ${index + 1}`}
                  >
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      className="object-cover rounded-lg"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>

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
                <h1 className="product-title">صلاتكِ براحة، أينما كنتِ.</h1>
                <p className="product-subtitle">
                  طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.
                </p>

                
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
                    <div className="form-group-header">
                      <span className="step-num">1</span>
                      <span className="step-title">اختاري اللون:</span>
                      <strong className="selected-color-name">{selectedColor}</strong>
                    </div>
                    <div className="color-swatches-grid">
                      {colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className={`color-swatch-btn ${selectedColor === c.name ? 'active' : ''}`}
                          onClick={() => setSelectedColor(c.name)}
                          aria-label={c.name}
                        >
                          <span
                            className="swatch-circle"
                            style={{ backgroundColor: c.value }}
                          >
                            {selectedColor === c.name && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </span>
                          <span className="swatch-label">{c.name}</span>
                        </button>
                      ))}
                    </div>
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
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(5, q + 1))}
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

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    className="submit-order-btn"
                    disabled={submitting || !wilaya}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جارٍ تسجيل الطلب...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 ml-1" />
                        <span>تأكيد الطلب — {formatDzd(total)}</span>
                      </>
                    )}
                  </button>

                  <p className="cod-reassurance">
                    <ShieldCheck className="w-4 h-4 text-burgundy shrink-0" />
                    <span>الدفع نقدًا عند الاستلام • المعاينة قبل الدفع</span>
                  </p>
                </form>
              )}
            </div>

          </div>
        </section>

        {/* 4. DESCRIPTION SECTION (Directly following the main product section) */}
        <section className="product-description-section">
          <div className="description-container">
            
            <div className="section-heading">
              <span className="heading-kicker">تفاصيل طقم نُسكي</span>
              <h2>طقم متكامل، خفيف، ومصمم بعناية.</h2>
              <p>
                لا بحث عن سجادة، ولا طقم يأخذ مساحة كبيرة. افتحي نُسكي وستجدين كل شيء مرتبًا وجاهزًا في ثوانٍ.
              </p>
            </div>

            {/* 3 CORE PIECES GRID */}
            <div className="pieces-grid">
              
              <div className="piece-card">
                <div className="piece-image-wrap relative aspect-square w-full">
                  <Image
                    src="/nouski/set-flatlay.png"
                    alt="طقم نُسكي كاملًا داخل سجادة الصلاة"
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="piece-content">
                  <span className="piece-num">01</span>
                  <h3>طقم صلاة كامل</h3>
                  <p>ثوب صلاة ساتر وواسع مصمم بقماش ناعم وخفيف، يمنحكِ الراحة والسكينة أثناء الصلاة.</p>
                </div>
              </div>

              <div className="piece-card">
                <div className="piece-image-wrap relative aspect-square w-full">
                  <Image
                    src="/nouski/prayer-garments.png"
                    alt="سجادة صلاة خفيفة"
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="piece-content">
                  <span className="piece-num">02</span>
                  <h3>سجادة خفيفة قابلة للطي</h3>
                  <p>سجادة صلاة خفيفة الوزن تُطوى بحجم صغير دون أن تشغل أي مساحة في حقيبتكِ.</p>
                </div>
              </div>

              <div className="piece-card">
                <div className="piece-image-wrap relative aspect-square w-full">
                  <Image
                    src="/nouski/color-pouches.png"
                    alt="حقيبة أنيقة للحفظ"
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="piece-content">
                  <span className="piece-num">03</span>
                  <h3>حقيبة مبطّنة أنيقة</h3>
                  <p>حقيبة قماشية مرتبة تجمع الثوب والسجادة معًا في تنسيق أنيق ومحمي.</p>
                </div>
              </div>

            </div>

            {/* USE CASES SHOWCASE */}
            <div className="use-cases-banner">
              <div className="use-cases-text">
                <span className="banner-tag">جاهزة في أي مكان</span>
                <h2>رفيقة يومكِ خارج البيت.</h2>
                <p>صُممت لترافقكِ بسهولة وتضمن لكِ أداء صلاتكِ براحة واطمئنان.</p>
                <div className="use-tags">
                  <span><GraduationCap className="w-4 h-4 shrink-0" /> الجامعة</span>
                  <span><BriefcaseBusiness className="w-4 h-4 shrink-0" /> العمل</span>
                  <span><Plane className="w-4 h-4 shrink-0" /> السفر</span>
                  <span><Home className="w-4 h-4 shrink-0" /> البيت</span>
                </div>
              </div>
              <div className="use-cases-img relative aspect-square w-full">
                <Image
                  src="/nouski/olive-look.png"
                  alt="طقم نُسكي عند الاستخدام"
                  fill
                  className="object-cover rounded-2xl"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* FAQ */}
            <div className="faq-block">
              <h3 className="faq-title">أسئلة شائعة</h3>
              <div className="faq-items">
                <details className="faq-item">
                  <summary>
                    <span>ماذا يحتوي طقم نُسكي؟</span>
                    <Plus className="w-4 h-4 icon-plus" />
                  </summary>
                  <p>يحتوي على طقم صلاة ساتر، سجادة صلاة خفيفة قابلة للطي، وحقيبة مبطّنة لحفظهما معًا.</p>
                </details>

                <details className="faq-item">
                  <summary>
                    <span>كيف يتم حساب سعر التوصيل؟</span>
                    <Plus className="w-4 h-4 icon-plus" />
                  </summary>
                  <p>عند اختيار ولايتكِ وطريقة التوصيل (منزل أو مكتب) داخل استمارة الطلب، يُحسب السعر تلقائيًا ويرفق بالمجموع.</p>
                </details>

                <details className="faq-item">
                  <summary>
                    <span>متى يكون الدفع؟</span>
                    <Plus className="w-4 h-4 icon-plus" />
                  </summary>
                  <p>الدفع يكون نقدًا عند استلام الطلب ومعاينة المنتج بحضور عون التوصيل.</p>
                </details>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="minimal-footer">
        <div className="footer-brand">
          <strong>نُسكي</strong>
          <span>NOUSKI</span>
        </div>
        <p>رفيقة لحظاتكِ الهادئة، أينما كنتِ.</p>
        <small>© 2026 NOUSKI. جميع الحقوق محفوظة.</small>
      </footer>
    </div>
  )
}
