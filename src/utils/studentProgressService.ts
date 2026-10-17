import { 
  WorkoutCollectionCategory, 
  ActiveWorkoutSession, 
  StudentProgressStats, 
  UserProgressRecord 
} from '../types';
import { getStoredSession } from './supabaseClient';

const FAVORITES_KEY = 'mf_user_favorites_v1';
const ACTIVE_SESSION_KEY = 'mf_active_workout_session_v1';
const PROGRESS_HISTORY_KEY = 'mf_user_progress_history_v1';

function getProgressStorageKey(): string {
  try {
    const session = getStoredSession();
    if (session?.user?.id) {
      return `${PROGRESS_HISTORY_KEY}_${session.user.id}`;
    }
  } catch {}
  return PROGRESS_HISTORY_KEY;
}

/**
 * Retorna a lista de IDs de treinos favoritados
 */
export function getFavoriteWorkoutIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Erro ao carregar favoritos:', e);
    return [];
  }
}

/**
 * Alterna favorito (adiciona ou remove)
 */
export function toggleFavoriteWorkout(workoutId: string): string[] {
  if (typeof window === 'undefined') return [];
  const current = getFavoriteWorkoutIds();
  const exists = current.includes(workoutId);
  const updated = exists ? current.filter(id => id !== workoutId) : [...current, workoutId];
  
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao salvar favoritos:', e);
  }
  return updated;
}

export function isWorkoutFavorite(workoutId: string): boolean {
  return getFavoriteWorkoutIds().includes(workoutId);
}

/**
 * Obtém a sessão em andamento para retomar ("Continue de onde parou")
 */
export function getActiveWorkoutSession(): ActiveWorkoutSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const session: ActiveWorkoutSession = JSON.parse(raw);
    
    // Expira sessões abandonadas com mais de 7 dias
    const started = new Date(session.startedAt || session.lastActiveAt).getTime();
    if (Date.now() - started > 7 * 24 * 60 * 60 * 1000) {
      clearActiveWorkoutSession();
      return null;
    }
    return session;
  } catch (e) {
    console.warn('Erro ao carregar sessão em andamento:', e);
    return null;
  }
}

/**
 * Salva o estado da sessão em andamento
 */
export function saveActiveWorkoutSession(session: ActiveWorkoutSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
      ...session,
      lastActiveAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Erro ao salvar sessão ativa:', e);
  }
}

/**
 * Limpa a sessão em andamento quando finalizada ou descartada
 */
export function clearActiveWorkoutSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (e) {}
}

/**
 * Registra a conclusão de uma sessão com métricas reais (sem calorias falsas)
 */
export function recordCompletedWorkout(
  workoutId: string, 
  workoutTitle: string, 
  category: WorkoutCollectionCategory,
  durationMinutes: number,
  goals?: string[],
  muscleGroups?: string[],
  level?: string,
  notes?: string,
  source: 'app_session' | 'manual_entry' = 'app_session'
): boolean {
  if (typeof window === 'undefined') return false;
  const history = getCompletedWorkoutsHistory();
  
  // Prevenção contra registros duplicados por cliques repetidos (janela de 60 segundos para o mesmo treino)
  const isDuplicate = history.some(h => {
    if (h.workout_id !== workoutId) return false;
    const diff = Math.abs(Date.now() - new Date(h.completed_at).getTime());
    return diff < 60 * 1000;
  });
  if (isDuplicate) {
    console.warn('[studentProgressService] Registro duplicado ignorado (menos de 60s da última conclusão).');
    return false;
  }

  const session = getStoredSession();
  const userId = session?.user?.id || 'local_student';

  const record: UserProgressRecord = {
    id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    workout_id: workoutId,
    workout_title: workoutTitle,
    category,
    status: 'completed',
    completed_at: new Date().toISOString(),
    duration_seconds: Math.round(durationMinutes * 60),
    goals: goals && goals.length > 0 ? goals : undefined,
    muscle_groups: muscleGroups && muscleGroups.length > 0 ? muscleGroups : undefined,
    level,
    notes,
    source
  };

  const updatedHistory = [record, ...history].slice(0, 100); // mantém últimos 100
  try {
    localStorage.setItem(getProgressStorageKey(), JSON.stringify(updatedHistory));
  } catch (e) {
    console.error('Erro ao salvar histórico de conclusão:', e);
  }

  // Remove sessão ativa pois o treino foi concluído
  clearActiveWorkoutSession();
  return true;
}

/**
 * Remove um registro de conclusão do histórico (gestão pelo aluno)
 */
export function removeCompletedWorkout(recordId: string): void {
  if (typeof window === 'undefined') return;
  const history = getCompletedWorkoutsHistory();
  const updated = history.filter(h => h.id !== recordId);
  try {
    localStorage.setItem(getProgressStorageKey(), JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao remover histórico:', e);
  }
}

/**
 * Retorna o histórico de sessões concluídas
 */
export function getCompletedWorkoutsHistory(): UserProgressRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getProgressStorageKey();
    let raw = localStorage.getItem(key);
    // Se logado e chave específica ainda vazia, herda dados locais para não perder histórico
    if (!raw && key !== PROGRESS_HISTORY_KEY) {
      raw = localStorage.getItem(PROGRESS_HISTORY_KEY);
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Calcula estatísticas reais consolidadas para a área "Meu Progresso"
 */
export function getStudentProgressStats(): StudentProgressStats {
  const history = getCompletedWorkoutsHistory();
  const completedWorkoutsCount = history.length;
  
  const totalSeconds = history.reduce((acc, h) => acc + (h.duration_seconds || 0), 0);
  const totalTrainingMinutes = Math.round(totalSeconds / 60);

  // Frequência semanal (treinos concluídos nos últimos 7 dias)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyFrequency = history.filter(h => new Date(h.completed_at).getTime() >= sevenDaysAgo).length;

  // Distribuição por categoria
  const categoryBreakdown: Record<string, number> = {};
  for (const h of history) {
    const cat = h.category || 'Geral';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  }

  const lastCompletedDate = history.length > 0 ? history[0].completed_at : undefined;

  return {
    completedWorkoutsCount,
    totalTrainingMinutes,
    weeklyFrequency,
    categoryBreakdown,
    lastCompletedDate
  };
}
