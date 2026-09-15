-- =====================================================================
-- SUPABASE SETUP SCRIPT FOR ASYAR STORE
-- Copy & execute this entire script in your Supabase SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- =====================================================================

-- 1. CREATE STORAGE BUCKET FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable public read access for storage objects in 'product-images'
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Enable upload access for storage objects in 'product-images'
DROP POLICY IF EXISTS "Allow Upload Product Images" ON storage.objects;
CREATE POLICY "Allow Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Enable update access for storage objects in 'product-images'
DROP POLICY IF EXISTS "Allow Update Product Images" ON storage.objects;
CREATE POLICY "Allow Update Product Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Enable delete access for storage objects in 'product-images'
DROP POLICY IF EXISTS "Allow Delete Product Images" ON storage.objects;
CREATE POLICY "Allow Delete Product Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');


-- 2. TABLE FOR PRODUCT & SITE SETTINGS (PRICE, TITLE, DESCRIPTION, FOOTER, ETC.)
CREATE TABLE IF NOT EXISTS product_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  price NUMERIC NOT NULL DEFAULT 2600,
  title TEXT DEFAULT 'صلاتكِ براحة، أينما كنتِ.',
  subtitle TEXT DEFAULT 'طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.',
  brand_name TEXT DEFAULT 'نُسكي — NOUSKI',
  footer_text TEXT DEFAULT 'طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure text columns exist if table was created previously
ALTER TABLE product_settings ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'صلاتكِ براحة، أينما كنتِ.';
ALTER TABLE product_settings ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT 'طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.';
ALTER TABLE product_settings ADD COLUMN IF NOT EXISTS brand_name TEXT DEFAULT 'نُسكي — NOUSKI';
ALTER TABLE product_settings ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية';

-- Seed default product settings
INSERT INTO product_settings (id, price, title, subtitle, brand_name, footer_text)
VALUES ('default', 2600, 'صلاتكِ براحة، أينما كنتِ.', 'طقم صلاة أنيق وخفيف يجمع كل ما تحتاجينه في حقيبة واحدة صغيرة — جاهز للعمل، الجامعة أو السفر.', 'نُسكي — NOUSKI', 'طقم الصلاة المتنقل الفاخر · توصيل لـ 69 ولاية')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE product_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select product_settings" ON product_settings;
CREATE POLICY "Public select product_settings" ON product_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public all product_settings" ON product_settings;
CREATE POLICY "Public all product_settings" ON product_settings FOR ALL USING (true);


-- 3. TABLE FOR PRODUCT COLORS (ACTIVATION / DEACTIVATION)
CREATE TABLE IF NOT EXISTS product_colors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure id column is TEXT if created previously as UUID
ALTER TABLE product_colors ALTER COLUMN id TYPE TEXT;

ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select product_colors" ON product_colors;
CREATE POLICY "Public select product_colors" ON product_colors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public all product_colors" ON product_colors;
CREATE POLICY "Public all product_colors" ON product_colors FOR ALL USING (true);

-- Seed default colors if table is empty
INSERT INTO product_colors (id, name, hex, is_active, display_order)
SELECT * FROM (VALUES
  ('c1000000-0000-0000-0000-000000000001', 'وردي', '#efa9ba', true, 1),
  ('c1000000-0000-0000-0000-000000000002', 'عنابي', '#761d49', true, 2),
  ('c1000000-0000-0000-0000-000000000003', 'زيتوني', '#666d4d', true, 3),
  ('c1000000-0000-0000-0000-000000000004', 'لافندر', '#9d82c8', true, 4),
  ('c1000000-0000-0000-0000-000000000005', 'بيج', '#e4c9a4', true, 5),
  ('c1000000-0000-0000-0000-000000000006', 'أزرق', '#183552', true, 6)
) AS v(id, name, hex, is_active, display_order)
WHERE NOT EXISTS (SELECT 1 FROM product_colors);


-- 4. TABLE FOR PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  storage_path TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure id column is TEXT if created previously as UUID
ALTER TABLE product_images ALTER COLUMN id TYPE TEXT;

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select product_images" ON product_images;
CREATE POLICY "Public select product_images" ON product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public all product_images" ON product_images;
CREATE POLICY "Public all product_images" ON product_images FOR ALL USING (true);

-- Seed default images if table is empty
INSERT INTO product_images (id, url, alt, is_active, display_order)
SELECT * FROM (VALUES
  ('f1000000-0000-0000-0000-000000000001', '/nouski/olive-look.png', 'سيدة ترتدي طقم صلاة نُسكي الزيتوني', true, 1),
  ('f1000000-0000-0000-0000-000000000002', '/nouski/set-flatlay.png', 'مكونات طقم صلاة نُسكي مرتبة على سجادة الصلاة', true, 2),
  ('f1000000-0000-0000-0000-000000000003', '/nouski/prayer-garments.png', 'طقمَا صلاة نُسكي باللون الزيتوني', true, 3),
  ('f1000000-0000-0000-0000-000000000004', '/nouski/color-pouches.png', 'حقائب نُسكي بألوان وردية وعنابية وبيج ولافندر', true, 4)
) AS v(id, url, alt, is_active, display_order)
WHERE NOT EXISTS (SELECT 1 FROM product_images);


-- 5. ADD colors_per_item COLUMN TO ORDERS TABLE
-- Stores an array of color names, one per ordered item (e.g. ["وردي","عنابي","وردي"])
-- Only populated when quantity > 1; single-item orders continue to embed color in address.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS colors_per_item JSONB DEFAULT NULL;
