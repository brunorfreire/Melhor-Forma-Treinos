import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Edit3,
  Lock,
  Crown,
  RotateCcw,
  Zap,
  Target,
  Maximize2,
  HeartPulse,
  Trophy,
  Award,
  Filter
} from 'lucide-react';
import { WorkoutPlan, Exercise, CatalogWorkout, ActiveWorkoutSession } from '../types';
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
import { CATALOG_COLLECTIONS, DEFAULT_FREE_WORKOUT_IDS } from '../data/catalogWorkouts';
import { 
  getActiveWorkoutSession, 
  getFavoriteWorkoutIds, 
  toggleFavoriteWorkout, 
  clearActiveWorkoutSession
} from '../utils/studentProgressService';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { PremiumModal } from './PremiumModal';

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
  const [categoryGroup, setCategoryGroup] = useState<'todos' | 'divisoes' | 'pilares' | 'niveis_acesso'>('todos');
  const [selectedPreviewSession, setSelectedPreviewSession] = useState<CollectionWorkoutSession | null>(null);

  // Modal de Conteúdo Premium
  const [premiumModalWorkout, setPremiumModalWorkout] = useState<CatalogWorkout | null>(null);

  // Sessão em andamento ("Continue de onde parou")
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSession | null>(() => getActiveWorkoutSession());

  // IDs de treinos favoritados
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteWorkoutIds());

  // Fallback image error handling
  const [bannerImgError, setBannerImgError] = useState(false);
  const [cardImgErrors, setCardImgErrors] = useState<Record<string, boolean>>({});

  // Recarrega favoritos e sessão ativa ao montar
  useEffect(() => {
    setActiveSession(getActiveWorkoutSession());
    setFavoriteIds(getFavoriteWorkoutIds());
  }, []);

  // 72 Workouts Catalog Loading (Published only for student streaming view)
  const catalogWorkouts = useMemo(() => getAllCatalogWorkouts(), []);

  const allStreamSessions: CollectionWorkoutSession[] = useMemo(() => {
    // Todos os 72 treinos do catálogo organizados com suas fotos e metadados individuais
    const catalogSessionsMapped: CollectionWorkoutSession[] = catalogWorkouts.map(w => {
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
        exercises,
        accessLevel: w.accessLevel || (DEFAULT_FREE_WORKOUT_IDS.includes(w.id) ? 'free' : 'premium'),
        photoAlt: w.photoAlt
      };
    });

    // Mescla com a coleção Força 40+ garantindo unicidade de IDs
    const existingIds = new Set(catalogSessionsMapped.map(s => s.id));
    const additional = SESSIONS_40_PLUS.filter(s => !existingIds.has(s.id)).map(s => ({
      ...s,
      accessLevel: (s.id === 's1' || s.id === 's2' || s.id === 's6' || s.id === 's11' || s.id.includes('iniciante')) ? ('free' as const) : ('premium' as const)
    }));
    return [...catalogSessionsMapped, ...additional];
  }, [catalogWorkouts]);

  // Carousel refs for smooth left/right scrolling across collections
  const carouselRefs = {
    favoritos: useRef<HTMLDivElement>(null),
    gratuitos: useRef<HTMLDivElement>(null),
    peitoralOmbroTriceps: useRef<HTMLDivElement>(null),
    costasBiceps: useRef<HTMLDivElement>(null),
    nivel1: useRef<HTMLDivElement>(null),
    nivel2: useRef<HTMLDivElement>(null),
    nivel3: useRef<HTMLDivElement>(null),
    equilibrio: useRef<HTMLDivElement>(null),
    forca: useRef<HTMLDivElement>(null),
    superiores: useRef<HTMLDivElement>(null),
    inferiores: useRef<HTMLDivElement>(null),
    fullBody: useRef<HTMLDivElement>(null),
    cardio: useRef<HTMLDivElement>(null)
  };

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardImgError = (id: string) => {
    setCardImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleToggleFavorite = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoriteWorkout(sessionId);
    setFavoriteIds(updated);
  };

  const handleDismissActiveSession = () => {
    clearActiveWorkoutSession();
    setActiveSession(null);
  };

  // Helpers para classificação inteligente de novas divisões musculares
  const isPeitoralOmbroTriceps = (s: CollectionWorkoutSession): boolean => {
    const pushKeywords = [
      'peitoral', 'peito', 'ombro', 'tríceps', 'triceps', 'deltóide', 'deltoide', 
      'empurrar', 'empurrada', 'supino', 'desenvolvimento', 'elevação lateral', 'elevação frontal', 'flexão'
    ];
    if (['w-sup-01', 'w-sup-03', 'w-sup-05', 'w-sup-06', 'w-sup-08', 'w-sup-09', 'w-sup-11', 'w-sup-12', 'w-40p-07'].includes(s.id)) {
      return true;
    }
    const tMatch = pushKeywords.some(k => s.title.toLowerCase().includes(k));
    const fMatch = pushKeywords.some(k => s.focus.toLowerCase().includes(k));
    const oMatch = pushKeywords.some(k => s.objective.toLowerCase().includes(k));
    const exMatch = s.exercises && s.exercises.some(e => {
      const mg = (e.muscleGroup || '').toLowerCase();
      const mp = (e.movementPattern || '').toLowerCase();
      const nm = (e.name || '').toLowerCase();
      return mp.includes('empurrar') || pushKeywords.some(k => mg.includes(k) || nm.includes(k));
    });
    return tMatch || fMatch || oMatch || !!exMatch;
  };

  const isCostasBiceps = (s: CollectionWorkoutSession): boolean => {
    const pullKeywords = [
      'costas', 'bíceps', 'biceps', 'dorsal', 'romboides', 'romboide', 'trapézio', 'trapezio',
      'puxar', 'puxada', 'remada', 'tração', 'tracao', 'escapular', 'lat pulldown', 'crucifixo invertido', 'rosca'
    ];
    if (['w-sup-02', 'w-sup-03', 'w-sup-04', 'w-sup-05', 'w-sup-07', 'w-sup-08', 'w-sup-09', 'w-sup-10', 'w-sup-12', 'w-40p-07'].includes(s.id)) {
      return true;
    }
    const tMatch = pullKeywords.some(k => s.title.toLowerCase().includes(k));
    const fMatch = pullKeywords.some(k => s.focus.toLowerCase().includes(k));
    const oMatch = pullKeywords.some(k => s.objective.toLowerCase().includes(k));
    const exMatch = s.exercises && s.exercises.some(e => {
      const mg = (e.muscleGroup || '').toLowerCase();
      const mp = (e.movementPattern || '').toLowerCase();
      const nm = (e.name || '').toLowerCase();
      return mp.includes('puxar') || pullKeywords.some(k => mg.includes(k) || nm.includes(k));
    });
    return tMatch || fMatch || oMatch || !!exMatch;
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
      if (activeFilter === 'peitoral-ombro-triceps') return isPeitoralOmbroTriceps(s);
      if (activeFilter === 'costas-biceps' || activeFilter === 'costas-trapezio-biceps' || activeFilter === 'costas-biceps-trapezio') return isCostasBiceps(s);
      if (activeFilter === 'gratis') return s.accessLevel === 'free';
      if (activeFilter === 'premium') return s.accessLevel === 'premium';
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

  // Coleções filtradas para os carrosséis
  const favoriteSessions = useMemo(() => {
    return allStreamSessions.filter(s => favoriteIds.includes(s.id));
  }, [allStreamSessions, favoriteIds]);

  const freeSessions = useMemo(() => {
    return allStreamSessions.filter(s => s.accessLevel === 'free');
  }, [allStreamSessions]);

  const peitoralOmbroTricepsSessions = useMemo(() => {
    return allStreamSessions.filter(s => isPeitoralOmbroTriceps(s));
  }, [allStreamSessions]);

  const costasBicepsSessions = useMemo(() => {
    return allStreamSessions.filter(s => isCostasBiceps(s));
  }, [allStreamSessions]);

  const nivel1Sessions = allStreamSessions.filter(s => s.levelId === 'nivel-1');
  const nivel2Sessions = allStreamSessions.filter(s => s.levelId === 'nivel-2');
  const nivel3Sessions = allStreamSessions.filter(s => s.levelId === 'nivel-3');
  const forcaSessions = allStreamSessions.filter(s => s.id.startsWith('w-40p') || s.pillarId === 'forca');
  const superioresSessions = allStreamSessions.filter(s => s.id.startsWith('w-sup') || s.focus.toLowerCase().includes('superior'));
  const inferioresSessions = allStreamSessions.filter(s => s.id.startsWith('w-inf') || s.focus.toLowerCase().includes('inferior'));
  const fullBodySessions = allStreamSessions.filter(s => s.id.startsWith('w-fb') || s.focus.toLowerCase().includes('full body'));
  const cardioSessions = allStreamSessions.filter(s => s.id.startsWith('w-cardio') || s.pillarId === 'condicionamento');
  const equilibrioMobilitySessions = allStreamSessions.filter(s => s.id.startsWith('w-mob') || s.pillarId === 'equilibrio' || s.pillarId === 'mobilidade');

  const categoriesList = useMemo(() => [
    {
      id: 'todos',
      name: 'Todos os Treinos',
      subtitle: 'Catálogo completo 40+',
      icon: Sparkles,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      group: 'todos'
    },
    {
      id: 'peitoral-ombro-triceps',
      name: 'Peitoral, Ombro e Tríceps',
      subtitle: 'Musculaturas de empurrar',
      icon: Target,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      group: 'divisoes'
    },
    {
      id: 'costas-biceps',
      name: 'Costas, Bíceps e Trapézio',
      subtitle: 'Musculaturas de puxar',
      icon: Maximize2,
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      group: 'divisoes'
    },
    {
      id: 'superiores',
      name: 'Membros Superiores',
      subtitle: 'Tronco, postura e braços',
      icon: Dumbbell,
      color: 'text-teal-400',
      badgeBg: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      group: 'divisoes'
    },
    {
      id: 'inferiores',
      name: 'Membros Inferiores',
      subtitle: 'Pernas, glúteos e joelhos',
      icon: Layers,
      color: 'text-orange-400',
      badgeBg: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      group: 'divisoes'
    },
    {
      id: 'full_body',
      name: 'Full Body Integrado',
      subtitle: 'Corpo todo com eficiência',
      icon: Activity,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      group: 'divisoes'
    },
    {
      id: 'forca_40_plus',
      name: 'Força para a Vida 40+',
      subtitle: 'Massa magra e densidade',
      icon: Flame,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      group: 'pilares'
    },
    {
      id: 'cardiorespiratorio',
      name: 'Condicionamento & Fôlego',
      subtitle: 'Cardio ativo sem impacto',
      icon: HeartPulse,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      group: 'pilares'
    },
    {
      id: 'mobilidade_equilibrio',
      name: 'Mobilidade & Equilíbrio',
      subtitle: 'Articulações e prevenção',
      icon: Scale,
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      group: 'pilares'
    },
    {
      id: 'gratis',
      name: 'Treinos Gratuitos',
      subtitle: '100% liberados',
      icon: Sparkles,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      group: 'niveis_acesso'
    },
    {
      id: 'premium',
      name: 'Treinos Premium',
      subtitle: 'Catálogo VIP completo',
      icon: Crown,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      group: 'niveis_acesso'
    },
    {
      id: 'nivel-1',
      name: 'Nível 1 (Começar Bem)',
      subtitle: 'Iniciantes e retorno seguro',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      group: 'niveis_acesso'
    },
    {
      id: 'nivel-2',
      name: 'Nível 2 (Evoluir)',
      subtitle: 'Intermediário consistente',
      icon: Trophy,
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      group: 'niveis_acesso'
    },
    {
      id: 'nivel-3',
      name: 'Nível 3 (Longevidade)',
      subtitle: 'Avançado, força e vigor',
      icon: Award,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      group: 'niveis_acesso'
    }
  ], []);

  const categoryCounts = useMemo<Record<string, number>>(() => {
    return {
      todos: allStreamSessions.length,
      'peitoral-ombro-triceps': peitoralOmbroTricepsSessions.length,
      'costas-biceps': costasBicepsSessions.length,
      superiores: superioresSessions.length,
      inferiores: inferioresSessions.length,
      full_body: fullBodySessions.length,
      forca_40_plus: forcaSessions.length,
      cardiorespiratorio: cardioSessions.length,
      mobilidade_equilibrio: equilibrioMobilitySessions.length,
      gratis: freeSessions.length,
      premium: allStreamSessions.filter(s => s.accessLevel === 'premium').length,
      'nivel-1': nivel1Sessions.length,
      'nivel-2': nivel2Sessions.length,
      'nivel-3': nivel3Sessions.length,
    };
  }, [
    allStreamSessions, 
    peitoralOmbroTricepsSessions, 
    costasBicepsSessions, 
    superioresSessions, 
    inferioresSessions, 
    fullBodySessions, 
    forcaSessions, 
    cardioSessions, 
    equilibrioMobilitySessions, 
    freeSessions, 
    nivel1Sessions, 
    nivel2Sessions, 
    nivel3Sessions
  ]);

  const visibleCategories = useMemo(() => {
    if (categoryGroup === 'todos') return categoriesList;
    return categoriesList.filter(c => c.group === categoryGroup || c.id === 'todos');
  }, [categoriesList, categoryGroup]);

  const activeCategoryMeta = useMemo(() => {
    return categoriesList.find(c => c.id === activeFilter) || {
      id: activeFilter,
      name: activeFilter,
      subtitle: '',
      icon: Layers,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      group: 'todos'
    };
  }, [categoriesList, activeFilter]);

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('catalogo-treinos');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartWorkout = (session: CollectionWorkoutSession) => {
    // Se for premium, abre modal com opções ou desbloqueio
    if (session.accessLevel === 'premium') {
      const catalogMatch = catalogWorkouts.find(w => w.id === session.id);
      if (catalogMatch) {
        setPremiumModalWorkout(catalogMatch);
        return;
      }
    }

    const catalogWorkout = catalogWorkouts.find(w => w.id === session.id);
    if (catalogWorkout) {
      const plan = convertCatalogWorkoutToWorkoutPlan(catalogWorkout);
      onSelectSessionToTrain(plan);
    } else {
      const plan = convertSessionToWorkoutPlan(session);
      onSelectSessionToTrain(plan);
    }
  };

  const handleOpenLock = (session: CollectionWorkoutSession) => {
    const catalogMatch = catalogWorkouts.find(w => w.id === session.id);
    if (catalogMatch) {
      setPremiumModalWorkout(catalogMatch);
    } else {
      // Mock do catalog workout para o modal de conversão
      setPremiumModalWorkout({
        id: session.id,
        title: session.title,
        description: session.objective,
        category: session.pillarId === 'forca' ? 'forca_40_plus' : 'full_body',
        level: session.levelId === 'nivel-1' ? 'iniciante' : session.levelId === 'nivel-2' ? 'intermediario' : 'avancado',
        duration: session.duration,
        equipments: ['Halteres', 'Colchonete'],
        objective: session.objective,
        coverImage: session.coverImage,
        status: 'publicado',
        accessLevel: 'premium',
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER PRINCIPAL 40+ (Com foto profissional de mulher 45-55 anos) */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div className="relative w-full max-w-7xl mx-auto min-h-[480px] sm:min-h-[520px] md:min-h-[580px] flex items-center">
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
          <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 py-10 sm:py-16 max-w-2xl space-y-4 sm:space-y-5">
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
      {/* 2. CONTINUE DE ONDE PAROU (Sessão Ativa Resumível)                       */}
      {/* ========================================================================= */}
      {activeSession && (
        <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 sm:p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Play className="w-6 h-6 fill-current animate-pulse ml-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Continue de onde parou
                    </span>
                    <span className="text-xs text-slate-400">
                      {activeSession.completedExercisesIds.length} de {activeSession.totalExercises} concluídos
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate mt-1">
                    {activeSession.workoutTitle}
                  </h3>
                  {/* Micro Progress Bar */}
                  <div className="w-48 max-w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.round((activeSession.completedExercisesIds.length / (activeSession.totalExercises || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onSelectSessionToTrain(activeSession.plan)}
                  className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-950/50 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Retomar Treino</span>
                </button>
                <button
                  onClick={handleDismissActiveSession}
                  className="min-h-[44px] min-w-[44px] p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition"
                  title="Descartar progresso salvo"
                  aria-label="Descartar progresso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. DESTAQUE EDITORIAL: NOVA COLEÇÃO ESPECIAL "FORÇA PARA A VIDA 40+"     */}
      {/* Formato Panorâmico Widescreen 16:9 / 2:1 conforme Seção 3 do Guia       */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 sm:p-7 md:p-8 shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center">
            {/* Left Column: Text Presentation & Pillars */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COLEÇÃO ESPECIAL EM DESTAQUE</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                  FORÇA PARA A VIDA 40+
                </h2>
                <p className="text-sm sm:text-base font-semibold text-emerald-400 mt-0.5">
                  Mais força hoje. Mais autonomia amanhã.
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Uma coleção especial de treinos para desenvolver força, equilíbrio, mobilidade e condicionamento físico. Mais movimento, autonomia e qualidade de vida em cada fase.
              </p>

              {/* Os 4 Pilares Interativos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {PILLARS_40_PLUS.map((pillar) => (
                  <div
                    key={pillar.id}
                    onClick={() => onOpenCollection()}
                    className={`cursor-pointer p-2.5 sm:p-3 rounded-xl border ${pillar.borderColor} ${pillar.bgColor} hover:bg-slate-800/80 transition flex flex-col justify-between`}
                  >
                    <span className={`text-[11px] font-bold uppercase ${pillar.color}`}>
                      {pillar.name}
                    </span>
                    <span className="text-[10px] text-slate-300 mt-1 leading-tight line-clamp-2">
                      {pillar.shortDesc}
                    </span>
                  </div>
                ))}
              </div>

              {/* Botão Oficial: CONHECER A COLEÇÃO (abre a coleção completa) */}
              <div className="pt-1">
                <button
                  onClick={() => onOpenCollection()}
                  className="min-h-[46px] w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-950/60"
                >
                  <span>CONHECER A COLEÇÃO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Premium Cover Card (Panorâmico 16:9 / 2:1) */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => onOpenCollection()}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-900 shadow-2xl transition hover:border-emerald-400 active:scale-99 aspect-video lg:aspect-[16/10]"
              >
                <img
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80"
                  alt="Mulher de 50 anos em treinamento funcional seguro e consciente"
                  className="w-full h-full object-cover object-[center_25%] transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow">
                    15 Treinos Organizados
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    3 Níveis Estruturados
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
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
      {/* 4. BARRA DE BUSCA E FILTROS RÁPIDOS STREAMING                             */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 4. BARRA DE BUSCA E GRADE RESPONSIVA DE CATEGORIAS                        */}
      {/* ========================================================================= */}
      <section id="catalogo-treinos" className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Catálogo de Treinos 40+
            </h2>
            <p className="text-xs text-slate-400">
              Escolha uma divisão muscular ou programa em formato vertical 3:4 com demonstrações completas.
            </p>
          </div>

          {/* Search Input - Preservado acima da navegação */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar treino, foco ou exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[44px] bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-sm"
              aria-label="Buscar treinos no catálogo"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-white"
                aria-label="Limpar campo de busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Abas de Navegação / Grupos de Filtros */}
        <div className="flex items-center gap-1.5 sm:gap-2 py-3 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Filtros:
          </span>
          {[
            { id: 'todos', label: 'Todas as Categorias', count: 14 },
            { id: 'divisoes', label: 'Divisões Musculares', count: 5 },
            { id: 'pilares', label: 'Coleções 40+', count: 3 },
            { id: 'niveis_acesso', label: 'Níveis & Acesso', count: 5 }
          ].map((grp) => (
            <button
              key={grp.id}
              onClick={() => setCategoryGroup(grp.id as any)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 active:scale-95 ${
                categoryGroup === grp.id
                  ? 'bg-slate-800 text-white border-emerald-500/80 shadow-sm shadow-emerald-950 font-black'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>{grp.label}</span>
              <span className="text-[10px] opacity-70">({grp.count})</span>
            </button>
          ))}
        </div>

        {/* Grade Responsiva de Categorias: 2 colunas no celular, 3 ou 4 em tablets/computadores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-1 pb-3">
          {visibleCategories.map((cat) => {
            const isSelected = activeFilter === cat.id;
            const Icon = cat.icon;
            const count = (categoryCounts as any)[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveFilter(cat.id);
                  const el = document.getElementById('catalogo-treinos');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`group relative text-left min-h-[52px] sm:min-h-[58px] h-auto p-2.5 sm:p-3 rounded-xl border transition-all duration-200 active:scale-[0.98] flex flex-col justify-between ${
                  isSelected
                    ? cat.id === 'premium'
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-900/90 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                }`}
                aria-pressed={isSelected}
                aria-label={`Filtrar por ${cat.name}, ${count} treinos disponíveis`}
              >
                <div className="flex items-start justify-between gap-1.5 w-full">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected 
                        ? (cat.id === 'premium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300') 
                        : cat.badgeBg + ' ' + cat.color
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    {isSelected && (
                      <span className={`w-2 h-2 rounded-full animate-pulse ${cat.id === 'premium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isSelected
                      ? (cat.id === 'premium' ? 'bg-amber-500/30 text-amber-200 border-amber-400/50' : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50')
                      : 'bg-slate-800/90 text-slate-400 border-slate-700/60'
                  }`}>
                    {count} {count === 1 ? 'treino' : 'treinos'}
                  </span>
                </div>

                <div className="mt-1.5 w-full">
                  <div className={`text-xs font-bold leading-snug break-words ${isSelected ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                    {cat.name}
                  </div>
                  {cat.subtitle && (
                    <div className={`text-[10px] leading-tight line-clamp-1 mt-0.5 ${isSelected ? (cat.id === 'premium' ? 'text-amber-200/80' : 'text-emerald-200/80') : 'text-slate-400'}`}>
                      {cat.subtitle}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CARROSSÉIS OU GRID (Conforme Busca/Filtro)                              */}
      {/* ========================================================================= */}
      {searchTerm.trim() !== '' || activeFilter !== 'todos' ? (
        /* Grid de Resultados Filtrados: 2 colunas no celular conforme Regra 5 */
        <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold">
                Filtro ativo:
              </span>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeCategoryMeta.name}
              </span>
              <span className="text-xs text-slate-400">
                • {filteredSessions.length} {filteredSessions.length === 1 ? 'treino vertical 3:4 encontrado' : 'treinos verticais 3:4 encontrados'}
              </span>
            </div>
            <button
              onClick={() => { setSearchTerm(''); setActiveFilter('todos'); }}
              className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1.5 self-start sm:self-auto min-h-[36px] px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar filtros (Ver todos)
            </button>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">Nenhum treino encontrado para esta categoria ou termo de busca.</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveFilter('todos'); }}
                className="mt-3 text-xs text-emerald-400 font-bold hover:underline"
              >
                Ver todos os 72 treinos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 xs:gap-3 sm:gap-4">
              {filteredSessions.map((session) => (
                <WorkoutCard
                  key={session.id}
                  session={session}
                  onPreview={() => setSelectedPreviewSession(session)}
                  onStart={() => handleStartWorkout(session)}
                  onLockClick={() => handleOpenLock(session)}
                  hasError={!!cardImgErrors[session.id]}
                  onError={() => handleCardImgError(session.id)}
                  isFavorite={favoriteIds.includes(session.id)}
                  onToggleFavorite={(e) => handleToggleFavorite(session.id, e)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Carrosséis Temáticos Horizontais (com Peek Effect e formato vertical 3:4) */
        <div className="space-y-7 sm:space-y-9 py-2 max-w-7xl mx-auto w-full">
          {/* Carrossel 0: MEUS FAVORITOS (se houver) */}
          {favoriteSessions.length > 0 && (
            <CarouselRow
              title="MEUS FAVORITOS"
              subtitle="Treinos que você salvou para praticar a qualquer momento"
              badge="Personalizado"
              sessions={favoriteSessions}
              scrollRef={carouselRefs.favoritos}
              onScrollLeft={() => scrollCarousel(carouselRefs.favoritos, 'left')}
              onScrollRight={() => scrollCarousel(carouselRefs.favoritos, 'right')}
              onPreviewSession={(s) => setSelectedPreviewSession(s)}
              onStartSession={(s) => handleStartWorkout(s)}
              onLockClick={(s) => handleOpenLock(s)}
              cardImgErrors={cardImgErrors}
              onCardImgError={handleCardImgError}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* Carrossel 1: TREINOS GRATUITOS (Acesso Imediato) */}
          <CarouselRow
            title="TREINOS GRATUITOS | ACESSO IMEDIATO"
            subtitle="Sessões completas liberadas para você experimentar agora mesmo"
            badge="100% Liberado"
            sessions={freeSessions}
            scrollRef={carouselRefs.gratuitos}
            onScrollLeft={() => scrollCarousel(carouselRefs.gratuitos, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.gratuitos, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 2: NÍVEL 1 | COMEÇAR BEM */}
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
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection('nivel-1')}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 3: NÍVEL 2 | EVOLUIR COM SEGURANÇA */}
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
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection('nivel-2')}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 4: NÍVEL 3 | LONGEVIDADE EM MOVIMENTO */}
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
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection('nivel-3')}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 5: EQUILÍBRIO & MOBILIDADE ATIVA */}
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
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 6: FORÇA FUNCIONAL 40+ */}
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
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 7: MEMBROS SUPERIORES */}
          <CarouselRow
            title="MEMBROS SUPERIORES | POSTURA & FORÇA"
            subtitle="Fortalecimento de costas, ombros, peitoral e braços para suporte postural"
            badge="Superiores"
            sessions={superioresSessions}
            scrollRef={carouselRefs.superiores}
            onScrollLeft={() => scrollCarousel(carouselRefs.superiores, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.superiores, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 7.1: PEITORAL, OMBRO E TRÍCEPS (NOVA DIVISÃO EMPURRAR) */}
          <CarouselRow
            title="PEITORAL, OMBRO E TRÍCEPS | FORÇA DE EMPURRAR"
            subtitle="Supinos, desenvolvimentos e estabilização de escápulas e braços firmes"
            badge="Divisão Empurrar"
            sessions={peitoralOmbroTricepsSessions}
            scrollRef={carouselRefs.peitoralOmbroTriceps}
            onScrollLeft={() => scrollCarousel(carouselRefs.peitoralOmbroTriceps, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.peitoralOmbroTriceps, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 7.2: COSTAS, BÍCEPS E TRAPÉZIO (NOVA DIVISÃO PUXAR) */}
          <CarouselRow
            title="COSTAS, BÍCEPS E TRAPÉZIO | FORÇA DE PUXAR"
            subtitle="Remadas, puxadas e sustentação dorsal para postura alinhada e alívio de tensões"
            badge="Divisão Puxar"
            sessions={costasBicepsSessions}
            scrollRef={carouselRefs.costasBiceps}
            onScrollLeft={() => scrollCarousel(carouselRefs.costasBiceps, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.costasBiceps, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 8: MEMBROS INFERIORES */}
          <CarouselRow
            title="MEMBROS INFERIORES | BASE & ESTABILIDADE"
            subtitle="Pernas fortes, glúteos ativos e joelhos protegidos para caminhar e subir escadas"
            badge="Inferiores"
            sessions={inferioresSessions}
            scrollRef={carouselRefs.inferiores}
            onScrollLeft={() => scrollCarousel(carouselRefs.inferiores, 'left')}
            onScrollRight={() => scrollCarousel(carouselRefs.inferiores, 'right')}
            onPreviewSession={(s) => setSelectedPreviewSession(s)}
            onStartSession={(s) => handleStartWorkout(s)}
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 9: FULL BODY INTEGRADO */}
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
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Carrossel 10: CONDICIONAMENTO CARDIORRESPIRATÓRIO */}
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
            onLockClick={(s) => handleOpenLock(s)}
            cardImgErrors={cardImgErrors}
            onCardImgError={handleCardImgError}
            onOpenLevel={() => onOpenCollection()}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE PRÉ-VISUALIZAÇÃO COMPLETA DA SESSÃO                           */}
      {/* ========================================================================= */}
      {selectedPreviewSession && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Header da Sessão */}
            <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-slate-950">
              <img
                src={selectedPreviewSession.coverImage}
                alt={selectedPreviewSession.title}
                className="w-full h-full object-cover object-[center_25%]"
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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    {selectedPreviewSession.duration}
                  </span>
                  <span className="text-xs text-emerald-300 font-bold">
                    {selectedPreviewSession.focus}
                  </span>
                  {selectedPreviewSession.accessLevel === 'premium' ? (
                    <span className="bg-amber-950/90 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Premium
                    </span>
                  ) : (
                    <span className="bg-emerald-950/90 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/40">
                      ★ Grátis
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
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

              {/* Lista dos Exercícios desta Sessão (16:9 vídeos preservados) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Exercícios Inclusos ({selectedPreviewSession.exercises.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Com vídeos demonstrativos</span>
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
                className={`w-full sm:flex-1 min-h-[46px] py-3 px-4 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  selectedPreviewSession.accessLevel === 'premium'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-950 font-black'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                }`}
              >
                {selectedPreviewSession.accessLevel === 'premium' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Desbloquear Treino (Premium)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Treinar Agora (Modo Aluno)</span>
                  </>
                )}
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

      {/* ========================================================================= */}
      {/* 7. MODAL DE CONVERSÃO / INFORMAÇÕES PREMIUM                                */}
      {/* ========================================================================= */}
      <PremiumModal
        isOpen={!!premiumModalWorkout}
        onClose={() => setPremiumModalWorkout(null)}
        targetWorkout={premiumModalWorkout}
      />
    </div>
  );
};

/* ========================================================================= */
/* Subcomponente: Linha de Carrossel Horizontal (com Peek Effect Mobile)     */
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
  onLockClick?: (session: CollectionWorkoutSession) => void;
  cardImgErrors: Record<string, boolean>;
  onCardImgError: (id: string) => void;
  onOpenLevel?: () => void;
  favoriteIds?: string[];
  onToggleFavorite?: (id: string, e?: React.MouseEvent) => void;
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
  onLockClick,
  cardImgErrors,
  onCardImgError,
  onOpenLevel,
  favoriteIds = [],
  onToggleFavorite
}) => {
  const hasDivider = title.includes(' | ');
  const [levelPrefix, levelName] = hasDivider ? title.split(' | ') : [null, title];

  return (
    <div className="space-y-3 px-3 sm:px-6 md:px-8 w-full max-w-full">
      {/* Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2.5 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          {hasDivider ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded sm:hidden">
                  {levelPrefix}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight uppercase leading-snug">
                  <span className="hidden sm:inline text-emerald-400">{levelPrefix} | </span>
                  {levelName}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                  {badge}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight uppercase leading-snug">
                {title}
              </h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                {badge}
              </span>
            </div>
          )}

          <p className="text-xs text-slate-300 sm:text-slate-400 leading-relaxed break-words">
            {subtitle}
          </p>
        </div>

        {/* Controles do carrossel */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 shrink-0 border-t border-slate-900/60 sm:border-0">
          {onOpenLevel && (
            <button
              onClick={onOpenLevel}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 min-h-[38px] px-2 py-1 rounded-lg hover:bg-slate-900 transition"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={onScrollLeft}
              className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition active:scale-95 shadow-sm"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onScrollRight}
              className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition active:scale-95 shadow-sm"
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track com Peek Effect (larguras calculadas para revelar borda do próximo card) */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory w-full"
      >
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className="w-[145px] xs:w-[165px] sm:w-[190px] md:w-[215px] shrink-0 snap-start"
          >
            <WorkoutCard
              session={session}
              onPreview={() => onPreviewSession(session)}
              onStart={() => onStartSession(session)}
              onLockClick={onLockClick ? () => onLockClick(session) : undefined}
              hasError={!!cardImgErrors[session.id]}
              onError={() => onCardImgError(session.id)}
              isFavorite={favoriteIds.includes(session.id)}
              onToggleFavorite={(e) => onToggleFavorite?.(session.id, e)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Subcomponente: Card Individual de Treino (PADRÃO 3:4 VERTICAL POSTER)    */
/* ========================================================================= */
interface WorkoutCardProps {
  session: CollectionWorkoutSession;
  onPreview: () => void;
  onStart: () => void;
  onLockClick?: () => void;
  hasError: boolean;
  onError: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  session,
  onPreview,
  onStart,
  onLockClick,
  hasError,
  onError,
  isFavorite = false,
  onToggleFavorite
}) => {
  const isPremium = session.accessLevel === 'premium';

  // Nível simplificado para badge
  const levelLabel = session.levelId === 'nivel-1' ? 'Nível 1' : session.levelId === 'nivel-2' ? 'Nível 2' : 'Nível 3';

  return (
    <div 
      onClick={onPreview}
      className="group relative aspect-[3/4] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/90 hover:border-emerald-500/60 shadow-lg hover:shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onPreview();
      }}
      aria-label={`Ver detalhes do treino ${session.title}`}
    >
      {/* 3:4 Vertical Cover Image */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {!hasError ? (
          <img
            src={session.coverImage}
            alt={session.photoAlt || session.title}
            className="w-full h-full object-cover object-[center_20%] sm:object-[center_25%] transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={onError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 flex flex-col items-center justify-center p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-1.5 shadow-sm">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-emerald-300 font-semibold line-clamp-1">{session.focus}</span>
          </div>
        )}

        {/* Gradiente escuro otimizado para legibilidade mobile (cobrindo 60% da base) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        
        {/* Sombra sutil no topo para os badges */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      </div>

      {/* Top Badges: Nível, Duração, Grátis/Premium e Favorito */}
      <div className="relative z-10 p-2 sm:p-2.5 flex items-start justify-between gap-1 pointer-events-none">
        {/* Nível & Duração */}
        <div className="flex flex-col gap-1 items-start">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-sm">
            {levelLabel}
          </span>
          <span className="text-[8px] xs:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 flex items-center gap-1 shadow-sm">
            <Clock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[70px]">{session.duration}</span>
          </span>
        </div>

        {/* Acesso (Grátis / Premium) e Botão Favoritar */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {isPremium ? (
            <span 
              onClick={(e) => { e.stopPropagation(); onLockClick?.(); }}
              className="text-[8px] xs:text-[9px] font-black uppercase px-1.5 xs:px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/50 backdrop-blur-md flex items-center gap-0.5 shadow-sm hover:scale-105 transition cursor-pointer"
              title="Conteúdo Exclusivo Premium"
            >
              <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span>Premium</span>
            </span>
          ) : (
            <span className="text-[8px] xs:text-[9px] font-black uppercase px-1.5 xs:px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 backdrop-blur-md flex items-center gap-0.5 shadow-sm">
              <span>★ Grátis</span>
            </span>
          )}

          {/* Favoritar */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="w-6 h-6 xs:w-7 xs:h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 flex items-center justify-center text-slate-300 hover:text-rose-400 transition active:scale-90"
              title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
              aria-label="Favoritar treino"
            >
              <Heart className={`w-3 h-3 xs:w-3.5 xs:h-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Center Hover / Play Indicator */}
      <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
        <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-300">
          {isPremium ? (
            <Lock className="w-4 h-4 xs:w-5 xs:h-5 text-slate-950" />
          ) : (
            <Play className="w-4 h-4 xs:w-5 xs:h-5 fill-current ml-0.5" />
          )}
        </div>
      </div>

      {/* Bottom Info Section (Over dark gradient) */}
      <div className="relative z-10 p-2.5 sm:p-3 flex flex-col justify-end space-y-1.5 pointer-events-auto">
        <div className="space-y-0.5">
          <span className="text-[9px] xs:text-[10px] font-bold text-emerald-400 uppercase tracking-wider block truncate">
            {session.focus}
          </span>
          <h4 className="text-xs xs:text-sm font-black text-white leading-tight line-clamp-2 drop-shadow group-hover:text-emerald-300 transition-colors">
            {session.title}
          </h4>
        </div>

        {/* Movements & Touch CTA button */}
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
          <span className="text-[9px] text-slate-400 font-medium truncate">
            {session.exercises.length} mov.
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isPremium) {
                onLockClick ? onLockClick() : onStart();
              } else {
                onStart();
              }
            }}
            className={`min-h-[32px] px-2 xs:px-2.5 py-1 rounded-lg text-[10px] xs:text-[11px] font-bold flex items-center gap-1 transition active:scale-95 shadow-md ${
              isPremium
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
            }`}
            title={isPremium ? "Ver detalhes do plano Premium" : "Iniciar Treino Agora"}
          >
            {isPremium ? (
              <>
                <Lock className="w-2.5 h-2.5 text-amber-300" />
                <span>Ver</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Treinar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
