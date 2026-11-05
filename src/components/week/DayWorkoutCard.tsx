import React, { useState } from 'react';
import {
  Play,
  RefreshCw,
  PlusCircle,
  Eye,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Dumbbell,
  HeartPulse,
  Moon,
  ShieldCheck,
  User,
  Lock,
  Target
} from 'lucide-react';
import {
  CatalogWorkout,
  DayScheduleItem,
  DayScheduleType,
  SubscriptionStatus,
  UserRole
} from '../../types';
import {
  PLANNED_FOCUS_OPTIONS,
  WeekCalendarDayMeta,
  doesWorkoutMatchFocus,
  getFocusLabel,
  resolveEffectiveDayStatus
} from '../../services/weeklyScheduleService';
import { canUserAccessWorkout } from '../../data/workoutCatalogService';

interface DayWorkoutCardProps {
  dayItem: DayScheduleItem;
  dayMeta: WeekCalendarDayMeta;
  workout: CatalogWorkout | null;
  exerciseCount: number;
  userStatus?: SubscriptionStatus;
  userRole?: UserRole;
  purchasedWorkoutIds?: string[];
  onOpenPicker: () => void;
  onStartWorkout: (workout: CatalogWorkout, dateISO: string) => void;
  onViewDetails: (workout: CatalogWorkout) => void;
  onChangeDayType: (newType: DayScheduleType, confirmTrainerOverride?: boolean) => void;
  onChangeDayFocus: (newFocusId: string, confirmTrainerOverride?: boolean) => void;
}

export const DayWorkoutCard: React.FC<DayWorkoutCardProps> = ({
  dayItem,
  dayMeta,
  workout,
  exerciseCount,
  userStatus,
  userRole,
  purchasedWorkoutIds,
  onOpenPicker,
  onStartWorkout,
  onViewDetails,
  onChangeDayType,
  onChangeDayFocus
}) => {
  const [imgError, setImgError] = useState(false);
  const [pendingTrainerAction, setPendingTrainerAction] = useState<
    | { type: 'dayType'; value: DayScheduleType }
    | { type: 'focus'; value: string }
    | { type: 'picker' }
    | null
  >(null);

  if (!dayItem || !dayMeta) return null;

  const effectiveStatus = resolveEffectiveDayStatus(dayItem);
  const isTrainerOrigin = dayItem.origin === 'trainer';
  const focusLabel = getFocusLabel(dayItem.plannedFocus, dayItem.plannedFocusLabel);

  const hasWorkoutAccess = workout
    ? canUserAccessWorkout(workout, userStatus, userRole, purchasedWorkoutIds)
    : true;

  const focusMatchesWorkout =
    workout && dayItem.plannedFocus
      ? doesWorkoutMatchFocus(workout, dayItem.plannedFocus)
      : true;

  const handleRequestDayTypeChange = (nextType: DayScheduleType) => {
    if (nextType === dayItem.dayType) return;
    if (isTrainerOrigin) {
      setPendingTrainerAction({ type: 'dayType', value: nextType });
      return;
    }
    onChangeDayType(nextType, false);
  };

  const handleRequestFocusChange = (nextFocus: string) => {
    if (nextFocus === (dayItem.plannedFocus || '')) return;
    if (isTrainerOrigin) {
      setPendingTrainerAction({ type: 'focus', value: nextFocus });
      return;
    }
    onChangeDayFocus(nextFocus, false);
  };

  const handleRequestOpenPicker = () => {
    if (isTrainerOrigin && workout) {
      setPendingTrainerAction({ type: 'picker' });
      return;
    }
    onOpenPicker();
  };

  const confirmTrainerOverrideAction = () => {
    if (!pendingTrainerAction) return;
    const action = pendingTrainerAction;
    setPendingTrainerAction(null);

    if (action.type === 'dayType') {
      onChangeDayType(action.value, true);
    } else if (action.type === 'focus') {
      onChangeDayFocus(action.value, true);
    } else if (action.type === 'picker') {
      onOpenPicker();
    }
  };

  // Badge de status acessível (ícone + texto explícito: planejado, realizado ou não realizado)
  const renderStatusBadge = () => {
    if (dayItem.dayType === 'rest') {
      return (
        <span
          data-testid="day-status-badge"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 text-slate-300 border border-slate-700"
        >
          <Moon className="w-3.5 h-3.5 text-slate-400" />
          <span>Dia de descanso</span>
        </span>
      );
    }

    if (effectiveStatus === 'completed') {
      return (
        <span
          data-testid="day-status-badge"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Status: Realizado</span>
        </span>
      );
    }

    if (effectiveStatus === 'missed') {
      return (
        <span
          data-testid="day-status-badge"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Status: Não realizado</span>
        </span>
      );
    }

    return (
      <span
        data-testid="day-status-badge"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30"
      >
        <Calendar className="w-3.5 h-3.5 text-teal-400" />
        <span>Status: Planejado</span>
      </span>
    );
  };

  return (
    <section
      aria-label={`Programação de ${dayMeta.formattedFullDate}`}
      data-testid="day-workout-card"
      className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5"
    >
      {/* 1. Cabeçalho do Dia Selecionado: Data + Origem + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/90">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {dayMeta.isToday && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                Hoje
              </span>
            )}

            {/* Identificação clara entre Planejamento Pessoal vs Planejamento do Treinador */}
            {isTrainerOrigin ? (
              <span
                data-testid="plan-origin-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Planejamento do treinador • {dayItem.trainerName || 'Bruno Freire'}</span>
              </span>
            ) : (
              <span
                data-testid="plan-origin-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold"
              >
                <User className="w-3 h-3 text-emerald-400" />
                <span>
                  Planejamento pessoal
                  {dayItem.customizedFromTrainer ? ' (adaptado pelo aluno)' : ''}
                </span>
              </span>
            )}
          </div>

          <h2
            data-testid="selected-day-date-heading"
            className="text-lg sm:text-xl font-black text-white tracking-tight"
          >
            {dayMeta.formattedFullDate}
          </h2>
        </div>

        <div className="self-start sm:self-center shrink-0">
          {renderStatusBadge()}
        </div>
      </div>

      {/* Aviso de Confirmação antes de sobrescrever prescrição do treinador */}
      {pendingTrainerAction && (
        <div
          data-testid="trainer-override-warning"
          className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-100 space-y-3 animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-black text-white">
                Este dia possui prescrição do treinador ({dayItem.trainerName || 'Bruno Freire'})
              </p>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Para proteger seu acompanhamento profissional, confirme se deseja personalizar este dia por conta própria. A alteração será identificada como planejamento pessoal neste dia.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPendingTrainerAction(null)}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700"
            >
              Manter prescrição do treinador
            </button>
            <button
              type="button"
              onClick={confirmTrainerOverrideAction}
              data-testid="confirm-trainer-override-btn"
              className="min-h-[40px] px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
            >
              Personalizar este dia
            </button>
          </div>
        </div>
      )}

      {/* 2. Seletor de Tipo do Dia e Foco Planejado */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4">
        {/* Tipo do Dia */}
        <div className="md:col-span-6 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Programação do dia
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleRequestDayTypeChange('workout')}
              data-testid="day-type-workout-btn"
              aria-pressed={dayItem.dayType === 'workout'}
              className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                dayItem.dayType === 'workout'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-black'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5 shrink-0" />
              <span>Treino</span>
            </button>

            <button
              type="button"
              onClick={() => handleRequestDayTypeChange('active_recovery')}
              data-testid="day-type-recovery-btn"
              aria-pressed={dayItem.dayType === 'active_recovery'}
              className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                dayItem.dayType === 'active_recovery'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-black'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Recuperação</span>
            </button>

            <button
              type="button"
              onClick={() => handleRequestDayTypeChange('rest')}
              data-testid="day-type-rest-btn"
              aria-pressed={dayItem.dayType === 'rest'}
              className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                dayItem.dayType === 'rest'
                  ? 'bg-slate-800 border-slate-600 text-white font-black'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 shrink-0" />
              <span>Descanso</span>
            </button>
          </div>
        </div>

        {/* Objetivo ou Grupamento Planejado */}
        {dayItem.dayType !== 'rest' && (
          <div className="md:col-span-6 space-y-1.5">
            <label
              htmlFor="day-planned-focus-select"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Objetivo ou grupamento planejado</span>
            </label>
            <select
              id="day-planned-focus-select"
              data-testid="day-focus-select"
              value={dayItem.plannedFocus || ''}
              onChange={(e) => handleRequestFocusChange(e.target.value)}
              className="w-full min-h-[44px] bg-slate-900 border border-slate-700/90 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none transition"
            >
              <option value="">Foco livre (qualquer grupamento)</option>
              {PLANNED_FOCUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Nota do treinador quando houver */}
      {dayItem.trainerNotes && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Orientação do treinador:</span>
            <span>{dayItem.trainerNotes}</span>
          </div>
        </div>
      )}

      {/* 3. Conteúdo Principal do Card conforme o Tipo do Dia */}
      {dayItem.dayType === 'rest' ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Moon className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black text-white">
              Dia reservado para descanso
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O descanso faz parte da evolução muscular e da proteção articular após os 40 anos. Se desejar incluir uma prática leve hoje, você pode alterar para Recuperação Ativa ou escolher um treino.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => handleRequestDayTypeChange('active_recovery')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 transition"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Mudar para Recuperação Ativa</span>
            </button>
            <button
              type="button"
              onClick={() => handleRequestDayTypeChange('workout')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
            >
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span>Planejar treino neste dia</span>
            </button>
          </div>
        </div>
      ) : workout ? (
        /* Card do Treino Associado */
        <div
          data-testid="associated-workout-box"
          className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12">
            {/* Imagem de Capa */}
            <div className="sm:col-span-4 relative aspect-video sm:aspect-auto sm:min-h-[180px] bg-slate-900 overflow-hidden">
              {!imgError && workout.coverImage ? (
                <img
                  src={workout.coverImage}
                  alt={workout.photoAlt || workout.title}
                  className="w-full h-full object-cover object-[center_25%]"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950 to-slate-900">
                  <Dumbbell className="w-10 h-10 text-emerald-400/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent sm:hidden" />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                {workout.accessLevel === 'free' ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                    Liberado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase inline-flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Premium
                  </span>
                )}
              </div>
            </div>

            {/* Metadados e Botões Contextuais */}
            <div className="sm:col-span-8 p-4 sm:p-5 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Foco do dia: {focusLabel}
                  </span>

                  {!focusMatchesWorkout && (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      Foco diferente do planejado
                    </span>
                  )}
                </div>

                <h3
                  data-testid="associated-workout-title"
                  className="text-base sm:text-xl font-black text-white leading-snug"
                >
                  {workout.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {workout.objective || workout.description}
                </p>

                {/* Quantidade de exercícios e duração estimada */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-semibold">
                  {workout.duration && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{workout.duration}</span>
                    </span>
                  )}

                  {exerciseCount > 0 && (
                    <span
                      data-testid="associated-workout-exercises-count"
                      className="inline-flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                    >
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                      <span>{exerciseCount} exercícios</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 capitalize">
                    <span>Nível {workout.level}</span>
                  </span>
                </div>
              </div>

              {/* Botões Contextuais Obrigatórios: Começar treino, Ver detalhes, Trocar treino */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onStartWorkout(workout, dayItem.dateISO)}
                  data-testid="start-scheduled-workout-btn"
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
                >
                  {hasWorkoutAccess ? (
                    <Play className="w-4 h-4 fill-current text-slate-950 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-950 shrink-0" />
                  )}
                  <span>Começar treino</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewDetails(workout)}
                  data-testid="view-workout-details-btn"
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ver detalhes</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestOpenPicker}
                  data-testid="replace-workout-btn"
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Trocar treino</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dia de Treino ou Recuperação Ativa ainda sem treino associado */
        <div
          data-testid="unassigned-workout-box"
          className="p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-dashed border-emerald-500/40 text-center space-y-3.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Foco previsto: {focusLabel}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Nenhum treino selecionado para este dia
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escolha um treino compatível no catálogo para deixar sua sessão pronta para a Execução Guiada.
            </p>
          </div>
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={onOpenPicker}
              data-testid="choose-workout-btn"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Escolher treino</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
