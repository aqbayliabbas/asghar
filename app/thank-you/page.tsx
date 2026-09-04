import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <main dir="rtl" className="flex min-h-screen flex-col bg-cream text-blackwood">
      <header className="border-b border-burgundy/15 bg-cream px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <Link href="/" dir="ltr" className="font-serif text-3xl font-bold tracking-[-0.08em] text-burgundy">
            asyar<span className="text-wood">.</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full overflow-hidden border-2 border-blackwood bg-card shadow-[0_12px_32px_rgba(31,6,4,0.15)]">
          <div className="bg-burgundy px-6 py-12 text-center text-cream">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-wood-light text-burgundy shadow-inner">
              <CheckCircle2 className="h-12 w-12 text-burgundy" />
            </div>
            <span className="inline-block rounded-full bg-wood/30 px-4 py-1 text-xs tracking-widest text-wood-light font-medium">
              تم تسجيل طلبك بنجاح
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-5xl">
              شكراً لك، تم تسجيل طلبك
            </h1>
            <p className="mt-4 text-base leading-relaxed text-cream/90 max-w-lg mx-auto">
              يسعدنا اختيارك لمنتجات <strong>أسيار</strong>. نتمنى لك تجربة استثنائية مع هذه القطعة الخشبية المصنوعة بعناية.
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-6">
            <div className="flex items-start gap-4 border border-wood/40 bg-wood-light/20 p-5 text-sm text-burgundy">
              <Truck className="h-7 w-7 shrink-0 text-wood" />
              <div>
                <strong className="block font-serif text-base text-burgundy">مرحلة التأكيد والتوصيل</strong>
                <p className="mt-1 leading-relaxed text-burgundy/80">
                  سيقوم فريق خدمة العملاء بالتواصل معكم عبر الهاتف خلال 24 ساعة لتأكيد عنوان الشحن وتفاصيل الطرد. الدفع يتم عند الاستلام.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center text-xs text-burgundy/75 border-y border-burgundy/15 py-6">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-wood" />
                <span>ضمان الجودة والأصالة</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-wood" />
                <span>خشب جوز طبيعي 100%</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="inline-block w-full bg-burgundy px-8 py-4 font-semibold tracking-[0.12em] text-cream transition-colors hover:bg-blackwood"
              >
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-blackwood px-5 py-8 text-cream md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-right text-xs text-cream/50">
          <div>
            <Link href="/" dir="ltr" className="font-serif text-2xl font-bold tracking-[-0.08em] text-cream">
              asyar<span className="text-wood">.</span>
            </Link>
            <p className="mt-1">متجذّرون في التراث. نصنع للغد.</p>
          </div>
          <p>© 2026 أسيار · كل قطعة لها حكاية</p>
        </div>
      </footer>
    </main>
  )
}
