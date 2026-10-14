-- =============================================================================
-- MELHOR FORMA PLAY | ESQUEMA DE BANCO DE DADOS & SEGURANÇA SUPABASE (POSTGRES)
-- FASE 3: PLATAFORMA HÍBRIDA FREEMIUM + PREMIUM & ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilita extensão de UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA PROFILES (Perfis dos Usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'trainer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA PRODUCTS (Planos e Assinaturas Disponíveis)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'subscription' CHECK (tipo IN ('subscription', 'one_time')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA SUBSCRIPTIONS (Assinaturas Comerciais dos Usuários)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'active', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ NOT NULL,
  payment_provider_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA ENTITLEMENTS (Direitos de Acesso Efetivos Verificados no Servidor)
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA WORKOUT_ACCESS (Classificação de Conteúdo: Free vs Premium)
CREATE TABLE IF NOT EXISTS public.workout_access (
  workout_id TEXT PRIMARY KEY,
  access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'premium')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA USER_PROGRESS (Histórico e Execução de Treinos Concluídos)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workout_id TEXT NOT NULL,
  exercise_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0
);

-- 7. TABELA USER_FAVORITES (Sessões Favoritas do Aluno)
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workout_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, workout_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURANÇA NO BANCO DE DADOS
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para PROFILES
-- Usuário autenticado só visualiza e atualiza seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Políticas para PRODUCTS
-- Qualquer usuário (anônimo ou autenticado) pode listar produtos ativos
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (status = 'active');

-- 3. Políticas para SUBSCRIPTIONS
-- Usuário só pode ler sua própria assinatura (nunca alterar via client!)
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Alterações de assinatura só são permitidas via Service Role (Webhook / Backend)
-- Não há política de INSERT/UPDATE pública para clientes.

-- 4. Políticas para ENTITLEMENTS
-- Usuário só pode ler seus direitos de acesso concedidos pelo backend
CREATE POLICY "entitlements_select_own" ON public.entitlements
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Políticas para WORKOUT_ACCESS
-- Todos podem consultar se o treino é Free ou Premium
CREATE POLICY "workout_access_select_all" ON public.workout_access
  FOR SELECT USING (true);

-- Apenas admins/treinadores podem alterar classificação (via service role ou perfil verificado)
CREATE POLICY "workout_access_update_admin" ON public.workout_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('trainer', 'admin')
    )
  );

-- 6. Políticas para USER_PROGRESS
-- Aluno pode gerenciar exclusivamente seu próprio progresso
CREATE POLICY "user_progress_all_own" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- 7. Políticas para USER_FAVORITES
-- Aluno pode adicionar e remover seus próprios favoritos
CREATE POLICY "user_favorites_all_own" ON public.user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- SEED INICIAL: PRODUTOS & CLASSIFICAÇÃO DOS 72 TREINOS
-- =============================================================================

INSERT INTO public.products (id, nome, tipo, status, description)
VALUES ('prod_mf_play_premium', 'Melhor Forma Play Premium', 'subscription', 'active', 'Acesso completo às 72 sessões, todas as coleções e suporte do treinador.')
ON CONFLICT (id) DO NOTHING;

-- 12 Sessões Gratuitas Iniciais (2 de cada coleção)
INSERT INTO public.workout_access (workout_id, access_level) VALUES
  ('w-40p-01', 'free'),
  ('w-40p-05', 'free'),
  ('w-sup-01', 'free'),
  ('w-sup-05', 'free'),
  ('w-inf-01', 'free'),
  ('w-inf-05', 'free'),
  ('w-fb-01', 'free'),
  ('w-fb-05', 'free'),
  ('w-cardio-01', 'free'),
  ('w-cardio-05', 'free'),
  ('w-mob-01', 'free'),
  ('w-mob-05', 'free')
ON CONFLICT (workout_id) DO UPDATE SET access_level = 'free';
