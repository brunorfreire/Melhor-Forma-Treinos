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
}

export interface WorkoutSession {
  id: string;
  name: string;
  focus: string;
  exercises: Exercise[];
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

export type ViewMode = 'home' | 'collection' | 'student' | 'editor';

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
  | 'mobilidade_equilibrio';

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
  videoUrl?: string; // URL direta de vídeo licenciado (mp4/webm)
  youtubeId?: string; // Código/ID de vídeo do YouTube curado
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
