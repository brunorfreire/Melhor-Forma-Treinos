-- =====================================================================
-- MELHOR FORMA PLAY 40+ | ESQUEMA DE SEGURANÇA E BANCO DE DADOS (SUPABASE)
-- VERSÃO AUDITADA DEFINITIVA:
-- 1. Políticas RLS de auditoria específicas (INSERT, UPDATE e DELETE exclusivo para admin)
-- 2. Promoção do primeiro administrador imune a bloqueios indevidos do trigger
-- 3. Revogação de acesso administrativa imediata no banco sem depender de expiração de JWT
-- 4. Isolamento estrito de conteúdo Free vs Premium (tabelas, itens e exercícios exclusivos)
-- 5. Suporte a tabela de direitos/compras (user_entitlements) com bloqueio imediato pós-reembolso
-- 6. Preservação de autoria nas 32 aprovações legadas sem atribuição indevida ao admin importador
-- 7. Compatibilidade 100% de esquema (target_muscle/muscle_group e description/instructions/cautions)
-- 8. Storage particionado: bucket público e bucket privado/protegido (aceitando GIF, WebP e MP4)
-- =====================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM PERSONALIZADOS
DO $$ BEGIN
  CREATE TYPE public.app_user_role AS ENUM ('student', 'trainer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.biomechanical_status_type AS ENUM ('validado', 'pendente_revisao', 'sem_avaliacao');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.entitlement_status_type AS ENUM ('active', 'expired', 'canceled', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA DE PERFIS DE USUÁRIO (PROFILES)
-- Utiliza app_role próprio para não colidir nem sobrescrever o role do JWT do Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  app_role public.app_user_role NOT NULL DEFAULT 'student',
  cref TEXT,
  avatar_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE DIREITOS E COMPRAS (USER_ENTITLEMENTS)
-- Garante validação real de compras avulsas, assinaturas e revogação imediata em caso de cancelamento/reembolso
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_type TEXT NOT NULL CHECK (entitlement_type IN ('subscription', 'lifetime', 'single_workout', 'trainer_granted')),
  resource_id TEXT, -- NULL para acesso global Premium, ou workout_id específico
  status public.entitlement_status_type NOT NULL DEFAULT 'active',
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FUNÇÕES DE SEGURANÇA COM SEARCH_PATH EXPLÍCITO (ANTI-HIJACKING & ANTI-RECURSÃO)

-- 5.1. current_app_role()
-- Consulta estritamente a tabela profiles em tempo real.
-- CORREÇÃO OBRIGATÓRIA: Não possui fallback para claims antigas em token se o perfil não existir no banco!
-- O servidor é a única fonte verificada de autorização.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS public.app_user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_db_role public.app_user_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'student'::public.app_user_role;
  END IF;

  -- Consulta exclusiva e em tempo real na tabela profiles
  SELECT app_role INTO v_db_role FROM public.profiles WHERE id = auth.uid();
  IF v_db_role IS NOT NULL THEN
    RETURN v_db_role;
  END IF;

  -- Se não possui perfil no banco, NUNCA conceder papéis privilegiados com base em claims antigas do token
  RETURN 'student'::public.app_user_role;
END;
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO anon, authenticated, service_role;

-- 5.2. has_global_premium_access()
-- Avalia se o usuário autenticado possui direito GLOBAL a todo o catálogo Premium (assinatura ou equipe).
-- CORREÇÃO OBRIGATÓRIA: Compras avulsas (single_workout) NÃO concedem acesso global!
-- Reembolsos e cancelamentos bloqueiam o acesso imediatamente.
CREATE OR REPLACE FUNCTION public.has_global_premium_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_role public.app_user_role;
  v_has_global_entitlement BOOLEAN := FALSE;
  v_is_refunded_or_canceled BOOLEAN := FALSE;
  v_sub_status TEXT;
BEGIN
  -- 1. Equipe técnica (treinadores e administradores verificados no banco)
  v_role := public.current_app_role();
  IF v_role IN ('trainer', 'admin') THEN
    RETURN TRUE;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Bloqueio imediato se houver reembolso/cancelamento de direito global
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = auth.uid()
      AND (resource_id IS NULL OR entitlement_type IN ('subscription', 'lifetime'))
      AND status IN ('refunded', 'canceled')
      AND updated_at >= (
        SELECT COALESCE(MAX(ue2.updated_at), '1970-01-01'::timestamptz)
        FROM public.user_entitlements ue2
        WHERE ue2.user_id = auth.uid()
          AND (ue2.resource_id IS NULL OR ue2.entitlement_type IN ('subscription', 'lifetime'))
          AND ue2.status = 'active'
      )
  ) INTO v_is_refunded_or_canceled;

  IF v_is_refunded_or_canceled THEN
    RETURN FALSE;
  END IF;

  -- 3. Tabela de direitos (user_entitlements) - APENAS direitos globais (resource_id IS NULL ou global)
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND (valid_until IS NULL OR valid_until > NOW())
      AND (
        (resource_id IS NULL AND entitlement_type IN ('subscription', 'lifetime', 'trainer_granted'))
        OR resource_id = '*'
      )
  ) INTO v_has_global_entitlement;

  IF v_has_global_entitlement THEN
    RETURN TRUE;
  END IF;

  -- 4. Tabela profiles (apenas status 'active' ou 'trialing', rejeitando 'free', 'canceled', 'refunded')
  SELECT subscription_status INTO v_sub_status FROM public.profiles WHERE id = auth.uid();
  IF v_sub_status IN ('active', 'trialing') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Alias de compatibilidade
CREATE OR REPLACE FUNCTION public.current_user_has_premium_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT public.has_global_premium_access();
$$;

REVOKE ALL ON FUNCTION public.has_global_premium_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_global_premium_access() TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.current_user_has_premium_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_has_premium_access() TO anon, authenticated, service_role;

-- 5.3. can_user_access_workout(p_workout_id TEXT)
-- CORREÇÃO OBRIGATÓRIA: Autorização por recurso individual.
-- Uma compra 'single_workout' libera estritamente o treino com resource_id correspondente.
-- Reembolso específico bloqueia imediatamente aquele recurso.
CREATE OR REPLACE FUNCTION public.can_user_access_workout(p_workout_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_access_level TEXT;
  v_is_workout_refunded BOOLEAN := FALSE;
  v_has_single_entitlement BOOLEAN := FALSE;
BEGIN
  -- 1. Verifica o nível de acesso do treino no catálogo
  SELECT access_level INTO v_access_level 
  FROM public.catalog_workouts 
  WHERE id = p_workout_id;

  -- Treino gratuito é liberado para todos (visitantes, alunos, logados ou não)
  IF v_access_level = 'free' THEN
    RETURN TRUE;
  END IF;

  -- 2. Treinador e Administrador possuem acesso irrestrito
  IF public.current_app_role() IN ('trainer', 'admin') THEN
    RETURN TRUE;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 3. Verifica se este treino específico foi reembolsado/cancelado para este usuário
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = auth.uid()
      AND resource_id = p_workout_id
      AND status IN ('refunded', 'canceled')
      AND updated_at >= (
        SELECT COALESCE(MAX(ue2.updated_at), '1970-01-01'::timestamptz)
        FROM public.user_entitlements ue2
        WHERE ue2.user_id = auth.uid()
          AND ue2.resource_id = p_workout_id
          AND ue2.status = 'active'
      )
  ) INTO v_is_workout_refunded;

  IF v_is_workout_refunded THEN
    RETURN FALSE;
  END IF;

  -- 4. Verifica se possui acesso global ativo (assinatura completa)
  IF public.has_global_premium_access() THEN
    RETURN TRUE;
  END IF;

  -- 5. Autorização por recurso individual (compra avulsa do treino específico)
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = auth.uid()
      AND resource_id = p_workout_id
      AND status = 'active'
      AND (valid_until IS NULL OR valid_until > NOW())
  ) INTO v_has_single_entitlement;

  IF v_has_single_entitlement THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.can_user_access_workout(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_user_access_workout(TEXT) TO anon, authenticated, service_role;

-- 5.4. can_user_access_exercise(p_exercise_id TEXT)
-- CORREÇÃO CRÍTICA (DENY BY DEFAULT):
-- Identificadores nulos, vazios, desconhecidos ou inexistentes retornam estritamente FALSE.
-- Executada como SECURITY DEFINER para consultar relacionamentos e treinos
-- sem ser mascarada pelas políticas RLS da sessão de visitante.
-- Exercícios de treinos gratuitos são liberados.
-- Exercícios de treinos Premium só são liberados se o usuário possuir acesso global
-- ou compra avulsa (single_workout) do treino específico contendo este exercício.
CREATE OR REPLACE FUNCTION public.can_user_access_exercise(p_exercise_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_exists BOOLEAN := FALSE;
  v_is_in_free BOOLEAN := FALSE;
  v_has_purchased_workout BOOLEAN := FALSE;
BEGIN
  -- Regra 0: Validação de parâmetro e existência (DENY BY DEFAULT)
  -- Identificadores nulos, vazios ou desconhecidos são REJEITADOS IMEDIATAMENTE
  IF p_exercise_id IS NULL OR trim(p_exercise_id) = '' THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.central_exercises WHERE id = p_exercise_id
  ) INTO v_exists;

  IF NOT v_exists THEN
    RETURN FALSE;
  END IF;

  -- 1. Equipe técnica (treinador e administrador verificados no banco)
  IF public.current_app_role() IN ('trainer', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- 2. Exercício vinculado a pelo menos um treino GRATUITO (liberado publicamente)
  SELECT EXISTS (
    SELECT 1 
    FROM public.workout_exercise_items wei
    JOIN public.catalog_workouts cw ON cw.id = wei.workout_id
    WHERE wei.exercise_id = p_exercise_id
      AND cw.access_level = 'free'
  ) INTO v_is_in_free;

  IF v_is_in_free THEN
    RETURN TRUE;
  END IF;

  -- 3. Usuário com direito global ativo (assinante premium sem reembolso/cancelamento)
  IF public.has_global_premium_access() THEN
    RETURN TRUE;
  END IF;

  -- 4. Usuário autenticado com compra avulsa (single_workout) do treino específico
  IF auth.uid() IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.workout_exercise_items wei
      JOIN public.user_entitlements ue ON ue.resource_id = wei.workout_id
      WHERE wei.exercise_id = p_exercise_id
        AND ue.user_id = auth.uid()
        AND ue.status = 'active'
        AND (ue.valid_until IS NULL OR ue.valid_until > NOW())
        AND NOT EXISTS (
          SELECT 1 FROM public.user_entitlements ue_ref
          WHERE ue_ref.user_id = auth.uid()
            AND ue_ref.resource_id = wei.workout_id
            AND ue_ref.status IN ('refunded', 'canceled')
            AND ue_ref.updated_at >= ue.updated_at
        )
    ) INTO v_has_purchased_workout;

    IF v_has_purchased_workout THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- 5. DENY BY DEFAULT ABSOLUTO: qualquer exercício não autorizado acima retorna FALSE!
  RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.can_user_access_exercise(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_user_access_exercise(TEXT) TO anon, authenticated, service_role;

-- 5.3. handle_new_user()
-- Gatilho executado no Supabase Auth.
-- SEGURANÇA CRÍTICA: ignora qualquer papel enviado pelo cliente em raw_user_meta_data.
-- Apenas app_metadata (definido no backend ou via operação de serviço) pode definir perfil além de 'student'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_initial_role public.app_user_role := 'student';
BEGIN
  IF (new.raw_app_meta_data->>'app_role') = 'admin' THEN
    v_initial_role := 'admin';
  ELSIF (new.raw_app_meta_data->>'app_role') = 'trainer' THEN
    v_initial_role := 'trainer';
  ELSE
    v_initial_role := 'student';
  END IF;

  INSERT INTO public.profiles (
    id,
    nome,
    email,
    app_role,
    subscription_status,
    cref
  )
  VALUES (
    new.id,
    COALESCE(NULLIF(TRIM(new.raw_user_meta_data->>'nome'), ''), split_part(new.email, '@', 1)),
    new.email,
    v_initial_role,
    'free',
    NULLIF(TRIM(new.raw_user_meta_data->>'cref'), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = COALESCE(NULLIF(TRIM(EXCLUDED.nome), ''), profiles.nome);
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.6. protect_profile_privileged_fields()
-- Trigger de bloqueio que impede que qualquer usuário comum promova a si mesmo
-- ou altere subscription_status, app_role ou id via requisições de frontend.
-- CORREÇÃO CRÍTICA DO TRAP CURRENT_USER:
-- Em funções SECURITY DEFINER, CURRENT_USER muda para o criador da função (ex: postgres).
-- Utiliza SESSION_USER (que identifica o verdadeiro usuário da conexão, ex: authenticator do PostgREST)
-- e flag de contexto local para permitir operações legítimas do DBA ou de promote_user_to_admin().
-- 5.6. protect_profile_privileged_fields()
-- Trigger de bloqueio que impede que qualquer usuário comum promova a si mesmo
-- ou altere subscription_status, app_role ou id via requisições de frontend.
-- CORREÇÃO CRÍTICA: Não depende de flags de sessão arbitrárias definidas pelo cliente.
-- A verificação baseia-se unicamente em SESSION_USER (DBA/postgres), token service_role verificado
-- ou administrador com perfil ativo no banco.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_is_privileged BOOLEAN := FALSE;
BEGIN
  -- 1. Conexão direta de superusuário/DBA no banco (SQL Editor Supabase ou terminal psql)
  -- Nota de Segurança: utiliza SESSION_USER (pois no PostgREST SESSION_USER é 'authenticator')
  IF SESSION_USER IN ('postgres', 'supabase_admin') THEN
    v_is_privileged := TRUE;
  END IF;

  -- 2. Operações de backend através da service_role (token JWT de serviço com assinatura verificada)
  IF auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    v_is_privileged := TRUE;
  END IF;

  -- 3. Administrador autenticado no sistema com perfil ativo verificado no banco
  IF public.current_app_role() = 'admin' THEN
    v_is_privileged := TRUE;
  END IF;

  -- Se for operação verdadeiramente privilegiada:
  IF v_is_privileged THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- Para qualquer outro usuário (aluno, visitante, ou tentativa de elevação indevida via API):
  -- Bloqueia alteração e preserva estritamente os campos sensíveis
  NEW.app_role := OLD.app_role;
  NEW.subscription_status := OLD.subscription_status;
  NEW.id := OLD.id;
  NEW.email := OLD.email;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_privileged_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- 5.7. Restrição estrita de privilégios de coluna em public.profiles
-- Usuários autenticados comuns NUNCA recebem autorização de UPDATE em colunas de autorização
REVOKE UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (nome, cref, avatar_url, updated_at) ON public.profiles TO authenticated;

-- 5.8. Função Privilegiada para Promoção Segura do Primeiro Administrador
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(
  target_email TEXT,
  target_name TEXT DEFAULT NULL,
  target_cref TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(trim(target_email));
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com e-mail % não encontrado no Supabase Auth. Crie a conta primeiro via OTP ou Magic Link no aplicativo.', target_email;
  END IF;

  -- 1. Grava no raw_app_meta_data para refletir nos tokens JWT
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('app_role', 'admin', 'subscription_status', 'active')
  WHERE id = v_user_id;

  -- 2. Atualiza public.profiles
  UPDATE public.profiles
  SET 
    app_role = 'admin',
    subscription_status = 'active',
    nome = COALESCE(target_name, nome),
    cref = COALESCE(target_cref, cref),
    updated_at = NOW()
  WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_user_to_admin(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(TEXT, TEXT, TEXT) TO postgres, service_role;

-- 5.9. Função Privilegiada para Revogação / Rebaixamento de Administrador
CREATE OR REPLACE FUNCTION public.demote_admin_to_student(target_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(trim(target_email));
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com e-mail % não encontrado no Supabase Auth.', target_email;
  END IF;

  -- 1. Remove app_role de raw_app_meta_data
  UPDATE auth.users
  SET raw_app_meta_data = (COALESCE(raw_app_meta_data, '{}'::jsonb) - 'app_role') || jsonb_build_object('app_role', 'student', 'subscription_status', 'free')
  WHERE id = v_user_id;

  -- 2. Atualiza public.profiles
  UPDATE public.profiles
  SET 
    app_role = 'student',
    subscription_status = 'free',
    updated_at = NOW()
  WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.demote_admin_to_student(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.demote_admin_to_student(TEXT) TO postgres, service_role;

-- 6. TABELA DA BIBLIOTECA CENTRAL DE EXERCÍCIOS (46 canônicos)
-- Compatibilidade total: contém muscle_group e target_muscle, instructions, cautions e description
CREATE TABLE IF NOT EXISTS public.central_exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  muscle_group TEXT NOT NULL,
  target_muscle TEXT, -- Coluna de compatibilidade espelhada
  movement_pattern TEXT NOT NULL,
  equipment TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('iniciante', 'intermediario', 'avancado')),
  instructions TEXT NOT NULL DEFAULT '',
  cautions TEXT NOT NULL DEFAULT '',
  description TEXT, -- Coluna de compatibilidade espelhada
  external_id TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  fallback_media_url TEXT,
  youtube_id TEXT,
  vimeo_id TEXT,
  vimeo_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'none' CHECK (media_type IN ('image', 'video', 'youtube', 'vimeo', 'none')),
  license_source TEXT NOT NULL DEFAULT 'manual' CHECK (license_source IN ('original', 'youtube_curated', 'musclewiki_licensed', 'manual')),
  video_validation_status TEXT NOT NULL DEFAULT 'pendente_revisao' CHECK (video_validation_status IN ('validado', 'pendente_revisao', 'sem_video')),
  demonstrator_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de compatibilidade bidirecional automática para central_exercises
CREATE OR REPLACE FUNCTION public.sync_central_exercise_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  NEW.target_muscle := COALESCE(NEW.target_muscle, NEW.muscle_group);
  NEW.muscle_group := COALESCE(NEW.muscle_group, NEW.target_muscle);
  IF NEW.description IS NULL OR NEW.description = '' THEN
    NEW.description := TRIM(CONCAT(NEW.instructions, CASE WHEN NEW.cautions <> '' THEN ' | Cuidados: ' || NEW.cautions ELSE '' END));
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_central_exercise_compat_fields ON public.central_exercises;
CREATE TRIGGER trg_sync_central_exercise_compat_fields
  BEFORE INSERT OR UPDATE ON public.central_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_central_exercise_compat_fields();

-- 7. TABELA DO CATÁLOGO DE TREINOS (72 treinos - Vitrine e Conteúdo)
CREATE TABLE IF NOT EXISTS public.catalog_workouts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('iniciante', 'intermediario', 'avancado')),
  duration TEXT NOT NULL,
  equipments TEXT[] NOT NULL DEFAULT '{}',
  objective TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  photo_alt TEXT,
  model_gender TEXT CHECK (model_gender IN ('feminino', 'masculino')),
  model_age_group TEXT,
  author_trainer TEXT,
  status TEXT NOT NULL DEFAULT 'publicado' CHECK (status IN ('publicado', 'rascunho', 'revisao')),
  access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RELACIONAMENTOS TREINO-EXERCÍCIO (251 relações de prescrição)
CREATE TABLE IF NOT EXISTS public.workout_exercise_items (
  workout_id TEXT NOT NULL REFERENCES public.catalog_workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES public.central_exercises(id) ON DELETE RESTRICT,
  item_order INTEGER NOT NULL,
  sets TEXT NOT NULL DEFAULT '3',
  reps TEXT NOT NULL DEFAULT '10-12',
  rest TEXT NOT NULL DEFAULT '45s',
  load TEXT,
  notes TEXT,
  alternative_exercise_id TEXT REFERENCES public.central_exercises(id) ON DELETE SET NULL,
  alternative_notes TEXT,
  PRIMARY KEY (workout_id, exercise_id, item_order)
);

-- 9. REGISTROS DE AUDITORIA BIOMECÂNICA (DADOS INTERNOS PROTEGIDOS)
-- Nomes, CREF, pareceres e histórico de revisão pertencem estritamente à equipe técnica
CREATE TABLE IF NOT EXISTS public.exercise_audit_records (
  exercise_id TEXT PRIMARY KEY REFERENCES public.central_exercises(id) ON DELETE CASCADE,
  biomechanical_status public.biomechanical_status_type NOT NULL DEFAULT 'sem_avaliacao',
  is_legacy_approval BOOLEAN NOT NULL DEFAULT FALSE,
  media_availability TEXT NOT NULL DEFAULT 'nao_verificado' CHECK (media_availability IN ('disponivel', 'indisponivel', 'sem_midia', 'nao_verificado')),
  media_availability_details TEXT,
  media_format TEXT NOT NULL DEFAULT 'nenhum' CHECK (media_format IN ('gif', 'webp', 'mp4', 'youtube', 'vimeo', 'nenhum')),
  media_source_url TEXT,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  reviewer_cref TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  last_verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.1. Trigger anti-falsificação de autoria com tratamento para aprovações legadas
-- PRESERVAÇÃO CRÍTICA: se is_legacy_approval = TRUE, mantém reviewer_id = NULL e reviewer_cref = NULL,
-- sem estampar indevidamente o nome do administrador que está executando a importação!
CREATE OR REPLACE FUNCTION public.set_audit_author_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_profile RECORD;
BEGIN
  -- 1. Preservação estrita das 32 aprovações legadas
  IF NEW.is_legacy_approval = TRUE THEN
    NEW.reviewer_id := NULL;
    NEW.reviewer_cref := NULL;
    NEW.reviewer_name := COALESCE(NEW.reviewer_name, 'Aprovação Legada (Curadoria Inicial)');
    NEW.updated_at := COALESCE(NEW.updated_at, NOW());
    RETURN NEW;
  END IF;

  -- 2. Novas revisões em tempo de execução
  IF auth.uid() IS NULL THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- Força reviewer_id a ser sempre o auth.uid() real da sessão autenticada
  NEW.reviewer_id := auth.uid();

  -- Obtém nome e cref do perfil oficial autenticado para impedir falsificação
  SELECT nome, cref INTO v_user_profile FROM public.profiles WHERE id = auth.uid();
  IF FOUND THEN
    NEW.reviewer_name := COALESCE(v_user_profile.nome, NEW.reviewer_name, 'Personal Trainer');
    NEW.reviewer_cref := COALESCE(v_user_profile.cref, NEW.reviewer_cref);
  END IF;

  NEW.reviewed_at := COALESCE(NEW.reviewed_at, NOW());
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_audit_author_identity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_set_audit_author_identity ON public.exercise_audit_records;
CREATE TRIGGER trg_set_audit_author_identity
  BEFORE INSERT OR UPDATE ON public.exercise_audit_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_audit_author_identity();

-- 10. HISTÓRICO DE AUDITORIA (LOG IMUTÁVEL DE MODIFICAÇÕES)
CREATE TABLE IF NOT EXISTS public.exercise_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.1. Trigger anti-falsificação do autor do log
CREATE OR REPLACE FUNCTION public.set_audit_log_author_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.author_id := auth.uid();
    SELECT nome INTO v_user_name FROM public.profiles WHERE id = auth.uid();
    NEW.author_name := COALESCE(v_user_name, 'Personal Trainer');
  END IF;
  NEW.created_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_audit_log_author_identity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_set_audit_log_author_identity ON public.exercise_audit_logs;
CREATE TRIGGER trg_set_audit_log_author_identity
  BEFORE INSERT ON public.exercise_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_audit_log_author_identity();

-- Bloqueio total de edição ou exclusão do histórico de auditoria (somente INSERT)
REVOKE UPDATE, DELETE ON public.exercise_audit_logs FROM PUBLIC, anon, authenticated;

-- 11. VIEWS SEGURAS PARA CONSUMO PÚBLICO E VITRINE

-- 11.1. View de Vitrine Pública de Treinos (Metadados Comerciais Sem Expor Prescrições)
CREATE OR REPLACE VIEW public.v_catalog_showcase
WITH (security_invoker = false)
AS
SELECT 
  id,
  title,
  description,
  category,
  level,
  duration,
  equipments,
  objective,
  cover_image,
  photo_alt,
  model_gender,
  model_age_group,
  author_trainer,
  status,
  access_level
FROM public.catalog_workouts
WHERE status = 'publicado';

GRANT SELECT ON public.v_catalog_showcase TO anon, authenticated;

-- 11.2. View Pública de Status de Auditoria (Oculta Nomes, CREF, Notas Internas e UUIDs)
CREATE OR REPLACE VIEW public.v_public_exercise_status
WITH (security_invoker = false)
AS
SELECT 
  exercise_id, 
  biomechanical_status, 
  is_legacy_approval, 
  media_format,
  media_availability
FROM public.exercise_audit_records;

GRANT SELECT ON public.v_public_exercise_status TO anon, authenticated;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES TOTALMENTE AUDITADAS E NÃO-RECURSIVAS
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.central_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercise_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_audit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_audit_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- POLÍTICAS: PROFILES (SEM RECURSÃO)
-- ---------------------------------------------------------------------

-- Leitura: usuário acessa o próprio perfil; staff (trainer/admin) acessa todos
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  OR public.current_app_role() IN ('trainer', 'admin')
);

-- Atualização: usuário atualiza seu próprio perfil com base em id = auth.uid()
-- ou administradores autorizados. A proteção de campos privilegiados é garantida pelo trigger e privilégios de coluna.
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.current_app_role() IN ('admin'))
WITH CHECK (id = auth.uid() OR public.current_app_role() IN ('admin'));

-- ---------------------------------------------------------------------
-- POLÍTICAS: USER_ENTITLEMENTS (COMPRAS / ASSINATURAS)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "entitlements_select_policy" ON public.user_entitlements;
CREATE POLICY "entitlements_select_policy"
ON public.user_entitlements FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.current_app_role() IN ('trainer', 'admin')
);

DROP POLICY IF EXISTS "entitlements_admin_write" ON public.user_entitlements;
CREATE POLICY "entitlements_admin_write"
ON public.user_entitlements FOR ALL
TO authenticated
USING (public.current_app_role() IN ('admin'))
WITH CHECK (public.current_app_role() IN ('admin'));

-- ---------------------------------------------------------------------
-- POLÍTICAS: CATÁLOGO DE TREINOS (VITRINE PÚBLICA / ESCRITA TREINADOR)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "workouts_public_select" ON public.catalog_workouts;
CREATE POLICY "workouts_public_select"
ON public.catalog_workouts FOR SELECT
TO anon, authenticated
USING (
  status = 'publicado'
  OR public.current_app_role() IN ('trainer', 'admin')
);

DROP POLICY IF EXISTS "workouts_trainer_write" ON public.catalog_workouts;
CREATE POLICY "workouts_trainer_write"
ON public.catalog_workouts FOR ALL
TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- ---------------------------------------------------------------------
-- POLÍTICAS: RELACIONAMENTOS TREINO-EXERCÍCIO (PROTEÇÃO REAL POR RECURSO)
-- ---------------------------------------------------------------------
-- Utiliza can_user_access_workout:
-- 1. Treinos gratuitos são visíveis para qualquer visitante.
-- 2. Compra de um treino avulso libera EXCLUSIVAMENTE os itens daquele treino.
-- 3. Assinatura global ativa libera os itens de todo o catálogo.
-- 4. Reembolsos bloqueiam imediatamente o acesso ao recurso.
DROP POLICY IF EXISTS "workout_items_access_policy" ON public.workout_exercise_items;
CREATE POLICY "workout_items_access_policy"
ON public.workout_exercise_items FOR SELECT
TO anon, authenticated
USING (
  public.can_user_access_workout(workout_exercise_items.workout_id)
);

DROP POLICY IF EXISTS "workout_items_trainer_write" ON public.workout_exercise_items;
CREATE POLICY "workout_items_trainer_write"
ON public.workout_exercise_items FOR ALL
TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- ---------------------------------------------------------------------
-- POLÍTICAS: EXERCÍCIOS CENTRAIS (PROTEÇÃO DE CONTEÚDO EXCLUSIVO PREMIUM)
-- ---------------------------------------------------------------------
-- CORREÇÃO CRÍTICA DO VAZAMENTO POR RLS:
-- Utiliza a função SECURITY DEFINER can_user_access_exercise(id).
-- Não é enganada pelo mascaramento de RLS da tabela workout_exercise_items.
-- Bloqueia exercícios que pertencem exclusivamente a treinos Premium para usuários não autorizados.
DROP POLICY IF EXISTS "exercises_select_policy" ON public.central_exercises;
CREATE POLICY "exercises_select_policy"
ON public.central_exercises FOR SELECT
TO anon, authenticated
USING (
  public.can_user_access_exercise(id)
);

DROP POLICY IF EXISTS "exercises_trainer_write" ON public.central_exercises;
CREATE POLICY "exercises_trainer_write"
ON public.central_exercises FOR ALL
TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- ---------------------------------------------------------------------
-- POLÍTICAS: AUDITORIA BIOMECÂNICA (POLÍTICAS ESPECÍFICAS INSERT / UPDATE / DELETE)
-- CORREÇÃO OBRIGATÓRIA: Não utiliza FOR ALL para impedir DELETE por treinador!
-- ---------------------------------------------------------------------

-- Leitura: restrita a treinador e administrador
DROP POLICY IF EXISTS "audit_records_trainer_select" ON public.exercise_audit_records;
CREATE POLICY "audit_records_trainer_select"
ON public.exercise_audit_records FOR SELECT
TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'));

-- Inserção: treinadores e administradores
DROP POLICY IF EXISTS "audit_records_trainer_insert" ON public.exercise_audit_records;
CREATE POLICY "audit_records_trainer_insert"
ON public.exercise_audit_records FOR INSERT
TO authenticated
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- Atualização: treinadores e administradores
DROP POLICY IF EXISTS "audit_records_trainer_update" ON public.exercise_audit_records;
CREATE POLICY "audit_records_trainer_update"
ON public.exercise_audit_records FOR UPDATE
TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- Exclusão: EXCLUSIVA PARA ADMINISTRADOR (Treinadores NÃO podem deletar registros de auditoria)
DROP POLICY IF EXISTS "audit_records_admin_delete" ON public.exercise_audit_records;
CREATE POLICY "audit_records_admin_delete"
ON public.exercise_audit_records FOR DELETE
TO authenticated
USING (public.current_app_role() = 'admin');

-- ---------------------------------------------------------------------
-- POLÍTICAS: HISTÓRICO DE AUDITORIA (LOG IMUTÁVEL)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_trainer_select" ON public.exercise_audit_logs;
CREATE POLICY "audit_logs_trainer_select"
ON public.exercise_audit_logs FOR SELECT
TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'));

DROP POLICY IF EXISTS "audit_logs_trainer_insert" ON public.exercise_audit_logs;
CREATE POLICY "audit_logs_trainer_insert"
ON public.exercise_audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- =====================================================================
-- STORAGE: BUCKETS 'exercise-media-public' E 'exercise-media-premium'
-- =====================================================================

-- 1. Bucket Público: para demonstrações de exercícios Free, GIFs e WebPs de treinos gratuitos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-media-public',
  'exercise-media-public',
  true,
  52428800, -- 50 MB
  ARRAY['image/gif', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/gif', 'image/webp', 'video/mp4'];

-- 2. Bucket Privado/Protegido: para demonstrações, vídeos MP4, WebP e GIF exclusivos de treinos Premium
-- URLs públicas diretas são BLOQUEADAS. Acesso requer autenticação com assinatura ativa ou perfil trainer/admin.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-media-premium',
  'exercise-media-premium',
  false,
  52428800, -- 50 MB
  ARRAY['image/gif', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/gif', 'image/webp', 'video/mp4'];

-- 3. Bucket Legado de Compatibilidade ('exercise-media')
-- Configurado como fechado/privado para evitar vazamento não-autorizado de mídias protegidas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-media',
  'exercise-media',
  false,
  52428800,
  ARRAY['image/gif', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800;

-- ---------------------------------------------------------------------
-- 10.2. TABELA DE VÍNCULOS EXPLÍCITOS DE ATIVOS DE MÍDIA (STORAGE)
-- Substitui regexps frágeis no nome do arquivo por vínculo determinístico e auditado
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT NOT NULL REFERENCES public.central_exercises(id) ON DELETE CASCADE,
  bucket_id TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT,
  mime_type TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  access_tier TEXT NOT NULL DEFAULT 'premium' CHECK (access_tier IN ('public', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_lookup 
  ON public.exercise_media_assets (bucket_id, storage_path);

CREATE INDEX IF NOT EXISTS idx_media_assets_exercise 
  ON public.exercise_media_assets (exercise_id);

ALTER TABLE public.exercise_media_assets ENABLE ROW LEVEL SECURITY;

-- 10.3. can_user_access_storage_object(p_bucket_id TEXT, p_object_name TEXT)
-- CORREÇÃO CRÍTICA (DENY BY DEFAULT):
-- Substitui expressões regulares frágeis sobre o nome do arquivo por consulta
-- ao vínculo relacional verificado na tabela exercise_media_assets.
-- Arquivos inexistentes, sem vínculo cadastrado ou não aprovados retornam estritamente FALSE.
CREATE OR REPLACE FUNCTION public.can_user_access_storage_object(
  p_bucket_id TEXT,
  p_object_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_asset RECORD;
  v_has_access BOOLEAN := FALSE;
BEGIN
  -- 1. Validação de parâmetros (Deny by default)
  IF p_bucket_id IS NULL OR p_object_name IS NULL OR trim(p_object_name) = '' THEN
    RETURN FALSE;
  END IF;

  -- 2. Equipe técnica (treinador/admin) possui acesso total
  IF public.current_app_role() IN ('trainer', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- 3. Localização do ativo pelo mapeamento relacional explícito
  SELECT * INTO v_asset
  FROM public.exercise_media_assets
  WHERE bucket_id = p_bucket_id
    AND storage_path = p_object_name;

  -- Se não existir vínculo explícito cadastrado no banco: NEGA ACESSO IMEDIATAMENTE (Deny by default)
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 4. Arquivos não aprovados pela curadoria técnica NUNCA são liberados a alunos ou público
  IF NOT v_asset.is_approved THEN
    RETURN FALSE;
  END IF;

  -- 5. Bucket Público: somente liberado se a mídia for de tier público E o exercício pertencer a treino free
  IF p_bucket_id = 'exercise-media-public' THEN
    IF v_asset.access_tier = 'public' AND public.can_user_access_exercise(v_asset.exercise_id) THEN
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END IF;

  -- 6. Bucket Premium / Legado: visitantes anônimos são bloqueados
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Assinantes globais ativos
  IF public.has_global_premium_access() THEN
    RETURN TRUE;
  END IF;

  -- Comprador avulso (single_workout): valida se adquiriu o treino específico contendo o exercício desta mídia
  SELECT public.can_user_access_exercise(v_asset.exercise_id) INTO v_has_access;
  RETURN v_has_access;
END;
$$;

REVOKE ALL ON FUNCTION public.can_user_access_storage_object(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_user_access_storage_object(TEXT, TEXT) TO anon, authenticated, service_role;

-- Políticas de RLS da tabela de ativos de mídia
DROP POLICY IF EXISTS "media_assets_select_policy" ON public.exercise_media_assets;
CREATE POLICY "media_assets_select_policy"
ON public.exercise_media_assets FOR SELECT
TO anon, authenticated
USING (public.can_user_access_storage_object(bucket_id, storage_path));

DROP POLICY IF EXISTS "media_assets_trainer_write" ON public.exercise_media_assets;
CREATE POLICY "media_assets_trainer_write"
ON public.exercise_media_assets FOR ALL
TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- Carga inicial de vínculo explícito para os 13 arquivos físicos originais
INSERT INTO public.exercise_media_assets (exercise_id, bucket_id, storage_path, file_name, mime_type, is_approved, access_tier)
VALUES
  ('ex-agachamento-sumo-halter', 'exercise-media-public', 'agachamento-sumo-halter.webp', 'agachamento-sumo-halter.webp', 'image/webp', true, 'public'),
  ('ex-agachamento-sumo-halter', 'exercise-media-public', 'agachamento-sumo-halter.gif', 'agachamento-sumo-halter.gif', 'image/gif', true, 'public'),
  ('ex-elevacao-pelvica-unilateral', 'exercise-media-public', 'elevacao-pelvica-unilateral.webp', 'elevacao-pelvica-unilateral.webp', 'image/webp', true, 'public'),
  ('ex-elevacao-pelvica-unilateral', 'exercise-media-public', 'elevacao-pelvica-unilateral.gif', 'elevacao-pelvica-unilateral.gif', 'image/gif', true, 'public'),
  ('ex-flexao-braco-inclinada', 'exercise-media-public', 'flexao-braco-inclinada.webp', 'flexao-braco-inclinada.webp', 'image/webp', true, 'public'),
  ('ex-remada-curvada-halteres', 'exercise-media-public', 'remada-curvada-halteres.webp', 'remada-curvada-halteres.webp', 'image/webp', true, 'public'),
  ('ex-remada-curvada-halteres', 'exercise-media-public', 'remada-curvada-halteres.gif', 'remada-curvada-halteres.gif', 'image/gif', true, 'public'),
  ('ex-subida-step-degrau', 'exercise-media-public', 'subida-step-degrau.webp', 'subida-step-degrau.webp', 'image/webp', true, 'public'),
  ('ex-subida-step-degrau', 'exercise-media-public', 'subida-step-degrau.gif', 'subida-step-degrau.gif', 'image/gif', true, 'public'),
  -- Exercício exclusivo Premium (w-sup-06): bucket fechado, tier premium
  ('ex-triceps-frances-halter', 'exercise-media-premium', 'triceps-frances-halter.webp', 'triceps-frances-halter.webp', 'image/webp', true, 'premium'),
  ('ex-triceps-frances-halter', 'exercise-media-premium', 'triceps-frances-halter.gif', 'triceps-frances-halter.gif', 'image/gif', true, 'premium'),
  -- Exercício pendente/sem vínculo a treinos: bucket fechado, is_approved = false
  ('ex-mesa-flexora', 'exercise-media-premium', 'mesa-flexora.webp', 'mesa-flexora.webp', 'image/webp', false, 'premium'),
  ('ex-mesa-flexora', 'exercise-media-premium', 'mesa-flexora.gif', 'mesa-flexora.gif', 'image/gif', false, 'premium')
ON CONFLICT (storage_path) DO NOTHING;

-- ---------------------------------------------------------------------
-- POLÍTICAS DE ACESSO DO STORAGE (SELECT) - BASEADAS EM VÍNCULO DETERMINÍSTICO
-- ---------------------------------------------------------------------

-- Bucket Público: leitura permitida apenas para objetos públicos explicitamente aprovados
DROP POLICY IF EXISTS "media_public_select" ON storage.objects;
CREATE POLICY "media_public_select"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'exercise-media-public'
  AND public.can_user_access_storage_object(bucket_id, name)
);

-- Bucket Premium e Legado: leitura restrita a assinantes ativos, compradores específicos ou equipe
DROP POLICY IF EXISTS "media_premium_select" ON storage.objects;
CREATE POLICY "media_premium_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('exercise-media-premium', 'exercise-media')
  AND public.can_user_access_storage_object(bucket_id, name)
);

-- ---------------------------------------------------------------------
-- POLÍTICAS DE ESCRITA DO STORAGE (INSERT, UPDATE, DELETE)
-- Escrita restrita a usuários com perfil de Treinador ou Administrador
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "media_trainer_insert" ON storage.objects;
CREATE POLICY "media_trainer_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('exercise-media-public', 'exercise-media-premium', 'exercise-media') AND
  public.current_app_role() IN ('trainer', 'admin')
);

DROP POLICY IF EXISTS "media_trainer_update" ON storage.objects;
CREATE POLICY "media_trainer_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('exercise-media-public', 'exercise-media-premium', 'exercise-media') AND
  public.current_app_role() IN ('trainer', 'admin')
);

DROP POLICY IF EXISTS "media_trainer_delete" ON storage.objects;
CREATE POLICY "media_trainer_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('exercise-media-public', 'exercise-media-premium', 'exercise-media') AND
  public.current_app_role() IN ('trainer', 'admin')
);

-- =====================================================================
-- INSTRUÇÃO DE USO: PROMOÇÃO PRIVILEGIADA DO PRIMEIRO ADMINISTRADOR
-- Após criar sua conta de e-mail no aplicativo ou no Supabase Auth,
-- execute a linha abaixo no SQL Editor para conceder privilégios plenos:
--
-- SELECT public.promote_user_to_admin('134freire@gmail.com', 'Anderson Personal', '012345-G/SP');
--
-- Para rebaixar/revogar um administrador no futuro, execute:
-- SELECT public.demote_admin_to_student('134freire@gmail.com');
-- =====================================================================
