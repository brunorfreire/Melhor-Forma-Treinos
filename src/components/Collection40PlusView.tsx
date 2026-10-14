import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Dumbbell, 
  Scale, 
  Activity, 
  HeartPulse, 
  Clock, 
  CheckCircle2, 
  Play, 
  Share2, 
  ShieldCheck, 
  Layers, 
  Info, 
  ChevronRight,
  UserCheck,
  Award
} from 'lucide-react';
import { WorkoutPlan, Exercise } from '../types';
import { 
  LEVELS_40_PLUS, 
  PILLARS_40_PLUS, 
  SESSIONS_40_PLUS, 
  CollectionWorkoutSession, 
  convertSessionToWorkoutPlan 
} from '../data/collection40Plus';
import { ExerciseThumbnail } from './ExerciseThumbnail';

interface Collection40PlusViewProps {
  initialLevelId?: string;
  onBackToHome: () => void;
  onSelectSessionToTrain: (plan: WorkoutPlan) => void;
  onCustomizeInEditor: (plan: WorkoutPlan) => void;
  onPreviewExercise: (ex: Exercise) => void;
  onOpenShareModal: (plan: WorkoutPlan) => void;
}

export const Collection40PlusView: React.FC<Collection40PlusViewProps> = ({
  initialLevelId = 'nivel-1',
  onBackToHome,
  onSelectSessionToTrain,
  onCustomizeInEditor,
  onPreviewExercise,
  onOpenShareModal
}) => {
  const [activeLevelId, setActiveLevelId] = useState<'nivel-1' | 'nivel-2' | 'nivel-3'>(
    (initialLevelId as any) || 'nivel-1'
  );
  const [activePillarFilter, setActivePillarFilter] = useState<string>('todos');

  const currentLevel = LEVELS_40_PLUS.find(l => l.id === activeLevelId) || LEVELS_40_PLUS[0];
  const levelSessions = SESSIONS_40_PLUS.filter(s => {
    if (s.levelId !== activeLevelId) return false;
    if (activePillarFilter === 'todos') return true;
    return s.pillarId === activePillarFilter;
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="min-h-[44px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Voltar ao Streaming</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
            Coleção Oficial 40+
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {/* ========================================================================= */}
        {/* 1. HERO BANNER PREMIUM DA COLEÇÃO */}
        {/* ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-emerald-500/40 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            {/* Imagem Premium de Mulher Madura Saudável e Ativa */}
            <div className="md:col-span-5 relative aspect-video md:aspect-auto md:h-full min-h-[260px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=85"
                alt="Mulher madura de 50 anos em exercício funcional com sorriso confiante"
                className="w-full h-full object-cover object-[center_20%] sm:object-[center_25%]"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-950" />
              <div className="absolute top-3 left-3">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow">
                  Saúde & Envelhecimento Ativo
                </span>
              </div>
            </div>

            {/* Conteúdo Textual da Coleção */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CONCEITO: TREINE PARA VIVER MAIS E MELHOR</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                  FORÇA PARA A VIDA 40+
                </h1>
                <p className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 mt-1">
                  Mais força hoje. Mais autonomia amanhã.
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Uma coleção desenvolvida especialmente para homens e mulheres a partir dos 40 anos que buscam desenvolver força, equilíbrio, mobilidade e condicionamento físico de forma sustentável, segura e prazerosa — sem extremismos e sem estética inalcançável.
              </p>

              {/* Princípios Fundamentais */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sem promessas irreais</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Proteção articular</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Progressão gradual</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Autonomia duradoura</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. OS QUATRO PILARES DA COLEÇÃO */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Os 4 Pilares da Coleção
              </h2>
              <p className="text-xs text-slate-400">
                Cada sessão integra estímulos planejados pela Educação Física para saúde integral.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PILLARS_40_PLUS.map((pillar) => (
              <div
                key={pillar.id}
                onClick={() => setActivePillarFilter(activePillarFilter === pillar.id ? 'todos' : pillar.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${pillar.borderColor} ${
                  activePillarFilter === pillar.id
                    ? 'bg-slate-900 ring-2 ring-emerald-400 shadow-lg'
                    : `${pillar.bgColor} hover:bg-slate-900/90`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-wider ${pillar.color}`}>
                      {pillar.name}
                    </span>
                    {activePillarFilter === pillar.id && (
                      <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded">
                        Filtro Ativo
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {pillar.shortDesc}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <span className={`text-[10px] font-bold mt-3 block ${pillar.color}`}>
                  {activePillarFilter === pillar.id ? 'Limpar filtro' : 'Filtrar treinos deste pilar →'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. NAVEGAÇÃO POR NÍVEIS (NÍVEL 1, NÍVEL 2, NÍVEL 3) */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-2">
          {/* Level Switcher Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {LEVELS_40_PLUS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => {
                  setActiveLevelId(lvl.id);
                  setActivePillarFilter('todos');
                }}
                className={`flex-1 min-h-[52px] p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  activeLevelId === lvl.id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-950/60'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-black uppercase block ${activeLevelId === lvl.id ? 'text-emerald-200' : 'text-emerald-400'}`}>
                    {lvl.durationRange}
                  </span>
                  <span className="text-xs sm:text-sm font-black tracking-tight block">
                    {lvl.title}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  activeLevelId === lvl.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {lvl.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Level Details Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">
                  {currentLevel.title}
                </h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  {currentLevel.subtitle} • Duração: {currentLevel.durationRange}
                </p>
              </div>
              <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                <span className="font-bold text-slate-300">Público:</span> {currentLevel.targetAudience}
              </div>
            </div>

            {/* Características do Nível */}
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                Diretrizes Técnicas do Nível:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentLevel.characteristics.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. LISTA DAS 5 SESSÕES DO NÍVEL ATIVO */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Sessões de Treino Disponíveis ({levelSessions.length})
              </h4>
              {activePillarFilter !== 'todos' && (
                <button
                  onClick={() => setActivePillarFilter('todos')}
                  className="text-xs text-emerald-400 hover:underline font-bold"
                >
                  Mostrar todos os pilares
                </button>
              )}
            </div>

            <div className="space-y-4">
              {levelSessions.map((session, sIdx) => {
                const pillar = PILLARS_40_PLUS.find(p => p.id === session.pillarId);

                return (
                  <div
                    key={session.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4 transition"
                  >
                    {/* Header da Sessão */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm shrink-0">
                          0{sIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {session.duration}
                            </span>
                            <span className={`text-[10px] font-bold uppercase ${pillar?.color || 'text-slate-400'}`}>
                              Pilar {pillar?.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {session.focus}
                            </span>
                          </div>
                          <h5 className="text-base sm:text-lg font-bold text-white mt-1">
                            {session.title}
                          </h5>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {session.objective}
                          </p>
                        </div>
                      </div>

                      {/* Botões de Ação Imediata (Responsivos para 320px+) */}
                      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:self-start shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => {
                            const plan = convertSessionToWorkoutPlan(session);
                            onSelectSessionToTrain(plan);
                          }}
                          className="min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950"
                        >
                          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>Treinar Agora</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const plan = convertSessionToWorkoutPlan(session);
                              onCustomizeInEditor(plan);
                            }}
                            className="flex-1 min-h-[44px] py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                            title="Carregar este treino no Montador do Treinador para editar"
                          >
                            <span>Editar Ficha</span>
                          </button>

                          <button
                            onClick={() => {
                              const plan = convertSessionToWorkoutPlan(session);
                              onOpenShareModal(plan);
                            }}
                            className="min-h-[44px] min-w-[44px] p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl flex items-center justify-center transition"
                            title="Compartilhar no WhatsApp"
                            aria-label="Compartilhar treino"
                          >
                            <Share2 className="w-4 h-4 text-emerald-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Grade de Exercícios da Sessão com Miniaturas Horizontais */}
                    <div className="border-t border-slate-800/80 pt-3">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                        Exercícios da Sessão ({session.exercises.length} movimentos com vídeo demonstrativo):
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {session.exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                          >
                            {/* Miniatura 16:9 */}
                            <div className="w-20 sm:w-24 shrink-0">
                              <ExerciseThumbnail
                                exercise={ex}
                                onClick={() => onPreviewExercise(ex)}
                                aspectRatio="16:9"
                                showPlayBadge={true}
                              />
                            </div>

                            {/* Informações técnicas resumidas */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-mono text-slate-400">#{exIdx + 1}</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase truncate">
                                  {ex.muscleGroup}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-white truncate mt-0.5">
                                {ex.name}
                              </p>
                              <p className="text-[10px] text-slate-300 mt-0.5">
                                <span className="font-semibold text-white">{ex.sets} séries</span> • {ex.reps} • Descanso: {ex.rest}
                              </p>
                            </div>

                            {/* Botão Ver Execução */}
                            <button
                              onClick={() => onPreviewExercise(ex)}
                              className="min-h-[44px] min-w-[44px] p-2 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-xl transition flex items-center justify-center shrink-0"
                              title="Ver execução do movimento"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
