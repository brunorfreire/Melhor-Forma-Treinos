import React, { useState, useRef, useMemo } from 'react';
import { 
  Play, 
  Sparkles, 
  Dumbbell, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Clock, 
  Layers, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Scale, 
  Info,
  CheckCircle2,
  X,
  Share2,
  Edit3
} from 'lucide-react';
import { WorkoutPlan, Exercise } from '../types';
import { 
  SESSIONS_40_PLUS, 
  PILLARS_40_PLUS, 
  LEVELS_40_PLUS, 
  CollectionWorkoutSession, 
  convertSessionToWorkoutPlan 
} from '../data/collection40Plus';
import { 
  getAllCatalogWorkouts, 
  getHydratedWorkout, 
  convertCatalogWorkoutToWorkoutPlan 
} from '../data/workoutCatalogService';
import { CATALOG_COLLECTIONS } from '../data/catalogWorkouts';
import { ExerciseThumbnail } from './ExerciseThumbnail';

interface StreamingHomeViewProps {
  onSelectSessionToTrain: (plan: WorkoutPlan) => void;
  onOpenCollection: (levelId?: string) => void;
  onOpenTrainerEditor: () => void;
  onPreviewExercise: (ex: Exercise) => void;
  onOpenShareModal?: (plan: WorkoutPlan) => void;
}

export const StreamingHomeView: React.FC<StreamingHomeViewProps> = ({
  onSelectSessionToTrain,
  onOpenCollection,
  onOpenTrainerEditor,
  onPreviewExercise,
  onOpenShareModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [selectedPreviewSession, setSelectedPreviewSession] = useState<CollectionWorkoutSession | null>(null);

  // Fallback image error handling
  const [bannerImgError, setBannerImgError] = useState(false);
  const [cardImgErrors, setCardImgErrors] = useState<Record<string, boolean>>({});

  // 72 Workouts Catalog Loading (Published only for student streaming view)
  const catalogWorkouts = useMemo(() => getAllCatalogWorkouts(), []);

  const allStreamSessions: CollectionWorkoutSession[] = useMemo(() => {
    const published = catalogWorkouts.filter(w => w.status === 'publicado');
    const catalogSessionsMapped: CollectionWorkoutSession[] = published.map(w => {
      const hydrated = getHydratedWorkout(w.id);
      const exercises = hydrated ? hydrated.exercises : [];
      const levelId = w.level === 'iniciante' ? 'nivel-1' : w.level === 'intermediario' ? 'nivel-2' : 'nivel-3';
      const pillarId = w.category === 'forca_40_plus' ? 'forca' :
                       w.category === 'cardiorespiratorio' ? 'condicionamento' :
                       w.category === 'mobilidade_equilibrio' ? 'mobilidade' : 'forca';
      return {
        id: w.id,
        title: w.title,
        levelId,
        pillarId,
        duration: w.duration,
        focus: w.category === 'superiores' ? 'Membros Superiores' :
               w.category === 'inferiores' ? 'Membros Inferiores' :
               w.category === 'full_body' ? 'Full Body Integrado' :
               w.category === 'cardiorespiratorio' ? 'Condicionamento' :
               w.category === 'mobilidade_equilibrio' ? 'Mobilidade & Equilíbrio' : 'Força 40+',
        objective: w.objective,
        targetAudience: 'Mulheres e homens 40+ buscando saúde e longevidade',
        coverImage: w.coverImage,
        exercises
      };
    });

    // Mescla garantindo unicidade de IDs
    const existingIds = new Set(catalogSessionsMapped.map(s => s.id));
    const additional = SESSIONS_40_PLUS.filter(s => !existingIds.has(s.id));
    return [...catalogSessionsMapped, ...additional];
  }, [catalogWorkouts]);

  // Carousel refs for smooth left/right scrolling across collections
  const carouselRefs = {
    nivel1: useRef<HTMLDivElement>(null),
    nivel2: useRef<HTMLDivElement>(null),
    nivel3: useRef<HTMLDivElement>(null),
    equilibrio: useRef<HTMLDivElement>(null),
    forca: useRef<HTMLDivElement>(null),
    superiores: useRef<HTMLDivElement>(null),
    inferiores: useRef<HTMLDivElement>(null),
    fullBody: useRef<HTMLDivElement>(null),
    cardio: useRef<HTMLDivElement>(null),
    mobilidade: useRef<HTMLDivElement>(null)
  };

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardImgError = (id: string) => {
    setCardImgErrors(prev => ({ ...prev, [id]: true }));
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return allStreamSessions.filter(s => {
      const matchesSearch = searchTerm.trim() === '' || 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.focus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.exercises.some(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'todos') return true;
      if (activeFilter === 'nivel-1') return s.levelId === 'nivel-1';
      if (activeFilter === 'nivel-2') return s.levelId === 'nivel-2';
      if (activeFilter === 'nivel-3') return s.levelId === 'nivel-3';
      if (activeFilter === 'forca_40_plus') return s.id.startsWith('w-40p') || s.pillarId === 'forca';
      if (activeFilter === 'superiores') return s.id.startsWith('w-sup') || s.focus.toLowerCase().includes('superior');
      if (activeFilter === 'inferiores') return s.id.startsWith('w-inf') || s.focus.toLowerCase().includes('inferior');
      if (activeFilter === 'full_body') return s.id.startsWith('w-fb') || s.focus.toLowerCase().includes('full body');
      if (activeFilter === 'cardiorespiratorio') return s.id.startsWith('w-cardio') || s.pillarId === 'condicionamento';
      if (activeFilter === 'mobilidade_equilibrio') return s.id.startsWith('w-mob') || s.pillarId === 'mobilidade' || s.pillarId === 'equilibrio';

      return true;
    });
  }, [allStreamSessions, searchTerm, activeFilter]);

  const nivel1Sessions = allStreamSessions.filter(s => s.levelId === 'nivel-1');
  const nivel2Sessions = allStreamSessions.filter(s => s.levelId === 'nivel-2');
  const nivel3Sessions = allStreamSessions.filter(s => s.levelId === 'nivel-3');
  const forcaSessions = allStreamSessions.filter(s => s.id.startsWith('w-40p') || s.pillarId === 'forca');
  const superioresSessions = allStreamSessions.filter(s => s.id.startsWith('w-sup') || s.focus.toLowerCase().includes('superior'));
  const inferioresSessions = allStreamSessions.filter(s => s.id.startsWith('w-inf') || s.focus.toLowerCase().includes('inferior'));
  const fullBodySessions = allStreamSessions.filter(s => s.id.startsWith('w-fb') || s.focus.toLowerCase().includes('full body'));
  const cardioSessions = allStreamSessions.filter(s => s.id.startsWith('w-cardio') || s.pillarId === 'condicionamento');
  const equilibrioMobilitySessions = allStreamSessions.filter(s => s.id.startsWith('w-mob') || s.pillarId === 'equilibrio' || s.pillarId === 'mobilidade');

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('catalogo-treinos');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartWorkout = (session: CollectionWorkoutSession) => {
    const catalogWorkout = catalogWorkouts.find(w => w.id === session.id);
    if (catalogWorkout) {
      const plan = convertCatalogWorkoutToWorkoutPlan(catalogWorkout);
      onSelectSessionToTrain(plan);
    } else {
      const plan = convertSessionToWorkoutPlan(session);
      onSelectSessionToTrain(plan);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER PRINCIPAL 40+ (Com foto profissional de mulher 45-55 anos) */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div className="relative w-full max-w-7xl mx-auto min-h-[500px] sm:min-h-[540px] md:min-h-[600px] flex items-center">
          {/* Background Image / Realistic Mature Brazilian Woman Portrait */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {!bannerImgError ? (
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=85"
                alt="Mulher de 50 anos ativa e confiante treinando com halteres em ambiente iluminado"
                className="w-full h-full object-cover object-[center_20%] sm:object-[center_28%] scale-100 filter brightness-[0.80] sm:brightness-[0.85] contrast-[1.05]"
                referrerPolicy="no-referrer"
                loading="eager"
                onError={() => setBannerImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              </div>
            )}

            {/* Dark & Emerald Gradients for High Readability (Desktop & Mobile 320px+) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40 sm:bg-gradient-to-r sm:from-slate-950 sm:via-slate-950/85 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full px-3.5 sm:px-8 md:px-12 py-10 sm:py-16 max-w-2xl space-y-4 sm:space-y-5">
            {/* Brand Concept Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-950/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wide uppercase text-[11px] font-bold">
                Treine para viver mais e melhor
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] uppercase drop-shadow-md break-words">
              SEU PRÓXIMO TREINO <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                COMEÇA AQUI.
              </span>
            </h1>

            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-normal max-w-xl drop-shadow">
              Mais força, disposição e qualidade de vida. Encontre treinos que acompanham seu ritmo e ajudam você a cuidar do seu futuro.
            </p>

            {/* Micro Pillars tags */}
            <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 pt-1 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] sm:text-xs">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Força Real
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] sm:text-xs">
                <Scale className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Equilíbrio
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] sm:text-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Mobilidade
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] sm:text-xs">
                <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Longevidade
              </span>
            </div>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={scrollToCatalog}
                className="min-h-[48px] py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-xl shadow-emerald-950/60"
              >
                <Play className="w-4 h-4 fill-current text-white shrink-0" />
                <span>EXPLORAR TREINOS</span>
              </button>

              <button
                onClick={() => onOpenCollection()}
                className="min-h-[48px] py-3.5 px-6 bg-slate-900/90 hover:bg-slate-800/90 active:scale-98 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 transition backdrop-blur-md shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CONHECER A COLEÇÃO 40+</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DESTAQUE EDITORIAL: NOVA COLEÇÃO ESPECIAL "FORÇA PARA A VIDA 40+" */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 sm:p-8 md:p-10 shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Column: Text Presentation & Pillars */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COLEÇÃO ESPECIAL EM DESTAQUE</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
                  FORÇA PARA A VIDA 40+
                </h2>
                <p className="text-base sm:text-lg font-semibold text-emerald-400 mt-1">
                  Mais força hoje. Mais autonomia amanhã.
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Uma coleção especial de treinos para desenvolver força, equilíbrio, mobilidade e condicionamento físico. Mais movimento, autonomia e qualidade de vida em cada fase.
              </p>

              {/* Os 4 Pilares Interativos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {PILLARS_40_PLUS.map((pillar) => (
                  <div
                    key={pillar.id}
                    onClick={() => onOpenCollection()}
                    className={`cursor-pointer p-3 rounded-xl border ${pillar.borderColor} ${pillar.bgColor} hover:bg-slate-800/80 transition flex flex-col justify-between`}
                  >
                    <span className={`text-xs font-bold uppercase ${pillar.color}`}>
                      {pillar.name}
                    </span>
                    <span className="text-[11px] text-slate-300 mt-1 leading-tight line-clamp-2">
                      {pillar.shortDesc}
                    </span>
                  </div>
                ))}
              </div>

              {/* Botão Oficial: CONHECER A COLEÇÃO (abre a coleção completa) */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenCollection()}
                  className="min-h-[46px] w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-950/60"
                >
                  <span>CONHECER A COLEÇÃO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Premium Cover Card */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => onOpenCollection()}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-900 shadow-2xl transition hover:border-emerald-400 active:scale-99 aspect-video lg:aspect-[4/3]"
              >
                <img
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80"
                  alt="Mulher de 50 anos em treinamento funcional seguro e consciente"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow">
                    15 Treinos Organizados
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                    3 Níveis Estruturados
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    Começar Bem • Evoluir • Longevidade
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-slate-700/60">
                    <span>15 a 50 min / sessão</span>
                    <span className="text-emerald-300 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                      Ver Treinos <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. BARRA DE BUSCA E FILTROS RÁPIDOS */}
      {/* ========================================================================= */}
      <section id="catalogo-treinos" className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Catálogo de Treinos
            </h2>
            <p className="text-xs text-slate-400">
              Escolha uma sessão para treinar agora com vídeos demonstrativos ou envie para o seu aluno.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar treino, foco ou exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[44px] bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar text-xs">
          {[
            { id: 'todos', label: 'Todos os Treinos' },
            { id: 'nivel-1', label: 'Nível 1 (Começar Bem)' },
            { id: 'nivel-2', label: 'Nível 2 (Evoluir)' },
            { id: 'nivel-3', label: 'Nível 3 (Longevidade)' },
            { id: 'forca', label: 'Pilar Força' },
            { id: 'equilibrio', label: 'Pilar Equilíbrio' },
            { id: 'mobilidade', label: 'Pilar Mobilidade' },
            { id: 'condicionamento', label: 'Pilar Cardio' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl font-bold whitespace-nowrap transition border text-xs flex items-center justify-center ${
                activeFilter === f.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CARROSSÉIS HORIZONTAIS ESTILO STREAMING */}
      {/* ========================================================================= */}
      {searchTerm.trim() !== '' || activeFilter !== 'todos' ? (
        /* Grid de Resultados Filtrados */
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400">
              {filteredSessions.length} treino(s) encontrado(s)
            </span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">Nenhum treino encontrado para sua busca.</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveFilter('todos'); }}
                className="mt-3 text-xs text-emerald-400 font-bold hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSessions.map((session) => (
                <WorkoutCard
                  key={session.id}
                  session={session}
                  onPreview={() => setSelectedPreviewSession(session)}
                  onStart={() => handleStartWorkout(session)}
                  hasError={!!cardImgErrors[session.id]}
                  onError={() => handleCardImgError(session.id)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Carrosséis Temáticos Horizontais */
        <div className="space-y-8 sm:space-y-10 py-4 max-w-7xl mx-auto w-full">
          {/* Carrossel 1: NÍVEL 1 | COMEÇAR BEM */}
          <CarouselRow
            title="NÍVEL 1 | COMEÇAR BEM"
            subtitle="Adaptação, confiança e técnica segura para iniciantes ou retorno (15 a 30 min)"
            badge="Iniciante & Retorno"
            sessions={nivel1Sessions}
            scrollRef={carouselRefs.nivel1}
            onScrollLeft={() => scrollCarousel(carouselRefs.nivel1, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.nivel1, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection('nivel-1')}
          />

          {/* Carrossel 2: NÍVEL 2 | EVOLUIR COM SEGURANÇA */}
          <CarouselRow
            title="NÍVEL 2 | EVOLUIR COM SEGURANÇA"
            subtitle="Treino resistido estruturado, progressão planejada e tônus muscular (25 a 45 min)"
            badge="Intermediário"
            sessions={nivel2Sessions}
            scrollRef={carouselRefs.nivel2}
            onScrollLeft={() => scrollCarousel(carouselRefs.nivel2, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.nivel2, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection('nivel-2')}
          />

          {/* Carrossel 3: NÍVEL 3 | LONGEVIDADE EM MOVIMENTO */}
          <CarouselRow
            title="NÍVEL 3 | LONGEVIDADE EM MOVIMENTO"
            subtitle="Preservação de massa magra, densidade óssea e vigor duradouro (35 a 50 min)"
            badge="Vigor & Potência"
            sessions={nivel3Sessions}
            scrollRef={carouselRefs.nivel3}
            onScrollLeft={() => scrollCarousel(carouselRefs.nivel3, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.nivel3, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection('nivel-3')}
          />

          {/* Carrossel 4: EQUILÍBRIO & MOBILIDADE ATIVA */}
          <CarouselRow
            title="EQUILÍBRIO & MOBILIDADE ARTICULAR"
            subtitle="Prevenção de dores e estabilidade para viver com total autonomia"
            badge="Saúde Articular"
            sessions={equilibrioMobilitySessions}
            scrollRef={carouselRefs.equilibrio}
            onScrollLeft={() => scrollCarousel(carouselRefs.equilibrio, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.equilibrio, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
          />

          {/* Carrossel 5: FORÇA FUNCIONAL 40+ */}
          <CarouselRow
            title="FORÇA FUNCIONAL & CONDICIONAMENTO"
            subtitle="Treinamento com pesos adaptado para saúde, fôlego e disposição"
            badge="Força Vital"
            sessions={forcaSessions}
            scrollRef={carouselRefs.forca}
            onScrollLeft={() => scrollCarousel(carouselRefs.forca, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.forca, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
          />

          {/* Carrossel 6: MEMBROS SUPERIORES */}
          <CarouselRow
            title="MEMBROS SUPERIORES | POSTURA & FORÇA"
            subtitle="Fortalecimento de costas, ombros, peitoral e braços para suporte postural e autonomia"
            badge="Superiores"
            sessions={superioresSessions}
            scrollRef={carouselRefs.superiores}
            onScrollLeft={() => scrollCarousel(carouselRefs.superiores, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.superiores, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
          />

          {/* Carrossel 7: MEMBROS INFERIORES */}
          <CarouselRow
            title="MEMBROS INFERIORES | BASE & ESTABILIDADE"
            subtitle="Pernas fortes, glúteos ativos e joelhos protegidos para caminhar e subir escadas com facilidade"
            badge="Inferiores"
            sessions={inferioresSessions}
            scrollRef={carouselRefs.inferiores}
            onScrollLeft={() => scrollCarousel(carouselRefs.inferiores, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.inferiores, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
          />

          {/* Carrossel 8: FULL BODY INTEGRADO */}
          <CarouselRow
            title="FULL BODY | CORPO INTEIRO INTEGRADO"
            subtitle="Sessões dinâmicas que conectam grandes grupos musculares com alta eficiência temporal"
            badge="Full Body"
            sessions={fullBodySessions}
            scrollRef={carouselRefs.fullBody}
            onScrollLeft={() => scrollCarousel(carouselRefs.fullBody, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.fullBody, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
          />

          {/* Carrossel 9: CONDICIONAMENTO CARDIORRESPIRATÓRIO */}
          <CarouselRow
            title="CONDICIONAMENTO CARDIORRESPIRATÓRIO & FÔLEGO"
            subtitle="Saúde cardiovascular, queima metabólica sustentável e disposição diária renovada"
            badge="Cardio & Vigor"
            sessions={cardioSessions}
            scrollRef={carouselRefs.cardio}
            onScrollLeft={() => scrollCarousel(carouselRefs.cardio, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.cardio, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DE PRÉ-VISUALIZAÇÃO COMPLETA DA SESSÃO */}
      {/* ========================================================================= */}
      {selectedPreviewSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Header da Sessão */}
            <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-slate-950">
              <img
                src={selectedPreviewSession.coverImage}
                alt={selectedPreviewSession.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

              <button
                onClick={() => setSelectedPreviewSession(null)}
                className="absolute top-3 right-3 min-h-[44px] min-w-[44px] rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition"
                aria-label="Fechar pré-visualização"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    {selectedPreviewSession.duration}
                  </span>
                  <span className="text-xs text-emerald-300 font-bold">
                    {selectedPreviewSession.focus}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedPreviewSession.title}
                </h3>
              </div>
            </div>

            {/* Informações detalhadas */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Objetivo desta Sessão:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedPreviewSession.objective}
                </p>
              </div>

              {/* Lista dos Exercícios desta Sessão */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Exercícios Inclusos ({selectedPreviewSession.exercises.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Com vídeos demonstrativos</span>
                </div>

                <div className="space-y-2.5">
                  {selectedPreviewSession.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      {/* Miniatura 16:9 clicável */}
                      <div className="w-20 shrink-0">
                        <ExerciseThumbnail
                          exercise={ex}
                          onClick={() => onPreviewExercise(ex)}
                          aspectRatio="16:9"
                          showPlayBadge={true}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-slate-400">#{idx + 1}</span>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">
                            {ex.muscleGroup}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {ex.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {ex.sets} séries • {ex.reps} • Descanso: {ex.rest}
                        </p>
                      </div>

                      <button
                        onClick={() => onPreviewExercise(ex)}
                        className="min-h-[44px] min-w-[44px] px-2 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-xl transition flex items-center justify-center shrink-0"
                        title="Ver vídeo demonstrativo"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer com Ações */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  handleStartWorkout(selectedPreviewSession);
                  setSelectedPreviewSession(null);
                }}
                className="w-full sm:flex-1 min-h-[46px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Treinar Agora (Modo Aluno)</span>
              </button>

              <button
                onClick={() => {
                  const plan = convertSessionToWorkoutPlan(selectedPreviewSession);
                  if (onOpenShareModal) {
                    onOpenShareModal(plan);
                  } else {
                    handleStartWorkout(selectedPreviewSession);
                  }
                  setSelectedPreviewSession(null);
                }}
                className="w-full sm:w-auto min-h-[46px] py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* Subcomponente: Linha de Carrossel Horizontal */
/* ========================================================================= */
interface CarouselRowProps {
  title: string;
  subtitle: string;
  badge: string;
  sessions: CollectionWorkoutSession[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onPreviewSession: (session: CollectionWorkoutSession) => void;
  onStartSession: (session: CollectionWorkoutSession) => void;
  cardImgErrors: Record<string, boolean>;
  onCardImgError: (id: string) => void;
  onOpenLevel: () => void;
}

const CarouselRow: React.FC<CarouselRowProps> = ({
  title,
  subtitle,
  badge,
  sessions,
  scrollRef,
  onScrollLeft,
  onScrollRight,
  onPreviewSession,
  onStartSession,
  cardImgErrors,
  onCardImgError,
  onOpenLevel
}) => {
  // Parsing de título com formato "NÍVEL X | SUBTÍTULO" para renderização mobile sem quebras estranhas
  const hasDivider = title.includes(' | ');
  const [levelPrefix, levelName] = hasDivider ? title.split(' | ') : [null, title];

  return (
    <div className="space-y-3 px-3 sm:px-6 md:px-8 w-full max-w-full">
      {/* ========================================================================= */}
      {/* Row Header: Mobile-first vertical flow (5 linhas claras) e Desktop em linha única */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
          {/* Mobile Linha 1 & 2 ou Desktop Linha Única */}
          {hasDivider ? (
            <>
              {/* Linha 1: NÍVEL (destaque temático) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded sm:hidden">
                  {levelPrefix}
                </span>
              </div>
              {/* Linha 2 & 3: Título e Selo */}
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase leading-snug">
                  <span className="hidden sm:inline text-emerald-400">{levelPrefix} | </span>
                  {levelName}
                </h3>
                {/* Linha 3: Selo Badge */}
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                  {badge}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase leading-snug">
                {title}
              </h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                {badge}
              </span>
            </div>
          )}

          {/* Linha 4: Descrição completa com quebra natural sem corte de palavras */}
          <p className="text-xs text-slate-300 sm:text-slate-400 leading-relaxed break-words">
            {subtitle}
          </p>
        </div>

        {/* Linha 5: Controles do carrossel e link para nível */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 shrink-0 border-t border-slate-900/60 sm:border-0">
          <button
            onClick={onOpenLevel}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 min-h-[40px] px-2 py-1 rounded-lg hover:bg-slate-900 transition"
          >
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={onScrollLeft}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition active:scale-95 shadow-sm"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onScrollRight}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition active:scale-95 shadow-sm"
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track (rolagem fluida sem overflow na página) */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth w-full"
      >
        {sessions.map((session) => (
          <div key={session.id} className="min-w-[245px] xs:min-w-[265px] sm:min-w-[280px] md:min-w-[300px] shrink-0">
            <WorkoutCard
              session={session}
              onPreview={() => onPreviewSession(session)}
              onStart={() => onStartSession(session)}
              hasError={!!cardImgErrors[session.id]}
              onError={() => onCardImgError(session.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Subcomponente: Card Individual de Treino (Cinematográfico 16:9) */
/* ========================================================================= */
interface WorkoutCardProps {
  session: CollectionWorkoutSession;
  onPreview: () => void;
  onStart: () => void;
  hasError: boolean;
  onError: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  session,
  onPreview,
  onStart,
  hasError,
  onError
}) => {
  return (
    <div className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-emerald-950/40 flex flex-col h-full w-full min-w-0">
      {/* 16:9 Cinematic Thumbnail */}
      <div 
        onClick={onPreview}
        className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
      >
        {!hasError ? (
          <img
            src={session.coverImage}
            alt={session.title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={onError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-emerald-950/40 flex items-center justify-center p-4">
            <Dumbbell className="w-8 h-8 text-emerald-400 opacity-60" />
          </div>
        )}

        {/* Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            {session.duration}
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-300">
            {session.exercises.length} movimentos
          </span>
        </div>

        {/* Centered Play Button Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Content com margens consistentes e quebra de texto fluida */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3 min-w-0">
        <div className="min-w-0 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block truncate">
            {session.focus}
          </span>
          <h4 
            onClick={onPreview}
            className="text-sm font-bold text-white hover:text-emerald-300 transition cursor-pointer leading-snug line-clamp-2 break-words"
          >
            {session.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed break-words">
            {session.objective}
          </p>
        </div>

        {/* Action Row: Botão verde visível de alto contraste e botão de detalhes */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 w-full">
          <button
            onClick={onStart}
            className="flex-1 min-w-0 min-h-[44px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95"
            title="Começar treino agora"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="truncate">Treinar</span>
          </button>

          <button
            onClick={onPreview}
            className="shrink-0 min-h-[44px] px-3 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-200 rounded-xl text-xs font-semibold transition active:scale-95"
            title="Ver detalhes e exercícios"
          >
            Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
