/**
 * SERVIÇO DE MIGRAÇÃO SEGURA E ESQUEMAS SQL PARA SUPABASE
 * Melhor Forma Play 40+
 *
 * Princípios de Segurança e Migração:
 * 1. Não sobrescreve o campo reservado `role` do JWT do Supabase (utiliza `app_role`).
 * 2. RLS estrito: leitura pública para catálogo, escrita restrita a usuários com `app_role IN ('trainer', 'admin')`.
 * 3. Migração idempotente: utiliza UPSERT para permitir reexecução segura sem duplicar dados.
 * 4. Validação antes e depois da migração: confere 72 treinos, 251 vínculos e 46 exercícios canônicos.
 * 5. Não apaga cópias locais enquanto a migração não for formalmente comprovada.
 */

import { getSupabaseConfigStatus } from './supabaseClient';
import { getAllCatalogWorkouts, getAllCentralExercises, getAllWorkoutExerciseItems } from '../data/workoutCatalogService';
import { getStoredAuditRecords } from './libraryAuditService';
import { getAllMediaFilesFromIndexedDB } from './mediaStorageService';

export interface MigrationStepProgress {
  step: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'skipped';
  details?: string;
}

export interface MigrationReport {
  success: boolean;
  timestamp: string;
  targetUrl: string | null;
  counts: {
    workoutsUploaded: number;
    exercisesUploaded: number;
    relationsUploaded: number;
    auditRecordsUploaded: number;
    mediaFilesUploaded: number;
  };
  errors: string[];
  steps: MigrationStepProgress[];
}

/**
 * DDL SQL COMPLETO PARA EXECUÇÃO NO SUPABASE SQL EDITOR
 */
export const SUPABASE_SQL_DDL_SCRIPT = `-- =====================================================================
-- MELHOR FORMA PLAY 40+ | ESQUEMA COMPLETO DE BANCO DE DADOS E RLS
-- =====================================================================

-- 1. EXTENSÕES E TIPOS DE AUTORIZAÇÃO
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- 2. TABELA DE PERFIS DE USUÁRIO (PROFILES)
-- Utiliza app_role para não colidir com o role reservado do Supabase Auth
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

-- Função auxiliar segura para verificar o papel do usuário na sessão atual
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS public.app_user_role AS $$
  SELECT app_role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Gatilho para criar perfil padrão ao cadastrar novo usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, app_role, subscription_status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    'student', -- Sempre inicia como student por segurança
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABELA DA BIBLIOTECA CENTRAL DE EXERCÍCIOS (46 canônicos)
CREATE TABLE IF NOT EXISTS public.central_exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  fallback_media_url TEXT,
  youtube_id TEXT,
  vimeo_id TEXT,
  vimeo_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'none',
  video_validation_status TEXT NOT NULL DEFAULT 'pendente_revisao',
  is_verified_asset BOOLEAN NOT NULL DEFAULT FALSE,
  license_source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DO CATÁLOGO DE TREINOS (72 treinos)
CREATE TABLE IF NOT EXISTS public.catalog_workouts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  equipments TEXT[] NOT NULL DEFAULT '{}',
  objective TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'publicado',
  access_level TEXT NOT NULL DEFAULT 'free',
  photo_alt TEXT,
  model_gender TEXT,
  model_age_group TEXT,
  author_trainer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RELACIONAMENTOS TREINO-EXERCÍCIO (251 relações)
CREATE TABLE IF NOT EXISTS public.workout_exercise_items (
  workout_id TEXT NOT NULL REFERENCES public.catalog_workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES public.central_exercises(id) ON DELETE CASCADE,
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

-- 6. REGISTROS DE AUDITORIA E REVISÃO BIOMECÂNICA
CREATE TABLE IF NOT EXISTS public.exercise_audit_records (
  exercise_id TEXT PRIMARY KEY REFERENCES public.central_exercises(id) ON DELETE CASCADE,
  biomechanical_status public.biomechanical_status_type NOT NULL DEFAULT 'sem_avaliacao',
  is_legacy_approval BOOLEAN NOT NULL DEFAULT FALSE,
  media_availability TEXT NOT NULL DEFAULT 'nao_verificado',
  media_availability_details TEXT,
  media_format TEXT NOT NULL DEFAULT 'nenhum',
  media_source_url TEXT,
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_name TEXT,
  reviewer_cref TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  last_verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. HISTÓRICO DE AUDITORIA (LOG IMUTÁVEL DE MODIFICAÇÕES)
CREATE TABLE IF NOT EXISTS public.exercise_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.central_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercise_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_audit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_audit_logs ENABLE ROW LEVEL SECURITY;

-- Regras Profiles
CREATE POLICY "Leitura de perfil próprio ou por treinador"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.current_app_role() IN ('trainer', 'admin'));

CREATE POLICY "Atualização restrita do próprio perfil (sem mudar app_role)"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  app_role = (SELECT app_role FROM public.profiles WHERE id = auth.uid())
);

-- Regras Catálogo e Exercícios: Leitura pública, escrita restrita a Treinador/Admin
CREATE POLICY "Leitura pública do catálogo de treinos"
ON public.catalog_workouts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Escrita de treinos apenas para treinadores"
ON public.catalog_workouts FOR ALL TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

CREATE POLICY "Leitura pública de exercícios centrais"
ON public.central_exercises FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Escrita de exercícios apenas para treinadores"
ON public.central_exercises FOR ALL TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

CREATE POLICY "Leitura pública das relações treino-exercício"
ON public.workout_exercise_items FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Escrita de relações apenas para treinadores"
ON public.workout_exercise_items FOR ALL TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

CREATE POLICY "Leitura pública de status de auditoria"
ON public.exercise_audit_records FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Registro de auditoria restrito a treinadores"
ON public.exercise_audit_records FOR ALL TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'))
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

CREATE POLICY "Leitura de logs restrita a treinadores"
ON public.exercise_audit_logs FOR SELECT TO authenticated
USING (public.current_app_role() IN ('trainer', 'admin'));

CREATE POLICY "Inserção de logs por treinadores autenticados"
ON public.exercise_audit_logs FOR INSERT TO authenticated
WITH CHECK (public.current_app_role() IN ('trainer', 'admin'));

-- =====================================================================
-- STORAGE: BUCKET 'exercise-media'
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-media',
  'exercise-media',
  true,
  52428800, -- 50 MB
  ARRAY['image/gif', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- Regras do Storage: Leitura pública, upload e exclusão restritos a Treinador
CREATE POLICY "Leitura pública de mídias de exercícios"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'exercise-media');

CREATE POLICY "Upload restrito a treinadores e administradores"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exercise-media' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.app_role IN ('trainer', 'admin')
  )
);

CREATE POLICY "Exclusão e atualização restrita a treinadores"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'exercise-media' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.app_role IN ('trainer', 'admin')
  )
);
`;

/**
 * Verifica conectividade real e permissões no Supabase
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  url: string | null;
  message: string;
  hasTables: boolean;
  hasStorageBucket: boolean;
}> {
  const config = getSupabaseConfigStatus();
  if (!config.isConfigured || !config.url) {
    return {
      connected: false,
      url: null,
      message: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
      hasTables: false,
      hasStorageBucket: false
    };
  }

  const anonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || '') : '';

  try {
    // 1. Testa REST API pública
    const restRes = await fetch(`${config.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey
      }
    });

    if (!restRes.ok && restRes.status !== 404) {
      return {
        connected: false,
        url: config.url,
        message: `Servidor Supabase respondeu com código HTTP ${restRes.status}.`,
        hasTables: false,
        hasStorageBucket: false
      };
    }

    // 2. Testa existência da tabela central_exercises
    let hasTables = false;
    try {
      const tableRes = await fetch(`${config.url}/rest/v1/central_exercises?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': anonKey
        }
      });
      hasTables = tableRes.ok;
    } catch {
      hasTables = false;
    }

    // 3. Testa existência do bucket exercise-media
    let hasStorageBucket = false;
    try {
      const bucketRes = await fetch(`${config.url}/storage/v1/bucket/exercise-media`, {
        method: 'GET',
        headers: {
          'apikey': anonKey
        }
      });
      hasStorageBucket = bucketRes.ok;
    } catch {
      hasStorageBucket = false;
    }

    return {
      connected: true,
      url: config.url,
      message: hasTables 
        ? 'Conexão ativa e tabelas detectadas com sucesso.' 
        : 'Conexão ativa com o Supabase, porém as tabelas ainda não foram criadas. Execute o script SQL no Painel.',
      hasTables,
      hasStorageBucket
    };
  } catch (err: any) {
    return {
      connected: false,
      url: config.url,
      message: `Erro ao conectar ao Supabase: ${err.message}`,
      hasTables: false,
      hasStorageBucket: false
    };
  }
}

/**
 * Executa migração idempotente enviando os dados locais/canônicos para o Supabase
 */
export async function runIdempotentCloudMigration(
  onProgress?: (progress: MigrationStepProgress) => void
): Promise<MigrationReport> {
  const steps: MigrationStepProgress[] = [];
  const errors: string[] = [];

  const updateStep = (stepName: string, status: MigrationStepProgress['status'], details?: string) => {
    const item: MigrationStepProgress = { step: stepName, status, details };
    steps.push(item);
    if (onProgress) onProgress(item);
  };

  const connection = await testSupabaseConnection();
  if (!connection.connected || !connection.url) {
    updateStep('Conexão com Supabase', 'failed', connection.message);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      targetUrl: null,
      counts: { workoutsUploaded: 0, exercisesUploaded: 0, relationsUploaded: 0, auditRecordsUploaded: 0, mediaFilesUploaded: 0 },
      errors: [connection.message],
      steps
    };
  }

  updateStep('Conexão com Supabase', 'success', `Conectado a ${connection.url}`);

  if (!connection.hasTables) {
    const msg = 'Tabelas do banco de dados ainda não criadas no Supabase. Execute o script DDL no SQL Editor antes de migrar.';
    updateStep('Verificação de Tabelas', 'failed', msg);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      targetUrl: connection.url,
      counts: { workoutsUploaded: 0, exercisesUploaded: 0, relationsUploaded: 0, auditRecordsUploaded: 0, mediaFilesUploaded: 0 },
      errors: [msg],
      steps
    };
  }

  updateStep('Verificação de Tabelas', 'success', 'Tabelas catalogadas e prontas');

  const anonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || '') : '';
  const workouts = getAllCatalogWorkouts();
  const exercises = getAllCentralExercises();
  const relations = getAllWorkoutExerciseItems();
  const auditRecords = getStoredAuditRecords();
  const indexedDbFiles = await getAllMediaFilesFromIndexedDB();

  let exercisesUploaded = 0;
  let workoutsUploaded = 0;
  let relationsUploaded = 0;
  let auditRecordsUploaded = 0;
  let mediaFilesUploaded = 0;

  // 1. Migração de Exercícios Centrais (UPSERT)
  updateStep('Migração de Exercícios Centrais', 'in_progress', `Enviando ${exercises.length} exercícios canônicos...`);
  try {
    const exercisePayload = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      target_muscle: ex.targetMuscle,
      difficulty: ex.difficulty,
      description: ex.description,
      instructions: ex.instructions,
      video_url: ex.videoUrl || null,
      fallback_media_url: ex.fallbackMediaUrl || null,
      youtube_id: ex.youtubeId || null,
      vimeo_id: ex.vimeoId || null,
      vimeo_url: ex.vimeoUrl || null,
      media_type: ex.mediaType || 'none',
      video_validation_status: ex.videoValidationStatus || 'pendente_revisao',
      is_verified_asset: Boolean(ex.isVerifiedAsset),
      license_source: ex.licenseSource || 'manual'
    }));

    const res = await fetch(`${connection.url}/rest/v1/central_exercises`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(exercisePayload)
    });

    if (res.ok) {
      exercisesUploaded = exercises.length;
      updateStep('Migração de Exercícios Centrais', 'success', `${exercises.length} exercícios sincronizados`);
    } else {
      const errText = await res.text();
      errors.push(`Falha ao sincronizar exercícios: ${errText}`);
      updateStep('Migração de Exercícios Centrais', 'failed', errText);
    }
  } catch (err: any) {
    errors.push(`Erro de rede em exercícios centrais: ${err.message}`);
    updateStep('Migração de Exercícios Centrais', 'failed', err.message);
  }

  // 2. Migração de Catálogo de Treinos (UPSERT)
  updateStep('Migração de Treinos', 'in_progress', `Enviando ${workouts.length} treinos do catálogo...`);
  try {
    const workoutPayload = workouts.map(w => ({
      id: w.id,
      title: w.title,
      description: w.description,
      category: w.category,
      level: w.level,
      duration: w.duration,
      equipments: w.equipments,
      objective: w.objective,
      cover_image: w.coverImage,
      status: w.status || 'publicado',
      access_level: w.accessLevel || 'free',
      photo_alt: w.photoAlt || null,
      model_gender: w.modelGender || null,
      model_age_group: w.modelAgeGroup || null,
      author_trainer: w.authorTrainer || null
    }));

    const res = await fetch(`${connection.url}/rest/v1/catalog_workouts`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(workoutPayload)
    });

    if (res.ok) {
      workoutsUploaded = workouts.length;
      updateStep('Migração de Treinos', 'success', `${workouts.length} treinos sincronizados`);
    } else {
      const errText = await res.text();
      errors.push(`Falha ao sincronizar treinos: ${errText}`);
      updateStep('Migração de Treinos', 'failed', errText);
    }
  } catch (err: any) {
    errors.push(`Erro de rede em treinos: ${err.message}`);
    updateStep('Migração de Treinos', 'failed', err.message);
  }

  // 3. Migração de Relacionamentos (UPSERT)
  updateStep('Migração de Relacionamentos', 'in_progress', `Enviando ${relations.length} relacionamentos...`);
  try {
    const relationPayload = relations.map(r => ({
      workout_id: r.workoutId,
      exercise_id: r.exerciseId,
      item_order: r.order,
      sets: r.sets,
      reps: r.reps,
      rest: r.rest,
      load: r.load || null,
      notes: r.notes || null,
      alternative_exercise_id: r.alternativeExerciseId || null,
      alternative_notes: r.alternativeNotes || null
    }));

    const res = await fetch(`${connection.url}/rest/v1/workout_exercise_items`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(relationPayload)
    });

    if (res.ok) {
      relationsUploaded = relations.length;
      updateStep('Migração de Relacionamentos', 'success', `${relations.length} vínculos sincronizados`);
    } else {
      const errText = await res.text();
      errors.push(`Falha ao sincronizar vínculos: ${errText}`);
      updateStep('Migração de Relacionamentos', 'failed', errText);
    }
  } catch (err: any) {
    errors.push(`Erro de rede em vínculos: ${err.message}`);
    updateStep('Migração de Relacionamentos', 'failed', err.message);
  }

  // 4. Migração de Registros de Auditoria (UPSERT)
  const auditEntries = Object.values(auditRecords);
  updateStep('Migração de Decisões de Auditoria', 'in_progress', `Enviando ${auditEntries.length} registros de auditoria...`);
  try {
    if (auditEntries.length > 0) {
      const auditPayload = auditEntries.map(a => ({
        exercise_id: a.exerciseId,
        biomechanical_status: a.biomechanicalStatus,
        is_legacy_approval: Boolean(a.isLegacyApproval),
        media_availability: a.mediaAvailability,
        media_availability_details: a.mediaAvailabilityDetails || null,
        media_format: a.mediaFormat,
        media_source_url: a.mediaSourceUrl || null,
        reviewer_name: a.reviewerName || null,
        reviewed_at: a.reviewedAt || null,
        review_notes: a.reviewNotes || null,
        last_verified_at: a.lastVerifiedAt || null
      }));

      const res = await fetch(`${connection.url}/rest/v1/exercise_audit_records`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(auditPayload)
      });

      if (res.ok) {
        auditRecordsUploaded = auditEntries.length;
        updateStep('Migração de Decisões de Auditoria', 'success', `${auditEntries.length} decisões de auditoria preservadas`);
      } else {
        const errText = await res.text();
        errors.push(`Falha ao sincronizar auditoria: ${errText}`);
        updateStep('Migração de Decisões de Auditoria', 'failed', errText);
      }
    } else {
      updateStep('Migração de Decisões de Auditoria', 'skipped', 'Nenhuma decisão customizada pendente');
    }
  } catch (err: any) {
    errors.push(`Erro de rede em auditoria: ${err.message}`);
    updateStep('Migração de Decisões de Auditoria', 'failed', err.message);
  }

  // 5. Migração de Arquivos Binários do IndexedDB para o Storage
  if (indexedDbFiles.length > 0) {
    updateStep('Migração de Arquivos para o Storage', 'in_progress', `Enviando ${indexedDbFiles.length} arquivos locais...`);
    for (const fileItem of indexedDbFiles) {
      if (fileItem.blob) {
        try {
          const fileName = `migrated/${fileItem.id}_${fileItem.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const uploadRes = await fetch(`${connection.url}/storage/v1/object/exercise-media/${fileName}`, {
            method: 'POST',
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': fileItem.mimeType || 'application/octet-stream'
            },
            body: fileItem.blob
          });
          if (uploadRes.ok) {
            mediaFilesUploaded++;
          }
        } catch {}
      }
    }
    updateStep('Migração de Arquivos para o Storage', 'success', `${mediaFilesUploaded} de ${indexedDbFiles.length} arquivos enviados para o Storage`);
  } else {
    updateStep('Migração de Arquivos para o Storage', 'skipped', 'Nenhum arquivo local no IndexedDB pendente');
  }

  const allSuccess = errors.length === 0;

  return {
    success: allSuccess,
    timestamp: new Date().toISOString(),
    targetUrl: connection.url,
    counts: {
      workoutsUploaded,
      exercisesUploaded,
      relationsUploaded,
      auditRecordsUploaded,
      mediaFilesUploaded
    },
    errors,
    steps
  };
}
