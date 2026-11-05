import { PrimaryMuscleFocus, MovementPatternType, WorkoutCollectionCategory } from '../types';
import { INITIAL_WORKOUT_EXERCISES } from '../data/workoutExercises';

export interface WorkoutClassificationMeta {
  id: string;
  title: string;
  category: WorkoutCollectionCategory;
  primaryFocus: PrimaryMuscleFocus;
  movementPattern: MovementPatternType;
  secondaryFocus: string[];
  exerciseCount: number;
}

/**
 * Mapa de contagem de exercícios por ID de treino
 */
const EXERCISE_COUNT_BY_ID: Record<string, number> = {};
INITIAL_WORKOUT_EXERCISES.forEach(r => {
  EXERCISE_COUNT_BY_ID[r.workoutId] = (EXERCISE_COUNT_BY_ID[r.workoutId] || 0) + 1;
});

/**
 * Classificação oficial e anatômica dos 72 treinos do catálogo Melhor Forma Play 40+
 * Baseada no foco muscular primário e padrão biomecânico predominante.
 */
export const CATALOG_CLASSIFICATIONS: Record<string, WorkoutClassificationMeta> = {
  // =========================================================================
  // COLEÇÃO 1: FORÇA PARA A VIDA 40+ (w-40p-01 a w-40p-12)
  // =========================================================================
  'w-40p-01': {
    id: 'w-40p-01',
    title: 'Primeiros Passos na Força 40+',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'costas-biceps', 'peitoral-ombro-triceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-01'] || 4
  },
  'w-40p-02': {
    id: 'w-40p-02',
    title: 'Estabilidade Articular & Alinhamento',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'mobilidade',
    secondaryFocus: ['mobilidade_equilibrio'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-02'] || 4
  },
  'w-40p-03': {
    id: 'w-40p-03',
    title: 'Força de Base com Cadeira',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'agachar',
    secondaryFocus: ['inferiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-03'] || 4
  },
  'w-40p-04': {
    id: 'w-40p-04',
    title: 'Despertar Muscular 40+',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-04'] || 4
  },
  'w-40p-05': {
    id: 'w-40p-05',
    title: 'Força Funcional & Tônus',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'peitoral-ombro-triceps', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-05'] || 5
  },
  'w-40p-06': {
    id: 'w-40p-06',
    title: 'Autonomia & Cargas Moderadas',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'peitoral-ombro-triceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-06'] || 4
  },
  'w-40p-07': {
    id: 'w-40p-07',
    title: 'Empurrar & Puxar Seguro',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['peitoral-ombro-triceps', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-07'] || 4
  },
  'w-40p-08': {
    id: 'w-40p-08',
    title: 'Resistência Muscular Ativa',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'cardiorespiratorio'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-08'] || 4
  },
  'w-40p-09': {
    id: 'w-40p-09',
    title: 'Densidade Óssea & Carga Firme',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-09'] || 4
  },
  'w-40p-10': {
    id: 'w-40p-10',
    title: 'Força Vital & Potência Funcional',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'costas-biceps', 'peitoral-ombro-triceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-10'] || 4
  },
  'w-40p-11': {
    id: 'w-40p-11',
    title: 'Força Total & Vigor 40+',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'peitoral-ombro-triceps', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-11'] || 4
  },
  'w-40p-12': {
    id: 'w-40p-12',
    title: 'Superação & Longevidade Ativa',
    category: 'forca_40_plus',
    primaryFocus: 'forca_40_plus',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-40p-12'] || 4
  },

  // =========================================================================
  // COLEÇÃO 2: MEMBROS SUPERIORES (w-sup-01 a w-sup-12)
  // =========================================================================
  'w-sup-01': {
    id: 'w-sup-01',
    title: 'Postura & Peitoral Leve',
    category: 'superiores',
    primaryFocus: 'peitoral-ombro-triceps', // PUSH PURO
    movementPattern: 'empurrar',
    secondaryFocus: ['superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-01'] || 4
  },
  'w-sup-02': {
    id: 'w-sup-02',
    title: 'Costas & Ombros Protegidos',
    category: 'superiores',
    primaryFocus: 'costas-biceps', // PULL PURO (Dorsal, Romboides, Remadas)
    movementPattern: 'puxar',
    secondaryFocus: ['superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-02'] || 4
  },
  'w-sup-03': {
    id: 'w-sup-03',
    title: 'Braços Firmes & Cotovelos Seguros',
    category: 'superiores',
    primaryFocus: 'bracos',
    movementPattern: 'isolamento',
    secondaryFocus: ['superiores', 'costas-biceps', 'peitoral-ombro-triceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-03'] || 4
  },
  'w-sup-04': {
    id: 'w-sup-04',
    title: 'Fortalecimento de Punhos & Cintura Escapular',
    category: 'superiores',
    primaryFocus: 'cintura_escapular',
    movementPattern: 'mobilidade',
    secondaryFocus: ['superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-04'] || 4
  },
  'w-sup-05': {
    id: 'w-sup-05',
    title: 'Puxar e Empurrar',
    category: 'superiores',
    primaryFocus: 'superiores_composto', // MISTO DE EMPURRAR E PUXAR
    movementPattern: 'composto',
    secondaryFocus: ['superiores', 'peitoral-ombro-triceps', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-05'] || 4
  },
  'w-sup-06': {
    id: 'w-sup-06',
    title: 'Esculpir Ombros & Tríceps',
    category: 'superiores',
    primaryFocus: 'peitoral-ombro-triceps', // PUSH PURO (Deltóides e Tríceps)
    movementPattern: 'empurrar',
    secondaryFocus: ['superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-06'] || 4
  },
  'w-sup-07': {
    id: 'w-sup-07',
    title: 'Costas Definidas & Fortes',
    category: 'superiores',
    primaryFocus: 'costas-biceps', // PULL PURO (Dorsal, Remada Curvada, Bíceps)
    movementPattern: 'puxar',
    secondaryFocus: ['superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-07'] || 4
  },
  'w-sup-08': {
    id: 'w-sup-08',
    title: 'Superiores Completo com Halteres',
    category: 'superiores',
    primaryFocus: 'superiores_composto',
    movementPattern: 'composto',
    secondaryFocus: ['superiores', 'peitoral-ombro-triceps', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-08'] || 4
  },
  'w-sup-09': {
    id: 'w-sup-09',
    title: 'Densidade de Superiores Avançada',
    category: 'superiores',
    primaryFocus: 'peitoral-ombro-triceps', // PUSH PREDOMINANTE (Supino, Desenvolvimento, Tríceps)
    movementPattern: 'empurrar',
    secondaryFocus: ['superiores', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-09'] || 4
  },
  'w-sup-10': {
    id: 'w-sup-10',
    title: 'Força & Tração Avançada',
    category: 'superiores',
    primaryFocus: 'costas-biceps', // PULL PURO (Lat Pulldown, Remada, Crucifixo Invertido, Rosca)
    movementPattern: 'puxar',
    secondaryFocus: ['superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-10'] || 4
  },
  'w-sup-11': {
    id: 'w-sup-11',
    title: 'Potência & Definição de Ombros',
    category: 'superiores',
    primaryFocus: 'peitoral-ombro-triceps', // PUSH / OMBROS (Desenvolvimento, Elevação Lateral e Frontal)
    movementPattern: 'empurrar',
    secondaryFocus: ['superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-11'] || 4
  },
  'w-sup-12': {
    id: 'w-sup-12',
    title: 'Desafio Master de Membros Superiores',
    category: 'superiores',
    primaryFocus: 'superiores_composto',
    movementPattern: 'composto',
    secondaryFocus: ['superiores', 'peitoral-ombro-triceps', 'costas-biceps'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-sup-12'] || 4
  },

  // =========================================================================
  // COLEÇÃO 3: MEMBROS INFERIORES (w-inf-01 a w-inf-12)
  // =========================================================================
  'w-inf-01': {
    id: 'w-inf-01',
    title: 'Pernas Firmes & Joelhos Protegidos',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-01'] || 4
  },
  'w-inf-02': {
    id: 'w-inf-02',
    title: 'Glúteos & Isquiotibiais no Solo',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'dobradica',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-02'] || 4
  },
  'w-inf-03': {
    id: 'w-inf-03',
    title: 'Panturrilhas & Estabilidade de Tornozelo',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-03'] || 3
  },
  'w-inf-04': {
    id: 'w-inf-04',
    title: 'Pernas Leves & Firmeza',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-04'] || 3
  },
  'w-inf-05': {
    id: 'w-inf-05',
    title: 'Força de Quadríceps & Passada',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-05'] || 4
  },
  'w-inf-06': {
    id: 'w-inf-06',
    title: 'Elevação Pélvica & Glúteo Médio',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'dobradica',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-06'] || 3
  },
  'w-inf-07': {
    id: 'w-inf-07',
    title: 'Búlgaro & Unilateral Controlado',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-07'] || 3
  },
  'w-inf-08': {
    id: 'w-inf-08',
    title: 'Pernas & Glúteos Esculpidos',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-08'] || 4
  },
  'w-inf-09': {
    id: 'w-inf-09',
    title: 'Força Máxima Controlada de Inferiores',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-09'] || 3
  },
  'w-inf-10': {
    id: 'w-inf-10',
    title: 'Densidade de Pernas & Autonomia',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-10'] || 3
  },
  'w-inf-11': {
    id: 'w-inf-11',
    title: 'Resistência & Potência de Glúteos',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-11'] || 3
  },
  'w-inf-12': {
    id: 'w-inf-12',
    title: 'Desafio Inferiores Master',
    category: 'inferiores',
    primaryFocus: 'inferiores',
    movementPattern: 'agachar',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-inf-12'] || 4
  },

  // =========================================================================
  // COLEÇÃO 4: FULL BODY INTEGRADO (w-fb-01 a w-fb-12)
  // =========================================================================
  'w-fb-01': {
    id: 'w-fb-01',
    title: 'Corpo Todo em Harmonia',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-01'] || 4
  },
  'w-fb-02': {
    id: 'w-fb-02',
    title: 'Circuito Funcional Leve',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-02'] || 4
  },
  'w-fb-03': {
    id: 'w-fb-03',
    title: 'Movimento Global & Articulações',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['mobilidade_equilibrio'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-03'] || 4
  },
  'w-fb-04': {
    id: 'w-fb-04',
    title: 'Full Body Essencial em 20 Minutos',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-04'] || 4
  },
  'w-fb-05': {
    id: 'w-fb-05',
    title: 'Força Integrada Corpo Inteiro',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-05'] || 5
  },
  'w-fb-06': {
    id: 'w-fb-06',
    title: 'Combos Funcionais com Halteres',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-06'] || 4
  },
  'w-fb-07': {
    id: 'w-fb-07',
    title: 'Tônus Global & Firmeza',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-07'] || 4
  },
  'w-fb-08': {
    id: 'w-fb-08',
    title: 'Full Body Dinâmico 40+',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores', 'cardiorespiratorio'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-08'] || 4
  },
  'w-fb-09': {
    id: 'w-fb-09',
    title: 'Complex de Força Corpo Todo',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-09'] || 4
  },
  'w-fb-10': {
    id: 'w-fb-10',
    title: 'Alta Eficiência Global',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-10'] || 3
  },
  'w-fb-11': {
    id: 'w-fb-11',
    title: 'Desafio Total 40+ Full Body',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-11'] || 3
  },
  'w-fb-12': {
    id: 'w-fb-12',
    title: 'Maestria Corporal Completa',
    category: 'full_body',
    primaryFocus: 'full_body',
    movementPattern: 'composto',
    secondaryFocus: ['inferiores', 'superiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-fb-12'] || 3
  },

  // =========================================================================
  // COLEÇÃO 5: CARDIORESPIRATÓRIO & CONDICIONAMENTO (w-cardio-01 a w-cardio-12)
  // =========================================================================
  'w-cardio-01': {
    id: 'w-cardio-01',
    title: 'Caminhada Ativa & Ritmo Constante',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-01'] || 3
  },
  'w-cardio-02': {
    id: 'w-cardio-02',
    title: 'Cardio de Baixo Impacto',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-02'] || 3
  },
  'w-cardio-03': {
    id: 'w-cardio-03',
    title: 'Fôlego & Circulação Ativa',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-03'] || 3
  },
  'w-cardio-04': {
    id: 'w-cardio-04',
    title: 'Passo Leve & Respiração',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: ['mobilidade_equilibrio'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-04'] || 3
  },
  'w-cardio-05': {
    id: 'w-cardio-05',
    title: 'Intervalado Suave (AIT 40+)',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-05'] || 3
  },
  'w-cardio-06': {
    id: 'w-cardio-06',
    title: 'Cardio Funcional sem Saltos',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: ['inferiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-06'] || 3
  },
  'w-cardio-07': {
    id: 'w-cardio-07',
    title: 'Subida no Degrau & Ritmo',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: ['inferiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-07'] || 3
  },
  'w-cardio-08': {
    id: 'w-cardio-08',
    title: 'Disposição & Resistência Aeróbia',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-08'] || 2
  },
  'w-cardio-09': {
    id: 'w-cardio-09',
    title: 'HIIT Seguro para Articulações',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-09'] || 2
  },
  'w-cardio-10': {
    id: 'w-cardio-10',
    title: 'Circuito Metabólico de Força',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: ['inferiores'],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-10'] || 2
  },
  'w-cardio-11': {
    id: 'w-cardio-11',
    title: 'Fôlego de Campeã 40+',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-11'] || 2
  },
  'w-cardio-12': {
    id: 'w-cardio-12',
    title: 'Resistência Cardiovascular Plena',
    category: 'cardiorespiratorio',
    primaryFocus: 'cardiorespiratorio',
    movementPattern: 'locomocao',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-cardio-12'] || 2
  },

  // =========================================================================
  // COLEÇÃO 6: MOBILIDADE & EQUILÍBRIO (w-mob-01 a w-mob-12)
  // =========================================================================
  'w-mob-01': {
    id: 'w-mob-01',
    title: 'Despertar Articular Matinal',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-01'] || 3
  },
  'w-mob-02': {
    id: 'w-mob-02',
    title: 'Equilíbrio Unipodal com Apoio',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-02'] || 3
  },
  'w-mob-03': {
    id: 'w-mob-03',
    title: 'Alívio de Lombar & Pelve',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-03'] || 3
  },
  'w-mob-04': {
    id: 'w-mob-04',
    title: 'Ombros Livres & Pescoço Leve',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-04'] || 3
  },
  'w-mob-05': {
    id: 'w-mob-05',
    title: 'Mobilidade Dinâmica de Quadril (90/90)',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-05'] || 3
  },
  'w-mob-06': {
    id: 'w-mob-06',
    title: 'Estabilidade do Core & Propriocepção',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-06'] || 3
  },
  'w-mob-07': {
    id: 'w-mob-07',
    title: 'Tornozelos & Joelhos Resilientes',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-07'] || 3
  },
  'w-mob-08': {
    id: 'w-mob-08',
    title: 'Flexibilidade Funcional Ativa',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-08'] || 3
  },
  'w-mob-09': {
    id: 'w-mob-09',
    title: 'Cadeia Posterior & Descompressão Total',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-09'] || 3
  },
  'w-mob-10': {
    id: 'w-mob-10',
    title: 'Equilíbrio Dinâmico & Agilidade 40+',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-10'] || 2
  },
  'w-mob-11': {
    id: 'w-mob-11',
    title: 'Mobilidade Global Profunda',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-11'] || 3
  },
  'w-mob-12': {
    id: 'w-mob-12',
    title: 'Maestria em Movimento & Postura',
    category: 'mobilidade_equilibrio',
    primaryFocus: 'mobilidade_equilibrio',
    movementPattern: 'mobilidade',
    secondaryFocus: [],
    exerciseCount: EXERCISE_COUNT_BY_ID['w-mob-12'] || 3
  }
};

/**
 * Obtém os metadados de classificação de um treino
 */
export function getWorkoutClassification(workoutId: string): WorkoutClassificationMeta | null {
  return CATALOG_CLASSIFICATIONS[workoutId] || null;
}

/**
 * Retorna com segurança a quantidade real de exercícios de um treino
 * (mesmo para treinos Premium bloqueados, sem expor vídeos ou cargas)
 */
export function getWorkoutExerciseCount(workoutId: string): number {
  const meta = CATALOG_CLASSIFICATIONS[workoutId];
  if (meta && meta.exerciseCount > 0) {
    return meta.exerciseCount;
  }
  const count = EXERCISE_COUNT_BY_ID[workoutId];
  if (count && count > 0) {
    return count;
  }
  return 4; // fallback seguro para manter o card funcional
}

/**
 * Verifica se um treino pertence genuinamente ao agrupamento Peitoral, Ombro e Tríceps (PUSH)
 * Regra: Foco primário Push / Membros Superiores anteriores ou foco explícito.
 * NUNCA permite treinos de Inferiores, Costas puro, Cardio ou Mobilidade pura.
 */
export function isPushWorkout(workout: { id: string; category?: string; primaryFocus?: string }): boolean {
  const meta = CATALOG_CLASSIFICATIONS[workout.id];
  if (meta) {
    return meta.primaryFocus === 'peitoral-ombro-triceps';
  }
  return workout.primaryFocus === 'peitoral-ombro-triceps';
}

/**
 * Verifica se um treino pertence genuinamente ao agrupamento Costas, Bíceps e Trapézio (PULL)
 * Regra: Foco primário Pull / Costas e Bíceps.
 */
export function isPullWorkout(workout: { id: string; category?: string; primaryFocus?: string }): boolean {
  const meta = CATALOG_CLASSIFICATIONS[workout.id];
  if (meta) {
    return meta.primaryFocus === 'costas-biceps';
  }
  return workout.primaryFocus === 'costas-biceps';
}

/**
 * Verifica se um treino pertence aos Membros Inferiores
 */
export function isLowerWorkout(workout: { id: string; category?: string; primaryFocus?: string }): boolean {
  const meta = CATALOG_CLASSIFICATIONS[workout.id];
  if (meta) {
    return meta.category === 'inferiores' || meta.primaryFocus === 'inferiores';
  }
  return workout.category === 'inferiores' || workout.primaryFocus === 'inferiores';
}

/**
 * Avalia estritamente se um treino atende ao filtro do catálogo
 */
export function matchesClassificationFilter(
  workout: {
    id: string;
    category?: string;
    primaryFocus?: string;
    levelId?: string;
    level?: string;
    accessLevel?: string;
    pillarId?: string;
    focus?: string;
  },
  filterId: string
): boolean {
  if (!filterId || filterId === 'todos') return true;

  const meta = CATALOG_CLASSIFICATIONS[workout.id];
  const cat = meta?.category || workout.category;
  const primaryFocus = meta?.primaryFocus || workout.primaryFocus;

  switch (filterId) {
    // 1. Divisões Anatômicas Específicas
    case 'peitoral-ombro-triceps':
      return primaryFocus === 'peitoral-ombro-triceps';

    case 'costas-biceps':
    case 'costas-trapezio-biceps':
    case 'costas-biceps-trapezio':
      return primaryFocus === 'costas-biceps';

    // 2. Categorias Oficiais do Catálogo
    case 'superiores':
      return cat === 'superiores';

    case 'inferiores':
      return cat === 'inferiores';

    case 'full_body':
      return cat === 'full_body';

    case 'forca_40_plus':
      return cat === 'forca_40_plus';

    case 'cardiorespiratorio':
      return cat === 'cardiorespiratorio';

    case 'mobilidade_equilibrio':
      return cat === 'mobilidade_equilibrio';

    // 3. Filtros Transversais de Nível
    case 'nivel-1':
      return workout.levelId === 'nivel-1' || workout.level === 'iniciante';

    case 'nivel-2':
      return workout.levelId === 'nivel-2' || workout.level === 'intermediario';

    case 'nivel-3':
      return workout.levelId === 'nivel-3' || workout.level === 'avancado';

    // 4. Filtros Transversais de Acesso Comercial
    case 'gratis':
      return workout.accessLevel === 'free';

    case 'premium':
      return workout.accessLevel === 'premium';

    default:
      return true;
  }
}

/**
 * Relatório completo de auditoria para fins de diagnóstico e curadoria contínua
 */
export interface CatalogAuditReport {
  totalWorkouts: number;
  totalRelations: number;
  categoryDistribution: Record<string, number>;
  primaryFocusDistribution: Record<string, number>;
  pushWorkouts: { id: string; title: string; count: number }[];
  pullWorkouts: { id: string; title: string; count: number }[];
  empurrarPuxarSeguro: { id: string; title: string; exerciseCount: number; valid: boolean };
  crossContaminationPushViolations: string[];
  workoutsWithZeroExercises: string[];
  isValid: boolean;
}

/**
 * Executa a auditoria completa do catálogo
 */
export function auditCatalogClassification(): CatalogAuditReport {
  const ids = Object.keys(CATALOG_CLASSIFICATIONS);
  const totalWorkouts = ids.length;
  let totalRelations = 0;

  const categoryDistribution: Record<string, number> = {};
  const primaryFocusDistribution: Record<string, number> = {};
  const pushWorkouts: { id: string; title: string; count: number }[] = [];
  const pullWorkouts: { id: string; title: string; count: number }[] = [];
  const crossContaminationPushViolations: string[] = [];
  const workoutsWithZeroExercises: string[] = [];

  ids.forEach(id => {
    const meta = CATALOG_CLASSIFICATIONS[id];
    totalRelations += meta.exerciseCount;

    categoryDistribution[meta.category] = (categoryDistribution[meta.category] || 0) + 1;
    primaryFocusDistribution[meta.primaryFocus] = (primaryFocusDistribution[meta.primaryFocus] || 0) + 1;

    if (meta.exerciseCount === 0) {
      workoutsWithZeroExercises.push(id);
    }

    if (meta.primaryFocus === 'peitoral-ombro-triceps') {
      pushWorkouts.push({ id: meta.id, title: meta.title, count: meta.exerciseCount });
      // Validação de contaminação cruzada
      if (meta.category === 'inferiores' || meta.category === 'cardiorespiratorio' || meta.category === 'mobilidade_equilibrio') {
        crossContaminationPushViolations.push(`${meta.id} (${meta.category}) não pode ser push`);
      }
    }

    if (meta.primaryFocus === 'costas-biceps') {
      pullWorkouts.push({ id: meta.id, title: meta.title, count: meta.exerciseCount });
    }
  });

  const empurrarPuxar = CATALOG_CLASSIFICATIONS['w-40p-07'];
  const empurrarPuxarReport = {
    id: 'w-40p-07',
    title: empurrarPuxar?.title || 'Empurrar & Puxar Seguro',
    exerciseCount: empurrarPuxar?.exerciseCount || 0,
    valid: (empurrarPuxar?.exerciseCount || 0) > 0
  };

  const isValid = 
    totalWorkouts === 72 &&
    crossContaminationPushViolations.length === 0 &&
    workoutsWithZeroExercises.length === 0 &&
    empurrarPuxarReport.valid;

  return {
    totalWorkouts,
    totalRelations,
    categoryDistribution,
    primaryFocusDistribution,
    pushWorkouts,
    pullWorkouts,
    empurrarPuxarSeguro: empurrarPuxarReport,
    crossContaminationPushViolations,
    workoutsWithZeroExercises,
    isValid
  };
}
