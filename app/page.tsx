'use client'

import Image from 'next/image'
import { FormEvent, useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, Loader2, Minus, Plus, ShieldCheck, ShoppingBag, Truck, X } from 'lucide-react'
import { createOrder } from './actions/createOrder'

const productImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rKrne6xJheMVqTuP85M7ADv7573KYJ.png'
const lifestyleImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%204%2C%202026%2C%2006_20_09%20PM-JAjnIIG5l6pNHo4inB1jttIrWJs1gI.png'
const detailImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%204%2C%202026%2C%2006_12_47%20PM-UR05WWSS5JJIy2f0oKlSHAeKmlIGHY.png'
const productPrice = 3500

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

const formatDzd = (value: number) => `${value.toLocaleString('en-US')} DA`

export default function Page() {
  const [menu, setMenu] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [wilaya, setWilaya] = useState('')
  const [delivery, setDelivery] = useState<'domicile' | 'desk'>('domicile')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  const shipping = wilaya ? (shippingRates[wilaya]?.[delivery] ?? (delivery === 'domicile' ? 700 : 450)) : 0
  const total = productPrice * quantity + shipping

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
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
      setSubmitted(true);
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', { value: total, currency: 'DZD' });
      }
    } else if ((res as any).limitReached) {
      setLimitReached(true)
    } else {
      setOrderError(res.error || 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
    <main dir="rtl" className="flex min-h-screen flex-col bg-cream text-blackwood">
      <header className="border-b border-burgundy/15 bg-cream px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <a href="#top" dir="ltr" className="font-serif text-3xl font-bold tracking-[-0.08em] text-burgundy">
            asyar<span className="text-wood">.</span>
          </a>
        </div>
      </header>

      <section id="product" className="order-1 mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-14 md:px-10 md:py-14"><div className="relative aspect-[1.12] overflow-hidden bg-wood-light md:order-2"><Image src={productImage} alt="منظم مفاتيح جداري من خشب الجوز من أسيار" fill priority className="object-cover object-[center_38%]" sizes="(max-width: 768px) 100vw, 52vw" /><div className="absolute bottom-4 right-4 bg-cream/90 px-4 py-2 text-xs tracking-[0.12em] text-burgundy">مصنوع من خشب طبيعي</div></div><div className="md:order-1 md:pt-5"><p className="text-xs tracking-[0.25em] text-wood">من مجموعة الأشياء اليومية</p><h1 className="mt-5 font-serif text-5xl leading-[1.05] tracking-[-0.04em] text-burgundy md:text-7xl">معلق الملابس <br /> العصري</h1><p className="mt-6 max-w-md text-base leading-8 text-burgundy/70">قطعة هادئة لمدخل بيتك. تصميم عملي من خشب الجوز، يرحّب بمفاتيحك ويمنح التفاصيل اليومية مكانًا يستحقها.</p><div className="mt-8 flex items-center gap-4 border-y border-burgundy/15 py-5"><span className="font-serif text-3xl text-burgundy">{formatDzd(productPrice)}</span><span className="text-xs text-burgundy/50">سعر المنتج</span></div><a href="#order" className="mt-8 inline-flex w-full items-center justify-center bg-burgundy px-6 py-4 text-sm tracking-[0.16em] text-cream transition-transform hover:-translate-y-1">احجز قطعتك <span className="mr-3">←</span></a><div className="mt-6 grid grid-cols-3 gap-3 text-center text-[11px] text-burgundy/65"><div><Truck className="mx-auto mb-2 h-5 w-5 text-wood" />توصيل سريع</div><div><ShieldCheck className="mx-auto mb-2 h-5 w-5 text-wood" />صنع بعناية</div><div><span className="mx-auto mb-2 block h-5 w-5 rounded-full border border-wood" />ضمان الجودة</div></div></div></section>

      <section id="details" className="order-3 border-y border-burgundy/15 bg-burgundy px-5 py-12 text-cream md:px-10 md:py-16"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3"><div><p className="text-xs tracking-[0.2em] text-wood-light">لماذا أسيار؟</p><h2 className="mt-4 font-serif text-4xl leading-tight">جمالٌ يسكن<br />في التفاصيل.</h2></div><div className="border-t border-cream/20 pt-5"><p className="text-xs text-wood-light">المادة</p><p className="mt-3 leading-7 text-cream/70">خشب جوز طبيعي بملمس دافئ وتدرجات فريدة. كل قطعة تحمل أثر الشجرة التي جاءت منها.</p></div><div className="border-t border-cream/20 pt-5"><p className="text-xs text-wood-light">الفكرة</p><p className="mt-3 leading-7 text-cream/70">صُنع ليبقى قريبًا منك؛ يلتقط الأشياء التي نحتاجها كل يوم، ويضيف لمسة من المعنى إلى المكان.</p></div></div></section>

      <section className="order-4 mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-20"><div className="grid gap-8 md:grid-cols-2 md:items-center"><div className="relative aspect-[4/5] overflow-hidden bg-wood-light"><Image src={lifestyleImage} alt="علاقة أسيار الخشبية في مدخل منزل مع مفاتيح ومعاطف" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div><div className="space-y-8 md:px-8"><div><p className="text-xs tracking-[0.2em] text-wood">علاقة أسيار الخشبية</p><h2 className="mt-4 font-serif text-4xl leading-tight text-burgundy md:text-5xl">قطعة واحدة.<br />استخدامات متعددة.</h2><p className="mt-5 leading-8 text-burgundy/70">صُممت أسيار لتمنح الأشياء التي ترافقك يوميًا مكانًا واضحًا وجميلًا. من مفاتيحك عند الباب إلى معطفك وحقيبتك، كل شيء يبقى قريبًا ومرتبًا.</p></div><div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm text-burgundy"><div><strong className="block text-wood">01 — خشب طبيعي</strong><span className="mt-1 block leading-6 text-burgundy/65">خشب جوز بتدرجات دافئة وملمس لا يتكرر.</span></div><div><strong className="block text-wood">02 — خطاف عملي</strong><span className="mt-1 block leading-6 text-burgundy/65">لالمفاتيح والأغراض الصغيرة التي تحتاجها يوميًا.</span></div><div><strong className="block text-wood">03 — مساحة أكبر</strong><span className="mt-1 block leading-6 text-burgundy/65">للمعاطف والحقائب والأوشحة.</span></div><div><strong className="block text-wood">04 — موفّر للمساحة</strong><span className="mt-1 block leading-6 text-burgundy/65">يثبت على الحائط ويحافظ على ترتيب المدخل.</span></div></div></div></div></section>

      <section className="order-5 bg-wood-light/35 px-5 py-12 md:px-10 md:py-20"><div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center"><div className="md:order-2"><p className="text-xs tracking-[0.2em] text-wood">جمال الخشب في تفاصيلك اليومية</p><h2 className="mt-4 font-serif text-4xl leading-tight text-burgundy md:text-5xl">أكثر من علاقة<br />للحائط.</h2><p className="mt-5 max-w-xl leading-8 text-burgundy/70">إنها قطعة تضيف النظام إلى مساحتك، والدفء إلى منزلك، والجمال إلى الأشياء التي تستخدمها كل يوم. مناسبة للمدخل، غرفة النوم، الممر، المكتب أو أي زاوية تحتاج إلى ترتيب إضافي.</p><div className="mt-8 flex flex-wrap gap-3 text-sm text-burgundy"><span className="border border-burgundy/20 bg-cream px-4 py-2">مفاتيحك</span><span className="border border-burgundy/20 bg-cream px-4 py-2">معاطفك</span><span className="border border-burgundy/20 bg-cream px-4 py-2">حقيبتك</span><span className="border border-burgundy/20 bg-cream px-4 py-2">إكسسواراتك</span></div></div><div className="relative aspect-[4/3] overflow-hidden bg-wood-light md:order-1"><Image src={detailImage} alt="علاقة أسيار الخشبية في مدخل عصري مع جاكيت ومفاتيح" fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" /></div></div></section>

      <section id="order" className="order-2 mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        {submitted ? (
          <div className="mx-auto max-w-2xl overflow-hidden border-2 border-blackwood bg-card shadow-[0_12px_32px_rgba(31,6,4,0.12)] transition-all">
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
                يسعدنا اختيارك لمنتجات <strong>أسيار</strong>. نتمنى لك تجربة استثنائية مع هذه القطعة الخشبية المصنوعة بعناية.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="border border-burgundy/15 bg-wood-light/20 p-5">
                <h3 className="font-serif text-lg font-bold text-burgundy border-b border-burgundy/15 pb-3 mb-4">
                  ملخص الطلب
                </h3>
                <div className="space-y-3 text-sm text-burgundy">
                  <div className="flex justify-between">
                    <span className="text-burgundy/60">المنتج:</span>
                    <span className="font-semibold">معلق الملابس العصري × {quantity}</span>
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

              <div className="flex items-start gap-4 border border-wood/40 bg-cream p-4 text-xs text-burgundy/80">
                <Truck className="h-6 w-6 shrink-0 text-wood" />
                <p className="leading-relaxed">
                  <strong>التأكيد والتوصيل:</strong> سيقوم فريق أسيار بالتواصل معك هاتفياً عبر الرقم المذكور لتأكيد معلومات الشحن. الدفع يتم عند الاستلام.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="flex-1 border border-burgundy px-6 py-3.5 text-center text-sm font-semibold text-burgundy transition-colors hover:bg-wood-light/30"
                >
                  طلب قطعة أخرى
                </button>
                <a
                  href="#top"
                  className="flex-1 bg-burgundy px-6 py-3.5 text-center text-sm font-semibold text-cream transition-colors hover:bg-blackwood"
                >
                  العودة للرئيسية
                </a>
              </div>
            </div>
          </div>
        ) : limitReached ? (
          <div className="mx-auto max-w-2xl overflow-hidden border-2 border-blackwood bg-card shadow-[0_12px_32px_rgba(31,6,4,0.12)]">
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
              <a href="#top" className="inline-block bg-burgundy px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-blackwood">
                العودة للرئيسية
              </a>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl overflow-hidden border-2 border-blackwood bg-card shadow-[0_8px_0_rgba(31,6,4,0.12)]">
            <div className="border-b border-blackwood/15 px-5 py-6 md:px-8">
              <h2 className="font-serif text-3xl text-burgundy">أكمل طلبك</h2>
              <p className="mt-2 text-sm text-burgundy/60">أدخل معلوماتك وسنتواصل معك لتأكيد الطلب.</p>
            </div>
            <form onSubmit={submitOrder} className="space-y-4 p-5 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-burgundy">الاسم واللقب
                  <input required name="name" placeholder="الاسم واللقب" className="mt-2 w-full border border-burgundy/35 bg-cream px-4 py-3 text-right outline-none focus:border-burgundy" />
                </label>
                <label className="text-sm text-burgundy">رقم الهاتف
                  <input required name="phone" type="tel" placeholder="05 xx xx xx xx" className="mt-2 w-full border border-burgundy/35 bg-cream px-4 py-3 text-right outline-none focus:border-burgundy" />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-burgundy">الولاية
                  <select required value={wilaya} onChange={(event) => setWilaya(event.target.value)} className="mt-2 w-full border border-burgundy/35 bg-wood-light px-4 py-3 text-right">
                    <option value="" disabled>اختر الولاية</option>
                    {wilayas.map((item, index) => <option key={`${item}-${index}`} value={item}>{index + 1} - {item}</option>)}
                  </select>
                </label>
                <label className="text-sm text-burgundy">البلدية
                  <input required name="commune" placeholder="اكتب اسم البلدية" className="mt-2 w-full border border-burgundy/35 bg-wood-light px-4 py-3 text-right outline-none focus:border-burgundy" />
                </label>
              </div>
              <label className="block text-sm text-burgundy">عنوان التوصيل
                <input required name="address" placeholder="الحي، الشارع، رقم المنزل" className="mt-2 w-full border border-burgundy/35 bg-cream px-4 py-3 text-right outline-none focus:border-burgundy" />
              </label>
              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-semibold text-burgundy">طريقة التوصيل</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={`cursor-pointer border px-4 py-4 ${delivery === 'domicile' ? 'border-burgundy bg-wood-light' : 'border-burgundy/25'}`}>
                    <input type="radio" name="delivery" checked={delivery === 'domicile'} onChange={() => setDelivery('domicile')} className="ml-2 accent-burgundy" />التوصيل للمنزل <span className="block pr-6 text-xs text-burgundy/60">{formatDzd(shippingRates[wilaya]?.domicile ?? 700)}</span>
                  </label>
                  <label className={`cursor-pointer border px-4 py-4 ${delivery === 'desk' ? 'border-burgundy bg-wood-light' : 'border-burgundy/25'}`}>
                    <input type="radio" name="delivery" checked={delivery === 'desk'} onChange={() => setDelivery('desk')} className="ml-2 accent-burgundy" />نقطة الاستلام <span className="block pr-6 text-xs text-burgundy/60">{formatDzd(shippingRates[wilaya]?.desk ?? 450)}</span>
                  </label>
                </div>
              </fieldset>
              <div className="mt-6 border-y border-burgundy/15 py-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-burgundy">ملخص الطلب</span>
                  <ChevronDown className="h-5 w-5 text-burgundy" />
                </div>
                <div className="mt-5 flex items-center justify-between border-b border-burgundy/10 pb-4 text-sm">
                  <span>منظم المفاتيح المعلّق × {quantity}</span>
                  <span>{formatDzd(productPrice * quantity)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>التوصيل</span>
                  <span>{wilaya ? formatDzd(shipping) : 'اختر الولاية'}</span>
                </div>
                <div className="mt-5 flex items-center justify-between text-lg font-bold text-burgundy">
                  <span>المجموع الإجمالي</span>
                  <span>{formatDzd(total)}</span>
                </div>
              </div>
              {orderError && (
                <div role="alert" className="border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-700">
                  {orderError}
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center border border-burgundy/30">
                  <button type="button" aria-label="إنقاص الكمية" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-burgundy" disabled={submitting || quantity <= 1}><Minus className="h-4 w-4" /></button>
                  <span className="min-w-10 text-center font-semibold">{quantity}</span>
                  <button type="button" aria-label="زيادة الكمية" onClick={() => setQuantity(Math.min(15, quantity + 1))} className="px-4 py-3 text-burgundy disabled:opacity-40" disabled={submitting || quantity >= 15}><Plus className="h-4 w-4" /></button>
                </div>
                <button type="submit" disabled={submitting} className="flex-1 bg-burgundy px-6 py-4 font-semibold tracking-[0.12em] text-cream transition-colors hover:bg-blackwood disabled:opacity-60 flex items-center justify-center gap-2">
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

      <footer className="order-6 bg-blackwood px-5 py-10 text-cream md:px-10"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right"><div><a href="#top" dir="ltr" className="font-serif text-3xl font-bold tracking-[-0.08em]">asyar<span className="text-wood">.</span></a><p className="mt-2 text-xs text-cream/50">متجذّرون في التراث. نصنع للغد.</p></div><p className="text-xs text-cream/40">© 2026 أسيار · كل قطعة لها حكاية</p></div></footer>
    </main>
  )
}
