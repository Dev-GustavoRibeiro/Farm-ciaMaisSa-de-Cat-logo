-- =====================================================
-- FARMÁCIA MAIS SAÚDE - SCRIPT ÚNICO DE INSTALAÇÃO
-- =====================================================
-- Execute este arquivo único no SQL Editor do Supabase
-- Ele irá limpar o banco antigo e criar tudo do zero
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPEZA
-- =====================================================

-- Remover views antigas
DROP VIEW IF EXISTS products_with_category CASCADE;
DROP VIEW IF EXISTS orders_summary CASCADE;
DROP VIEW IF EXISTS best_selling_products CASCADE;

-- Remover funções antigas
DROP FUNCTION IF EXISTS public.generate_unique_slug(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_order_total(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- =====================================================
-- PARTE 2: TABELAS (com IF NOT EXISTS para segurança)
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort INT DEFAULT 0,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2),
  cost_price NUMERIC(10,2),
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  sku TEXT,
  barcode TEXT,
  whatsapp_message TEXT
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  customer_city TEXT DEFAULT 'Ipirá',
  customer_state TEXT DEFAULT 'BA',
  customer_zipcode TEXT,
  customer_notes TEXT,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  shipping_amount NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method TEXT DEFAULT 'whatsapp',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  tracking_code TEXT,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price_at_purchase NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
  active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_applied NUMERIC(10,2) NOT NULL
);

-- =====================================================
-- PARTE 3: ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(active);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- =====================================================
-- PARTE 4: FUNÇÕES (COM SEARCH_PATH SEGURO)
-- =====================================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND active = true
  );
END;
$$;

-- Função para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PARTE 5: RLS - HABILITAR EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 6: RLS - REMOVER POLÍTICAS ANTIGAS
-- =====================================================

-- Categories
DO $$ BEGIN DROP POLICY IF EXISTS "Public can view active categories" ON categories; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all categories" ON categories; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can insert categories" ON categories; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update categories" ON categories; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete categories" ON categories; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage categories" ON categories; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Products
DO $$ BEGIN DROP POLICY IF EXISTS "Public can view active products" ON products; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all products" ON products; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can insert products" ON products; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update products" ON products; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete products" ON products; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage products" ON products; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Product Images
DO $$ BEGIN DROP POLICY IF EXISTS "Public can view product images" ON product_images; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can insert product images" ON product_images; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update product images" ON product_images; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete product images" ON product_images; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage product images" ON product_images; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Orders
DO $$ BEGIN DROP POLICY IF EXISTS "Public can create orders" ON orders; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all orders" ON orders; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update orders" ON orders; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete orders" ON orders; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can update orders" ON orders; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can delete orders" ON orders; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Order Items
DO $$ BEGIN DROP POLICY IF EXISTS "Public can create order items" ON order_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all order items" ON order_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update order items" ON order_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete order items" ON order_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage order items" ON order_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Testimonials
DO $$ BEGIN DROP POLICY IF EXISTS "Public can view active testimonials" ON testimonials; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Public can create testimonials" ON testimonials; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all testimonials" ON testimonials; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update testimonials" ON testimonials; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete testimonials" ON testimonials; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage testimonials" ON testimonials; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Settings
DO $$ BEGIN DROP POLICY IF EXISTS "Public can view settings" ON settings; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can insert settings" ON settings; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update settings" ON settings; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete settings" ON settings; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage settings" ON settings; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Admin Users
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can insert admin users" ON admin_users; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update admin users" ON admin_users; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete admin users" ON admin_users; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage admin users" ON admin_users; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Activity Logs
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can create activity logs" ON activity_logs; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can create activity logs" ON activity_logs; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Coupons
DO $$ BEGIN DROP POLICY IF EXISTS "Public can view active coupons" ON coupons; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all coupons" ON coupons; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can insert coupons" ON coupons; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can update coupons" ON coupons; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can delete coupons" ON coupons; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated can manage coupons" ON coupons; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Coupon Usage
DO $$ BEGIN DROP POLICY IF EXISTS "Public can create coupon usage" ON coupon_usage; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view coupon usage" ON coupon_usage; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- =====================================================
-- PARTE 7: RLS - CRIAR NOVAS POLÍTICAS SEGURAS
-- =====================================================

-- CATEGORIES
CREATE POLICY "categories_public_select" ON categories
  FOR SELECT USING (active = true);

CREATE POLICY "categories_admin_select" ON categories
  FOR SELECT TO authenticated 
  USING (public.is_admin());

CREATE POLICY "categories_admin_insert" ON categories
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update" ON categories
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_delete" ON categories
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- PRODUCTS
CREATE POLICY "products_public_select" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "products_admin_select" ON products
  FOR SELECT TO authenticated 
  USING (public.is_admin());

CREATE POLICY "products_admin_insert" ON products
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update" ON products
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_delete" ON products
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- PRODUCT IMAGES
CREATE POLICY "product_images_public_select" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "product_images_admin_insert" ON product_images
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "product_images_admin_update" ON product_images
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_images_admin_delete" ON product_images
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- ORDERS
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT TO anon, authenticated 
  WITH CHECK (
    customer_name IS NOT NULL AND 
    customer_phone IS NOT NULL AND
    total_amount >= 0
  );

CREATE POLICY "orders_admin_select" ON orders
  FOR SELECT TO authenticated 
  USING (public.is_admin());

CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "orders_admin_delete" ON orders
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- ORDER ITEMS
CREATE POLICY "order_items_public_insert" ON order_items
  FOR INSERT TO anon, authenticated 
  WITH CHECK (
    order_id IS NOT NULL AND
    product_name IS NOT NULL AND
    quantity > 0 AND
    price_at_purchase >= 0
  );

CREATE POLICY "order_items_admin_select" ON order_items
  FOR SELECT TO authenticated 
  USING (public.is_admin());

CREATE POLICY "order_items_admin_update" ON order_items
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "order_items_admin_delete" ON order_items
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- TESTIMONIALS
CREATE POLICY "testimonials_public_select" ON testimonials
  FOR SELECT USING (active = true);

CREATE POLICY "testimonials_public_insert" ON testimonials
  FOR INSERT TO anon, authenticated 
  WITH CHECK (
    customer_name IS NOT NULL AND
    rating >= 1 AND rating <= 5 AND
    active = false
  );

CREATE POLICY "testimonials_admin_select" ON testimonials
  FOR SELECT TO authenticated 
  USING (public.is_admin());

CREATE POLICY "testimonials_admin_update" ON testimonials
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "testimonials_admin_delete" ON testimonials
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- SETTINGS
CREATE POLICY "settings_public_select" ON settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_insert" ON settings
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "settings_admin_update" ON settings
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "settings_admin_delete" ON settings
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- ADMIN USERS
CREATE POLICY "admin_users_self_select" ON admin_users
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_users_admin_insert" ON admin_users
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_users_admin_update" ON admin_users
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_users_admin_delete" ON admin_users
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- ACTIVITY LOGS
CREATE POLICY "activity_logs_admin_select" ON activity_logs
  FOR SELECT TO authenticated 
  USING (public.is_admin());

CREATE POLICY "activity_logs_admin_insert" ON activity_logs
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin() AND user_id = auth.uid());

-- COUPONS
CREATE POLICY "coupons_public_select" ON coupons
  FOR SELECT USING (active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "coupons_admin_select" ON coupons
  FOR SELECT TO authenticated 
  USING (public.is_admin());

CREATE POLICY "coupons_admin_insert" ON coupons
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "coupons_admin_update" ON coupons
  FOR UPDATE TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "coupons_admin_delete" ON coupons
  FOR DELETE TO authenticated 
  USING (public.is_admin());

-- COUPON USAGE
CREATE POLICY "coupon_usage_public_insert" ON coupon_usage
  FOR INSERT TO anon, authenticated 
  WITH CHECK (
    coupon_id IS NOT NULL AND
    order_id IS NOT NULL AND
    discount_applied >= 0
  );

CREATE POLICY "coupon_usage_admin_select" ON coupon_usage
  FOR SELECT TO authenticated 
  USING (public.is_admin());

-- =====================================================
-- PARTE 8: VIEWS (COM SECURITY INVOKER)
-- =====================================================

CREATE OR REPLACE VIEW products_with_category 
WITH (security_invoker = on)
AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

CREATE OR REPLACE VIEW orders_summary 
WITH (security_invoker = on)
AS
SELECT 
  o.*,
  COUNT(oi.id) as total_items,
  SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

CREATE OR REPLACE VIEW best_selling_products 
WITH (security_invoker = on)
AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  COALESCE(SUM(oi.quantity), 0) as total_sold,
  COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'refunded')
GROUP BY p.id, p.name, p.slug, p.price
ORDER BY total_sold DESC;

-- =====================================================
-- PARTE 9: DADOS INICIAIS
-- =====================================================

-- Configurações padrão
INSERT INTO settings (key, value, description) VALUES
  ('store_info', '{"name": "Farmácia Mais Saúde", "description": "Sua farmácia de confiança em Ipirá", "slogan": "Cuidando da sua saúde"}', 'Informações básicas'),
  ('contact', '{"phone": "75991357869", "whatsapp": "5575991357869", "address": "Ipirá - BA"}', 'Contato'),
  ('business_hours', '{"weekdays": "07:00 às 21:00", "saturday": "07:00 às 21:00", "sunday": "08:00 às 12:00"}', 'Horário'),
  ('delivery', '{"enabled": true, "free_threshold": 50.00, "default_fee": 5.00}', 'Entrega'),
  ('whatsapp', '{"default_message": "Olá! Gostaria de fazer um pedido na Farmácia Mais Saúde."}', 'WhatsApp'),
  ('theme', '{"primary_color": "#1e3a8a", "secondary_color": "#dc2626"}', 'Cores')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Categorias
INSERT INTO categories (name, slug, description, sort, active) VALUES
  ('Medicamentos', 'medicamentos', 'Medicamentos diversos', 1, true),
  ('Higiene Pessoal', 'higiene-pessoal', 'Produtos de higiene', 2, true),
  ('Beleza e Cosméticos', 'beleza-cosmeticos', 'Produtos de beleza', 3, true),
  ('Vitaminas e Suplementos', 'vitaminas-suplementos', 'Vitaminas e suplementos', 4, true),
  ('Bebês e Crianças', 'bebes-criancas', 'Produtos infantis', 5, true),
  ('Cuidados com a Saúde', 'cuidados-saude', 'Equipamentos de saúde', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Produtos de exemplo
DO $$
DECLARE cat_med UUID; cat_hig UUID; cat_bel UUID; cat_vit UUID;
BEGIN
  SELECT id INTO cat_med FROM categories WHERE slug = 'medicamentos' LIMIT 1;
  SELECT id INTO cat_hig FROM categories WHERE slug = 'higiene-pessoal' LIMIT 1;
  SELECT id INTO cat_bel FROM categories WHERE slug = 'beleza-cosmeticos' LIMIT 1;
  SELECT id INTO cat_vit FROM categories WHERE slug = 'vitaminas-suplementos' LIMIT 1;

  IF cat_med IS NOT NULL THEN
    INSERT INTO products (name, slug, description, price, active, category_id) VALUES
      ('Dipirona 500mg', 'dipirona-500mg', 'Analgésico - 10 comprimidos', 8.90, true, cat_med),
      ('Paracetamol 750mg', 'paracetamol-750mg', 'Analgésico - 20 comprimidos', 12.50, true, cat_med)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  IF cat_hig IS NOT NULL THEN
    INSERT INTO products (name, slug, description, price, active, category_id) VALUES
      ('Sabonete Antibacteriano', 'sabonete-antibacteriano', 'Limpeza profunda - 90g', 4.50, true, cat_hig),
      ('Creme Dental Colgate', 'creme-dental-colgate', 'Proteção anticáries - 90g', 6.90, true, cat_hig)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  IF cat_bel IS NOT NULL THEN
    INSERT INTO products (name, slug, description, price, active, category_id) VALUES
      ('Protetor Solar FPS 50', 'protetor-solar-fps50', 'Proteção UVA/UVB - 120ml', 45.90, true, cat_bel)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  IF cat_vit IS NOT NULL THEN
    INSERT INTO products (name, slug, description, price, active, category_id) VALUES
      ('Vitamina C 1000mg', 'vitamina-c-1000mg', 'Reforço imunológico - 30 comp', 28.90, true, cat_vit)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- Depoimentos
INSERT INTO testimonials (customer_name, rating, comment, active) VALUES
  ('Maria Silva', 5, 'Excelente atendimento! Entrega super rápida.', true),
  ('João Santos', 5, 'Farmácia de confiança em Ipirá!', true),
  ('Ana Oliveira', 4, 'Muito prático pedir pelo WhatsApp.', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PARTE 10: CONFIGURAR PRIMEIRO ADMIN
-- =====================================================
-- Após criar um usuário no Supabase Auth, execute:
--
-- INSERT INTO admin_users (user_id, name, role, active)
-- SELECT id, email, 'admin', true
-- FROM auth.users
-- ORDER BY created_at ASC
-- LIMIT 1
-- ON CONFLICT (user_id) DO UPDATE SET active = true, role = 'admin';
-- =====================================================

-- FIM DO SCRIPT
SELECT 'Banco de dados criado com sucesso!' as status;
