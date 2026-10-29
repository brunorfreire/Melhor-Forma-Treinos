import React, { useState, useEffect, useRef } from 'react';
import { WorkoutPlan, ViewMode, Exercise } from './types';
import { SAMPLE_WORKOUT_PLAN } from './data/defaultPlans';
import { decodeWorkoutPlan } from './utils/codec';
import { StreamingHomeView } from './components/StreamingHomeView';
import { Collection40PlusView } from './components/Collection40PlusView';
import { StudentWorkoutView } from './components/StudentWorkoutView';
const TrainerEditor = React.lazy(() => import('./components/TrainerEditor').then(m => ({ default: m.TrainerEditor })));
import { ShareModal } from './components/ShareModal';
import { HostingerGuideModal } from './components/HostingerGuideModal';
import { MuscleWikiModal } from './components/MuscleWikiModal';
import { RestTimer } from './components/RestTimer';
import { StudentHistoryModal } from './components/StudentHistoryModal';
import { saveStudentWorkout } from './utils/studentStorage';
import { PWAInstallButton } from './components/PWAInstallButton';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { HorizontalScroller } from './components/ui/HorizontalScroller';
import { MelhorFormaLogo } from './components/MelhorFormaLogo';
import { MyWorkoutTodayModal } from './components/MyWorkoutTodayModal';
import { StudentEvolutionView } from './components/StudentEvolutionView';
import { getAllCatalogWorkouts } from './data/workoutCatalogService';
import { GlobalAuthGate } from './components/auth/GlobalAuthGate';
import { LandingPage } from './components/landing/LandingPage';
import { validateCurrentSession, logoutUser, AuthSession } from './utils/supabaseClient';
import { 
  Play, 
  Sparkles, 
  Dumbbell, 
  Users, 
  Layers, 
  Film, 
  CheckCircle2, 
  ChevronRight, 
  Share2, 
  Target, 
  Trophy,
  LogOut,
  User,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

const STORAGE_KEY = 'mf_treino_v1_lite_plan';

function getInitialRoute(): string {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path === '/entrar' || hash === '#/entrar' || hash === '#entrar') return '/entrar';
  if (path === '/cadastro' || hash === '#/cadastro' || hash === '#cadastro') return '/cadastro';
  if (path === '/recuperar' || hash === '#/recuperar' || hash === '#recuperar') return '/recuperar';
  if (path === '/app' || hash === '#/app' || hash === '#app') return '/app';
  return '/';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authInitialError, setAuthInitialError] = useState<string>('');

  const [plan, setPlan] = useState<WorkoutPlan>(SAMPLE_WORKOUT_PLAN);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [collectionLevelTarget, setCollectionLevelTarget] = useState<string>('nivel-1');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHostingerModalOpen, setIsHostingerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTodayModalOpen, setIsTodayModalOpen] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [isGuidedExecutionMode, setIsGuidedExecutionMode] = useState(false);

  // Referência para o item de navegação ativo com scrollIntoView automático seguro
  const activeNavRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeNavRef.current) {
      activeNavRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [viewMode]);

  // Navegação SPA segura
  const navigate = (route: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', route);
      }
    } catch {}
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Monitora histórico de navegação (botão Voltar/Avançar do navegador)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // 1. Verificação e Restauração Segura de Sessão no Supabase Auth + Retorno Google OAuth
  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      setIsCheckingAuth(true);
      try {
        const result = await validateCurrentSession();
        if (isMounted) {
          if (result.valid && result.session) {
            setSession(result.session);
            setAuthInitialError('');
            const initialRoute = getInitialRoute();
            if (result.isOAuthCallback || initialRoute === '/entrar' || initialRoute === '/cadastro') {
              try {
                window.history.replaceState(null, '', '/app');
              } catch {}
              setCurrentRoute('/app');
            }
          } else {
            setSession(null);
            if (result.oauthError) {
              setAuthInitialError(result.oauthError);
              const targetRoute = result.oauthOriginView === 'register' ? '/cadastro' : '/entrar';
              try {
                window.history.replaceState(null, '', targetRoute);
              } catch {}
              setCurrentRoute(targetRoute);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    verify();
    return () => { isMounted = false; };
  }, []);

  // 2. Proteção de Rota /app (Se não autenticado, redireciona para /entrar)
  useEffect(() => {
    if (!isCheckingAuth) {
      if (currentRoute === '/app' && !session) {
        navigate('/entrar');
      }
    }
  }, [currentRoute, session, isCheckingAuth]);

  // 3. Leitura de URL de Treino (Apenas quando autenticado na rota /app)
  useEffect(() => {
    if (!session || currentRoute !== '/app') return;

    const parseUrl = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      let encodedData = '';

      if (hash.includes('plan=')) {
        encodedData = hash.split('plan=')[1];
      } else if (search.includes('plan=')) {
        const params = new URLSearchParams(search);
        encodedData = params.get('plan') || '';
      }

      if (encodedData) {
        const decoded = decodeWorkoutPlan(encodedData);
        if (decoded) {
          setPlan(decoded);
          setViewMode('student');
          return;
        }
      }

      if (hash.includes('colecao') || search.includes('colecao')) {
        setViewMode('collection');
        return;
      }

      // Se não houver plano na URL, carrega plano salvo localmente
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.sessions)) {
            let needsSave = false;
            if (
              parsed.trainerName === 'Prof. Anderson - Equipe Melhor Forma' ||
              parsed.trainerName === 'Prof. Anderson - Melhor Forma Play' ||
              parsed.trainerName === 'Melhor Forma Team (Demo Guiada)'
            ) {
              parsed.trainerName = 'Bruno Freire';
              needsSave = true;
            }
            parsed.sessions = parsed.sessions.map((s: any) => {
              if (
                s &&
                (s.id === 'sess-w-sup-05' ||
                  (typeof s.name === 'string' && /puxada\s*&\s*empurrada/i.test(s.name)))
              ) {
                needsSave = true;
                return { ...s, name: 'Puxar e Empurrar' };
              }
              return s;
            });
            if (typeof parsed.goal === 'string' && /puxada\s*&\s*empurrada/i.test(parsed.goal)) {
              parsed.goal = parsed.goal.replace(
                /Puxada\s*&\s*Empurrada(\s+em\s+Equil[ií]brio)?/gi,
                'Puxar e Empurrar'
              );
              needsSave = true;
            }
            if (needsSave) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
            setPlan(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not load saved plan:', err);
      }
    };

    parseUrl();
  }, [session, currentRoute]);

  const handleLogout = async () => {
    await logoutUser();
    setSession(null);
    setViewMode('home');
    navigate('/');
  };

  // Salva no localStorage quando modificado no editor
  const handleUpdatePlan = (updated: WorkoutPlan) => {
    setPlan(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (updated.studentName && updated.studentName.trim().length > 1) {
        saveStudentWorkout(updated);
      }
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  };

  const handleSelectPlanFromHistory = (selectedPlan: WorkoutPlan) => {
    setPlan(selectedPlan);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlan));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  };

  const handleSelectSessionToTrain = (selectedPlan: WorkoutPlan) => {
    setPlan(selectedPlan);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlan));
    } catch (err) {
      console.warn('Could not save session to localStorage:', err);
    }
    setViewMode('student');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomizeInEditor = (selectedPlan: WorkoutPlan) => {
    setPlan(selectedPlan);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlan));
    } catch (err) {
      console.warn('Could not save session to localStorage:', err);
    }
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCollectionWithLevel = (levelId?: string) => {
    if (levelId) {
      setCollectionLevelTarget(levelId);
    }
    setViewMode('collection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // TELA DE CARREGAMENTO / VALIDAÇÃO DE SESSÃO
  // =========================================================================
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <MelhorFormaLogo size={52} className="animate-pulse" />
        <p className="mt-5 text-xs font-bold text-slate-300 tracking-wide">
          Carregando Melhor Forma Play 40+...
        </p>
      </div>
    );
  }

  // =========================================================================
  // ROTA 1: LANDING PAGE PÚBLICA COMERCIAL (/)
  // =========================================================================
  if (currentRoute === '/') {
    return (
      <LandingPage
        onNavigate={navigate}
        isAuthenticated={Boolean(session)}
      />
    );
  }

  // =========================================================================
  // ROTAS 2, 3 e 4: AUTENTICAÇÃO REAL (/entrar, /cadastro, /recuperar)
  // =========================================================================
  if (currentRoute === '/entrar' || currentRoute === '/cadastro' || currentRoute === '/recuperar') {
    const initialView = 
      currentRoute === '/cadastro' ? 'register' :
      currentRoute === '/recuperar' ? 'recover' : 'login';

    return (
      <GlobalAuthGate
        initialView={initialView}
        initialError={authInitialError}
        onAuthenticated={(newSession) => {
          setAuthInitialError('');
          setSession(newSession);
          navigate('/app');
        }}
        onNavigate={navigate}
        onBackToLanding={() => {
          setAuthInitialError('');
          navigate('/');
        }}
      />
    );
  }

  // =========================================================================
  // ROTA 5: APLICATIVO PROTEGIDO (/app)
  // SE NÃO AUTENTICADO, BLOQUEIA COMPLETAMENTE E DIRECIONA AO LOGIN
  // =========================================================================
  if (!session) {
    return (
      <GlobalAuthGate
        initialView="login"
        initialError={authInitialError}
        onAuthenticated={(newSession) => {
          setAuthInitialError('');
          setSession(newSession);
          navigate('/app');
        }}
        onNavigate={navigate}
        onBackToLanding={() => {
          setAuthInitialError('');
          navigate('/');
        }}
      />
    );
  }

  const user = session.user;
  const isPrivileged = user.role === 'trainer' || user.role === 'admin';
  const isPremium = user.subscription_status === 'active' || isPrivileged;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start">
      {/* ========================================================================= */}
      {/* GLOBAL STREAMING NAVIGATION BAR (Melhor Forma Play) */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Navegação principal"
        className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 px-3 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top,0.5rem))] pb-2 transition shadow-lg shadow-black/40 w-full min-w-0 max-w-full"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 w-full">
          {/* Top Row on Mobile: Brand Logo & User Status (Clean, no cramped install button) */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0">
            <div 
              onClick={() => { setViewMode('home'); navigate('/app'); }}
              className="flex items-center gap-2 cursor-pointer group shrink-0 min-w-0"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') { setViewMode('home'); navigate('/app'); } }}
              aria-label="Ir para a página inicial do Melhor Forma Play"
            >
              <MelhorFormaLogo size={34} className="sm:w-9 sm:h-9 shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-emerald-300 transition leading-none truncate">
                    Melhor Forma Play
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0 leading-none">
                    40+
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400/90 font-medium tracking-tight mt-0.5 hidden sm:block">
                  Treine para viver mais e melhor
                </span>
              </div>
            </div>

            {/* User Pill & Action on Right of Brand */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Badge de Identificação do Aluno/Admin */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 sm:px-2.5 py-1 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-white text-[11px] truncate max-w-[55px] min-[360px]:max-w-[75px] min-[390px]:max-w-[95px] sm:max-w-[120px]">
                  {user.nome.split(' ')[0]}
                </span>
                {user.role === 'admin' ? (
                  <span className="text-[9px] font-mono font-bold bg-purple-500/25 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/35">
                    Admin
                  </span>
                ) : user.role === 'trainer' ? (
                  <span className="text-[9px] font-mono font-bold bg-teal-500/25 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/35">
                    Treinador
                  </span>
                ) : isPremium ? (
                  <span className="text-[9px] font-mono font-bold bg-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/35">
                    Premium
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/35">
                    <span className="hidden sm:inline">Aluno </span>Free
                  </span>
                )}
              </div>

              {/* Botão Sair (Logout) com touch target 44px no mobile */}
              <button
                onClick={handleLogout}
                className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-rose-500/30 transition flex items-center justify-center cursor-pointer active:scale-95"
                title="Sair da conta"
                aria-label="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Botão de instalação somente visível em telas maiores no header (no mobile fica no banner dedicado) */}
              <div className="hidden md:flex items-center shrink-0">
                <PWAInstallButton variant="header" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs: Accessible Horizontal Scroller with smooth pan and touch */}
          <div className="w-full sm:w-auto min-w-0 max-w-full pt-1 sm:pt-0 border-t border-slate-900 sm:border-0">
            <HorizontalScroller
              ariaLabel="Navegação de seções"
              innerClassName="gap-1 sm:gap-1.5 text-xs font-bold py-0.5 md:flex-wrap"
            >
              <button
                ref={viewMode === 'home' ? activeNavRef : undefined}
                type="button"
                onClick={() => setViewMode('home')}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 transition whitespace-nowrap active:scale-95 ${
                  viewMode === 'home'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Catálogo Play</span>
                <span className="sm:hidden text-xs">Início</span>
              </button>

              <button
                ref={viewMode === 'collection' ? activeNavRef : undefined}
                type="button"
                onClick={() => handleOpenCollectionWithLevel()}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 transition whitespace-nowrap active:scale-95 ${
                  viewMode === 'collection'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Coleção 40+</span>
                <span className="sm:hidden text-xs">Coleção</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTodayModalOpen(true)}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 transition whitespace-nowrap active:scale-95 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/35 shadow-sm"
                title="Descobrir o treino ideal para os objetivos de hoje"
              >
                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Treino de Hoje</span>
                <span className="sm:hidden text-xs">Hoje</span>
              </button>

              <button
                ref={viewMode === 'student' ? activeNavRef : undefined}
                type="button"
                onClick={() => setViewMode('student')}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 transition whitespace-nowrap active:scale-95 ${
                  viewMode === 'student'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Meu Treino</span>
                <span className="sm:hidden text-xs">Treino</span>
              </button>

              <button
                ref={viewMode === 'evolution' ? activeNavRef : undefined}
                type="button"
                onClick={() => setViewMode('evolution')}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 transition whitespace-nowrap active:scale-95 ${
                  viewMode === 'evolution'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
                title="Acompanhar minha evolução e histórico de treinos concluídos"
              >
                <Trophy className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="hidden sm:inline">Minha Evolução</span>
                <span className="sm:hidden text-xs">Evolução</span>
              </button>

              {/* Editor visível exclusivamente para Treinador e Administrador */}
              {isPrivileged && (
                <button
                  ref={viewMode === 'editor' ? activeNavRef : undefined}
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 transition whitespace-nowrap active:scale-95 ${
                    viewMode === 'editor'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Treinador</span>
                  <span className="sm:hidden text-xs">Editor</span>
                </button>
              )}

              {/* Espaçador final de respiro garantido no mobile para visualização completa do último item */}
              <div className="w-4 shrink-0 sm:hidden" aria-hidden="true" />
            </HorizontalScroller>
          </div>
        </div>
      </nav>

      {/* Faixa Exclusiva de Instalação Mobile (PWAInstallBanner) */}
      <PWAInstallBanner />

      {/* ========================================================================= */}
      {/* ACTIVE VIEW ROUTING DENTRO DO APP PROTEGIDO */}
      {/* ========================================================================= */}
      {viewMode === 'home' && (
        <StreamingHomeView
          onSelectSessionToTrain={handleSelectSessionToTrain}
          onOpenCollection={handleOpenCollectionWithLevel}
          onOpenTrainerEditor={() => setViewMode('editor')}
          onPreviewExercise={(ex) => setPreviewExercise(ex)}
          onOpenShareModal={(planToShare) => {
            setPlan(planToShare);
            setIsShareModalOpen(true);
          }}
          onOpenEvolution={() => setViewMode('evolution')}
        />
      )}

      {viewMode === 'collection' && (
        <Collection40PlusView
          initialLevelId={collectionLevelTarget}
          onBackToHome={() => setViewMode('home')}
          onSelectSessionToTrain={handleSelectSessionToTrain}
          onCustomizeInEditor={handleCustomizeInEditor}
          onPreviewExercise={(ex) => setPreviewExercise(ex)}
          onOpenShareModal={(planToShare) => {
            setPlan(planToShare);
            setIsShareModalOpen(true);
          }}
        />
      )}

      {viewMode === 'student' && (
        <>
          <StudentWorkoutView
            plan={plan}
            onEditPlan={() => setViewMode('editor')}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onPreviewExercise={(ex) => setPreviewExercise(ex)}
            onBackToCatalog={() => setViewMode('home')}
            onOpenTodayRecommender={() => setIsTodayModalOpen(true)}
            onOpenEvolution={() => setViewMode('evolution')}
            onGuidedModeChange={setIsGuidedExecutionMode}
          />
          <RestTimer hidden={isGuidedExecutionMode} />
        </>
      )}

      {viewMode === 'evolution' && (
        <StudentEvolutionView
          onBackToCatalog={() => setViewMode('home')}
          onSelectSessionToTrain={handleSelectSessionToTrain}
          onOpenTodayRecommender={() => setIsTodayModalOpen(true)}
        />
      )}

      {viewMode === 'editor' && (
        isPrivileged ? (
          <React.Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Carregando painel do treinador...</div>}>
            <TrainerEditor
              plan={plan}
              onChangePlan={handleUpdatePlan}
              onViewAsStudent={() => setViewMode('student')}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenHostingerGuide={() => setIsHostingerModalOpen(true)}
              onPreviewExercise={(ex) => setPreviewExercise(ex)}
              onOpenStudentHistory={() => setIsHistoryModalOpen(true)}
              onBackToCatalog={() => setViewMode('home')}
            />
          </React.Suspense>
        ) : (
          <div className="w-full max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white">Acesso Restrito à Equipe Técnica</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sua conta está cadastrada como <strong className="text-emerald-400">Aluno ({user.nome})</strong>. A Central do Treinador e o Editor Técnico são reservados para perfis com permissão <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">trainer</code> ou <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">admin</code> verificados na tabela <code className="text-slate-300">public.profiles</code>.
            </p>
            <button
              onClick={() => setViewMode('home')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Catálogo de Treinos</span>
            </button>
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODALS GLOBAIS */}
      {/* ========================================================================= */}
      {isShareModalOpen && (
        <ShareModal
          plan={plan}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {isHostingerModalOpen && (
        <HostingerGuideModal
          plan={plan}
          onClose={() => setIsHostingerModalOpen(false)}
        />
      )}

      {isHistoryModalOpen && (
        <StudentHistoryModal
          currentPlan={plan}
          onSelectPlan={handleSelectPlanFromHistory}
          onClose={() => setIsHistoryModalOpen(false)}
          onOpenShareModal={(planToShare) => {
            setPlan(planToShare);
            setIsHistoryModalOpen(false);
            setIsShareModalOpen(true);
          }}
        />
      )}

      {previewExercise && (
        <MuscleWikiModal
          exercise={previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}

      {isTodayModalOpen && (
        <MyWorkoutTodayModal
          isOpen={isTodayModalOpen}
          onClose={() => setIsTodayModalOpen(false)}
          workouts={getAllCatalogWorkouts()}
          onStartSession={handleSelectSessionToTrain}
        />
      )}
    </main>
  );
}
