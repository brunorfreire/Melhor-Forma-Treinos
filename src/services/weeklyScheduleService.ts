import {
  CatalogWorkout,
  DayScheduleItem,
  DayScheduleType,
  DayWorkoutStatus,
  PlannedFocusOption,
  StudentWeeklySchedule,
  WeeklyPlanOrigin
} from '../types';
import { getAllCatalogWorkouts, getHydratedWorkout } from '../data/workoutCatalogService';
import { matchesClassificationFilter, getWorkoutExerciseCount } from './catalogClassificationService';
import { getStoredSession } from '../utils/supabaseClient';

const PERSONAL_SCHEDULE_STORAGE_PREFIX = 'mf_student_weekly_schedules_v1';
const DEMO_SCHEDULE_SESSION_KEY = 'mf_demo_weekly_schedule_v1';

let inMemoryDemoSchedules: Record<string, StudentWeeklySchedule> = {};
let inMemoryPersonalSchedules: Record<string, StudentWeeklySchedule> = {};

export const PLANNED_FOCUS_OPTIONS: PlannedFocusOption[] = [
  {
    id: 'superiores',
    label: 'Membros Superiores',
    shortLabel: 'Superiores',
    category: 'superiores',
    description: 'Costas, peitoral, ombros e braços com foco postural'
  },
  {
    id: 'peitoral-ombro-triceps',
    label: 'Peitoral, Ombro e Tríceps',
    shortLabel: 'Empurrar',
    category: 'peitoral-ombro-triceps',
    description: 'Divisão de empurrar e estabilidade escapular'
  },
  {
    id: 'costas-biceps',
    label: 'Costas, Bíceps e Trapézio',
    shortLabel: 'Puxar',
    category: 'costas-biceps',
    description: 'Divisão de puxar, sustentação dorsal e braços'
  },
  {
    id: 'inferiores',
    label: 'Membros Inferiores',
    shortLabel: 'Inferiores',
    category: 'inferiores',
    description: 'Pernas, glúteos e proteção articular de joelhos e quadril'
  },
  {
    id: 'forca_40_plus',
    label: 'Força para a Vida 40+',
    shortLabel: 'Força 40+',
    category: 'forca_40_plus',
    description: 'Força funcional, autonomia e longevidade ativa'
  },
  {
    id: 'full_body',
    label: 'Full Body Integrado',
    shortLabel: 'Full Body',
    category: 'full_body',
    description: 'Corpo inteiro em uma sessão equilibrada e dinâmica'
  },
  {
    id: 'cardiorespiratorio',
    label: 'Condicionamento & Fôlego',
    shortLabel: 'Cardio',
    category: 'cardiorespiratorio',
    description: 'Resistência cardiorrespiratória e vigor diário sem impacto excessivo'
  },
  {
    id: 'mobilidade_equilibrio',
    label: 'Mobilidade & Equilíbrio',
    shortLabel: 'Mobilidade',
    category: 'mobilidade_equilibrio',
    description: 'Saúde articular, estabilidade, postura e recuperação ativa'
  }
];

export interface WeekCalendarDayMeta {
  dateISO: string;
  dayOfWeek: number; // 1 = Segunda ... 7 = Domingo
  shortName: string; // Seg, Ter, Qua...
  fullName: string; // Segunda-feira...
  dayNumber: string; // "27"
  monthShort: string; // "Out"
  formattedFullDate: string; // "Segunda-feira, 27 de Outubro"
  isToday: boolean;
  isPast: boolean;
}

const WEEKDAY_SHORT_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const WEEKDAY_FULL_NAMES = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];
const MONTH_SHORT_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];
const MONTH_FULL_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Converte um objeto Date para string YYYY-MM-DD no fuso horário local
 */
export function toLocalDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma string YYYY-MM-DD para Date local (meio-dia para evitar desvios de horário de verão)
 */
export function parseLocalDateISO(dateISO?: string | null): Date {
  if (!dateISO || typeof dateISO !== 'string') {
    return new Date();
  }
  const parts = dateISO.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
}

/**
 * Retorna a data ISO (YYYY-MM-DD) da segunda-feira correspondente à semana da data informada
 */
export function getMondayISO(reference?: Date | string | null): string {
  const base =
    typeof reference === 'string'
      ? parseLocalDateISO(reference)
      : reference instanceof Date
        ? new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), 12, 0, 0, 0)
        : new Date();

  const jsDay = base.getDay(); // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);
  return toLocalDateISO(monday);
}

/**
 * Desloca uma semana em N semanas para frente ou para trás
 */
export function shiftWeekISO(weekStartISO?: string | null, deltaWeeks: number = 0): string {
  const safeWeekStart = weekStartISO ? getMondayISO(weekStartISO) : getMondayISO(new Date());
  const monday = parseLocalDateISO(safeWeekStart);
  monday.setDate(monday.getDate() + deltaWeeks * 7);
  return toLocalDateISO(monday);
}

/**
 * Formata o intervalo da semana (ex.: "27 Out – 02 Nov")
 */
export function formatWeekRangeLabel(weekStartISO?: string | null): string {
  const safeWeekStart = weekStartISO ? getMondayISO(weekStartISO) : getMondayISO(new Date());
  const monday = parseLocalDateISO(safeWeekStart);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const d1 = String(monday.getDate()).padStart(2, '0');
  const m1 = MONTH_SHORT_NAMES[monday.getMonth()];
  const d2 = String(sunday.getDate()).padStart(2, '0');
  const m2 = MONTH_SHORT_NAMES[sunday.getMonth()];

  if (m1 === m2) {
    return `${d1} a ${d2} de ${m2}`;
  }
  return `${d1} ${m1} – ${d2} ${m2}`;
}

/**
 * Retorna os 7 dias (Segunda a Domingo) com metadados completos para o calendário semanal
 */
export function getWeekCalendarDays(
  weekStartISO?: string | null,
  todayISO: string = toLocalDateISO(new Date())
): WeekCalendarDayMeta[] {
  const safeWeekStart = weekStartISO ? getMondayISO(weekStartISO) : getMondayISO(new Date());
  const monday = parseLocalDateISO(safeWeekStart);
  const result: WeekCalendarDayMeta[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateISO = toLocalDateISO(current);
    const dayNumber = String(current.getDate()).padStart(2, '0');
    const monthShort = MONTH_SHORT_NAMES[current.getMonth()];
    const monthFull = MONTH_FULL_NAMES[current.getMonth()];
    const fullName = WEEKDAY_FULL_NAMES[i];

    result.push({
      dateISO,
      dayOfWeek: i + 1,
      shortName: WEEKDAY_SHORT_NAMES[i],
      fullName,
      dayNumber,
      monthShort,
      formattedFullDate: `${fullName}, ${dayNumber} de ${monthFull}`,
      isToday: dateISO === todayISO,
      isPast: dateISO < todayISO
    });
  }

  return result;
}

export function getFocusOptionById(focusId?: string): PlannedFocusOption | undefined {
  if (!focusId) return undefined;
  return PLANNED_FOCUS_OPTIONS.find(f => f.id === focusId);
}

export function getFocusLabel(focusId?: string, fallbackLabel?: string): string {
  if (fallbackLabel && fallbackLabel.trim().length > 0) return fallbackLabel;
  const opt = getFocusOptionById(focusId);
  if (opt) return opt.label;
  return 'Foco livre (a definir)';
}

/**
 * Verifica se um treino do catálogo tem foco compatível com o grupamento/objetivo planejado para o dia
 */
export function doesWorkoutMatchFocus(workout: CatalogWorkout, plannedFocus?: string): boolean {
  if (!plannedFocus || plannedFocus === 'livre' || plannedFocus === 'todos') {
    return true;
  }
  return matchesClassificationFilter(workout, plannedFocus);
}

/**
 * Obtém metadados complementares do treino (com quantidade real de exercícios garantida)
 */
export function getWorkoutSummaryDetails(workoutId?: string): {
  workout: CatalogWorkout | null;
  exerciseCount: number;
  durationLabel: string;
} {
  if (!workoutId) {
    return { workout: null, exerciseCount: 0, durationLabel: '' };
  }
  const all = getAllCatalogWorkouts();
  const workout = all.find(w => w.id === workoutId) || null;
  if (!workout) {
    return { workout: null, exerciseCount: 0, durationLabel: '' };
  }

  const exerciseCount = workout.exerciseCount || getWorkoutExerciseCount(workout.id);

  return {
    workout,
    exerciseCount,
    durationLabel: workout.duration || '30 min'
  };
}

/**
 * Calcula o status efetivo de um dia considerando a data atual
 */
export function resolveEffectiveDayStatus(
  day: DayScheduleItem,
  todayISO: string = toLocalDateISO(new Date())
): DayWorkoutStatus {
  if (day.status === 'completed') return 'completed';
  if (day.status === 'missed') return 'missed';
  if (day.dayType === 'workout' && day.dateISO < todayISO) {
    return 'missed';
  }
  return 'planned';
}

function getPersonalStorageKey(): string {
  try {
    const session = getStoredSession();
    if (session?.user?.id) {
      return `${PERSONAL_SCHEDULE_STORAGE_PREFIX}_${session.user.id}`;
    }
  } catch {}
  return PERSONAL_SCHEDULE_STORAGE_PREFIX;
}

function loadPersonalSchedulesMap(): Record<string, StudentWeeklySchedule> {
  if (typeof window === 'undefined') return inMemoryPersonalSchedules;
  try {
    const key = getPersonalStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return inMemoryPersonalSchedules;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.warn('Erro ao ler planejamento semanal:', e);
  }
  return inMemoryPersonalSchedules;
}

function savePersonalSchedulesMap(map: Record<string, StudentWeeklySchedule>): void {
  inMemoryPersonalSchedules = map;
  if (typeof window === 'undefined') return;
  try {
    const key = getPersonalStorageKey();
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {
    console.warn('Erro ao salvar planejamento semanal:', e);
  }
}

function loadDemoSchedulesMap(): Record<string, StudentWeeklySchedule> {
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(DEMO_SCHEDULE_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          inMemoryDemoSchedules = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return inMemoryDemoSchedules;
}

function saveDemoSchedulesMap(map: Record<string, StudentWeeklySchedule>): void {
  inMemoryDemoSchedules = { ...map };
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(DEMO_SCHEDULE_SESSION_KEY, JSON.stringify(inMemoryDemoSchedules));
    } catch {}
  }
}

/**
 * Verifica se o aluno já possui algum planejamento semanal configurado
 */
export function hasAnyPersonalWeeklySchedule(): boolean {
  const map = loadPersonalSchedulesMap();
  return Object.keys(map).length > 0;
}

/**
 * Cria uma semana demonstrativa isolada ("Experimentar Minha Semana") com:
 * - 3 dias de treino (Segunda: Puxar e Empurrar / Superiores, Quarta: Inferiores, Sexta: Força 40+)
 * - 1 dia de recuperação ativa (Quinta: Mobilidade & Equilíbrio)
 * - 3 dias de descanso (Terça, Sábado, Domingo)
 * Usa exclusivamente treinos gratuitos liberados para permitir testar navegação e Execução Guiada sem pagamento.
 */
export function createDemoWeeklySchedule(
  weekStartISO: string = getMondayISO(),
  origin: WeeklyPlanOrigin = 'personal'
): StudentWeeklySchedule {
  const calendarDays = getWeekCalendarDays(weekStartISO);
  const days: Record<string, DayScheduleItem> = {};
  const trainerName = origin === 'trainer' ? 'Bruno Freire' : undefined;

  calendarDays.forEach((d) => {
    if (d.dayOfWeek === 1) {
      days[d.dateISO] = {
        dateISO: d.dateISO,
        dayOfWeek: 1,
        dayType: 'workout',
        plannedFocus: 'superiores',
        plannedFocusLabel: 'Membros Superiores',
        workoutId: 'w-sup-05', // Puxar e Empurrar (Free)
        status: 'planned',
        origin,
        trainerName,
        trainerNotes: origin === 'trainer' ? 'Priorize postura escapular e controle na fase excêntrica.' : undefined
      };
    } else if (d.dayOfWeek === 3) {
      days[d.dateISO] = {
        dateISO: d.dateISO,
        dayOfWeek: 3,
        dayType: 'workout',
        plannedFocus: 'inferiores',
        plannedFocusLabel: 'Membros Inferiores',
        workoutId: 'w-inf-01', // Agachamento Seguro & Joelhos Fortes (Free)
        status: 'planned',
        origin,
        trainerName,
        trainerNotes: origin === 'trainer' ? 'Foco em estabilidade de joelhos e ativação de glúteos.' : undefined
      };
    } else if (d.dayOfWeek === 4) {
      days[d.dateISO] = {
        dateISO: d.dateISO,
        dayOfWeek: 4,
        dayType: 'active_recovery',
        plannedFocus: 'mobilidade_equilibrio',
        plannedFocusLabel: 'Mobilidade & Equilíbrio',
        workoutId: 'w-mob-01', // Coluna Livre & Postura Alinhada (Free)
        status: 'planned',
        origin,
        trainerName
      };
    } else if (d.dayOfWeek === 5) {
      days[d.dateISO] = {
        dateISO: d.dateISO,
        dayOfWeek: 5,
        dayType: 'workout',
        plannedFocus: 'forca_40_plus',
        plannedFocusLabel: 'Força para a Vida 40+',
        workoutId: 'w-40p-01', // Primeiros Passos na Força 40+ (Free)
        status: 'planned',
        origin,
        trainerName,
        trainerNotes: origin === 'trainer' ? 'Sessão global para força funcional e autonomia.' : undefined
      };
    } else {
      days[d.dateISO] = {
        dateISO: d.dateISO,
        dayOfWeek: d.dayOfWeek,
        dayType: 'rest',
        plannedFocusLabel: 'Descanso e Recuperação',
        status: 'planned',
        origin,
        trainerName
      };
    }
  });

  const now = new Date().toISOString();
  return {
    id: `demo-week-${weekStartISO}`,
    weekStartISO,
    origin,
    trainerName,
    days,
    configuredWeekdays: [1, 3, 5],
    isDemo: true,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Obtém o planejamento da semana solicitada (real ou demonstrativo isolado)
 */
export function getWeeklySchedule(
  weekStartISO: string = getMondayISO(),
  options?: { isDemo?: boolean }
): StudentWeeklySchedule | null {
  const normalizedWeek = getMondayISO(weekStartISO);

  if (options?.isDemo) {
    const demoMap = loadDemoSchedulesMap();
    if (demoMap[normalizedWeek]) {
      return demoMap[normalizedWeek];
    }
    const created = createDemoWeeklySchedule(normalizedWeek, 'personal');
    demoMap[normalizedWeek] = created;
    saveDemoSchedulesMap(demoMap);
    return created;
  }

  const personalMap = loadPersonalSchedulesMap();
  if (personalMap[normalizedWeek]) {
    return personalMap[normalizedWeek];
  }

  // Se o aluno já configurou outra semana anteriormente, projeta a estrutura básica de dias escolhidos
  // para a nova semana navegada sem inventar prescrições automáticas
  const existingWeeks = Object.values(personalMap);
  if (existingWeeks.length > 0) {
    const latest = existingWeeks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const templateDaysByWeekday = new Map<number, DayScheduleItem>();
    Object.values(latest.days).forEach(d => {
      templateDaysByWeekday.set(d.dayOfWeek, d);
    });

    const calendarDays = getWeekCalendarDays(normalizedWeek);
    const days: Record<string, DayScheduleItem> = {};
    calendarDays.forEach(d => {
      const prev = templateDaysByWeekday.get(d.dayOfWeek);
      days[d.dateISO] = {
        dateISO: d.dateISO,
        dayOfWeek: d.dayOfWeek,
        dayType: prev ? prev.dayType : (latest.configuredWeekdays.includes(d.dayOfWeek) ? 'workout' : 'rest'),
        plannedFocus: prev?.plannedFocus,
        plannedFocusLabel: prev?.plannedFocusLabel,
        workoutId: prev?.workoutId,
        status: 'planned',
        origin: latest.origin,
        trainerName: latest.trainerName
      };
    });

    const projected: StudentWeeklySchedule = {
      id: `week-${normalizedWeek}`,
      weekStartISO: normalizedWeek,
      origin: latest.origin,
      trainerName: latest.trainerName,
      days,
      configuredWeekdays: [...latest.configuredWeekdays],
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    personalMap[normalizedWeek] = projected;
    savePersonalSchedulesMap(personalMap);
    return projected;
  }

  return null;
}

/**
 * Alterna a origem na demonstração ("Planejamento pessoal" vs "Planejamento do treinador")
 * para permitir validar a proteção contra sobrescrita silenciosa de plano do treinador.
 */
export function setDemoScheduleOrigin(
  weekStartISO: string,
  origin: WeeklyPlanOrigin
): StudentWeeklySchedule {
  const normalizedWeek = getMondayISO(weekStartISO);
  const demoMap = loadDemoSchedulesMap();
  const current = demoMap[normalizedWeek] || createDemoWeeklySchedule(normalizedWeek, origin);

  const updatedDays: Record<string, DayScheduleItem> = {};
  Object.entries(current.days).forEach(([dateISO, item]) => {
    updatedDays[dateISO] = {
      ...item,
      origin,
      trainerName: origin === 'trainer' ? 'Bruno Freire' : undefined,
      customizedFromTrainer: false
    };
  });

  const updated: StudentWeeklySchedule = {
    ...current,
    origin,
    trainerName: origin === 'trainer' ? 'Bruno Freire' : undefined,
    days: updatedDays,
    updatedAt: new Date().toISOString()
  };

  demoMap[normalizedWeek] = updated;
  saveDemoSchedulesMap(demoMap);
  return updated;
}

/**
 * Redefine a semana de demonstração para o estado inicial padrão
 */
export function resetDemoWeeklySchedule(
  weekStartISO: string = getMondayISO(),
  origin: WeeklyPlanOrigin = 'personal'
): StudentWeeklySchedule {
  const normalizedWeek = getMondayISO(weekStartISO);
  const demoMap = loadDemoSchedulesMap();
  const fresh = createDemoWeeklySchedule(normalizedWeek, origin);
  demoMap[normalizedWeek] = fresh;
  saveDemoSchedulesMap(demoMap);
  return fresh;
}

/**
 * Inicializa o planejamento pessoal do aluno a partir dos dias que ele próprio escolheu treinar,
 * sem gerar prescrições automáticas nem impor grupamentos ou cargas.
 */
export function initializePersonalWeeklySchedule(params: {
  weekStartISO?: string;
  selectedWorkoutWeekdays: number[]; // 1..7
  activeRecoveryWeekdays?: number[]; // 1..7
  focusByWeekday?: Record<number, string>;
}): StudentWeeklySchedule {
  const normalizedWeek = getMondayISO(params.weekStartISO);
  const calendarDays = getWeekCalendarDays(normalizedWeek);
  const workoutSet = new Set(params.selectedWorkoutWeekdays);
  const recoverySet = new Set(params.activeRecoveryWeekdays || []);
  const focusMap = params.focusByWeekday || {};

  const days: Record<string, DayScheduleItem> = {};

  calendarDays.forEach((d) => {
    const isWorkout = workoutSet.has(d.dayOfWeek);
    const isRecovery = !isWorkout && recoverySet.has(d.dayOfWeek);
    const dayType: DayScheduleType = isWorkout
      ? 'workout'
      : isRecovery
        ? 'active_recovery'
        : 'rest';

    const focusId = focusMap[d.dayOfWeek];
    const focusOpt = getFocusOptionById(focusId);

    days[d.dateISO] = {
      dateISO: d.dateISO,
      dayOfWeek: d.dayOfWeek,
      dayType,
      plannedFocus: isWorkout
        ? focusOpt?.id
        : isRecovery
          ? 'mobilidade_equilibrio'
          : undefined,
      plannedFocusLabel: isWorkout
        ? focusOpt?.label || 'Foco livre (a definir)'
        : isRecovery
          ? 'Recuperação Ativa & Mobilidade'
          : 'Descanso',
      workoutId: undefined,
      status: 'planned',
      origin: 'personal'
    };
  });

  const now = new Date().toISOString();
  const schedule: StudentWeeklySchedule = {
    id: `week-${normalizedWeek}`,
    weekStartISO: normalizedWeek,
    origin: 'personal',
    days,
    configuredWeekdays: Array.from(workoutSet).sort((a, b) => a - b),
    isDemo: false,
    createdAt: now,
    updatedAt: now
  };

  const personalMap = loadPersonalSchedulesMap();
  personalMap[normalizedWeek] = schedule;
  savePersonalSchedulesMap(personalMap);
  return schedule;
}

/**
 * Atualiza um único dia da semana (foco, tipo do dia, treino escolhido ou status).
 * Protege prescrições do treinador: se o dia foi definido pelo treinador e `confirmTrainerOverride`
 * não for verdadeiro, exige confirmação explícita antes de sobrescrever.
 * Nunca altera os demais dias da semana.
 */
export function updateScheduledDay(
  weekStartISO: string,
  dateISO: string,
  updates: Partial<Pick<DayScheduleItem, 'dayType' | 'plannedFocus' | 'plannedFocusLabel' | 'workoutId' | 'status'>>,
  options?: {
    isDemo?: boolean;
    confirmTrainerOverride?: boolean;
  }
): {
  success: boolean;
  requiresTrainerOverrideConfirmation?: boolean;
  schedule: StudentWeeklySchedule | null;
  updatedDay?: DayScheduleItem;
} {
  const normalizedWeek = getMondayISO(weekStartISO);
  const currentSchedule = getWeeklySchedule(normalizedWeek, { isDemo: options?.isDemo });
  if (!currentSchedule) {
    return { success: false, schedule: null };
  }

  const targetDay = currentSchedule.days[dateISO];
  if (!targetDay) {
    return { success: false, schedule: currentSchedule };
  }

  // Barreira de proteção ao planejamento do treinador: impede sobrescrita silenciosa
  const isModifyingPrescription =
    (updates.workoutId !== undefined && updates.workoutId !== targetDay.workoutId) ||
    (updates.dayType !== undefined && updates.dayType !== targetDay.dayType) ||
    (updates.plannedFocus !== undefined && updates.plannedFocus !== targetDay.plannedFocus);

  if (
    targetDay.origin === 'trainer' &&
    isModifyingPrescription &&
    !options?.confirmTrainerOverride
  ) {
    return {
      success: false,
      requiresTrainerOverrideConfirmation: true,
      schedule: currentSchedule,
      updatedDay: targetDay
    };
  }

  const nextDayType = updates.dayType ?? targetDay.dayType;
  let nextFocus = updates.plannedFocus !== undefined ? updates.plannedFocus : targetDay.plannedFocus;
  let nextFocusLabel =
    updates.plannedFocusLabel !== undefined
      ? updates.plannedFocusLabel
      : targetDay.plannedFocusLabel;

  if (updates.plannedFocus !== undefined && updates.plannedFocusLabel === undefined) {
    const opt = getFocusOptionById(updates.plannedFocus);
    nextFocusLabel = opt ? opt.label : 'Foco livre (a definir)';
  }

  if (nextDayType === 'rest') {
    nextFocus = undefined;
    nextFocusLabel = 'Descanso';
  } else if (nextDayType === 'active_recovery' && !nextFocus) {
    nextFocus = 'mobilidade_equilibrio';
    nextFocusLabel = 'Mobilidade & Equilíbrio';
  }

  const nextWorkoutId =
    nextDayType === 'rest'
      ? undefined
      : updates.workoutId !== undefined
        ? updates.workoutId
        : targetDay.workoutId;

  const updatedDay: DayScheduleItem = {
    ...targetDay,
    dayType: nextDayType,
    plannedFocus: nextFocus,
    plannedFocusLabel: nextFocusLabel,
    workoutId: nextWorkoutId,
    status: updates.status !== undefined ? updates.status : targetDay.status,
    origin:
      targetDay.origin === 'trainer' && isModifyingPrescription
        ? 'personal'
        : targetDay.origin,
    customizedFromTrainer:
      targetDay.origin === 'trainer' && isModifyingPrescription
        ? true
        : targetDay.customizedFromTrainer
  };

  // Atualiza exclusivamente a data selecionada, preservando intactos os outros 6 dias
  const nextDays: Record<string, DayScheduleItem> = {
    ...currentSchedule.days,
    [dateISO]: updatedDay
  };

  const configuredWeekdays = Object.values(nextDays)
    .filter(d => d.dayType === 'workout')
    .map(d => d.dayOfWeek)
    .sort((a, b) => a - b);

  const updatedSchedule: StudentWeeklySchedule = {
    ...currentSchedule,
    days: nextDays,
    configuredWeekdays,
    updatedAt: new Date().toISOString()
  };

  if (options?.isDemo) {
    const demoMap = loadDemoSchedulesMap();
    demoMap[normalizedWeek] = updatedSchedule;
    saveDemoSchedulesMap(demoMap);
  } else {
    const personalMap = loadPersonalSchedulesMap();
    personalMap[normalizedWeek] = updatedSchedule;
    savePersonalSchedulesMap(personalMap);
  }

  return {
    success: true,
    schedule: updatedSchedule,
    updatedDay
  };
}

/**
 * Marca um treino agendado na semana como 'completed' (Realizado) SOMENTE após confirmação
 * de conclusão da sessão. Evita duplicidade e nunca altera outros dias.
 */
export function markScheduledWorkoutCompleted(params: {
  workoutId?: string;
  scheduledDateISO?: string;
  isDemo?: boolean;
  completedRecordId?: string;
}): { updated: boolean; dateISO?: string; schedule?: StudentWeeklySchedule } {
  const todayISO = toLocalDateISO(new Date());
  const targetDateISO = params.scheduledDateISO || todayISO;
  const weekStartISO = getMondayISO(targetDateISO);

  const schedule = getWeeklySchedule(weekStartISO, { isDemo: params.isDemo });
  if (!schedule) {
    return { updated: false };
  }

  let matchedDay: DayScheduleItem | undefined = schedule.days[targetDateISO];

  // Se não havia data explícita e o dia de hoje não tem esse treino, verifica se há um dia na semana atual com esse workoutId
  if (
    (!matchedDay || (params.workoutId && matchedDay.workoutId && matchedDay.workoutId !== params.workoutId)) &&
    !params.scheduledDateISO &&
    params.workoutId
  ) {
    matchedDay = Object.values(schedule.days).find(
      d => d.workoutId === params.workoutId && d.status !== 'completed'
    );
  }

  if (!matchedDay) {
    return { updated: false, schedule };
  }

  // Evita gravação duplicada se já estiver concluído
  if (matchedDay.status === 'completed') {
    return { updated: false, dateISO: matchedDay.dateISO, schedule };
  }

  const nowISO = new Date().toISOString();
  const updatedDay: DayScheduleItem = {
    ...matchedDay,
    workoutId: matchedDay.workoutId || params.workoutId,
    dayType: matchedDay.dayType === 'rest' ? 'workout' : matchedDay.dayType,
    status: 'completed',
    completedAt: nowISO,
    completedRecordId: params.completedRecordId || `comp-${Date.now()}`
  };

  const updatedSchedule: StudentWeeklySchedule = {
    ...schedule,
    days: {
      ...schedule.days,
      [matchedDay.dateISO]: updatedDay
    },
    updatedAt: nowISO
  };

  if (params.isDemo) {
    const demoMap = loadDemoSchedulesMap();
    demoMap[weekStartISO] = updatedSchedule;
    saveDemoSchedulesMap(demoMap);
  } else {
    const personalMap = loadPersonalSchedulesMap();
    personalMap[weekStartISO] = updatedSchedule;
    savePersonalSchedulesMap(personalMap);
  }

  return {
    updated: true,
    dateISO: matchedDay.dateISO,
    schedule: updatedSchedule
  };
}

/**
 * Calcula o resumo de métricas da semana (quantos dias planejados e quantos concluídos)
 */
export function getWeeklyScheduleMetrics(
  schedule: StudentWeeklySchedule | null,
  todayISO: string = toLocalDateISO(new Date())
): {
  plannedCount: number;
  completedCount: number;
  missedCount: number;
  activeRecoveryCount: number;
  restCount: number;
} {
  if (!schedule || !schedule.days) {
    return {
      plannedCount: 0,
      completedCount: 0,
      missedCount: 0,
      activeRecoveryCount: 0,
      restCount: 0
    };
  }

  const items = Object.values(schedule.days);
  let plannedCount = 0;
  let completedCount = 0;
  let missedCount = 0;
  let activeRecoveryCount = 0;
  let restCount = 0;

  items.forEach((item) => {
    const effectiveStatus = resolveEffectiveDayStatus(item, todayISO);
    if (item.dayType === 'workout') {
      plannedCount += 1;
      if (effectiveStatus === 'completed') {
        completedCount += 1;
      } else if (effectiveStatus === 'missed') {
        missedCount += 1;
      }
    } else if (item.dayType === 'active_recovery') {
      activeRecoveryCount += 1;
      if (effectiveStatus === 'completed') {
        completedCount += 1;
      }
    } else {
      restCount += 1;
    }
  });

  return {
    plannedCount,
    completedCount,
    missedCount,
    activeRecoveryCount,
    restCount
  };
}

/**
 * Encontra o próximo treino relevante da semana (priorizando hoje, ou o próximo dia planejado na semana)
 */
export function getNextScheduledWorkoutSlot(
  schedule: StudentWeeklySchedule | null,
  todayISO: string = toLocalDateISO(new Date())
): {
  day: DayScheduleItem;
  dayMeta: WeekCalendarDayMeta;
  workout: CatalogWorkout | null;
  exerciseCount: number;
  isToday: boolean;
} | null {
  if (!schedule || !schedule.days) return null;

  const calendarDays = getWeekCalendarDays(schedule.weekStartISO, todayISO);
  const byDate = new Map(calendarDays.map(c => [c.dateISO, c]));

  const sortedDays = Object.values(schedule.days).sort((a, b) =>
    a.dateISO.localeCompare(b.dateISO)
  );

  // 1. Verifica hoje se for dia de treino ou recuperação ativa
  const todaySlot = schedule.days[todayISO];
  if (todaySlot && (todaySlot.dayType === 'workout' || todaySlot.dayType === 'active_recovery')) {
    const meta = byDate.get(todayISO) || calendarDays[0];
    const details = getWorkoutSummaryDetails(todaySlot.workoutId);
    return {
      day: todaySlot,
      dayMeta: meta,
      workout: details.workout,
      exerciseCount: details.exerciseCount,
      isToday: true
    };
  }

  // 2. Próximo dia de treino ainda não concluído a partir de hoje
  const upcoming = sortedDays.find(
    d => d.dateISO >= todayISO && d.dayType === 'workout' && d.status !== 'completed'
  );
  if (upcoming) {
    const meta = byDate.get(upcoming.dateISO) || calendarDays[0];
    const details = getWorkoutSummaryDetails(upcoming.workoutId);
    return {
      day: upcoming,
      dayMeta: meta,
      workout: details.workout,
      exerciseCount: details.exerciseCount,
      isToday: upcoming.dateISO === todayISO
    };
  }

  // 3. Qualquer dia de treino na semana (mesmo passado ou já realizado)
  const anyWorkout = sortedDays.find(d => d.dayType === 'workout');
  if (anyWorkout) {
    const meta = byDate.get(anyWorkout.dateISO) || calendarDays[0];
    const details = getWorkoutSummaryDetails(anyWorkout.workoutId);
    return {
      day: anyWorkout,
      dayMeta: meta,
      workout: details.workout,
      exerciseCount: details.exerciseCount,
      isToday: anyWorkout.dateISO === todayISO
    };
  }

  return null;
}
