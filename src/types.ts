export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: string;
  reps: string;
  rest: string;
  weight?: string;
  notes?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions?: string;
  cautions?: string;
  hasNoVideo?: boolean;
  muscleWikiUrl?: string;
  // Metadata vinda da biblioteca central
  centralExerciseId?: string;
  movementPattern?: string;
  equipment?: string;
  videoValidationStatus?: VideoValidationStatus;
  licenseSource?: string;
  fallbackMediaUrl?: string;
  vimeoId?: string;
  vimeoUrl?: string;
  mediaType?: 'image' | 'video' | 'youtube' | 'vimeo' | 'none';
}

export type WorkoutExecutionGroupKind = 'combinado' | 'conjugado' | 'circuitado';

export interface WorkoutExecutionGroup {
  id: string;
  kind: WorkoutExecutionGroupKind;
  /** IDs reais da ficha, em sequência contígua e sem reutilização por outro grupo. */
  exerciseIds: string[];
  /** Quantidade de rodadas e séries por exercício integrante. */
  rounds: number;
  /** Tempo entre exercícios da mesma rodada, inclusive zero. */
  restBetweenExercisesSeconds: number;
  /** Tempo após a rodada, antes de começar a próxima. */
  restBetweenRoundsSeconds: number;
}

export interface WorkoutSession {
  id: string;
  name: string;
  focus: string;
  exercises: Exercise[];
  /** Opcional: fichas antigas permanecem em execução simples. */
  executionGroups?: WorkoutExecutionGroup[];
}

export interface WorkoutPlan {
  id: string;
  studentName: string;
  trainerName: string;
  trainerPhone?: string;
  goal: string;
  frequency: string;
  generalNotes: string;
  sessions: WorkoutSession[];
  createdAt: string;
  updatedAt?: string;
}

export type ViewMode = 'home' | 'collection' | 'student' | 'evolution' | 'editor';

export interface SavedStudentWorkout {
  id: string;
  studentName: string;
  trainerName: string;
  trainerPhone?: string;
  goal: string;
  frequency: string;
  sessionsCount: number;
  exercisesCount: number;
  createdAt: string;
  updatedAt: string;
  plan: WorkoutPlan;
}

/* ========================================================================= */
/* ARQUITETURA DE DADOS: BIBLIOTECA CENTRAL E 72 TREINOS (PROMPT MESTRE)   */
/* ========================================================================= */

export type VideoValidationStatus = 'validado' | 'pendente_revisao' | 'sem_video';
export type WorkoutStatus = 'publicado' | 'rascunho' | 'revisao';
export type WorkoutLevel = 'iniciante' | 'intermediario' | 'avancado';

export type WorkoutCollectionCategory = 
  | 'forca_40_plus'
  | 'superiores'
  | 'inferiores'
  | 'full_body'
  | 'cardiorespiratorio'
  | 'mobilidade_equilibrio'
  | 'peitoral-ombro-triceps'
  | 'costas-biceps'
  | 'costas-trapezio-biceps';

export interface CollectionMeta {
  id: WorkoutCollectionCategory;
  name: string;
  shortDesc: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  totalWorkouts: number;
}

/**
 * 1. EXERCISES: Biblioteca central de exercícios
 */
export interface CentralExercise {
  id: string; // ID único e permanente, ex: "ex-goblet-squat"
  name: string; // Nome em português
  nameEn?: string; // Nome alternativo em inglês
  muscleGroup: string; // Peito, Costas, Quadríceps, Glúteos, Ombros, etc.
  movementPattern: string; // Empurrar, Puxar, Agachar, Dobradiça de quadril, Estabilidade de core, Locomoção, Mobilidade
  equipment: string; // Halteres, Peso corporal, Barra, Polia, Máquina, Elásticos, Kettlebell, Colchonete
  difficulty: WorkoutLevel; // iniciante, intermediario, avancado
  instructions: string; // Instruções técnicas
  cautions: string; // Cuidados e contraindicações relevantes
  externalId?: string; // ID externo (ex: MuscleWiki ID oficial)
  thumbnailUrl?: string; // URL ou referência da miniatura
  videoUrl?: string; // URL direta de vídeo licenciado (mp4/webm) ou mídia animada local (webp/gif)
  fallbackMediaUrl?: string; // URL de fallback caso a mídia primária falhe (ex: GIF de fallback para WebP)
  youtubeId?: string; // Código/ID de vídeo do YouTube curado
  vimeoId?: string; // Código/ID de vídeo do Vimeo
  vimeoUrl?: string; // URL do vídeo no Vimeo
  mediaType?: 'image' | 'video' | 'youtube' | 'vimeo' | 'none';
  licenseSource: 'original' | 'youtube_curated' | 'musclewiki_licensed' | 'manual';
  videoValidationStatus: VideoValidationStatus; // 'validado' | 'pendente_revisao' | 'sem_video'
  demonstratorInfo?: {
    gender?: 'feminino' | 'masculino';
    targetAgeGroup?: '40+' | 'geral';
  };
}

/**
 * 2. WORKOUTS: Biblioteca de sessões de treinamento (72 sessões)
 */
export interface CatalogWorkout {
  id: string; // ID único, ex: "w-40p-01", "w-sup-04"
  title: string;
  description: string;
  category: WorkoutCollectionCategory;
  level: WorkoutLevel;
  duration: string; // ex: "25 a 35 min"
  equipments: string[]; // ex: ["Halteres", "Colchonete", "Cadeira"]
  objective: string;
  coverImage: string;
  status: WorkoutStatus; // 'publicado' | 'rascunho' | 'revisao'
  accessLevel: 'free' | 'premium'; // Nível de acesso comercial
  photoAlt?: string;
  modelGender?: 'feminino' | 'masculino';
  modelAgeGroup?: string;
  authorTrainer?: string;
  updatedAt: string;
}

/**
 * 3. WORKOUT_EXERCISES: Relacionamento entre sessões e exercícios
 */
export interface WorkoutExerciseItem {
  workoutId: string;
  exerciseId: string;
  order: number;
  sets: string;
  reps: string;
  rest: string;
  load?: string;
  notes?: string;
  alternativeExerciseId?: string;
  alternativeNotes?: string;
}

/**
 * Estrutura hidratada combinando Workout + Exercícios Centrais
 */
export interface HydratedWorkoutSession {
  workout: CatalogWorkout;
  exercises: (Exercise & {
    centralDetails?: CentralExercise;
    order: number;
    alternativeDetails?: CentralExercise;
    alternativeNotes?: string;
  })[];
}

/* ========================================================================= */
/* ENTIDADES SAAS, SUPABASE AUTH & CONTROLE DE ACESSO FREEMIUM/PREMIUM       */
/* ========================================================================= */

export type UserRole = 'student' | 'trainer' | 'admin';
export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'trialing' | 'refunded';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  cref?: string;
  created_at: string;
  subscription_status?: SubscriptionStatus;
}

export interface Product {
  id: string;
  nome: string;
  tipo: 'subscription' | 'one_time';
  status: 'active' | 'archived';
  description?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  status: SubscriptionStatus;
  current_period_end: string;
  payment_provider_reference?: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  status: 'active' | 'expired';
  expires_at?: string;
}

export interface WorkoutAccessRecord {
  workout_id: string;
  access_level: 'free' | 'premium';
}

export interface UserProgressRecord {
  id: string;
  user_id: string;
  workout_id: string;
  exercise_id?: string;
  workout_title?: string;
  category?: WorkoutCollectionCategory;
  status: 'completed' | 'in_progress';
  completed_at: string;
  duration_seconds?: number;
  goals?: string[];
  muscle_groups?: string[];
  level?: string;
  notes?: string;
  source?: 'app_session' | 'manual_entry';
}

export interface UserFavoriteRecord {
  user_id: string;
  workout_id: string;
  created_at?: string;
}

/**
 * Sessão em andamento para retomada ("Continue de onde parou")
 */
export interface ActiveWorkoutSession {
  workoutId: string;
  workoutTitle: string;
  category: WorkoutCollectionCategory;
  duration: string;
  coverImage: string;
  startedAt: string;
  lastActiveAt: string;
  completedExercisesIds: string[];
  totalExercises: number;
  currentExerciseIndex: number;
  plan: WorkoutPlan;
}

/**
 * Estatísticas reais do aluno (sem calorias falsas)
 */
export interface StudentProgressStats {
  completedWorkoutsCount: number;
  totalTrainingMinutes: number;
  weeklyFrequency: number;
  categoryBreakdown: Record<string, number>;
  lastCompletedDate?: string;
}

/**
 * Tipos para "Meu Treino de Hoje" com seleção de múltiplos objetivos
 */
export type TodayWorkoutGoalId = 
  | 'ganhar-forca'
  | 'melhorar-condicionamento'
  | 'melhorar-mobilidade'
  | 'desenvolver-equilibrio'
  | 'treinar-corpo-inteiro';

export interface TodayGoalOption {
  id: TodayWorkoutGoalId;
  label: string;
  description: string;
  iconName: string;
}

export type TodayExperienceLevel = 'iniciante' | 'intermediario' | 'avancado' | 'todos';
export type TodayDurationPref = 'rapido' | 'medio' | 'longo' | 'todos';
export type TodayMusclePref = 'todos' | 'superiores' | 'inferiores' | 'full_body' | 'mobilidade' | 'peitoral-ombro-triceps' | 'costas-biceps';

export interface TodayWorkoutPreferences {
  goals: TodayWorkoutGoalId[];
  level: TodayExperienceLevel;
  duration: TodayDurationPref;
  musclePref: TodayMusclePref;
}

export interface RecommendedWorkoutMatch {
  workout: CatalogWorkout;
  matchScore: number; // 0 a 100%
  matchingGoals: TodayWorkoutGoalId[];
  matchedGoalLabels: string[];
  reasons: string[];
  isTopMatch?: boolean;
  recentlyCompleted?: boolean;
  lastCompletedDate?: string;
  isFresh?: boolean;
}

