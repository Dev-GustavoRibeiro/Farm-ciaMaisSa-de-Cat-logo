-- =====================================================
-- ADICIONAR TABELA DE PERFIS DE CLIENTES
-- =====================================================
-- Execute este script após o database.sql
-- 
-- IMPORTANTE: No painel do Supabase, vá em:
-- Authentication > Providers > Email
-- E desmarque "Confirm email" para permitir login imediato
-- =====================================================

-- Remover políticas existentes se houver (para recriar)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Tabela de perfis de clientes
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  address TEXT,
  neighborhood TEXT,
  complement TEXT,
  city TEXT DEFAULT 'Ipirá',
  state TEXT DEFAULT 'BA',
  zipcode TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);

-- Trigger para updated_at (só criar se a função existir)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON customer_profiles;
  CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN undefined_function THEN
  RAISE NOTICE 'Função update_updated_at_column não encontrada. Execute database.sql primeiro.';
END $$;

-- Habilitar RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customer_profiles
-- Clientes podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON customer_profiles
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON customer_profiles
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON customer_profiles
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON customer_profiles
  FOR SELECT TO authenticated 
  USING (public.is_admin());

-- Função para criar perfil automaticamente quando um usuário é criado
-- Esta função é executada via trigger no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Criar trigger para novos usuários (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentário
COMMENT ON TABLE customer_profiles IS 'Perfis dos clientes com endereço salvo para facilitar compras';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
