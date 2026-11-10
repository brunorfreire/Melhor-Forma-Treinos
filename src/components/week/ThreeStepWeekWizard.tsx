import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Dumbbell,
  Moon,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Info,
  Clock,
  Layers,
  X,
  FlaskConical,
  Check,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import {
  EducationalWorkoutModel,
  getEducationalModelsForFrequency,
  applyEducationalModelToSchedule
} from '../../services/educationalWorkoutModels';
import {
  StudentWeeklySchedule,
  WeeklyPlanOrigin
} from '../../types';
import {
  getWeekCalendarDays,
  getMondayISO,
  initializePersonalWeeklySchedule,
  getWeeklySchedule
} from '../../services/weeklyScheduleService';

export interface ThreeStepWeekWizardProps {
  isOpen: boolean;
  onClose: () => void;
  weekStartISO: string;
  onScheduleCreated: (schedule: StudentWeeklySchedule) => void;
  isDemoMode?: boolean;
}

const WEEKDAYS_CONFIG = [
  { dayOfWeek: 1, short: 'Seg', name: 'Segunda-feira' },
  { dayOfWeek: 2, short: 'Ter', name: 'Terça-feira' },
  { dayOfWeek: 3, short: 'Qua', name: 'Quarta-feira' },
  { dayOfWeek: 4, short: 'Qui', name: 'Quinta-feira' },
  { dayOfWeek: 5, short: 'Sex', name: 'Sexta-feira' },
  { dayOfWeek: 6, short: 'Sáb', name: 'Sábado' },
  { dayOfWeek: 7, short: 'Dom', name: 'Domingo' }
];

// Atalhos rápidos comuns por frequência semanal
const QUICK_SHORTCUTS_BY_FREQUENCY: Record<number, { label: string; days: number[] }[]> = {
  1: [
    { label: 'Segunda-feira', days: [1] },
    { label: 'Quarta-feira', days: [3] },
    { label: 'Sábado', days: [6] }
  ],
  2: [
    { label: 'Segunda e Quinta', days: [1, 4] },
    { label: 'Terça e Sexta', days: [2, 5] },
    { label: 'Terça e Quinta', days: [2, 4] },
    { label: 'Sábado e Domingo', days: [6, 7] }
  ],
  3: [
    { label: 'Segunda, Quarta e Sexta', days: [1, 3, 5] },
    { label: 'Terça, Quinta e Sábado', days: [2, 4, 6] },
    { label: 'Segunda, Terça e Quinta', days: [1, 2, 4] }
  ],
  4: [
    { label: 'Segunda, Terça, Quinta e Sexta', days: [1, 2, 4, 5] },
    { label: 'Terça, Quarta, Sexta e Sábado', days: [2, 3, 5, 6] }
  ],
  5: [
    { label: 'Segunda a Sexta (dias úteis)', days: [1, 2, 3, 4, 5] },
    { label: 'Terça a Sábado', days: [2, 3, 4, 5, 6] }
  ],
  6: [
    { label: 'Segunda a Sábado', days: [1, 2, 3, 4, 5, 6] }
  ],
  7: [
    { label: 'Todos os dias da semana', days: [1, 2, 3, 4, 5, 6, 7] }
  ]
};

// Verifica se há pelo menos 2 dias consecutivos selecionados
function hasConsecutiveDays(days: number[]): boolean {
  if (days.length < 2) return false;
  const sorted = [...days].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      return true;
    }
  }
  // Domingo (7) e Segunda (1) também são consecutivos
  if (sorted.includes(1) && sorted.includes(7)) {
    return true;
  }
  return false;
}

export const ThreeStepWeekWizard: React.FC<ThreeStepWeekWizardProps> = ({
  isOpen,
  onClose,
  weekStartISO,
  onScheduleCreated,
  isDemoMode = false
}) => {
  // Wizard state: 1 = Quantos dias, 2 = Quais dias, 3 = Confirmar, 4 = Pós-confirmação
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Etapa 1: Frequência selecionada (1 a 7)
  const [chosenFrequency, setChosenFrequency] = useState<number>(3);

  // Etapa 2: Dias da semana selecionados (números de 1 a 7)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);

  // Pós-confirmação: seleção de modelo educativo
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [postConfirmAction, setPostConfirmAction] = useState<
    'idle' | 'models' | 'trainer' | 'applied'
  >('idle');

  // Modo de teste demonstrativo dentro do wizard
  const [wizardDemoActive, setWizardDemoActive] = useState<boolean>(false);

  // Sincroniza atalhos padrão quando o usuário troca a frequência na Etapa 1
  const handleSelectFrequency = (freq: number) => {
    setChosenFrequency(freq);
    const shortcuts = QUICK_SHORTCUTS_BY_FREQUENCY[freq];
    if (shortcuts && shortcuts.length > 0) {
      setSelectedDays(shortcuts[0].days);
    } else {
      // Fallback simples
      const fallback: number[] = [];
      for (let i = 1; i <= freq; i++) fallback.push(i);
      setSelectedDays(fallback);
    }
  };

  const toggleDay = (dayOfWeek: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayOfWeek)) {
        return prev.filter(d => d !== dayOfWeek);
      } else {
        return [...prev, dayOfWeek].sort((a, b) => a - b);
      }
    });
  };

  const applyShortcut = (days: number[]) => {
    setSelectedDays([...days].sort((a, b) => a - b));
  };

  // Modelos educativos para a frequência escolhida
  const availableModels = useMemo(() => {
    return getEducationalModelsForFrequency(chosenFrequency);
  }, [chosenFrequency]);

  // Se o aluno escolheu dias consecutivos
  const consecutiveSelected = useMemo(() => {
    return hasConsecutiveDays(selectedDays);
  }, [selectedDays]);

  // Validação da Etapa 2: contagem exata
  const countMatch = selectedDays.length === chosenFrequency;
  const countDiff = selectedDays.length - chosenFrequency;

  // Consulta se existe plano cadastrado pelo treinador para a semana
  const trainerScheduleInfo = useMemo(() => {
    const s = getWeeklySchedule(weekStartISO, { isDemo: isDemoMode || wizardDemoActive });
    if (s && s.origin === 'trainer') {
      return {
        exists: true,
        trainerName: s.trainerName || 'Bruno Freire',
        plannedCount: Object.values(s.days).filter(d => d.dayType === 'workout').length
      };
    }
    return {
      exists: false,
      trainerName: 'Bruno Freire',
      plannedCount: 0
    };
  }, [weekStartISO, isDemoMode, wizardDemoActive]);

  // Executa a confirmação da disponibilidade (Etapa 3 -> Pós-confirmação)
  const handleConfirmAvailability = () => {
    const created = initializePersonalWeeklySchedule({
      weekStartISO,
      selectedWorkoutWeekdays: selectedDays,
      activeRecoveryWeekdays: []
    });
    onScheduleCreated(created);
    setStep(4);
    setPostConfirmAction('idle');
  };

  // Aplica modelo educativo selecionado
  const handleApplyEducationalModel = (model: EducationalWorkoutModel) => {
    const calendarDays = getWeekCalendarDays(weekStartISO);
    const chosenDatesISO = calendarDays
      .filter(d => selectedDays.includes(d.dayOfWeek))
      .map(d => d.dateISO);

    const updated = applyEducationalModelToSchedule({
      weekStartISO,
      chosenDatesISO,
      model,
      isDemo: isDemoMode || wizardDemoActive
    });

    if (updated) {
      onScheduleCreated(updated);
    }
    onClose();
  };

  // Simular cenário de demonstração rápido para testes (ex: 3 dias ou 5 dias)
  const handleTriggerDemoPreset = (presetFreq: number) => {
    setWizardDemoActive(true);
    handleSelectFrequency(presetFreq);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
      data-testid="three-step-week-wizard-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
        {/* ================================================================= */}
        {/* CABEÇALHO DO ASSISTENTE COM PROGRESSO 3 PASSOS                    */}
        {/* ================================================================= */}
        <div className="p-4 sm:p-6 border-b border-slate-800/90 bg-slate-950 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Assistente 40+
              </span>
              <span className="text-xs font-bold text-slate-400">
                Minha Semana em 3 Passos
              </span>
              {wizardDemoActive && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                  <FlaskConical className="w-3 h-3" /> Teste Demonstrativo
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              data-testid="close-wizard-btn"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              aria-label="Fechar assistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Indicador de Passos */}
          {step <= 3 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  data-testid="wizard-step-indicator"
                  className="font-black text-emerald-400 uppercase tracking-wider"
                >
                  Passo {step} de 3
                </span>
                <span className="text-slate-400 font-semibold">
                  {step === 1 && 'Quantos dias?'}
                  {step === 2 && 'Quais dias?'}
                  {step === 3 && 'Confirmar semana'}
                </span>
              </div>
              {/* Barra de Progresso Visual */}
              <div
                role="progressbar"
                aria-valuenow={step}
                aria-valuemin={1}
                aria-valuemax={3}
                className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex"
              >
                <div
                  className={`h-full bg-emerald-400 transition-all duration-300 ${
                    step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* CORPO DO ASSISTENTE - ETAPAS                                      */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* =============================================================== */}
          {/* ETAPA 1: QUANTOS DIAS POR SEMANA?                               */}
          {/* =============================================================== */}
          {step === 1 && (
            <div
              data-testid="wizard-step-1"
              className="space-y-6 animate-fadeIn"
            >
              <div className="space-y-2 text-center sm:text-left">
                <h2
                  id="wizard-modal-title"
                  className="text-xl sm:text-2xl font-black text-white tracking-tight"
                >
                  Quantos dias por semana você tem disponibilidade para treinar?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Escolha o que cabe na sua rotina. Você poderá mudar depois.
                </p>
              </div>

              {/* 7 Opções Grandes (1 a 7 dias) - Botões táteis mínimos 56px */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Selecione uma frequência:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isSelected = chosenFrequency === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSelectFrequency(num)}
                        data-testid={`frequency-btn-${num}`}
                        aria-pressed={isSelected}
                        className={`min-h-[58px] sm:min-h-[64px] px-3 py-2.5 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/40 text-white shadow-lg shadow-emerald-950/60'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {num}
                          </span>
                          <div className="text-left leading-tight">
                            <span className="text-xs sm:text-sm font-black block">
                              {num === 1 ? '1 dia' : `${num} dias`}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              por semana
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientação Educativa Especial para 7 dias */}
              {chosenFrequency === 7 && (
                <div
                  data-testid="frequency-7-education-note"
                  className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs space-y-1.5 animate-fadeIn"
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <HeartPulse className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Movimento diário e longevidade 40+</span>
                  </div>
                  <p className="leading-relaxed">
                    Treinar 7 dias por semana não significa fazer treinos pesados todos os dias. A recomendação segura é intercalar dias de força com dias de <strong>Recuperação ativa</strong> (atividade leve, como caminhada ou mobilidade, respeitando seu ritmo).
                  </p>
                </div>
              )}

              {/* Botões Rápidos de Demonstração / Teste */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Quer ver exemplos comuns para o público 40+?
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTriggerDemoPreset(3)}
                    className="min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                  >
                    Exemplo 3 dias (Seg/Qua/Sex)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDemoPreset(5)}
                    className="min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                  >
                    Exemplo 5 dias (Seg a Sex)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ETAPA 2: QUAIS DIAS DA SEMANA?                                  */}
          {/* =============================================================== */}
          {step === 2 && (
            <div
              data-testid="wizard-step-2"
              className="space-y-6 animate-fadeIn"
            >
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Em quais dias você pode treinar?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Selecione exatamente os {chosenFrequency}{' '}
                  {chosenFrequency === 1 ? 'dia' : 'dias'} em que você tem disponibilidade.
                </p>
              </div>

              {/* Contador Dinâmico de Dias */}
              <div
                data-testid="day-selection-counter-badge"
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold ${
                  countMatch
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : countDiff < 0
                      ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    {selectedDays.length} de {chosenFrequency}{' '}
                    {chosenFrequency === 1 ? 'dia escolhido' : 'dias escolhidos'}
                  </span>
                </div>

                <span className="text-xs font-semibold">
                  {countMatch && 'Quantidade exata selecionada'}
                  {countDiff < 0 && `Escolha mais ${Math.abs(countDiff)} ${Math.abs(countDiff) === 1 ? 'dia' : 'dias'}`}
                  {countDiff > 0 && `Desmarque ${countDiff} ${countDiff === 1 ? 'dia' : 'dias'}`}
                </span>
              </div>

              {/* Atalhos Rápidos por Frequência */}
              {QUICK_SHORTCUTS_BY_FREQUENCY[chosenFrequency] && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Atalhos rápidos sugeridos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SHORTCUTS_BY_FREQUENCY[chosenFrequency].map((shortcut, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyShortcut(shortcut.days)}
                        data-testid={`shortcut-btn-${idx}`}
                        className="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{shortcut.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 7 Dias da Semana (Segunda a Domingo) - Botões táteis táteis */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ou toque nos dias para personalizar:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {WEEKDAYS_CONFIG.map((item) => {
                    const isSelected = selectedDays.includes(item.dayOfWeek);
                    return (
                      <button
                        key={item.dayOfWeek}
                        type="button"
                        onClick={() => toggleDay(item.dayOfWeek)}
                        data-testid={`wizard-day-toggle-${item.dayOfWeek}`}
                        aria-pressed={isSelected}
                        className={`min-h-[58px] sm:min-h-[72px] p-2.5 rounded-2xl border flex flex-col items-center justify-between transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/40 text-white shadow-md shadow-emerald-950/50'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-black uppercase">
                          {item.short}
                        </span>
                        <div className="my-1">
                          {isSelected ? (
                            <Dumbbell className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold">
                          {isSelected ? 'Treino' : 'Sem treino'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aviso Educativo Amigável se houver Dias Consecutivos (sem bloquear) */}
              {consecutiveSelected && (
                <div
                  data-testid="consecutive-days-advice-note"
                  className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1 animate-fadeIn"
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Dias seguidos selecionados: Dica de ouro 40+</span>
                  </div>
                  <p className="leading-relaxed">
                    Você escolheu treinar em dias consecutivos. Excelente constância! Para cuidar das suas articulações aos 40+, é recomendável alternar os grupamentos (ex.: superiores em um dia, pernas no outro) ou incluir atividades de baixo impacto entre eles.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* ETAPA 3: CONFIRMAR MINHA SEMANA                                 */}
          {/* =============================================================== */}
          {step === 3 && (
            <div
              data-testid="wizard-step-3"
              className="space-y-6 animate-fadeIn"
            >
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Confirmar minha semana
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Confira sua disponibilidade semanal antes de prosseguir.
                </p>
              </div>

              {/* Nota Explicativa Transparente */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Esta etapa confirma <strong>apenas a sua disponibilidade semanal</strong> de dias. Você não está iniciando nenhum treino agora e não prescrevemos exercícios sem a sua escolha.
                </p>
              </div>

              {/* Resumo Completo dos 7 Dias da Semana */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Visão da sua semana:
                </span>
                <div className="space-y-2">
                  {WEEKDAYS_CONFIG.map((day) => {
                    const isWorkout = selectedDays.includes(day.dayOfWeek);
                    return (
                      <div
                        key={day.dayOfWeek}
                        data-testid={`review-day-row-${day.dayOfWeek}`}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                          isWorkout
                            ? 'bg-slate-950 border-emerald-500/50 text-white'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isWorkout
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-900 border border-slate-800 text-slate-500'
                            }`}
                          >
                            {isWorkout ? (
                              <Dumbbell className="w-4 h-4" />
                            ) : (
                              <Moon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block">
                              {day.name}
                            </span>
                            <span
                              className={`text-[11px] ${
                                isWorkout ? 'text-emerald-300 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              {isWorkout ? 'Disponível para treino' : 'Sem treino programado'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                            isWorkout
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {isWorkout ? 'Treino' : 'Descanso'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ETAPA 4: PÓS-CONFIRMAÇÃO (Ajuda com Modelos vs Treinador)        */}
          {/* =============================================================== */}
          {step === 4 && (
            <div
              data-testid="wizard-step-post-confirm"
              className="space-y-6 animate-fadeIn"
            >
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Disponibilidade confirmada com sucesso!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200/90 max-w-lg mx-auto">
                  Sua semana foi organizada com {chosenFrequency}{' '}
                  {chosenFrequency === 1 ? 'dia' : 'dias'} de treino. Agora, escolha como prefere continuar:
                </p>
              </div>

              {/* Opções Principais Pós-Confirmação */}
              <div className="grid grid-cols-1 gap-3.5">
                {/* Opção 1: Quero ajuda para organizar meus treinos (Modelos Educativos) */}
                <div
                  data-testid="post-confirm-option-models"
                  className={`p-4 sm:p-5 rounded-2xl border transition ${
                    postConfirmAction === 'models'
                      ? 'bg-slate-950 border-emerald-500'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-white">
                          Quero ajuda para organizar meus treinos
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Conheça modelos educativos de divisão semanal pensados especificamente para a frequência de {chosenFrequency}{' '}
                          {chosenFrequency === 1 ? 'dia' : 'dias'}, equilibrando força, recuperação e articulações.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPostConfirmAction(prev => (prev === 'models' ? 'idle' : 'models'))
                      }
                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 transition"
                    >
                      {postConfirmAction === 'models' ? 'Ocultar' : 'Ver modelos'}
                    </button>
                  </div>

                  {/* Lista de Modelos Educativos Disponíveis */}
                  {postConfirmAction === 'models' && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
                      {availableModels.map((model) => (
                        <div
                          key={model.id}
                          data-testid={`educational-model-card-${model.id}`}
                          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-black text-white">
                                {model.title}
                              </h4>
                              <p className="text-xs text-emerald-400 font-semibold">
                                {model.subtitle}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplyEducationalModel(model)}
                              data-testid={`apply-model-btn-${model.id}`}
                              className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/60 transition active:scale-95"
                            >
                              <Check className="w-4 h-4 text-slate-950" />
                              <span>Aplicar este modelo</span>
                            </button>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {model.description}
                          </p>

                          {/* Distribuição por Dia Escolhido */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Distribuição nos seus dias:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {selectedDays.map((dayNum, idx) => {
                                const dayConfig = WEEKDAYS_CONFIG.find(w => w.dayOfWeek === dayNum);
                                const focusItem =
                                  model.distribution[idx % model.distribution.length];
                                return (
                                  <div
                                    key={dayNum}
                                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                                  >
                                    <span className="font-bold text-white">
                                      {dayConfig?.name}:
                                    </span>
                                    <span
                                      className={`font-semibold ${
                                        focusItem?.isLightActivity
                                          ? 'text-cyan-300'
                                          : 'text-emerald-300'
                                      }`}
                                    >
                                      {focusItem?.focusLabel}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Nota de dias consecutivos do modelo */}
                          {model.consecutiveNotice && (
                            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                              {model.consecutiveNotice}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Opção 2: Já tenho orientação do meu treinador */}
                <div
                  data-testid="post-confirm-option-trainer"
                  className={`p-4 sm:p-5 rounded-2xl border transition ${
                    postConfirmAction === 'trainer'
                      ? 'bg-slate-950 border-cyan-500'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-white">
                          Já tenho orientação do meu treinador
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Consulte a programação enviada diretamente pelo seu professor ou treinador sem sobrescrevê-la.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPostConfirmAction(prev => (prev === 'trainer' ? 'idle' : 'trainer'))
                      }
                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs shrink-0 transition"
                    >
                      {postConfirmAction === 'trainer' ? 'Ocultar' : 'Consultar'}
                    </button>
                  </div>

                  {postConfirmAction === 'trainer' && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                      {trainerScheduleInfo.exists ? (
                        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 space-y-2">
                          <p className="font-bold text-white">
                            Plano ativo do treinador {trainerScheduleInfo.trainerName}:
                          </p>
                          <p>
                            Foram identificadas {trainerScheduleInfo.plannedCount} sessões prescritas para esta semana.
                          </p>
                          <button
                            type="button"
                            onClick={onClose}
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                          >
                            Visualizar prescrição no calendário
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                          <p className="font-bold text-white">
                            Nenhum plano específico encontrado
                          </p>
                          <p className="leading-relaxed">
                            Seu treinador ainda não cadastrou um plano personalizado para esta semana. Você pode utilizar os modelos educativos do Melhor Forma Play ou escolher treinos livres do catálogo.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Opção 3: Ir direto para o calendário e escolher treinos individualmente */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={onClose}
                    data-testid="go-to-calendar-direct-btn"
                    className="min-h-[48px] w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>Ir para meu calendário e escolher treinos no catálogo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RODAPÉ DO ASSISTENTE - BOTÕES DE NAVEGAÇÃO ENTRE PASSOS           */}
        {/* ================================================================= */}
        {step <= 3 && (
          <div className="p-4 sm:p-5 border-t border-slate-800/90 bg-slate-950 flex items-center justify-between gap-3">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(prev => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))}
                data-testid="wizard-back-btn"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                data-testid="wizard-step1-continue-btn"
                className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
              >
                <span>Continuar para quais dias</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!countMatch}
                data-testid="wizard-step2-continue-btn"
                className={`min-h-[48px] px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition ${
                  countMatch
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/60 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Continuar para confirmação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleConfirmAvailability}
                data-testid="wizard-step3-confirm-btn"
                className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/70 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Confirmar disponibilidade</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
