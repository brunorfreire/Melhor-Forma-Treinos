import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Dumbbell,
  FlaskConical,
  ShieldCheck,
  User,
  RotateCcw,
  X,
  Play,
  Clock,
  Layers,
  Lock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import {
  CatalogWorkout,
  DayScheduleType,
  Exercise,
  StudentWeeklySchedule,
  SubscriptionStatus,
  UserRole,
  WeeklyPlanOrigin,
  WorkoutPlan
} from '../../types';
import {
  getMondayISO,
  shiftWeekISO,
  toLocalDateISO,
  getWeekCalendarDays,
  getWeeklySchedule,
  initializePersonalWeeklySchedule,
  updateScheduledDay,
  getWeeklyScheduleMetrics,
  getWorkoutSummaryDetails,
  setDemoScheduleOrigin,
  resetDemoWeeklySchedule
} from '../../services/weeklyScheduleService';
import {
  canUserAccessWorkout,
  convertCatalogWorkoutToWorkoutPlan,
  getHydratedWorkout
} from '../../data/workoutCatalogService';
import { WeeklyPlanEmptyState } from './WeeklyPlanEmptyState';
import { ThreeStepWeekWizard } from './ThreeStepWeekWizard';
import { WeeklyCalendar } from './WeeklyCalendar';
import { DayWorkoutCard } from './DayWorkoutCard';
import { WorkoutPicker } from './WorkoutPicker';
import { PremiumModal } from '../PremiumModal';
import { ExerciseThumbnail } from '../ExerciseThumbnail';
import { AuthSession } from '../../utils/supabaseClient';

interface MyWeekViewProps {
  initialDateISO?: string;
  initialDemoMode?: boolean;
  userStatus?: SubscriptionStatus;
  userRole?: UserRole;
  purchasedWorkoutIds?: string[];
  session?: AuthSession | null;
  onStartScheduledWorkout: (plan: WorkoutPlan) => void;
  onPreviewExercise?: (ex: Exercise) => void;
  onBackToHome?: () => void;
}

export const MyWeekView: React.FC<MyWeekViewProps> = ({
  initialDateISO,
  initialDemoMode = false,
  userStatus = 'free',
  userRole = 'student',
  purchasedWorkoutIds = [],
  session = null,
  onStartScheduledWorkout,
  onPreviewExercise,
  onBackToHome
}) => {
  // Garantia de fallback e leitura segura para o objeto de sessão/usuário
  const effectiveUserStatus: SubscriptionStatus = session?.user?.subscription_status || userStatus || 'free';
  const effectiveUserRole: UserRole = session?.user?.role || userRole || 'student';
  const effectivePurchasedIds: string[] = purchasedWorkoutIds || [];

  const todayISO = useMemo(() => toLocalDateISO(new Date()), []);
  const currentMondayISO = useMemo(() => getMondayISO(todayISO), [todayISO]);

  const [isDemoMode, setIsDemoMode] = useState<boolean>(initialDemoMode);
  const [weekStartISO, setWeekStartISO] = useState<string>(() =>
    getMondayISO(initialDateISO || todayISO)
  );
  const [selectedDateISO, setSelectedDateISO] = useState<string>(() =>
    initialDateISO || todayISO
  );

  const [schedule, setSchedule] = useState<StudentWeeklySchedule | null>(() =>
    getWeeklySchedule(getMondayISO(initialDateISO || todayISO), {
      isDemo: initialDemoMode
    })
  );

  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [detailsModalWorkout, setDetailsModalWorkout] = useState<CatalogWorkout | null>(null);
  const [premiumModalWorkout, setPremiumModalWorkout] = useState<CatalogWorkout | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string>('');

  // Sincroniza quando initialDemoMode ou initialDateISO mudam externamente
  useEffect(() => {
    if (initialDemoMode) {
      setIsDemoMode(true);
    }
  }, [initialDemoMode]);

  useEffect(() => {
    if (initialDateISO) {
      const targetWeek = getMondayISO(initialDateISO);
      setWeekStartISO(targetWeek);
      setSelectedDateISO(initialDateISO);
    }
  }, [initialDateISO]);

  // Recarrega a agenda sempre que a semana ou o modo (real vs demo) mudar
  useEffect(() => {
    const loaded = getWeeklySchedule(weekStartISO, { isDemo: isDemoMode });
    setSchedule(loaded);

    const daysList = getWeekCalendarDays(weekStartISO, todayISO);
    const existsInWeek = daysList.some(d => d.dateISO === selectedDateISO);
    if (!existsInWeek) {
      const todayInWeek = daysList.find(d => d.isToday);
      setSelectedDateISO(todayInWeek ? todayInWeek.dateISO : daysList[0].dateISO);
    }
  }, [weekStartISO, isDemoMode, todayISO]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    window.setTimeout(() => {
      setFeedbackToast(prev => (prev === msg ? '' : prev));
    }, 3500);
  };

  const calendarDays = useMemo(
    () => getWeekCalendarDays(weekStartISO, todayISO),
    [weekStartISO, todayISO]
  );

  const selectedDayMeta = useMemo(
    () => calendarDays.find(d => d.dateISO === selectedDateISO) || calendarDays[0],
    [calendarDays, selectedDateISO]
  );

  const selectedDayItem =
    schedule?.days && selectedDayMeta ? schedule.days[selectedDayMeta.dateISO] : undefined;

  const selectedDaySummary = useMemo(
    () => getWorkoutSummaryDetails(selectedDayItem?.workoutId),
    [selectedDayItem?.workoutId]
  );

  const metrics = useMemo(
    () => getWeeklyScheduleMetrics(schedule, todayISO),
    [schedule, todayISO]
  );

  const handleCreatePersonalSchedule = (params: {
    selectedWorkoutWeekdays: number[];
    activeRecoveryWeekdays: number[];
    focusByWeekday: Record<number, string>;
  }) => {
    const created = initializePersonalWeeklySchedule({
      weekStartISO,
      selectedWorkoutWeekdays: params.selectedWorkoutWeekdays,
      activeRecoveryWeekdays: params.activeRecoveryWeekdays,
      focusByWeekday: params.focusByWeekday
    });
    setSchedule(created);

    // Seleciona automaticamente o primeiro dia de treino planejado ou hoje
    const firstWorkoutDay = Object.values(created.days)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .find(d => d.dayType === 'workout');
    if (firstWorkoutDay) {
      setSelectedDateISO(firstWorkoutDay.dateISO);
    }
    showToast('Sua semana foi organizada! Agora você pode escolher o treino de cada dia.');
  };

  const handleActivateDemo = () => {
    setIsDemoMode(true);
    const loaded = getWeeklySchedule(weekStartISO, { isDemo: true });
    setSchedule(loaded);

    // Na demonstração, posiciona em Segunda-feira (dia 1 com treino "Puxar e Empurrar") se hoje for descanso
    if (loaded) {
      const todaySlot = loaded.days[todayISO];
      if (!todaySlot || todaySlot.dayType === 'rest') {
        const mondaySlot = Object.values(loaded.days).find(d => d.dayOfWeek === 1);
        if (mondaySlot) {
          setSelectedDateISO(mondaySlot.dateISO);
        }
      }
    }
    showToast('Modo de demonstração "Experimentar Minha Semana" ativado.');
  };

  const handleExitDemo = () => {
    setIsDemoMode(false);
    const real = getWeeklySchedule(weekStartISO, { isDemo: false });
    setSchedule(real);
    showToast('Você voltou para o seu planejamento pessoal.');
  };

  const handleToggleDemoOrigin = (nextOrigin: WeeklyPlanOrigin) => {
    if (!isDemoMode) return;
    const updated = setDemoScheduleOrigin(weekStartISO, nextOrigin);
    setSchedule(updated);
    showToast(
      nextOrigin === 'trainer'
        ? 'Visualizando como Planejamento do Treinador (Bruno Freire).'
        : 'Visualizando como Planejamento Pessoal do Aluno.'
    );
  };

  const handleResetDemo = () => {
    const fresh = resetDemoWeeklySchedule(weekStartISO, schedule?.origin || 'personal');
    setSchedule(fresh);
    showToast('Semana demonstrativa restaurada ao estado inicial.');
  };

  const handleChangeDayType = (
    newType: DayScheduleType,
    confirmTrainerOverride: boolean = false
  ) => {
    if (!selectedDayMeta) return;
    const res = updateScheduledDay(
      weekStartISO,
      selectedDayMeta.dateISO,
      { dayType: newType },
      { isDemo: isDemoMode, confirmTrainerOverride }
    );
    if (res.success && res.schedule) {
      setSchedule(res.schedule);
    }
  };

  const handleChangeDayFocus = (
    newFocusId: string,
    confirmTrainerOverride: boolean = false
  ) => {
    if (!selectedDayMeta) return;
    const res = updateScheduledDay(
      weekStartISO,
      selectedDayMeta.dateISO,
      { plannedFocus: newFocusId || undefined },
      { isDemo: isDemoMode, confirmTrainerOverride }
    );
    if (res.success && res.schedule) {
      setSchedule(res.schedule);
    }
  };

  const handleConfirmSelectWorkout = (
    chosenWorkout: CatalogWorkout,
    confirmTrainerOverride: boolean = true
  ) => {
    if (!selectedDayMeta) return;
    const res = updateScheduledDay(
      weekStartISO,
      selectedDayMeta.dateISO,
      {
        dayType:
          selectedDayItem?.dayType === 'rest' ? 'workout' : selectedDayItem?.dayType || 'workout',
        workoutId: chosenWorkout.id,
        plannedFocus: selectedDayItem?.plannedFocus || chosenWorkout.category
      },
      { isDemo: isDemoMode, confirmTrainerOverride }
    );
    if (res.success && res.schedule) {
      setSchedule(res.schedule);
      setIsPickerOpen(false);
      showToast(`Treino "${chosenWorkout.title}" definido para ${selectedDayMeta.fullName}.`);
    }
  };

  const handleStartWorkoutFromSchedule = (workout: CatalogWorkout, dateISO: string) => {
    const hasAccess = canUserAccessWorkout(
      workout,
      effectiveUserStatus,
      effectiveUserRole,
      effectivePurchasedIds
    );
    if (!hasAccess) {
      setPremiumModalWorkout(workout);
      return;
    }

    const plan = convertCatalogWorkoutToWorkoutPlan(
      workout,
      effectiveUserStatus,
      effectiveUserRole,
      effectivePurchasedIds
    );
    if (!plan) {
      setPremiumModalWorkout(workout);
      return;
    }

    // Anexa metadados da agenda para sincronizar conclusão apenas quando realmente finalizado
    // Importante: nunca marca o treino como concluído apenas por abrir a ficha!
    const scheduledPlan: WorkoutPlan = {
      ...plan,
      catalogWorkoutId: workout.id,
      scheduledDateISO: dateISO,
      isDemoWeekSession: isDemoMode,
      isDemoSession: isDemoMode ? true : plan.isDemoSession
    };

    onStartScheduledWorkout(scheduledPlan);
  };

  const detailsHydratedExercises = useMemo(() => {
    if (!detailsModalWorkout) return [];
    const hasAccess = canUserAccessWorkout(
      detailsModalWorkout,
      effectiveUserStatus,
      effectiveUserRole,
      effectivePurchasedIds
    );
    if (!hasAccess) return [];
    const hydrated = getHydratedWorkout(detailsModalWorkout.id, {
      allowPremium: true,
      userStatus: effectiveUserStatus,
      userRole: effectiveUserRole,
      purchasedWorkoutIds: effectivePurchasedIds
    });
    return hydrated?.exercises || [];
  }, [detailsModalWorkout, effectiveUserStatus, effectiveUserRole, effectivePurchasedIds]);

  return (
    <div
      data-testid="my-week-view"
      className="w-full min-h-screen bg-slate-950 text-slate-100 pb-24"
    >
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 space-y-5">
        {/* ================================================================= */}
        {/* 1. CABEÇALHO OFICIAL DE MINHA SEMANA                              */}
        {/* ================================================================= */}
        <header className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {onBackToHome && (
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="min-h-[34px] px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Início</span>
                  </button>
                )}

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> Rotina Semanal 40+
                </span>

                {schedule && (
                  schedule.origin === 'trainer' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Planejamento do treinador • {schedule.trainerName || 'Bruno Freire'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold">
                      <User className="w-3 h-3 text-emerald-400" /> Planejamento pessoal
                    </span>
                  )
                )}
              </div>

              <h1
                data-testid="my-week-title"
                className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              >
                Minha Semana
              </h1>
              <p
                data-testid="my-week-subtitle"
                className="text-xs sm:text-sm text-slate-300 leading-relaxed"
              >
                Organize seus treinos e acompanhe sua rotina.
              </p>
            </div>

            {/* Indicador de sessões planejadas e concluídas */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              {schedule && (
                <>
                  <div
                    data-testid="my-week-sessions-indicator"
                    className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-white">
                        {metrics.completedCount} de {metrics.plannedCount}{' '}
                        {metrics.plannedCount === 1 ? 'sessão concluída' : 'sessões concluídas'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {metrics.plannedCount} treinos planejados nesta semana
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(true)}
                    data-testid="open-wizard-header-btn"
                    className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Organizar em 3 passos</span>
                  </button>
                </>
              )}

              {isDemoMode && (
                <button
                  type="button"
                  onClick={handleExitDemo}
                  data-testid="exit-demo-week-btn"
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <X className="w-4 h-4" />
                  <span>Sair da demonstração</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra Informativa do Modo de Demonstração Isolado ("Experimentar Minha Semana") */}
          {isDemoMode && (
            <div
              data-testid="demo-week-active-banner"
              className="p-3.5 sm:p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <FlaskConical className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-black text-amber-200">
                    Modo de Demonstração Ativo: Experimentar Minha Semana
                  </p>
                  <p className="text-[11px] sm:text-xs text-amber-200/80 leading-relaxed">
                    Explore 3 dias de treino (Seg, Qua, Sex), recuperação ativa (Qui) e descanso. Selecione datas, troque treinos, veja detalhes e inicie a Execução Guiada sem alterar seus dados reais.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleDemoOrigin(
                      schedule?.origin === 'trainer' ? 'personal' : 'trainer'
                    )
                  }
                  data-testid="toggle-demo-origin-btn"
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {schedule?.origin === 'trainer'
                      ? 'Simular Planejamento Pessoal'
                      : 'Simular Plano do Treinador'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDemo}
                  data-testid="reset-demo-week-btn"
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar demo</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Notificação leve de feedback */}
        {feedbackToast && (
          <div
            role="status"
            className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-lg animate-fadeIn"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackToast('')}
              className="text-emerald-300 hover:text-white p-1"
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. ESTADO VAZIO (PRIMEIRA EXPERIÊNCIA) OU CALENDÁRIO + CARD DO DIA */}
        {/* ================================================================= */}
        {!schedule ? (
          <WeeklyPlanEmptyState
            onCreateSchedule={handleCreatePersonalSchedule}
            onActivateDemo={handleActivateDemo}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        ) : (
          <div className="space-y-5">
            {/* Calendário Semanal (Segunda a Domingo) */}
            <WeeklyCalendar
              schedule={schedule}
              calendarDays={calendarDays}
              selectedDateISO={selectedDayMeta.dateISO}
              onSelectDate={(dateISO) => setSelectedDateISO(dateISO)}
              onPrevWeek={() => setWeekStartISO(prev => shiftWeekISO(prev, -1))}
              onNextWeek={() => setWeekStartISO(prev => shiftWeekISO(prev, 1))}
              onGoToCurrentWeek={() => {
                setWeekStartISO(currentMondayISO);
                setSelectedDateISO(todayISO);
              }}
              isCurrentWeek={weekStartISO === currentMondayISO}
            />

            {/* Card do Dia Selecionado */}
            {selectedDayItem && (
              <DayWorkoutCard
                dayItem={selectedDayItem}
                dayMeta={selectedDayMeta}
                workout={selectedDaySummary.workout}
                exerciseCount={selectedDaySummary.exerciseCount}
                userStatus={effectiveUserStatus}
                userRole={effectiveUserRole}
                purchasedWorkoutIds={effectivePurchasedIds}
                onOpenPicker={() => setIsPickerOpen(true)}
                onStartWorkout={handleStartWorkoutFromSchedule}
                onViewDetails={(w) => setDetailsModalWorkout(w)}
                onChangeDayType={handleChangeDayType}
                onChangeDayFocus={handleChangeDayFocus}
              />
            )}

            {/* Seção Secundária: Apresentação e Testes (Modo de Demonstração) */}
            {!isDemoMode && (
              <div
                data-testid="schedule-demo-footer-card"
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <FlaskConical className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                      Modo de Demonstração • Apresentação e Testes
                    </span>
                    <p className="text-xs text-slate-300">
                      Deseja testar uma semana simulada com 3 treinos e recuperação ativa?
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ativa um ambiente isolado para testar trocas de treinos e a Execução Guiada sem alterar seu calendário pessoal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleActivateDemo}
                  data-testid="activate-demo-footer-btn"
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ver demonstração</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. SELETOR E SUBSTITUIÇÃO DE TREINOS DO CATÁLOGO (WorkoutPicker)      */}
      {/* ===================================================================== */}
      {selectedDayItem && (
        <WorkoutPicker
          isOpen={isPickerOpen}
          dayItem={selectedDayItem}
          dayMeta={selectedDayMeta}
          currentWorkout={selectedDaySummary.workout}
          userStatus={effectiveUserStatus}
          userRole={effectiveUserRole}
          purchasedWorkoutIds={effectivePurchasedIds}
          isDemoMode={isDemoMode}
          onClose={() => setIsPickerOpen(false)}
          onConfirmSelectWorkout={handleConfirmSelectWorkout}
          onOpenPremiumInfo={(w) => {
            setIsPickerOpen(false);
            setPremiumModalWorkout(w);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* 4. MODAL "VER DETALHES" DA SESSÃO (Não marca como concluído)          */}
      {/* ===================================================================== */}
      {detailsModalWorkout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes do treino ${detailsModalWorkout.title}`}
          data-testid="workout-details-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                    {detailsModalWorkout.duration}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 capitalize">
                    Nível {detailsModalWorkout.level}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {detailsModalWorkout.title}
                </h2>
                <p className="text-xs text-slate-300">
                  {detailsModalWorkout.objective}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailsModalWorkout(null)}
                data-testid="close-workout-details-btn"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shrink-0"
                aria-label="Fechar detalhes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="font-bold text-white">Equipamentos:</span>
                <span>
                  {detailsModalWorkout.equipments && detailsModalWorkout.equipments.length > 0
                    ? detailsModalWorkout.equipments.join(', ')
                    : 'Peso corporal'}
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Treinador responsável:{' '}
                  <strong className="text-emerald-300">
                    {detailsModalWorkout.authorTrainer || 'Bruno Freire'}
                  </strong>
                </span>
              </div>

              {detailsHydratedExercises.length > 0 ? (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Exercícios da sessão ({detailsHydratedExercises.length})
                  </h3>
                  {detailsHydratedExercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                          <ExerciseThumbnail
                            exercise={ex}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              #{idx + 1}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 truncate">
                              {ex.muscleGroup}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                            {ex.name}
                          </h4>
                          <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                            {ex.sets} séries × {ex.reps} • Descanso: {ex.rest}
                          </p>
                        </div>
                      </div>

                      {onPreviewExercise && (
                        <button
                          type="button"
                          onClick={() => onPreviewExercise(ex)}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 shrink-0"
                        >
                          Vídeo
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <Lock className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-xs sm:text-sm font-bold text-white">
                    Prescrição detalhada exclusiva para assinantes Premium
                  </p>
                  <p className="text-xs text-slate-400">
                    Escolha um dos 12 treinos gratuitos ou desbloqueie o acesso Premium para visualizar séries, cargas e vídeos desta sessão.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDetailsModalWorkout(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = detailsModalWorkout;
                  setDetailsModalWorkout(null);
                  handleStartWorkoutFromSchedule(target, selectedDayMeta.dateISO);
                }}
                data-testid="details-modal-start-workout-btn"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60"
              >
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Começar treino</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conteúdo Premium */}
      {premiumModalWorkout && (
        <PremiumModal
          isOpen={Boolean(premiumModalWorkout)}
          targetWorkout={premiumModalWorkout}
          onClose={() => setPremiumModalWorkout(null)}
        />
      )}

      {/* Assistente Minha Semana em 3 Passos */}
      <ThreeStepWeekWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        weekStartISO={weekStartISO}
        onScheduleCreated={(newSchedule) => {
          setSchedule(newSchedule);
          showToast('Sua disponibilidade semanal foi organizada com sucesso!');
        }}
        isDemoMode={isDemoMode}
      />
    </div>
  );
};
