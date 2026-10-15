import { 
  CatalogWorkout, 
  TodayWorkoutGoalId, 
  TodayGoalOption, 
  TodayWorkoutPreferences, 
  RecommendedWorkoutMatch 
} from '../types';
import { getCompletedWorkoutsHistory } from './studentProgressService';

export const TODAY_GOAL_OPTIONS: TodayGoalOption[] = [
  {
    id: 'ganhar-forca',
    label: 'Ganhar força',
    description: 'Treino resistido para preservar massa magra, densidade óssea e vitalidade',
    iconName: 'Dumbbell'
  },
  {
    id: 'melhorar-condicionamento',
    label: 'Melhorar condicionamento',
    description: 'Fôlego, disposição cardiovascular e resistência sem impacto agressivo',
    iconName: 'HeartPulse'
  },
  {
    id: 'melhorar-mobilidade',
    label: 'Melhorar mobilidade',
    description: 'Liberdade articular, amplitude e alívio de tensões na coluna e quadril',
    iconName: 'Sparkles'
  },
  {
    id: 'desenvolver-equilibrio',
    label: 'Desenvolver equilíbrio',
    description: 'Estabilidade, segurança nos passos e prevenção ativa de quedas',
    iconName: 'Scale'
  },
  {
    id: 'treinar-corpo-inteiro',
    label: 'Treinar o corpo inteiro',
    description: 'Sessão integrada com grandes grupos musculares em um único treino',
    iconName: 'Activity'
  }
];

export const GOAL_LABELS: Record<TodayWorkoutGoalId, string> = {
  'ganhar-forca': 'Ganhar força',
  'melhorar-condicionamento': 'Melhorar condicionamento',
  'melhorar-mobilidade': 'Melhorar mobilidade',
  'desenvolver-equilibrio': 'Desenvolver equilíbrio',
  'treinar-corpo-inteiro': 'Treinar o corpo inteiro'
};

const STORAGE_PREFS_KEY = 'mf_meu_treino_hoje_prefs_v1';

export const DEFAULT_PREFERENCES: TodayWorkoutPreferences = {
  goals: ['ganhar-forca'],
  level: 'todos',
  duration: 'todos',
  musclePref: 'todos'
};

export function loadSavedTodayPreferences(): TodayWorkoutPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.goals) && parsed.goals.length > 0) {
      return {
        goals: parsed.goals.slice(0, 3),
        level: parsed.level || 'todos',
        duration: parsed.duration || 'todos',
        musclePref: parsed.musclePref || 'todos'
      };
    }
  } catch (e) {
    console.warn('Erro ao carregar preferências de Meu Treino de Hoje:', e);
  }
  return DEFAULT_PREFERENCES;
}

export function saveTodayPreferences(prefs: TodayWorkoutPreferences): void {
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Erro ao salvar preferências de Meu Treino de Hoje:', e);
  }
}

/**
 * Avalia se um treino atende determinísticamente a um objetivo específico
 */
export function checkWorkoutMatchesGoal(workout: CatalogWorkout, goal: TodayWorkoutGoalId): boolean {
  const textCorpus = [
    workout.title,
    workout.description,
    workout.objective,
    workout.category
  ].join(' ').toLowerCase();

  switch (goal) {
    case 'ganhar-forca': {
      if (
        workout.category === 'forca_40_plus' ||
        workout.category === 'superiores' ||
        workout.category === 'inferiores' ||
        workout.category === 'peitoral-ombro-triceps' ||
        workout.category === 'costas-biceps' ||
        workout.category === 'costas-trapezio-biceps'
      ) return true;
      return /força|fortalec|hipertrofia|resistid|tônus|carga|massa magra|densidade/.test(textCorpus);
    }
    case 'melhorar-condicionamento': {
      if (workout.category === 'cardiorespiratorio') return true;
      return /condicionamento|cardio|fôlego|aeróbic|metabólic|circuito|resistência|disposição/.test(textCorpus);
    }
    case 'melhorar-mobilidade': {
      if (workout.category === 'mobilidade_equilibrio') return true;
      return /mobilidade|alongamento|flexibilidade|articular|postura|amplitude|escápula|coluna|quadril/.test(textCorpus);
    }
    case 'desenvolver-equilibrio': {
      if (workout.category === 'mobilidade_equilibrio') return true;
      return /equilíbrio|estabilidade|unilateral|propriocepção|quedas|firmeza|base|apoio/.test(textCorpus);
    }
    case 'treinar-corpo-inteiro': {
      if (workout.category === 'full_body' || workout.category === 'forca_40_plus') return true;
      return /full body|corpo inteiro|integrado|global|completo|corpo todo/.test(textCorpus);
    }
    default:
      return false;
  }
}

/**
 * Calcula a duração aproximada em minutos a partir de string "25 a 35 min"
 */
function parseEstimatedMinutes(durationStr: string): number {
  const matches = durationStr.match(/\d+/g);
  if (!matches || matches.length === 0) return 30;
  if (matches.length === 1) return parseInt(matches[0], 10);
  const sum = matches.map(n => parseInt(n, 10)).reduce((a, b) => a + b, 0);
  return Math.round(sum / matches.length);
}

/**
 * Algoritmo determinístico de recomendação para o Meu Treino de Hoje
 * Avalia até 3 objetivos selecionados, nível, tempo e região muscular
 */
export function getRecommendedWorkouts(
  workouts: CatalogWorkout[],
  prefs: TodayWorkoutPreferences
): RecommendedWorkoutMatch[] {
  if (!workouts || workouts.length === 0) return [];

  const completedHistory = getCompletedWorkoutsHistory();
  // Mapa de conclusões recentes por ID do treino
  const historyMap = new Map<string, { lastCompletedAt: string; count: number; hoursAgo: number }>();
  const now = Date.now();

  completedHistory.forEach((rec) => {
    if (!rec.workout_id) return;
    const completedTime = new Date(rec.completed_at).getTime();
    const hoursAgo = Math.max(0, (now - completedTime) / (1000 * 60 * 60));
    const existing = historyMap.get(rec.workout_id);
    if (!existing) {
      historyMap.set(rec.workout_id, {
        lastCompletedAt: rec.completed_at,
        count: 1,
        hoursAgo
      });
    } else {
      existing.count += 1;
      if (hoursAgo < existing.hoursAgo) {
        existing.hoursAgo = hoursAgo;
        existing.lastCompletedAt = rec.completed_at;
      }
    }
  });

  const selectedGoals = prefs.goals && prefs.goals.length > 0 ? prefs.goals : (['ganhar-forca'] as TodayWorkoutGoalId[]);

  const matches: RecommendedWorkoutMatch[] = workouts.map((w) => {
    let score = 0;
    const reasons: string[] = [];
    const matchedGoals: TodayWorkoutGoalId[] = [];

    // 1. AVALIAÇÃO DE OBJETIVOS (Peso máx: 55 pts + bônus de combo de 10 pts)
    selectedGoals.forEach((goal) => {
      if (checkWorkoutMatchesGoal(w, goal)) {
        matchedGoals.push(goal);
      }
    });

    const goalMatchRatio = matchedGoals.length / selectedGoals.length;
    score += goalMatchRatio * 55;

    if (matchedGoals.length === selectedGoals.length && selectedGoals.length > 1) {
      score += 10; // Bônus por atender 100% dos objetivos múltiplos selecionados
      reasons.push(`Atende todos os ${selectedGoals.length} objetivos escolhidos`);
    } else if (matchedGoals.length > 0) {
      reasons.push(`Compatível com ${matchedGoals.length} de ${selectedGoals.length} objetivos`);
    }

    // 2. AVALIAÇÃO DE NÍVEL (Peso máx: 15 pts)
    if (prefs.level === 'todos') {
      score += 15;
    } else if (w.level === prefs.level) {
      score += 15;
      reasons.push(`Nível ideal (${w.level === 'iniciante' ? 'Iniciante' : w.level === 'intermediario' ? 'Intermediário' : 'Avançado'})`);
    } else {
      // Diferença de nível
      const levels = ['iniciante', 'intermediario', 'avancado'];
      const userIdx = levels.indexOf(prefs.level);
      const wIdx = levels.indexOf(w.level);
      if (Math.abs(userIdx - wIdx) === 1) {
        score += 8;
      }
    }

    // 3. AVALIAÇÃO DE DURAÇÃO (Peso máx: 15 pts)
    const minutes = parseEstimatedMinutes(w.duration);
    if (prefs.duration === 'todos') {
      score += 15;
    } else if (prefs.duration === 'rapido') {
      if (minutes <= 25) {
        score += 15;
        reasons.push(`Duração rápida (${w.duration})`);
      } else if (minutes <= 32) {
        score += 8;
      }
    } else if (prefs.duration === 'medio') {
      if (minutes >= 20 && minutes <= 38) {
        score += 15;
        reasons.push(`Duração moderada (${w.duration})`);
      } else {
        score += 6;
      }
    } else if (prefs.duration === 'longo') {
      if (minutes >= 35) {
        score += 15;
        reasons.push(`Treino completo (${w.duration})`);
      } else if (minutes >= 28) {
        score += 7;
      }
    }

    // 4. AVALIAÇÃO DE PREFERÊNCIA MUSCULAR / FOCO (Peso máx: 15 pts)
    if (prefs.musclePref === 'todos') {
      score += 15;
    } else if (prefs.musclePref === 'superiores') {
      if (
        w.category === 'superiores' ||
        w.category === 'peitoral-ombro-triceps' ||
        w.category === 'costas-biceps' ||
        w.category === 'costas-trapezio-biceps'
      ) {
        score += 15;
        reasons.push('Foco em Membros Superiores');
      }
    } else if (prefs.musclePref === 'inferiores') {
      if (w.category === 'inferiores') {
        score += 15;
        reasons.push('Foco em Membros Inferiores');
      }
    } else if (prefs.musclePref === 'full_body') {
      if (w.category === 'full_body' || w.category === 'forca_40_plus') {
        score += 15;
        reasons.push('Treino de Corpo Inteiro');
      }
    } else if (prefs.musclePref === 'mobilidade') {
      if (w.category === 'mobilidade_equilibrio') {
        score += 15;
        reasons.push('Foco em Mobilidade & Articulações');
      }
    } else if (prefs.musclePref === 'peitoral-ombro-triceps') {
      if (w.category === 'peitoral-ombro-triceps' || w.id === 'w-sup-01' || w.id === 'w-sup-03' || w.id === 'w-sup-05' || w.id === 'w-sup-09') {
        score += 15;
        reasons.push('Divisão Empurrar (Peito, Ombro e Tríceps)');
      }
    } else if (prefs.musclePref === 'costas-biceps') {
      if (w.category === 'costas-biceps' || w.category === 'costas-trapezio-biceps' || w.id === 'w-sup-02' || w.id === 'w-sup-04' || w.id === 'w-sup-06' || w.id === 'w-sup-10') {
        score += 15;
        reasons.push('Divisão Puxar (Costas, Bíceps e Trapézio)');
      }
    }

    // 5. INTEGRAÇÃO COM HISTÓRICO: Redução de repetições desnecessárias & estímulo à variedade
    const historyEntry = historyMap.get(w.id);
    let recentlyCompleted = false;
    let isFresh = !historyEntry;
    let lastCompletedDate: string | undefined = undefined;

    if (historyEntry) {
      lastCompletedDate = historyEntry.lastCompletedAt;
      if (historyEntry.hoursAgo <= 36) {
        // Concluído nas últimas 36 horas: reduz pontuação para abrir espaço a novas sessões
        score -= 25;
        recentlyCompleted = true;
        reasons.push('Concluído nas últimas 36h (priorizando sessões inéditas)');
      } else if (historyEntry.hoursAgo <= 72) {
        score -= 10;
        recentlyCompleted = true;
      }
    } else {
      // Treino ainda não realizado: incentiva exploração de novos conteúdos
      score += 5;
      reasons.push('Inédito na sua rotina');
    }

    // Normaliza para pontuação legível de 30% a 100%
    const normalizedScore = Math.min(100, Math.max(30, Math.round(score)));

    const matchedGoalLabels = matchedGoals.map(g => GOAL_LABELS[g] || g);

    return {
      workout: w,
      matchScore: normalizedScore,
      matchingGoals: matchedGoals,
      matchedGoalLabels,
      reasons: reasons.slice(0, 3),
      recentlyCompleted,
      lastCompletedDate,
      isFresh
    };
  });

  // Ordena por pontuação decrescente
  matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    // Desempate: quem atende mais objetivos
    if (b.matchingGoals.length !== a.matchingGoals.length) {
      return b.matchingGoals.length - a.matchingGoals.length;
    }
    // Desempate 2: treinos gratuitos vêm na frente para democratizar acesso
    if (a.workout.accessLevel === 'free' && b.workout.accessLevel !== 'free') return -1;
    if (b.workout.accessLevel === 'free' && a.workout.accessLevel !== 'free') return 1;
    return a.workout.title.localeCompare(b.workout.title);
  });

  if (matches.length > 0) {
    matches[0].isTopMatch = true;
  }

  return matches;
}
