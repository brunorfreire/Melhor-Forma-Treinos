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
import { INITIAL_WORKOUT_EXERCISES } from './workoutExercises';

const WORKOUTS_STORAGE_KEY = 'mf_catalog_workouts_v2';
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
        return parsed;
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
  if (typeof window === 'undefined') return [...INITIAL_WORKOUT_EXERCISES];
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
  return [...INITIAL_WORKOUT_EXERCISES];
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
export function getHydratedWorkout(workoutId: string): HydratedWorkoutSession | null {
  const workouts = getAllCatalogWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  if (!workout) return null;

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
 * Verifica se um usuário possui autorização para executar um treino específico.
 * Não confia exclusivamente em estado do frontend: valida explicitamente o nível de acesso.
 */
export function canUserAccessWorkout(
  workout: CatalogWorkout, 
  userStatus?: SubscriptionStatus,
  userRole?: UserRole
): boolean {
  // Treinos gratuitos são liberados para todos (com ou sem login)
  if (workout.accessLevel === 'free') return true;

  // Treinador e Administrador possuem acesso total irrestrito
  if (userRole === 'trainer' || userRole === 'admin') return true;

  // Assinantes com status ativo ou em período de testes
  return userStatus === 'active' || userStatus === 'trialing';
}

/**
 * Converte um treino do catálogo diretamente em um WorkoutPlan para execução
 * imediata no StudentWorkoutView sem duplicar vídeos.
 * Valida autorização: caso seja Premium e o usuário não tenha permissão, retorna null.
 */
export function convertCatalogWorkoutToWorkoutPlan(
  workout: CatalogWorkout,
  userStatus?: SubscriptionStatus,
  userRole?: UserRole
): WorkoutPlan | null {
  // Barreira de segurança: impede execução de treinos protegidos sem permissão
  if (!canUserAccessWorkout(workout, userStatus, userRole)) {
    console.warn(`[Acesso Bloqueado] Tentativa de executar treino Premium (${workout.id}) sem assinatura ativa.`);
    return null;
  }

  const hydrated = getHydratedWorkout(workout.id);
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
