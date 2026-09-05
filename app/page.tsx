'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Coffee,
  Laptop,
  Loader2,
  Minus,
  Plus,
  BookOpen,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sofa,
  Truck,
} from 'lucide-react'
import { createOrder } from './actions/createOrder'

const productImages = [
  {
    src: '/asghar/asghar-1.jpg',
    alt: 'طاولة أسغار الخشبية - المنظر الرئيسي مع السطح المرفوع والرف السفلي',
    caption: 'المنظر الرئيسي — تصميم أنيق ومبتكر',
  },
  {
    src: '/asghar/asghar-2.jpg',
    alt: 'تفاصيل السطح القابل للرفع وآلية التثبيت المعدنية لطاولة أسغار',
    caption: 'تفاصيل الخشب وآلية الرفع السلسة',
  },
  {
    src: '/asghar/asghar-3.jpg',
    alt: 'طاولة أسغار الخشبية جانب الأريكة في غرفة المعيشة',
    caption: 'مثالية بجانب الأريكة في غرفة المعيشة',
  },
  {
    src: '/asghar/asghar-4.jpg',
    alt: 'طاولة أسغار الخشبية بجانب السرير في غرفة النوم',
    caption: 'قطعة دافئة ومثالية بجانب السرير',
  },
]

const productPrice = 12500

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Bejaia', 'Biskra', 'Bechar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Setif', 'Saida',
  'Skikda', 'Sidi Bel Abbes', 'Annaba', 'Guelma', 'Constantine', 'Medea', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdes', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama', 'Ain Temouchent', 'Ghardaia', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
  'Ouled Djellal', 'Beni Abbes', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa', 'Ain Salah',
  'Ain Guezzam', 'Ain Temouchent Centre', 'El Aricha', 'Hassi Messaoud', 'Bir El Ater', 'Brezina', 'Debdeb', 'Messaad', 'Reggane', 'Wilaya 69',
]

const shippingRates: Record<string, { domicile: number; desk: number }> = {
  Adrar: { domicile: 1100, desk: 650 }, Chlef: { domicile: 700, desk: 450 }, Laghouat: { domicile: 850, desk: 550 },
  Alger: { domicile: 550, desk: 400 }, Oran: { domicile: 700, desk: 600 }, Blida: { domicile: 600, desk: 450 },
  Boumerdes: { domicile: 700, desk: 450 }, Tipaza: { domicile: 650, desk: 450 }, Medea: { domicile: 650, desk: 450 },
  Tlemcen: { domicile: 800, desk: 450 }, Tiaret: { domicile: 750, desk: 450 }, 'Tizi Ouzou': { domicile: 700, desk: 450 },
  Bejaia: { domicile: 850, desk: 550 }, Batna: { domicile: 700, desk: 450 }, Setif: { domicile: 700, desk: 450 },
  Constantine: { domicile: 700, desk: 450 }, Annaba: { domicile: 700, desk: 450 }, Skikda: { domicile: 800, desk: 450 },
  Ouargla: { domicile: 850, desk: 450 }, 'El Oued': { domicile: 850, desk: 550 }, Ghardaia: { domicile: 950, desk: 550 },
  Tamanrasset: { domicile: 1400, desk: 800 }, Bechar: { domicile: 1150, desk: 800 }, Tindouf: { domicile: 1300, desk: 800 },
  Timimoun: { domicile: 1400, desk: 800 }, 'El Meniaa': { domicile: 950, desk: 550 }, 'El M\'Ghair': { domicile: 850, desk: 550 },
}

const formatDzd = (value: number) => `${value.toLocaleString('en-US')} دج`

export default function Page() {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [wilaya, setWilaya] = useState('')
  const [delivery, setDelivery] = useState<'domicile' | 'desk'>('domicile')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  const currentImage = productImages[selectedImgIndex]
  const shipping = wilaya ? (shippingRates[wilaya]?.[delivery] ?? (delivery === 'domicile' ? 700 : 450)) : 0
  const total = productPrice * quantity + shipping

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setOrderError(null)

    const formData = new FormData(event.currentTarget)
    const name = (formData.get('name') as string) || ''
    const phone = (formData.get('phone') as string) || ''
    const commune = (formData.get('commune') as string) || ''
    const address = (formData.get('address') as string) || ''

    setCustomerName(name)
    setCustomerPhone(phone)

    const res = await createOrder({
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
    })

    setSubmitting(false)

    if (res.success) {
      setSubmitted(true)
      if (typeof window !== 'undefined' && (window as any).fbq) {
        ; (window as any).fbq('track', 'Purchase', { value: total, currency: 'DZD' })
      }
    } else if ((res as any).limitReached) {
      setLimitReached(true)
    } else {
      setOrderError(res.error || 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
    <main dir="rtl" id="top" className="flex min-h-screen flex-col bg-cream text-blackwood selection:bg-wood/20">
      {/* Top Banner */}
      <div className="bg-blackwood py-2 text-center text-xs font-semibold tracking-wider text-wood-light">
        توصيل إلى جميع الولايات · خشب بتشطيب أنيق · جودة مضمونة
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-burgundy/15 bg-cream/95 backdrop-blur-md px-5 py-3 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <a href="#top" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo.png"
              alt="أسغار - asyar"
              width={150}
              height={50}
              priority
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>
      </header>

      {/* FIRST SECTION: HERO SHOWCASE */}
      <section id="product" className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-12 md:items-start md:gap-12 md:px-10 md:py-14">
        {/* Images & Gallery (7 columns) */}
        <div className="space-y-4 md:col-span-7">
          <div className="relative aspect-[1.12] overflow-hidden rounded bg-wood-light shadow-md transition-all">
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              priority
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {productImages.map((img, idx) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setSelectedImgIndex(idx)}
                className={`relative aspect-square overflow-hidden rounded border-2 transition-all ${selectedImgIndex === idx
                  ? 'border-burgundy ring-2 ring-burgundy/30 scale-[1.03]'
                  : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                aria-label={`عرض الصورة ${idx + 1}`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details & Pitch (5 columns) */}
        <div className="space-y-6 md:col-span-5 md:pt-2">
          <div>
            <span className="inline-block border border-wood/30 bg-wood-light/30 px-3 py-1 text-xs tracking-[0.18em] font-semibold text-wood">
              من مجموعة القطع التي تصنع فرقًا
            </span>
            <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-burgundy md:text-5xl lg:text-6xl">
              طاولة أسغار الخشبية
            </h1>
            <p className="mt-2 text-xl font-medium text-wood">أكثر من مجرد طاولة.</p>
          </div>

          <p className="text-base leading-relaxed text-burgundy/80">
            قطعة خشبية أنيقة صُممت لترافقك في لحظات العمل، الدراسة، القراءة وحتى الاسترخاء.
          </p>

          <div className="rounded border border-burgundy/15 bg-wood-light/20 p-4 text-xs leading-relaxed text-burgundy/90">
            <strong className="block mb-1.5 text-burgundy font-bold text-sm">كل ذلك في تصميم واحد:</strong>
            سطح قابل للرفع، مساحة تخزين مخفية ورف سفلي عملي — يجمع بين جمال الخشب وسهولة الاستخدام.
          </div>

          {/* Price Box */}
          <div className="flex items-baseline gap-4 border-y border-burgundy/15 py-4">
            <span className="font-serif text-4xl font-bold text-burgundy">{formatDzd(productPrice)}</span>
            <span className="text-xs text-burgundy/60">الدفع عند الاستلام بعد المعاينة</span>
          </div>

          {/* CTA Button */}
          <a
            href="#order"
            className="inline-flex w-full items-center justify-center gap-3 bg-burgundy px-6 py-4.5 text-base font-semibold tracking-wider text-cream shadow-lg transition-all hover:bg-blackwood hover:-translate-y-0.5"
          >
            <span>اطلب قطعتك الآن</span>
            <span className="text-lg">←</span>
          </a>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 border-t border-burgundy/15 pt-5 text-center text-xs text-burgundy/80">
            <div className="space-y-1.5 p-2 rounded bg-wood-light/20">
              <Truck className="mx-auto h-5 w-5 text-wood" />
              <span className="block font-medium">توصيل إلى جميع الولايات</span>
            </div>
            <div className="space-y-1.5 p-2 rounded bg-wood-light/20">
              <Sparkles className="mx-auto h-5 w-5 text-wood" />
              <span className="block font-medium">خشب بتشطيب أنيق</span>
            </div>
            <div className="space-y-1.5 p-2 rounded bg-wood-light/20">
              <ShieldCheck className="mx-auto h-5 w-5 text-wood" />
              <span className="block font-medium">جودة مضمونة</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECOND SECTION: ORDER FORM (PLACED DIRECTLY AFTER HERO SECTION) */}
      <section id="order" className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12 border-t border-burgundy/15">
        {submitted ? (
          <div className="mx-auto max-w-2xl overflow-hidden border-2 border-blackwood bg-card shadow-[0_12px_32px_rgba(31,6,4,0.12)] transition-all rounded">
            <div className="bg-burgundy px-6 py-10 text-center text-cream">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-wood-light text-burgundy shadow-inner">
                <CheckCircle2 className="h-9 w-9 text-burgundy" />
              </div>
              <span className="inline-block rounded-full bg-wood/30 px-4 py-1 text-xs tracking-widest text-wood-light font-medium">
                تم تسجيل طلبك بنجاح
              </span>
              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-4xl">
                {customerName ? `شكراً لك يا ${customerName}` : 'شكراً لك، تم استلام طلبك'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/90 md:text-base max-w-lg mx-auto">
                يسعدنا اختيارك لمنتجات <strong>أسغار</strong>. نتمنى لك تجربة استثنائية مع هذه القطعة الخشبية المصنوعة بعناية.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="border border-burgundy/15 bg-wood-light/20 p-5 rounded">
                <h3 className="font-serif text-lg font-bold text-burgundy border-b border-burgundy/15 pb-3 mb-4">
                  ملخص الطلب
                </h3>
                <div className="space-y-3 text-sm text-burgundy">
                  <div className="flex justify-between">
                    <span className="text-burgundy/60">المنتج:</span>
                    <span className="font-semibold">طاولة أسغار الخشبية × {quantity}</span>
                  </div>
                  {customerName && (
                    <div className="flex justify-between">
                      <span className="text-burgundy/60">الاسم واللقب:</span>
                      <span className="font-semibold">{customerName}</span>
                    </div>
                  )}
                  {customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-burgundy/60">رقم الهاتف:</span>
                      <span className="font-semibold" dir="ltr">{customerPhone}</span>
                    </div>
                  )}
                  {wilaya && (
                    <div className="flex justify-between">
                      <span className="text-burgundy/60">الولاية والتوصيل:</span>
                      <span className="font-semibold">{wilaya} ({delivery === 'domicile' ? 'توصيل للمنزل' : 'نقطة الاستلام'})</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-burgundy/15 pt-3 text-base font-bold">
                    <span>المجموع الإجمالي عند التسليم:</span>
                    <span className="text-burgundy">{formatDzd(total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 border border-wood/40 bg-cream p-4 rounded text-xs text-burgundy/80">
                <Truck className="h-6 w-6 shrink-0 text-wood" />
                <p className="leading-relaxed">
                  <strong>التأكيد والتوصيل:</strong> سيقوم فريق أسغار بالتواصل معك هاتفياً عبر الرقم المذكور لتأكيد معلومات الشحن. الدفع يتم عند الاستلام بعد معاينة المنتج.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="flex-1 border border-burgundy px-6 py-3.5 text-center text-sm font-semibold text-burgundy transition-colors hover:bg-wood-light/30 rounded"
                >
                  طلب قطعة أخرى
                </button>
                <a
                  href="#top"
                  className="flex-1 bg-burgundy px-6 py-3.5 text-center text-sm font-semibold text-cream transition-colors hover:bg-blackwood rounded"
                >
                  العودة للرئيسية
                </a>
              </div>
            </div>
          </div>
        ) : limitReached ? (
          <div className="mx-auto max-w-2xl overflow-hidden border-2 border-blackwood bg-card shadow-[0_12px_32px_rgba(31,6,4,0.12)] rounded">
            <div className="bg-blackwood px-6 py-12 text-center text-cream">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full border-2 border-wood-light/40 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-wood-light" />
              </div>
              <h2 className="font-serif text-3xl font-bold leading-tight text-cream">نفدت الكميات المتاحة</h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/70 max-w-md mx-auto">
                نأسف، لقد استُنفدت كمية هذه الدفعة المحدودة. تابعنا لمعرفة موعد الدفعة القادمة.
              </p>
            </div>
            <div className="p-6 md:p-8 text-center">
              <a href="#top" className="inline-block bg-burgundy px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-blackwood rounded">
                العودة للرئيسية
              </a>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl overflow-hidden border-2 border-blackwood bg-card shadow-[0_8px_0_rgba(31,6,4,0.12)] rounded">
            <div className="border-b border-blackwood/15 px-5 py-6 md:px-8 bg-wood-light/20">
              <h2 className="font-serif text-3xl text-burgundy">أكمل طلبك — طاولة أسغار الخشبية</h2>
              <p className="mt-2 text-sm text-burgundy/70">أدخل معلوماتك وسنتواصل معك فوراً لتأكيد التوصيل.</p>
            </div>
            <form onSubmit={submitOrder} className="space-y-4 p-5 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-burgundy">الاسم واللقب
                  <input required name="name" placeholder="الاسم الكامل" className="mt-2 w-full border border-burgundy/35 bg-cream px-4 py-3 text-right outline-none focus:border-burgundy rounded" />
                </label>
                <label className="text-sm font-semibold text-burgundy">رقم الهاتف
                  <input required name="phone" type="tel" placeholder="05 xx xx xx xx" className="mt-2 w-full border border-burgundy/35 bg-cream px-4 py-3 text-right outline-none focus:border-burgundy rounded" />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-burgundy">الولاية
                  <select required value={wilaya} onChange={(event) => setWilaya(event.target.value)} className="mt-2 w-full border border-burgundy/35 bg-wood-light px-4 py-3 text-right rounded">
                    <option value="" disabled>اختر الولاية</option>
                    {wilayas.map((item, index) => <option key={`${item}-${index}`} value={item}>{index + 1} - {item}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-burgundy">البلدية
                  <input required name="commune" placeholder="اكتب اسم البلدية" className="mt-2 w-full border border-burgundy/35 bg-wood-light px-4 py-3 text-right outline-none focus:border-burgundy rounded" />
                </label>
              </div>
              <label className="block text-sm font-semibold text-burgundy">عنوان التوصيل
                <input required name="address" placeholder="الحي، الشارع، رقم المنزل" className="mt-2 w-full border border-burgundy/35 bg-cream px-4 py-3 text-right outline-none focus:border-burgundy rounded" />
              </label>

              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-semibold text-burgundy">طريقة التوصيل</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={`cursor-pointer border px-4 py-4 rounded ${delivery === 'domicile' ? 'border-burgundy bg-wood-light' : 'border-burgundy/25'}`}>
                    <input type="radio" name="delivery" checked={delivery === 'domicile'} onChange={() => setDelivery('domicile')} className="ml-2 accent-burgundy" />
                    التوصيل للمنزل <span className="block pr-6 text-xs text-burgundy/70">{formatDzd(shippingRates[wilaya]?.domicile ?? 700)}</span>
                  </label>
                  <label className={`cursor-pointer border px-4 py-4 rounded ${delivery === 'desk' ? 'border-burgundy bg-wood-light' : 'border-burgundy/25'}`}>
                    <input type="radio" name="delivery" checked={delivery === 'desk'} onChange={() => setDelivery('desk')} className="ml-2 accent-burgundy" />
                    نقطة الاستلام (Bureau) <span className="block pr-6 text-xs text-burgundy/70">{formatDzd(shippingRates[wilaya]?.desk ?? 450)}</span>
                  </label>
                </div>
              </fieldset>

              <div className="mt-6 border-y border-burgundy/15 py-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-burgundy">ملخص الطلب</span>
                  <ChevronDown className="h-5 w-5 text-burgundy" />
                </div>
                <div className="mt-5 flex items-center justify-between border-b border-burgundy/10 pb-4 text-sm">
                  <span>طاولة أسغار الخشبية × {quantity}</span>
                  <span>{formatDzd(productPrice * quantity)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>مصاريف التوصيل</span>
                  <span>{wilaya ? formatDzd(shipping) : 'اختر الولاية'}</span>
                </div>
                <div className="mt-5 flex items-center justify-between text-lg font-bold text-burgundy">
                  <span>المجموع الإجمالي</span>
                  <span>{formatDzd(total)}</span>
                </div>
              </div>

              {orderError && (
                <div role="alert" className="border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-700 rounded">
                  {orderError}
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center border border-burgundy/30 rounded">
                  <button type="button" aria-label="إنقاص الكمية" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-burgundy" disabled={submitting || quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center font-semibold">{quantity}</span>
                  <button type="button" aria-label="زيادة الكمية" onClick={() => setQuantity(Math.min(15, quantity + 1))} className="px-4 py-3 text-burgundy disabled:opacity-40" disabled={submitting || quantity >= 15}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button type="submit" disabled={submitting} className="flex-1 bg-burgundy px-6 py-4 font-semibold tracking-[0.12em] text-cream transition-colors hover:bg-blackwood disabled:opacity-60 flex items-center justify-center gap-2 rounded">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري إرسال الطلب...</span>
                    </>
                  ) : (
                    <span>اطلب الآن · {formatDzd(total)}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* SECTION 3: EVERYTHING IN ITS PLACE */}
      <section className="border-t border-burgundy/15 bg-wood-light/20 px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs tracking-[0.2em] font-semibold text-wood uppercase">كل شيء في مكانه</span>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-burgundy md:text-5xl">
                تصميم يفهم احتياجاتك.
              </h2>
            </div>

            <p className="text-lg font-medium text-burgundy/90">
              كم مرة احتجت إلى مكان تضع فيه حاسوبك، كتابك أو أغراضك اليومية؟
            </p>

            <p className="leading-relaxed text-burgundy/75">
              صُممت طاولة أسغار لتمنحك مساحة عملية دون أن تأخذ مساحة كبيرة من منزلك.
            </p>

            <div className="space-y-5 pt-2">
              <div className="border-r-4 border-wood pr-4 space-y-1">
                <h3 className="font-serif text-xl font-bold text-burgundy">سطح قابل للرفع</h3>
                <p className="text-sm leading-relaxed text-burgundy/75">
                  ارفع السطح بسهولة لتحصل على وضعية أكثر راحة أثناء استخدام الحاسوب، الكتابة أو الدراسة. وعندما تنتهي، أعده إلى مكانه لتحافظ على مظهر مرتب وأنيق.
                </p>
              </div>

              <div className="border-r-4 border-wood pr-4 space-y-1">
                <h3 className="font-serif text-xl font-bold text-burgundy">مساحة تخزين مخفية</h3>
                <p className="text-sm leading-relaxed text-burgundy/75">
                  تحت السطح مساحة عملية يمكنك استخدامها لحفظ: <strong className="text-burgundy">الكتب · الدفاتر · الحاسوب · الشواحن · الإكسسوارات</strong>. كل ما تحتاجه قريب منك، لكن بعيد عن الأنظار.
                </p>
              </div>

              <div className="border-r-4 border-wood pr-4 space-y-1">
                <h3 className="font-serif text-xl font-bold text-burgundy">رف سفلي واسع</h3>
                <p className="text-sm leading-relaxed text-burgundy/75">
                  مكان إضافي للكتب، المجلات، جهازك أو الأشياء التي تحب أن تبقى في متناول يدك.
                </p>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded bg-wood-light shadow-xl md:aspect-[5/4]">
            <Image
              src="/asghar/asghar-2.jpg"
              alt="طاولة أسغار الخشبية - تفاصيل السطح القابل للرفع والتخزين"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: DESIGNED FOR YOUR DAY */}
      <section className="bg-burgundy px-5 py-14 text-cream md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs tracking-[0.2em] font-semibold text-wood-light uppercase">ترافقك في كل لحظة</span>
            <h2 className="font-serif text-4xl leading-tight md:text-5xl text-cream">
              صُممت لتناسب يومك
            </h2>
            <p className="text-lg text-cream/80">من الصباح إلى المساء.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-cream/15 bg-cream/5 p-6 rounded transition-all hover:bg-cream/10 space-y-3">
              <Laptop className="h-8 w-8 text-wood-light" />
              <h3 className="font-serif text-xl font-bold text-cream">للعمل</h3>
              <p className="text-sm leading-relaxed text-cream/75">
                ضع حاسوبك، دفتر ملاحظاتك وكل ما تحتاجه لجلسة عمل مريحة.
              </p>
            </div>

            <div className="border border-cream/15 bg-cream/5 p-6 rounded transition-all hover:bg-cream/10 space-y-3">
              <BookOpen className="h-8 w-8 text-wood-light" />
              <h3 className="font-serif text-xl font-bold text-cream">للدراسة والقراءة</h3>
              <p className="text-sm leading-relaxed text-cream/75">
                مساحة مناسبة للكتب والدفاتر، مع إمكانية رفع السطح حسب حاجتك.
              </p>
            </div>

            <div className="border border-cream/15 bg-cream/5 p-6 rounded transition-all hover:bg-cream/10 space-y-3">
              <Coffee className="h-8 w-8 text-wood-light" />
              <h3 className="font-serif text-xl font-bold text-cream">للاسترخاء</h3>
              <p className="text-sm leading-relaxed text-cream/75">
                ضع قهوتك، كتابك وأغراضك بجانبك واستمتع بوقتك.
              </p>
            </div>

            <div className="border border-cream/15 bg-cream/5 p-6 rounded transition-all hover:bg-cream/10 space-y-3">
              <Sofa className="h-8 w-8 text-wood-light" />
              <h3 className="font-serif text-xl font-bold text-cream">بجانب الأريكة</h3>
              <p className="text-sm leading-relaxed text-cream/75">
                تصميمها يجعلها مثالية كطاولة جانبية في غرفة المعيشة أو غرفة النوم.
              </p>
            </div>
          </div>

          <div className="relative aspect-[16/9] max-w-4xl mx-auto overflow-hidden rounded bg-wood-light shadow-2xl">
            <Image
              src="/asghar/asghar-3.jpg"
              alt="طاولة أسغار الخشبية في صالة معيشة جانب الأريكة"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 85vw"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: WARMTH OF WOOD */}
      <section className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-12 md:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded bg-wood-light shadow-xl md:col-span-6">
            <Image
              src="/asghar/asghar-4.jpg"
              alt="طاولة أسغار الخشبية بجانب السرير في ليلة هادئة"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>

          <div className="space-y-6 md:col-span-6 md:pr-4">
            <span className="text-xs tracking-[0.2em] font-semibold text-wood uppercase">الأصالة والملمس الطبيعي</span>
            <h2 className="font-serif text-3xl leading-tight text-burgundy md:text-5xl">
              الخشب الذي يضيف الدفء
            </h2>
            <p className="text-lg font-medium text-wood">قطعة لها حضورها الخاص.</p>

            <div className="space-y-4 text-base leading-relaxed text-burgundy/80">
              <p>
                الخشب ليس مجرد مادة.
              </p>
              <p>
                ملمسه، لونه وتفاصيل خطوطه تمنح المساحة إحساسًا أكثر دفئًا وأناقة.
              </p>
              <p>
                اخترنا تصميمًا بسيطًا يحافظ على جمال الخشب الطبيعي دون تفاصيل زائدة، حتى تنسجم الطاولة بسهولة مع الديكور العصري أو التقليدي.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY ASGHAR TABLE */}
      <section className="border-y border-burgundy/15 bg-wood-light/10 px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs tracking-[0.2em] font-semibold text-wood uppercase">المميزات الأساسية</span>
            <h2 className="font-serif text-4xl text-burgundy">لماذا طاولة أسغار؟</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-burgundy/15 bg-cream p-6 rounded shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy/10 text-burgundy font-bold">1</div>
              <h3 className="font-serif text-xl font-bold text-burgundy">تصميم عملي</h3>
              <p className="text-sm leading-relaxed text-burgundy/75">
                كل جزء فيها له وظيفة، من السطح القابل للرفع إلى مساحة التخزين والرف السفلي.
              </p>
            </div>

            <div className="border border-burgundy/15 bg-cream p-6 rounded shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy/10 text-burgundy font-bold">2</div>
              <h3 className="font-serif text-xl font-bold text-burgundy">توفير المساحة</h3>
              <p className="text-sm leading-relaxed text-burgundy/75">
                تحصل على عدة وظائف في قطعة واحدة دون الحاجة إلى أثاث إضافي.
              </p>
            </div>

            <div className="border border-burgundy/15 bg-cream p-6 rounded shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy/10 text-burgundy font-bold">3</div>
              <h3 className="font-serif text-xl font-bold text-burgundy">مظهر فاخر</h3>
              <p className="text-sm leading-relaxed text-burgundy/75">
                تشطيب خشبي دافئ يمنحها حضورًا أنيقًا في أي غرفة.
              </p>
            </div>

            <div className="border border-burgundy/15 bg-cream p-6 rounded shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy/10 text-burgundy font-bold">4</div>
              <h3 className="font-serif text-xl font-bold text-burgundy">استخدامات متعددة</h3>
              <p className="text-sm leading-relaxed text-burgundy/75">
                للعمل، الدراسة، القراءة، القهوة أو كطاولة جانبية.
              </p>
            </div>

            <div className="border border-burgundy/15 bg-cream p-6 rounded shadow-sm space-y-3 sm:col-span-2 lg:col-span-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy/10 text-burgundy font-bold">5</div>
              <h3 className="font-serif text-xl font-bold text-burgundy">صُممت للاستخدام اليومي</h3>
              <p className="text-sm leading-relaxed text-burgundy/75">
                عملية بما يكفي للاستخدام المستمر، وأنيقة بما يكفي لتبقى جزءًا من ديكور منزلك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: INCLUDED & BRAND STATEMENT */}
      <section className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl grid gap-10 md:grid-cols-2 md:items-center">
          {/* Brand Statement */}
          <div className="space-y-6 border-r-2 border-burgundy/20 pr-6">
            <h2 className="font-serif text-3xl leading-tight text-burgundy md:text-4xl">
              ليست مجرد قطعة أثاث<br />
              <span className="text-wood">إنها مساحة صغيرة لك.</span>
            </h2>

            <div className="space-y-2 text-base leading-relaxed text-burgundy/80">
              <p>مساحة تعمل فيها.</p>
              <p>مساحة تقرأ فيها.</p>
              <p>مساحة تحتفظ فيها بأشيائك.</p>
              <p>ومكان صغير يجعل يومك أكثر ترتيبًا.</p>
            </div>

            <p className="font-serif text-lg font-bold text-burgundy pt-2">
              أسغار — عندما تلتقي الوظيفة بجمال الخشب.
            </p>
          </div>

          {/* What will you get? */}
          <div className="rounded border border-burgundy/20 bg-burgundy text-cream p-8 space-y-6 shadow-lg">
            <h3 className="font-serif text-2xl font-bold text-wood-light border-b border-cream/20 pb-4">
              ماذا ستحصل عليه؟
            </h3>

            <ul className="space-y-3.5 text-sm text-cream/90">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-wood-light shrink-0" />
                <span>طاولة أسغار الخشبية</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-wood-light shrink-0" />
                <span>سطح علوي قابل للرفع</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-wood-light shrink-0" />
                <span>مساحة تخزين داخلية</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-wood-light shrink-0" />
                <span>رف سفلي</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-wood-light shrink-0" />
                <span>تصميم عملي ومتعدد الاستخدامات</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CALL TO ACTION BANNER */}
      <section className="bg-wood-light/30 px-5 py-12 text-center md:px-10 md:py-16 border-t border-burgundy/15">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-serif text-3xl font-bold text-burgundy md:text-5xl">
            اجعل مساحتك أكثر ترتيبًا
          </h2>
          <div className="space-y-1 text-lg text-burgundy/80">
            <p>لا تحتاج دائمًا إلى قطعة أثاث أكبر.</p>
            <p className="font-bold text-burgundy">أحيانًا، تحتاج فقط إلى تصميم أذكى.</p>
          </div>

          <div className="pt-4">
            <a
              href="#order"
              className="inline-flex items-center justify-center gap-2 bg-burgundy px-10 py-4.5 font-semibold text-cream text-lg shadow-lg transition-all hover:bg-blackwood rounded"
            >
              <span>اطلب الآن</span>
              <span>←</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blackwood px-5 py-10 text-cream md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right">
          <div>
            <a href="#top" dir="ltr" className="font-serif text-3xl font-bold tracking-[-0.08em]">
              asyar<span className="text-wood">.</span>
            </a>
            <p className="mt-2 text-sm text-cream/70">أسغار — أشياء يومية، بروح أصيلة.</p>
          </div>
          <p className="text-xs text-cream/50">© 2026 أسغار · كل قطعة لها حكاية</p>
        </div>
      </footer>
    </main>
  )
}
