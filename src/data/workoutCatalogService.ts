import { 
  CatalogWorkout, 
  CentralExercise, 
  WorkoutExerciseItem, 
  HydratedWorkoutSession, 
  WorkoutPlan, 
  WorkoutSession, 
  Exercise, 
  VideoValidationStatus, 
  WorkoutStatus,
  SubscriptionStatus,
  UserRole
} from '../types';
import { CENTRAL_EXERCISES } from './centralExercises';
import { INITIAL_CATALOG_WORKOUTS, CATALOG_COLLECTIONS } from './catalogWorkouts';
import { FREE_WORKOUT_EXERCISES } from './freeWorkoutExercises';
import { getSupabaseConfigStatus, getValidSessionToken } from '../utils/supabaseClient';

const WORKOUTS_STORAGE_KEY = 'mf_catalog_workouts_v3';
const EXERCISES_STORAGE_KEY = 'mf_central_exercises_v2';
const RELATIONS_STORAGE_KEY = 'mf_workout_exercises_v2';

/**
 * Obtém todos os treinos do catálogo (com persistência de edições do treinador)
 */
export function getAllCatalogWorkouts(): CatalogWorkout[] {
  if (typeof window === 'undefined') return [...INITIAL_CATALOG_WORKOUTS];
  try {
    const saved = localStorage.getItem(WORKOUTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const initialMap = new Map(INITIAL_CATALOG_WORKOUTS.map(w => [w.id, w]));
        return parsed.map((w: CatalogWorkout) => {
          const initial = initialMap.get(w.id);
          if (
            initial &&
            (!w.coverImage ||
              w.coverImage.includes('images.unsplash.com') ||
              w.coverImage.startsWith('/images/landing/'))
          ) {
            return {
              ...w,
              coverImage: initial.coverImage,
              photoAlt: initial.photoAlt,
              modelGender: initial.modelGender,
              modelAgeGroup: initial.modelAgeGroup
            };
          }
          return w;
        });
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar treinos salvos:', e);
  }
  return [...INITIAL_CATALOG_WORKOUTS];
}

/**
 * Salva a lista de treinos no localStorage
 */
export function saveAllCatalogWorkouts(workouts: CatalogWorkout[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workouts));
  } catch (e) {
    console.error('Erro ao salvar treinos:', e);
  }
}

/**
 * Obtém todos os exercícios da biblioteca central
 */
export function getAllCentralExercises(): CentralExercise[] {
  if (typeof window === 'undefined') return [...CENTRAL_EXERCISES];
  try {
    const saved = localStorage.getItem(EXERCISES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar exercícios centrais salvos:', e);
  }
  return [...CENTRAL_EXERCISES];
}

/**
 * Salva os exercícios centrais no localStorage
 */
export function saveAllCentralExercises(exercises: CentralExercise[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(exercises));
  } catch (e) {
    console.error('Erro ao salvar exercícios centrais:', e);
  }
}

/**
 * Obtém as relações entre treinos e exercícios
 */
export function getAllWorkoutExerciseItems(): WorkoutExerciseItem[] {
  if (typeof window === 'undefined') return [...FREE_WORKOUT_EXERCISES];
  try {
    const saved = localStorage.getItem(RELATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar relações treino-exercício:', e);
  }
  return [...FREE_WORKOUT_EXERCISES];
}

/**
 * Salva as relações entre treinos e exercícios no localStorage
 */
export function saveAllWorkoutExerciseItems(items: WorkoutExerciseItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RELATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Erro ao salvar relações treino-exercício:', e);
  }
}

/**
 * Hidrata uma sessão do catálogo, unindo o treino, a lista ordenada de exercícios
 * e os dados completos de instrução técnica e vídeo da biblioteca central.
 */
export function getHydratedWorkout(
  workoutId: string,
  options?: {
    allowPremium?: boolean;
    userStatus?: SubscriptionStatus;
    userRole?: UserRole;
    purchasedWorkoutIds?: string[];
    isAuthenticated?: boolean;
  }
): HydratedWorkoutSession | null {
  const workouts = getAllCatalogWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  if (!workout) return null;

  // Regra 1: Prescrições Free somente são liberadas para usuários autenticados
  // Visitantes anônimos veem apenas os dados da vitrine (título, capa, duração, objetivo)
  if (options?.isAuthenticated === false) {
    return {
      workout,
      exercises: []
    };
  }

  // Regra 2: Prescrições Premium exigem autorização confirmada (assinatura ativa, compra avulsa ou admin/treinador)
  if (workout.accessLevel === 'premium' && !options?.allowPremium) {
    const isAuthorized = canUserAccessWorkout(
      workout, 
      options?.userStatus, 
      options?.userRole, 
      options?.purchasedWorkoutIds
    );
    if (!isAuthorized) {
      return {
        workout,
        exercises: []
      };
    }
  }

  const relations = getAllWorkoutExerciseItems();
  const centralExercises = getAllCentralExercises();
  const exercisesMap = new Map<string, CentralExercise>(centralExercises.map(e => [e.id, e]));

  const workoutRelations = relations
    .filter(r => r.workoutId === workoutId)
    .sort((a, b) => a.order - b.order);

  const hydratedExercises = workoutRelations.map((rel, index) => {
    const central = exercisesMap.get(rel.exerciseId);
    const alternative = rel.alternativeExerciseId ? exercisesMap.get(rel.alternativeExerciseId) : undefined;

    const baseExercise: Exercise & {
      centralDetails?: CentralExercise;
      order: number;
      alternativeDetails?: CentralExercise;
      alternativeNotes?: string;
    } = {
      id: `ex-run-${workoutId}-${index}-${rel.exerciseId}`,
      centralExerciseId: rel.exerciseId,
      name: central ? central.name : `Exercício (${rel.exerciseId})`,
      muscleGroup: central ? central.muscleGroup : 'Geral',
      sets: rel.sets,
      reps: rel.reps,
      rest: rel.rest,
      weight: rel.load || '',
      notes: rel.notes || (central ? central.instructions : ''),
      instructions: central ? central.instructions : '',
      cautions: central ? central.cautions : '',
      youtubeId: central ? central.youtubeId : undefined,
      videoUrl: central ? central.videoUrl : undefined,
      fallbackMediaUrl: central ? central.fallbackMediaUrl : undefined,
      mediaType: central ? central.mediaType : undefined,
      thumbnailUrl: central?.thumbnailUrl || '',
      hasNoVideo: central ? central.videoValidationStatus === 'sem_video' : false,
      movementPattern: central?.movementPattern,
      equipment: central?.equipment,
      videoValidationStatus: central?.videoValidationStatus,
      licenseSource: central?.licenseSource,
      centralDetails: central,
      order: rel.order,
      alternativeDetails: alternative,
      alternativeNotes: rel.alternativeNotes
    };

    return baseExercise;
  });

  return {
    workout,
    exercises: hydratedExercises
  };
}

/**
 * Busca de forma segura e autenticada a prescrição completa de um treino no Supabase.
 * Para treinos Premium, as prescrições (itens, repetições, cargas e vídeos exclusivos)
 * são protegidas por Row-Level Security no backend e só são retornadas para usuários autorizados.
 */
export async function fetchAuthenticatedWorkoutSession(
  workoutId: string,
  token?: string
): Promise<HydratedWorkoutSession | null> {
  const status = getSupabaseConfigStatus();

  // 1. Quando Supabase estiver conectado, lê direto da nuvem com token verificado
  if (status.isConfigured && status.url) {
    try {
      const anonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || '') : '';
      const authToken = token || getValidSessionToken() || anonKey;

      // Busca dados de vitrine do treino
      const workoutRes = await fetch(`${status.url}/rest/v1/catalog_workouts?id=eq.${workoutId}&select=*`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!workoutRes.ok) return null;
      const workoutData = await workoutRes.json();
      if (!Array.isArray(workoutData) || workoutData.length === 0) return null;
      const raw = workoutData[0];
      const remoteWorkout: CatalogWorkout = {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        category: raw.category,
        level: raw.level,
        duration: raw.duration,
        equipments: raw.equipments || [],
        objective: raw.objective,
        coverImage: raw.cover_image,
        photoAlt: raw.photo_alt,
        modelGender: raw.model_gender,
        modelAgeGroup: raw.model_age_group,
        authorTrainer: raw.author_trainer,
        status: raw.status,
        accessLevel: raw.access_level,
        updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString()
      };

      // Busca itens de prescrição (RLS filtra no servidor: treinos Premium sem token ativo retornam [])
      const itemsRes = await fetch(`${status.url}/rest/v1/workout_exercise_items?workout_id=eq.${workoutId}&select=*&order=item_order.asc`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!itemsRes.ok) return { workout: remoteWorkout, exercises: [] };
      const itemsData = await itemsRes.json();
      if (!Array.isArray(itemsData) || itemsData.length === 0) {
        // Se for treino Premium e não retornou itens, o acesso foi protegido pelo servidor RLS
        return { workout: remoteWorkout, exercises: [] };
      }

      // Busca exercícios centrais correspondentes
      const exerciseIds = itemsData.map((it: any) => it.exercise_id);
      const exercisesRes = await fetch(`${status.url}/rest/v1/central_exercises?id=in.(${exerciseIds.join(',')})&select=*`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${authToken}`
        }
      });
      const exercisesData = exercisesRes.ok ? await exercisesRes.json() : [];
      const exercisesMap = new Map<string, any>(exercisesData.map((e: any) => [e.id, e]));

      const hydratedExercises: (Exercise & {
        centralDetails?: CentralExercise;
        order: number;
        alternativeDetails?: CentralExercise;
        alternativeNotes?: string;
      })[] = itemsData.map((rel: any, index: number) => {
        const central = exercisesMap.get(rel.exercise_id);
        return {
          id: `ex-run-${workoutId}-${index}-${rel.exercise_id}`,
          centralExerciseId: rel.exercise_id,
          name: central ? central.name : `Exercício (${rel.exercise_id})`,
          muscleGroup: central ? (central.muscle_group || central.target_muscle) : 'Geral',
          sets: rel.sets,
          reps: rel.reps,
          rest: rel.rest,
          weight: rel.load || '',
          notes: rel.notes || (central ? central.instructions : ''),
          instructions: central ? central.instructions : '',
          cautions: central ? central.cautions : '',
          youtubeId: central ? central.youtube_id : undefined,
          videoUrl: central ? central.video_url : undefined,
          fallbackMediaUrl: central ? central.fallback_media_url : undefined,
          mediaType: central ? central.media_type : undefined,
          thumbnailUrl: central?.thumbnail_url || '',
          hasNoVideo: central ? central.video_validation_status === 'sem_video' : false,
          movementPattern: central?.movement_pattern,
          equipment: central?.equipment,
          videoValidationStatus: central?.video_validation_status,
          licenseSource: central?.license_source,
          centralDetails: central,
          order: rel.item_order,
          alternativeNotes: rel.alternative_notes
        };
      });

      return {
        workout: remoteWorkout,
        exercises: hydratedExercises
      };
    } catch (err) {
      console.warn('Erro ao carregar treino autenticado do Supabase:', err);
    }
  }

  // 2. Fallback local para desenvolvimento e modo offline
  return getHydratedWorkout(workoutId, {
    allowPremium: false,
    userStatus: 'free',
    userRole: 'student'
  });
}

/**
 * Verifica se um usuário possui autorização para executar um treino específico.
 * Não confia exclusivamente em estado do frontend: valida explicitamente o nível de acesso
 * e diferencia assinaturas globais de compras avulsas por resource_id.
 */
export function canUserAccessWorkout(
  workout: CatalogWorkout, 
  userStatus?: SubscriptionStatus,
  userRole?: UserRole,
  purchasedWorkoutIds?: string[]
): boolean {
  // Treinos gratuitos são liberados para todos (com ou sem login)
  if (workout.accessLevel === 'free') return true;

  // Reembolsados ou cancelados perdem acesso imediatamente (exceto staff)
  if (userStatus === 'refunded' || userStatus === 'canceled') {
    if (userRole !== 'trainer' && userRole !== 'admin') return false;
  }

  // Treinador e Administrador possuem acesso total irrestrito
  if (userRole === 'trainer' || userRole === 'admin') return true;

  // Assinantes com status ativo ou em período de testes (direito global)
  if (userStatus === 'active' || userStatus === 'trialing') return true;

  // Compra avulsa do treino específico (autorização por recurso)
  if (purchasedWorkoutIds && purchasedWorkoutIds.includes(workout.id)) {
    return true;
  }

  return false;
}

/**
 * Converte um treino do catálogo diretamente em um WorkoutPlan para execução
 * imediata no StudentWorkoutView sem duplicar vídeos.
 * Valida autorização: caso seja Premium e o usuário não tenha permissão, retorna null.
 */
export function convertCatalogWorkoutToWorkoutPlan(
  workout: CatalogWorkout,
  userStatus?: SubscriptionStatus,
  userRole?: UserRole,
  purchasedWorkoutIds?: string[]
): WorkoutPlan | null {
  // Barreira de segurança: impede execução de treinos protegidos sem permissão
  if (!canUserAccessWorkout(workout, userStatus, userRole, purchasedWorkoutIds)) {
    console.warn(`[Acesso Bloqueado] Tentativa de executar treino Premium (${workout.id}) sem autorização confirmada.`);
    return null;
  }

  const hydrated = getHydratedWorkout(workout.id, {
    allowPremium: true,
    userStatus,
    userRole,
    purchasedWorkoutIds
  });
  const exercisesList: Exercise[] = hydrated ? hydrated.exercises : [];

  const session: WorkoutSession = {
    id: `sess-${workout.id}`,
    name: workout.title,
    focus: workout.objective,
    exercises: exercisesList
  };

  return {
    id: `plan-${workout.id}-${Date.now()}`,
    studentName: 'Aluno(a) Melhor Forma',
    trainerName: workout.authorTrainer || 'Prof. Anderson - Equipe Melhor Forma',
    goal: `${workout.title} (${workout.level})`,
    frequency: 'Conforme planejamento individual',
    generalNotes: `${workout.description} | Equipamentos: ${workout.equipments.join(', ')}`,
    createdAt: new Date().toISOString(),
    sessions: [session]
  };
}

/**
 * Altera nível de acesso (Gratuito / Premium)
 */
export function updateWorkoutAccessLevel(workoutId: string, accessLevel: 'free' | 'premium'): CatalogWorkout | null {
  const workouts = getAllCatalogWorkouts();
  const index = workouts.findIndex(w => w.id === workoutId);
  if (index === -1) return null;

  workouts[index] = {
    ...workouts[index],
    accessLevel,
    updatedAt: new Date().toISOString()
  };
  saveAllCatalogWorkouts(workouts);
  return workouts[index];
}

/**
 * Altera status de publicação (Publicado, Rascunho, Em Revisão)
 */
export function updateWorkoutStatus(workoutId: string, status: WorkoutStatus): CatalogWorkout | null {
  const workouts = getAllCatalogWorkouts();
  const index = workouts.findIndex(w => w.id === workoutId);
  if (index === -1) return null;

  workouts[index] = {
    ...workouts[index],
    status,
    updatedAt: new Date().toISOString()
  };
  saveAllCatalogWorkouts(workouts);
  return workouts[index];
}

/**
 * Atualiza um exercício central da biblioteca
 */
export function updateCentralExercise(exerciseId: string, updates: Partial<CentralExercise>): CentralExercise | null {
  const exercises = getAllCentralExercises();
  const index = exercises.findIndex(e => e.id === exerciseId);
  if (index === -1) return null;

  exercises[index] = {
    ...exercises[index],
    ...updates
  };
  saveAllCentralExercises(exercises);
  return exercises[index];
}

/**
 * Validação do vídeo de correspondência exata
 */
export function validateVideoStatus(exerciseId: string, status: VideoValidationStatus): CentralExercise | null {
  return updateCentralExercise(exerciseId, { videoValidationStatus: status });
}

/**
 * Duplica um treino existente
 */
export function duplicateWorkout(workoutId: string): CatalogWorkout | null {
  const workouts = getAllCatalogWorkouts();
  const source = workouts.find(w => w.id === workoutId);
  if (!source) return null;

  const newId = `w-copy-${Date.now().toString(36)}`;
  const duplicated: CatalogWorkout = {
    ...source,
    id: newId,
    title: `${source.title} (Cópia)`,
    status: 'rascunho',
    updatedAt: new Date().toISOString()
  };

  workouts.unshift(duplicated);
  saveAllCatalogWorkouts(workouts);

  // Duplicar também os relacionamentos de exercícios
  const relations = getAllWorkoutExerciseItems();
  const sourceRelations = relations.filter(r => r.workoutId === workoutId);
  const newRelations: WorkoutExerciseItem[] = sourceRelations.map(r => ({
    ...r,
    workoutId: newId
  }));

  saveAllWorkoutExerciseItems([...relations, ...newRelations]);
  return duplicated;
}

/**
 * Métricas de validação de vídeos
 */
export function getExerciseVideoMetrics() {
  const exercises = getAllCentralExercises();
  const total = exercises.length;
  const validated = exercises.filter(e => e.videoValidationStatus === 'validado').length;
  const pending = exercises.filter(e => e.videoValidationStatus === 'pendente_revisao').length;
  const noVideo = exercises.filter(e => e.videoValidationStatus === 'sem_video').length;

  return { total, validated, pending, noVideo };
}

/**
 * Métricas de publicação dos 72 treinos
 */
export function getWorkoutPublicationMetrics() {
  const workouts = getAllCatalogWorkouts();
  const total = workouts.length;
  const published = workouts.filter(w => w.status === 'publicado').length;
  const review = workouts.filter(w => w.status === 'revisao').length;
  const draft = workouts.filter(w => w.status === 'rascunho').length;
  const free = workouts.filter(w => w.accessLevel === 'free').length;
  const premium = workouts.filter(w => w.accessLevel === 'premium').length;

  return { total, published, review, draft, free, premium };
}

/**
 * Restaura o catálogo para o estado padrão de fábrica (limpa caches do localStorage)
 * Não quebra o aplicativo: reverte instantaneamente para INITIAL_CATALOG_WORKOUTS,
 * CENTRAL_EXERCISES e INITIAL_WORKOUT_EXERCISES.
 */
export function resetCatalogToDefaults(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(WORKOUTS_STORAGE_KEY);
    localStorage.removeItem(EXERCISES_STORAGE_KEY);
    localStorage.removeItem(RELATIONS_STORAGE_KEY);
  } catch (e) {
    console.error('Erro ao restaurar catálogo aos padrões:', e);
  }
}
