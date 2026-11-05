import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  CheckCircle2,
  Moon,
  HeartPulse,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { DayScheduleItem, StudentWeeklySchedule } from '../../types';
import {
  WeekCalendarDayMeta,
  formatWeekRangeLabel,
  resolveEffectiveDayStatus
} from '../../services/weeklyScheduleService';

interface WeeklyCalendarProps {
  schedule: StudentWeeklySchedule;
  calendarDays: WeekCalendarDayMeta[];
  selectedDateISO: string;
  onSelectDate: (dateISO: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToCurrentWeek: () => void;
  isCurrentWeek: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  schedule,
  calendarDays,
  selectedDateISO,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onGoToCurrentWeek,
  isCurrentWeek
}) => {
  const weekRangeLabel = formatWeekRangeLabel(schedule?.weekStartISO);

  const getShortDayStatusText = (dayItem?: DayScheduleItem): {
    label: string;
    icon: React.ReactNode;
    badgeTone: string;
  } => {
    if (!dayItem || dayItem.dayType === 'rest') {
      return {
        label: 'Descanso',
        icon: <Moon className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />,
        badgeTone: 'text-slate-400'
      };
    }

    const effectiveStatus = resolveEffectiveDayStatus(dayItem);

    if (effectiveStatus === 'completed') {
      return {
        label: 'Realizado',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />,
        badgeTone: 'text-emerald-300 font-extrabold'
      };
    }

    if (dayItem.dayType === 'active_recovery') {
      return {
        label: 'Recup.',
        icon: <HeartPulse className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />,
        badgeTone: 'text-cyan-300'
      };
    }

    if (effectiveStatus === 'missed') {
      return {
        label: 'Não feit.',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />,
        badgeTone: 'text-amber-300'
      };
    }

    return {
      label: dayItem.workoutId ? 'Treino' : 'Planejar',
      icon: <Dumbbell className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />,
      badgeTone: 'text-emerald-300'
    };
  };

  return (
    <section
      aria-label="Calendário semanal de treinos"
      data-testid="weekly-calendar"
      className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xl space-y-3"
    >
      {/* Barra Superior de Navegação entre Semanas */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevWeek}
          data-testid="prev-week-btn"
          aria-label="Semana anterior"
          className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-95 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold">Anterior</span>
        </button>

        <div className="flex flex-col items-center text-center min-w-0">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-white tracking-tight">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{weekRangeLabel}</span>
          </div>
          {!isCurrentWeek ? (
            <button
              type="button"
              onClick={onGoToCurrentWeek}
              data-testid="go-current-week-btn"
              className="mt-0.5 text-[11px] font-bold text-emerald-400 hover:underline"
            >
              Voltar para a semana atual
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400">
              Toque em um dia para ver ou ajustar seu treino
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onNextWeek}
          data-testid="next-week-btn"
          aria-label="Próxima semana"
          className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-1 transition active:scale-95 shrink-0"
        >
          <span className="hidden sm:inline text-xs font-bold">Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grade de 7 Dias (Segunda a Domingo) otimizada para 320px+ sem overflow */}
      <div
        role="tablist"
        aria-label="Dias da semana"
        className="grid grid-cols-7 gap-1 xs:gap-1.5 sm:gap-2 w-full min-w-0"
      >
        {calendarDays.map((dayMeta) => {
          const dayItem = schedule?.days ? schedule.days[dayMeta.dateISO] : undefined;
          const isSelected = selectedDateISO === dayMeta.dateISO;
          const statusMeta = getShortDayStatusText(dayItem);
          const effectiveStatus = dayItem ? resolveEffectiveDayStatus(dayItem) : 'planned';

          return (
            <button
              key={dayMeta.dateISO}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={`calendar-day-${dayMeta.dayOfWeek}`}
              onClick={() => onSelectDate(dayMeta.dateISO)}
              aria-label={`${dayMeta.formattedFullDate} - ${statusMeta.label}`}
              className={`relative min-h-[76px] sm:min-h-[88px] py-2 px-1 sm:px-2 rounded-2xl border flex flex-col items-center justify-between transition-all active:scale-95 min-w-0 ${
                isSelected
                  ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/40 text-white shadow-lg shadow-emerald-950/60'
                  : effectiveStatus === 'completed'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100 hover:border-emerald-400/60'
                    : dayItem?.dayType === 'workout'
                      ? 'bg-slate-950/90 border-slate-700/90 text-slate-200 hover:border-emerald-500/50'
                      : dayItem?.dayType === 'active_recovery'
                        ? 'bg-cyan-950/25 border-cyan-500/30 text-slate-200 hover:border-cyan-400/50'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              {/* Indicador "Hoje" */}
              {dayMeta.isToday && (
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 leading-tight">
                  Hoje
                </span>
              )}

              {/* Abreviação do dia + número */}
              <div className="flex flex-col items-center leading-tight">
                <span
                  className={`text-[10px] sm:text-xs font-bold uppercase ${
                    isSelected ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {dayMeta.shortName}
                </span>
                <span
                  className={`text-xs sm:text-base font-black mt-0.5 ${
                    isSelected ? 'text-white' : 'text-slate-100'
                  }`}
                >
                  {dayMeta.dayNumber}
                </span>
              </div>

              {/* Ícone + Status textual acessível (não depende apenas de cor) */}
              <div className="flex flex-col items-center gap-0.5 mt-1 w-full min-w-0">
                {statusMeta.icon}
                <span
                  className={`text-[8px] xs:text-[9px] sm:text-[10px] font-semibold truncate max-w-full leading-tight ${statusMeta.badgeTone}`}
                >
                  {statusMeta.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legenda de Acessibilidade Compacta */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 pt-1 border-t border-slate-800/70 text-[10px] sm:text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-emerald-400" /> Treino planejado
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Realizado
          </span>
          <span className="inline-flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-cyan-400" /> Recuperação ativa
          </span>
          <span className="inline-flex items-center gap-1">
            <Moon className="w-3 h-3 text-slate-500" /> Descanso
          </span>
        </div>
      </div>
    </section>
  );
};
