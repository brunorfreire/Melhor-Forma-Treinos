import React from 'react';
import {
  Play,
  Calendar,
  Dumbbell,
  CheckCircle2,
  HeartPulse,
  Moon,
  Clock,
  Layers,
  ChevronRight,
  Trophy,
  Compass,
  FlaskConical,
  Target,
  Sparkles
} from 'lucide-react';
import {
  ActiveWorkoutSession,
  CatalogWorkout,
  StudentProgressStats,
  StudentWeeklySchedule
} from '../../types';
import {
  getFocusLabel,
  getNextScheduledWorkoutSlot,
  getWeekCalendarDays,
  getWeeklyScheduleMetrics,
  resolveEffectiveDayStatus
} from '../../services/weeklyScheduleService';

interface UpcomingWorkoutCardProps {
  schedule: StudentWeeklySchedule | null;
  activeSession?: ActiveWorkoutSession | null;
  progressStats: StudentProgressStats;
  onStartScheduledWorkout: (workout: CatalogWorkout, dateISO: string, isDemo?: boolean) => void;
  onResumeActiveSession?: () => void;
  onDismissActiveSession?: () => void;
  onOpenMyWeek: (dayDateISO?: string) => void;
  onExperimentMyWeek?: () => void;
  onExploreCatalog: () => void;
  onOpenEvolution?: () => void;
  onOpenTodayRecommender?: () => void;
}

export const UpcomingWorkoutCard: React.FC<UpcomingWorkoutCardProps> = ({
  schedule,
  activeSession,
  progressStats,
  onStartScheduledWorkout,
  onResumeActiveSession,
  onOpenMyWeek,
  onExperimentMyWeek,
  onExploreCatalog,
  onOpenEvolution,
  onOpenTodayRecommender
}) => {
  const calendarDays = getWeekCalendarDays(schedule?.weekStartISO || undefined);
  const metrics = getWeeklyScheduleMetrics(schedule);
  const nextSlot = getNextScheduledWorkoutSlot(schedule);

  return (
    <section
      aria-label="Resumo da rotina e próximo treino"
      data-testid="upcoming-workout-hub"
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-5 pb-2 space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* ================================================================= */}
        {/* PILAR 1: MEU PRÓXIMO TREINO (Ação Principal Clara)                */}
        {/* ================================================================= */}
        <div
          data-testid="upcoming-workout-card"
          className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-emerald-950/85 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 sm:p-6 shadow-2xl flex flex-col justify-between gap-4"
        >
          {activeSession ? (
            /* Caso exista sessão em andamento ("Continue de onde parou") */
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                    <Play className="w-3 h-3 fill-current" /> Meu próximo treino • Em andamento
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    {activeSession.completedExercisesIds.length} de {activeSession.totalExercises} exercícios concluídos
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  {activeSession.workoutTitle}
                </h2>

                <div className="w-full max-w-xs bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(
                        (activeSession.completedExercisesIds.length /
                          (activeSession.totalExercises || 1)) *
                          100
                      )}%`
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onResumeActiveSession}
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  <span>Continuar Execução Guiada</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenMyWeek()}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Ver Minha Semana</span>
                </button>
              </div>
            </>
          ) : nextSlot ? (
            /* Próximo treino planejado na semana */
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                    <Dumbbell className="w-3 h-3" />
                    <span>
                      Meu próximo treino • {nextSlot.isToday ? 'Hoje' : nextSlot.dayMeta.shortName}
                    </span>
                  </span>

                  <span className="text-xs text-slate-300 font-semibold">
                    {nextSlot.dayMeta.formattedFullDate}
                  </span>
                </div>

                {nextSlot.workout ? (
                  <>
                    <h2
                      data-testid="upcoming-workout-title"
                      className="text-lg sm:text-2xl font-black text-white leading-tight"
                    >
                      {nextSlot.workout.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                      Foco: <strong className="text-emerald-300">{getFocusLabel(nextSlot.day.plannedFocus, nextSlot.day.plannedFocusLabel)}</strong> • {nextSlot.workout.objective}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-semibold pt-0.5">
                      <span className="inline-flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" /> {nextSlot.workout.duration}
                      </span>
                      {nextSlot.exerciseCount > 0 && (
                        <span className="inline-flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Layers className="w-3.5 h-3.5 text-teal-400" /> {nextSlot.exerciseCount} exercícios
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                      Dia planejado para {getFocusLabel(nextSlot.day.plannedFocus, nextSlot.day.plannedFocusLabel)}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Você reservou {nextSlot.dayMeta.fullName} para treinar. Escolha o treino no catálogo para iniciar sua Execução Guiada.
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                {nextSlot.workout ? (
                  <button
                    type="button"
                    onClick={() =>
                      onStartScheduledWorkout(
                        nextSlot.workout!,
                        nextSlot.day.dateISO,
                        schedule?.isDemo
                      )
                    }
                    data-testid="upcoming-start-workout-btn"
                    className="min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current text-slate-950 shrink-0" />
                    <span>Começar treino</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenMyWeek(nextSlot.day.dateISO)}
                    className="min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
                  >
                    <Calendar className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Escolher treino do dia</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenMyWeek(nextSlot.day.dateISO)}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Ajustar na Minha Semana</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Aluno ainda sem agenda semanal configurada */
            <>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Meu próximo treino
                </span>

                <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  Qual será seu treino de hoje?
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Organize os dias da sua semana para saber exatamente o que treinar em cada dia ou descubra agora uma sessão compatível com seus objetivos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenMyWeek()}
                  data-testid="home-plan-my-week-btn"
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
                >
                  <Calendar className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Planejar minha semana</span>
                </button>

                {onOpenTodayRecommender && (
                  <button
                    type="button"
                    onClick={onOpenTodayRecommender}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Target className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Descobrir treino de hoje</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ================================================================= */}
        {/* PILAR 2: MINHA SEMANA (Resumo Visual dos Próximos Dias)           */}
        {/* ================================================================= */}
        <div
          data-testid="home-my-week-summary-card"
          className="lg:col-span-5 rounded-3xl bg-slate-900/95 border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                  Minha Semana
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {schedule
                  ? `${metrics.completedCount} concluídos de ${metrics.plannedCount} treinos planejados`
                  : 'Escolha seus dias de treino e acompanhe sua rotina'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenMyWeek()}
              data-testid="home-view-my-week-header-btn"
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 transition shrink-0"
            >
              <span>Ver agenda</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Calendário Semanal de 7 Dias */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((dayMeta) => {
              const item = schedule?.days ? schedule.days[dayMeta.dateISO] : undefined;
              const status = item ? resolveEffectiveDayStatus(item) : 'planned';

              return (
                <button
                  key={dayMeta.dateISO}
                  type="button"
                  onClick={() => onOpenMyWeek(dayMeta.dateISO)}
                  className={`min-h-[58px] py-1.5 px-1 rounded-xl border flex flex-col items-center justify-between transition active:scale-95 ${
                    dayMeta.isToday
                      ? 'bg-emerald-950/70 border-emerald-400 text-white'
                      : status === 'completed'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : item?.dayType === 'workout'
                          ? 'bg-slate-950 border-slate-700 text-slate-200'
                          : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                  }`}
                  aria-label={`Abrir ${dayMeta.formattedFullDate} na Minha Semana`}
                >
                  <span className="text-[9px] font-bold uppercase">
                    {dayMeta.shortName}
                  </span>
                  <span className="text-xs font-black">{dayMeta.dayNumber}</span>
                  <span>
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : item?.dayType === 'workout' ? (
                      <Dumbbell className="w-3 h-3 text-emerald-400" />
                    ) : item?.dayType === 'active_recovery' ? (
                      <HeartPulse className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <Moon className="w-2.5 h-2.5 text-slate-600" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onOpenMyWeek()}
            data-testid="home-open-my-week-btn"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between transition"
          >
            <span>Abrir Minha Semana completa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* PILARES 3 E 4: EXPLORAR TREINOS + MINHA EVOLUÇÃO                    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onExploreCatalog}
          data-testid="home-pillar-explore-btn"
          className="min-h-[60px] p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between gap-3 text-left transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black text-white block">
                Explorar treinos
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Acesse o catálogo completo com 72 sessões e divisões 40+
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
        </button>

        {onOpenEvolution && (
          <button
            type="button"
            onClick={onOpenEvolution}
            data-testid="home-pillar-evolution-btn"
            className="min-h-[60px] p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 flex items-center justify-between gap-3 text-left transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-white block">
                  Minha evolução
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {progressStats.completedWorkoutsCount > 0
                    ? `${progressStats.completedWorkoutsCount} concluídos • ${progressStats.weeklyFrequency} nos últimos 7 dias`
                    : 'Histórico real de sessões e constância semanal'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
          </button>
        )}
      </div>
    </section>
  );
};
