-- Run this once in the Supabase SQL Editor for existing projects.
ALTER TABLE public.product_settings
  ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'صلاتكِ براحة، أينما كنتِ.',
  ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT 'طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.',
  ADD COLUMN IF NOT EXISTS brand_name TEXT DEFAULT 'نُسكي — NOUSKI',
  ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية';

UPDATE public.product_settings
SET
  title = COALESCE(title, 'صلاتكِ براحة، أينما كنتِ.'),
  subtitle = COALESCE(subtitle, 'طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.'),
  brand_name = COALESCE(brand_name, 'نُسكي — NOUSKI'),
  footer_text = COALESCE(footer_text, 'طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية')
WHERE id = 'default';

NOTIFY pgrst, 'reload schema';
