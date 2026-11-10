import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Sparkles,
  Dumbbell,
  HeartPulse,
  Moon,
  ArrowRight,
  FlaskConical
} from 'lucide-react';
import { PLANNED_FOCUS_OPTIONS } from '../../services/weeklyScheduleService';

interface WeeklyPlanEmptyStateProps {
  onCreateSchedule: (params: {
    selectedWorkoutWeekdays: number[];
    activeRecoveryWeekdays: number[];
    focusByWeekday: Record<number, string>;
  }) => void;
  onActivateDemo: () => void;
  onOpenWizard?: () => void;
}

const WEEKDAYS_LIST = [
  { dayOfWeek: 1, short: 'Seg', full: 'Segunda-feira' },
  { dayOfWeek: 2, short: 'Ter', full: 'Terça-feira' },
  { dayOfWeek: 3, short: 'Qua', full: 'Quarta-feira' },
  { dayOfWeek: 4, short: 'Qui', full: 'Quinta-feira' },
  { dayOfWeek: 5, short: 'Sex', full: 'Sexta-feira' },
  { dayOfWeek: 6, short: 'Sáb', full: 'Sábado' },
  { dayOfWeek: 7, short: 'Dom', full: 'Domingo' }
];

export const WeeklyPlanEmptyState: React.FC<WeeklyPlanEmptyStateProps> = ({
  onCreateSchedule,
  onActivateDemo,
  onOpenWizard
}) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [workoutDays, setWorkoutDays] = useState<number[]>([]);
  const [recoveryDays, setRecoveryDays] = useState<number[]>([]);
  const [focusByWeekday, setFocusByWeekday] = useState<Record<number, string>>({});
  const [validationMsg, setValidationMsg] = useState<string>('');

  const toggleDayMode = (dayOfWeek: number) => {
    setValidationMsg('');
    if (workoutDays.includes(dayOfWeek)) {
      // Alterna de Treino -> Recuperação Ativa
      setWorkoutDays(prev => prev.filter(d => d !== dayOfWeek));
      setRecoveryDays(prev => [...prev, dayOfWeek]);
    } else if (recoveryDays.includes(dayOfWeek)) {
      // Alterna de Recuperação Ativa -> Sem treino programado (descanso)
      setRecoveryDays(prev => prev.filter(d => d !== dayOfWeek));
    } else {
      // Alterna de Sem treino programado -> Treino
      setWorkoutDays(prev => [...prev, dayOfWeek].sort((a, b) => a - b));
    }
  };

  const setDayExplicitType = (dayOfWeek: number, mode: 'workout' | 'recovery' | 'rest') => {
    setValidationMsg('');
    setWorkoutDays(prev => prev.filter(d => d !== dayOfWeek));
    setRecoveryDays(prev => prev.filter(d => d !== dayOfWeek));

    if (mode === 'workout') {
      setWorkoutDays(prev => [...prev, dayOfWeek].sort((a, b) => a - b));
    } else if (mode === 'recovery') {
      setRecoveryDays(prev => [...prev, dayOfWeek].sort((a, b) => a - b));
    }
  };

  const handleStartPlanning = () => {
    if (onOpenWizard) {
      onOpenWizard();
    } else {
      setIsConfiguring(true);
    }
  };

  const handleSave = () => {
    if (workoutDays.length === 0 && recoveryDays.length === 0) {
      setValidationMsg('Selecione pelo menos 1 dia da semana em que pretende treinar.');
      return;
    }
    onCreateSchedule({
      selectedWorkoutWeekdays: workoutDays,
      activeRecoveryWeekdays: recoveryDays,
      focusByWeekday
    });
  };

  return (
    <div
      data-testid="weekly-plan-empty-state"
      className="w-full max-w-3xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/30 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-5"
    >
      {/* Topo Ilustrativo e Mensagem Principal */}
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Planejamento Pessoal 40+
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Vamos organizar sua semana?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Escolha os dias em que pretende treinar com nosso assistente em 3 passos e organize seus treinos em um só lugar.
          </p>
        </div>
      </div>

      {!isConfiguring ? (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleStartPlanning}
              data-testid="start-plan-my-week-btn"
              className="min-h-[48px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 transition active:scale-98"
            >
              <Calendar className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Planejar minha semana em 3 passos</span>
              <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
            </button>

            <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
              1. Quantos dias? → 2. Quais dias? → 3. Confirmar minha semana.
            </p>
          </div>

          {/* Dica educativa sobre Recuperação Ativa */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 text-cyan-200 text-xs flex items-start gap-2.5">
            <HeartPulse className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-bold text-white block">Recuperação ativa:</span>
              <span>Atividade leve, como caminhada ou mobilidade, respeitando seu ritmo e sem sobrecarga articular.</span>
            </div>
          </div>

          {/* Seção Secundária: Modo de Demonstração (Apresentação e Testes) */}
          <div
            data-testid="empty-state-demo-section"
            className="pt-4 border-t border-slate-800/80 bg-slate-950/60 rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <FlaskConical className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Modo de Demonstração • Apresentação e Testes
                </span>
                <p className="text-xs font-bold text-slate-200">
                  Quer ver como funciona uma semana completa antes de planejar a sua?
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Carrega 3 dias de treino fictícios isolados para testar o calendário e a Execução Guiada, sem modificar seus dados reais.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onActivateDemo}
              data-testid="empty-state-demo-btn"
              className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver demonstração</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 pt-2 border-t border-slate-800/80 animate-fadeIn">
          {/* Passo 1: Seleção de dias disponíveis */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-xs sm:text-sm font-bold text-white">
                1. Toque nos dias da semana para definir sua disponibilidade:
              </h3>
              <span className="text-[11px] text-slate-400">
                Toque para alternar: Treino → Recuperação ativa → Sem treino programado
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAYS_LIST.map((item) => {
                const isWorkout = workoutDays.includes(item.dayOfWeek);
                const isRecovery = recoveryDays.includes(item.dayOfWeek);

                return (
                  <button
                    key={item.dayOfWeek}
                    type="button"
                    onClick={() => toggleDayMode(item.dayOfWeek)}
                    data-testid={`setup-weekday-${item.dayOfWeek}`}
                    aria-pressed={isWorkout || isRecovery}
                    className={`min-h-[64px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-2xl border flex flex-col items-center justify-between transition active:scale-95 ${
                      isWorkout
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : isRecovery
                          ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-black uppercase">
                      {item.short}
                    </span>

                    <div className="my-1">
                      {isWorkout ? (
                        <Dumbbell className="w-4 h-4 text-emerald-400" />
                      ) : isRecovery ? (
                        <HeartPulse className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-bold leading-tight text-center">
                      {isWorkout ? 'Treino' : isRecovery ? 'Recup.' : 'Sem treino'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passo 2 (Opcional): Definir foco por dia selecionado */}
          {workoutDays.length > 0 && (
            <div className="space-y-2.5 bg-slate-950/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200">
                  2. Foco planejado para os dias de treino (opcional):
                </h4>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {workoutDays.length} {workoutDays.length === 1 ? 'dia selecionado' : 'dias selecionados'}
                </span>
              </div>

              <div className="space-y-2">
                {workoutDays.map((dayNum) => {
                  const dayMeta = WEEKDAYS_LIST.find(w => w.dayOfWeek === dayNum);
                  const selectedFocus = focusByWeekday[dayNum] || '';
                  return (
                    <div
                      key={dayNum}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-white">
                          {dayMeta?.full}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Foco planejado para ${dayMeta?.full}`}
                          value={selectedFocus}
                          onChange={(e) =>
                            setFocusByWeekday(prev => ({
                              ...prev,
                              [dayNum]: e.target.value
                            }))
                          }
                          className="min-h-[40px] w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">Escolher foco depois (livre)</option>
                          {PLANNED_FOCUS_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => setDayExplicitType(dayNum, 'rest')}
                          className="min-h-[40px] px-2.5 text-[11px] font-semibold text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {validationMsg && (
            <p className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2.5">
              {validationMsg}
            </p>
          )}

          {/* Ações de Confirmação */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsConfiguring(false)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold transition"
            >
              Voltar
            </button>

            <button
              type="button"
              onClick={handleSave}
              data-testid="confirm-create-week-btn"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Salvar e Organizar Minha Semana</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
