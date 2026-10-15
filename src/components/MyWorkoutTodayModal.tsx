import React, { useState, useMemo } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  RotateCcw, 
  Play, 
  Lock, 
  Sparkles, 
  Dumbbell, 
  HeartPulse, 
  Scale, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Info,
  Layers,
  Target,
  Maximize2,
  CheckCircle2
} from 'lucide-react';
import { 
  CatalogWorkout, 
  TodayWorkoutGoalId, 
  TodayWorkoutPreferences, 
  TodayExperienceLevel,
  TodayDurationPref,
  TodayMusclePref,
  WorkoutPlan
} from '../types';
import { 
  TODAY_GOAL_OPTIONS, 
  GOAL_LABELS,
  loadSavedTodayPreferences, 
  saveTodayPreferences, 
  getRecommendedWorkouts 
} from '../utils/workoutRecommender';
import { convertCatalogWorkoutToWorkoutPlan } from '../data/workoutCatalogService';

interface MyWorkoutTodayModalProps {
  isOpen: boolean;
  onClose: () => void;
  workouts: CatalogWorkout[];
  onStartSession: (plan: WorkoutPlan) => void;
  onPreviewSession?: (session: any) => void;
  onOpenLock?: (session: any) => void;
}

export const MyWorkoutTodayModal: React.FC<MyWorkoutTodayModalProps> = ({
  isOpen,
  onClose,
  workouts,
  onStartSession,
  onPreviewSession,
  onOpenLock
}) => {
  // Estado inicial carregado do localStorage
  const [preferences, setPreferences] = useState<TodayWorkoutPreferences>(() => loadSavedTodayPreferences());
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [cardImgErrors, setCardImgErrors] = useState<Record<string, boolean>>({});

  // Cálculo determinístico dos resultados (Hook chamado incondicionalmente no topo)
  const recommendations = useMemo(() => {
    if (!isOpen) return [];
    return getRecommendedWorkouts(workouts, preferences);
  }, [isOpen, workouts, preferences]);

  if (!isOpen) return null;

  const totalSteps = 4; // Etapa 1: Objetivos, 2: Nível, 3: Tempo, 4: Região Muscular -> Resultados

  // Helpers de seleção múltipla (Etapa 1)
  const toggleGoal = (goalId: TodayWorkoutGoalId) => {
    const isSelected = preferences.goals.includes(goalId);
    let updatedGoals: TodayWorkoutGoalId[];

    if (isSelected) {
      // Remove da seleção
      updatedGoals = preferences.goals.filter(id => id !== goalId);
    } else {
      // Impede selecionar mais de 3
      if (preferences.goals.length >= 3) {
        return;
      }
      updatedGoals = [...preferences.goals, goalId];
    }

    const updated = { ...preferences, goals: updatedGoals };
    setPreferences(updated);
    saveTodayPreferences(updated);
  };

  const handleLevelSelect = (level: TodayExperienceLevel) => {
    const updated = { ...preferences, level };
    setPreferences(updated);
    saveTodayPreferences(updated);
  };

  const handleDurationSelect = (duration: TodayDurationPref) => {
    const updated = { ...preferences, duration };
    setPreferences(updated);
    saveTodayPreferences(updated);
  };

  const handleMuscleSelect = (musclePref: TodayMusclePref) => {
    const updated = { ...preferences, musclePref };
    setPreferences(updated);
    saveTodayPreferences(updated);
  };

  const handleCardImgError = (id: string) => {
    setCardImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const topMatches = recommendations.slice(0, 6);

  const getGoalIcon = (id: TodayWorkoutGoalId) => {
    switch (id) {
      case 'ganhar-forca': return Dumbbell;
      case 'melhorar-condicionamento': return HeartPulse;
      case 'melhorar-mobilidade': return Sparkles;
      case 'desenvolver-equilibrio': return Scale;
      case 'treinar-corpo-inteiro': return Activity;
    }
  };

  const canAdvanceStep1 = preferences.goals.length >= 1;

  const handleStart = (workout: CatalogWorkout) => {
    const plan = convertCatalogWorkoutToWorkoutPlan(workout);
    if (plan) {
      onStartSession(plan);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meu-treino-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ========================================================================= */}
        {/* HEADER MODAL                                                              */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Recomendação Inteligente 40+
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {currentStep <= totalSteps ? `Etapa ${currentStep} de ${totalSteps}` : 'Treinos Recomendados'}
                </span>
              </div>
              <h2 id="meu-treino-modal-title" className="text-base sm:text-lg font-black text-white">
                Meu Treino de Hoje
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso das Etapas */}
        {currentStep <= totalSteps && (
          <div className="w-full bg-slate-950 px-4 sm:px-6 pt-2 pb-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>{currentStep === 1 ? '1. Objetivos' : currentStep === 2 ? '2. Nível' : currentStep === 3 ? '3. Tempo' : '4. Foco Corporal'}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CORPO DO MODAL (FLUXO EM ETAPAS OU RESULTADOS)                             */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* ----------------------------------------------------------------------- */}
          {/* ETAPA 1: SELEÇÃO MÚLTIPLA DE ATÉ 3 OBJETIVOS                           */}
          {/* ----------------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Qual é seu objetivo hoje?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Escolha até 3 objetivos que deseja trabalhar.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-emerald-300 mt-1">
                  <span>{preferences.goals.length} de 3 selecionados</span>
                  {preferences.goals.length === 3 && (
                    <span className="text-[10px] text-amber-400 font-semibold">(Limite máximo atingido)</span>
                  )}
                </div>
              </div>

              {/* Grid das 5 Opções de Objetivos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                {TODAY_GOAL_OPTIONS.map((opt) => {
                  const isSelected = preferences.goals.includes(opt.id);
                  const Icon = getGoalIcon(opt.id);
                  const isDisabled = !isSelected && preferences.goals.length >= 3;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleGoal(opt.id)}
                      disabled={isDisabled}
                      className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 min-h-[58px] ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg shadow-emerald-950/40'
                          : isDisabled
                            ? 'bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-50 cursor-not-allowed'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {/* Checkbox Visual / Indicador */}
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm' 
                          : 'border-slate-700 bg-slate-950 group-hover:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                            {opt.label}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!canAdvanceStep1 && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  Selecione pelo menos 1 objetivo para avançar.
                </p>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* ETAPA 2: NÍVEL DE EXPERIÊNCIA                                          */}
          {/* ----------------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Qual é o seu nível hoje?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Adaptamos a intensidade e a complexidade para que você treine com segurança.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'iniciante',
                    title: 'Nível 1 | Começar Bem',
                    desc: 'Iniciantes ou retorno após período parado. Foco em técnica e adaptação segura.'
                  },
                  {
                    id: 'intermediario',
                    title: 'Nível 2 | Evoluir com Segurança',
                    desc: 'Praticantes regulares buscando força consistente, tônus e progressão equilibrada.'
                  },
                  {
                    id: 'avancado',
                    title: 'Nível 3 | Longevidade em Movimento',
                    desc: 'Maior densidade de treino, vigor muscular duradouro e autonomia física máxima.'
                  },
                  {
                    id: 'todos',
                    title: 'Qualquer Nível',
                    desc: 'Aberto a todas as opções. Recomende o treino que melhor se alinhar aos meus objetivos.'
                  }
                ].map((item) => {
                  const isSelected = preferences.level === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLevelSelect(item.id as TodayExperienceLevel)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 min-h-[58px] ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                          {item.title}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* ETAPA 3: TEMPO DISPONÍVEL                                              */}
          {/* ----------------------------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Quanto tempo você tem disponível hoje?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Treinos objetivos que cabem na sua rotina com total eficácia.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'rapido',
                    title: 'Expresso (15 a 20 minutos)',
                    desc: 'Sessão dinâmica e pontual para dias corridos sem perder o ritmo.'
                  },
                  {
                    id: 'medio',
                    title: 'Padrão (25 a 35 minutos)',
                    desc: 'Duração ideal para estímulo completo de força e mobilidade.'
                  },
                  {
                    id: 'longo',
                    title: 'Completo (40 a 50+ minutos)',
                    desc: 'Treino mais aprofundado com aquecimento e blocos progressivos.'
                  },
                  {
                    id: 'todos',
                    title: 'Sem restrição de tempo',
                    desc: 'Qualquer duração disponível que melhor atenda meus objetivos.'
                  }
                ].map((item) => {
                  const isSelected = preferences.duration === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleDurationSelect(item.id as TodayDurationPref)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 min-h-[58px] ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                          {item.title}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* ETAPA 4: PREFERÊNCIA DE REGIÃO OU GRUPO MUSCULAR                       */}
          {/* ----------------------------------------------------------------------- */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Tem preferência por região corporal hoje?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Você pode priorizar um segmento muscular ou escolher corpo inteiro.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'todos',
                    title: 'Indiferente (Recomendação Livre)',
                    desc: 'Priorize os treinos que melhor atendam meus objetivos escolhidos.',
                    icon: Sparkles
                  },
                  {
                    id: 'peitoral-ombro-triceps',
                    title: 'Peitoral, Ombro e Tríceps',
                    desc: 'Divisão de empurrar: peito firme, ombros estáveis e tríceps.',
                    icon: Target
                  },
                  {
                    id: 'costas-biceps',
                    title: 'Costas, Bíceps e Trapézio',
                    desc: 'Divisão de puxar: postura ereta, sustentação dorsal e braços.',
                    icon: Maximize2
                  },
                  {
                    id: 'superiores',
                    title: 'Membros Superiores Gerais',
                    desc: 'Fortalecimento geral do tronco, postura e braços.',
                    icon: Dumbbell
                  },
                  {
                    id: 'inferiores',
                    title: 'Membros Inferiores',
                    desc: 'Pernas fortes, glúteos e estabilidade para joelhos.',
                    icon: Layers
                  },
                  {
                    id: 'full_body',
                    title: 'Corpo Inteiro (Full Body)',
                    desc: 'Exercícios compostos integrando o corpo de ponta a ponta.',
                    icon: Activity
                  },
                  {
                    id: 'mobilidade',
                    title: 'Mobilidade & Equilíbrio',
                    desc: 'Foco articular, prevenção de dores e estabilidade nos passos.',
                    icon: Scale
                  }
                ].map((item) => {
                  const isSelected = preferences.musclePref === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMuscleSelect(item.id as TodayMusclePref)}
                      className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 min-h-[58px] ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                            {item.title}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* RESULTADOS: TREINOS RECOMENDADOS (ETAPA 5)                              */}
          {/* ----------------------------------------------------------------------- */}
          {currentStep > totalSteps && (
            <div className="space-y-6">
              {/* Resumo das escolhas do usuário */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    Objetivos selecionados hoje:
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {preferences.goals.map((gid) => (
                      <span key={gid} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        {GOAL_LABELS[gid]}
                      </span>
                    ))}
                    {preferences.level !== 'todos' && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                        Nível: {preferences.level}
                      </span>
                    )}
                    {preferences.duration !== 'todos' && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                        Tempo: {preferences.duration === 'rapido' ? '15-20 min' : preferences.duration === 'medio' ? '25-35 min' : '40-50 min'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Modificar preferências
                </button>
              </div>

              {/* Título de Resultados */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Sessões mais recomendadas para você ({topMatches.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ordenadas pelo maior índice de compatibilidade com os seus objetivos de hoje.
                </p>
              </div>

              {/* Grid Vertical 3:4 de Cards Recomendados */}
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                {topMatches.map((match, index) => {
                  const w = match.workout;
                  const isLocked = w.accessLevel === 'premium';
                  const hasImgError = !!cardImgErrors[w.id];

                  return (
                    <div
                      key={w.id}
                      className="group relative flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 shadow-xl"
                    >
                      {/* Selo Top Match ou Afinidade */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1 pointer-events-none">
                        {match.isTopMatch ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wide shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-current" />
                            Melhor Correspondência
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold backdrop-blur-md">
                            {match.matchScore}% compatível
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          w.accessLevel === 'free' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1'
                        }`}>
                          {w.accessLevel === 'free' ? 'Gratuito' : <><Lock className="w-2.5 h-2.5" /> Premium</>}
                        </span>
                      </div>

                      {/* Imagem Vertical 3:4 */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                        {!hasImgError ? (
                          <img
                            src={w.coverImage}
                            alt={w.photoAlt || w.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                            loading={index < 2 ? 'eager' : 'lazy'}
                            onError={() => handleCardImgError(w.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 text-center">
                            <Dumbbell className="w-10 h-10 text-emerald-500/40 mb-2" />
                            <span className="text-xs text-slate-400 font-semibold">{w.title}</span>
                          </div>
                        )}

                        {/* Gradiente Escuro na parte inferior para legibilidade */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                        {/* Informações sobrepostas na base do card 3:4 */}
                        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 space-y-1.5 z-10">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                            <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              {w.duration}
                            </span>
                            <span className="capitalize bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                              {w.level}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2">
                            {w.title}
                          </h4>

                          {/* Tags de objetivos correspondidos & histórico */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {match.matchedGoalLabels.slice(0, 2).map((lbl) => (
                              <span key={lbl} className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                ✓ {lbl}
                              </span>
                            ))}
                            {match.isFresh && (
                              <span className="text-[9px] font-bold text-teal-300 bg-teal-950/80 border border-teal-500/30 px-1.5 py-0.5 rounded">
                                Inédito
                              </span>
                            )}
                            {match.recentlyCompleted && (
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                Feito recente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação na base do card */}
                      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => {
                            if (isLocked && onOpenLock) {
                              onOpenLock(w);
                            } else {
                              handleStart(w);
                            }
                          }}
                          className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${
                            isLocked
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Desbloquear</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Treinar Agora</span>
                            </>
                          )}
                        </button>

                        {onPreviewSession && (
                          <button
                            onClick={() => onPreviewSession(w)}
                            className="min-h-[42px] px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                            title="Ver detalhes da sessão"
                          >
                            Detalhes
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mensagem de Isenção / Responsabilidade */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-300 font-semibold">Transparência:</strong> As recomendações acima são geradas com base nas suas escolhas e nos metadados reais do catálogo Melhor Forma Play 40+. Não constituem prescrição médica individualizada. Respeite sempre seus limites e consulte seu médico antes de iniciar novas atividades físicas.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* FOOTER / NAVEGAÇÃO DE ETAPAS                                              */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
          {currentStep > 1 && currentStep <= totalSteps && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          )}

          {currentStep === 1 && (
            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs sm:text-sm font-semibold transition"
            >
              Cancelar
            </button>
          )}

          {currentStep > totalSteps && (
            <button
              onClick={() => setCurrentStep(1)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refazer Questionário</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {currentStep < totalSteps && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && !canAdvanceStep1}
                className={`min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-md ${
                  currentStep === 1 && !canAdvanceStep1
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                }`}
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === totalSteps && (
              <button
                onClick={() => setCurrentStep(totalSteps + 1)}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ver Recomendações</span>
              </button>
            )}

            {currentStep > totalSteps && (
              <button
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-md active:scale-95"
              >
                Fechar e Explorar
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
