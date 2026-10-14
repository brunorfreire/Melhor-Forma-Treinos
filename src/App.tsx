import React, { useState, useEffect } from 'react';
import { WorkoutPlan, ViewMode, Exercise } from './types';
import { SAMPLE_WORKOUT_PLAN } from './data/defaultPlans';
import { decodeWorkoutPlan } from './utils/codec';
import { StreamingHomeView } from './components/StreamingHomeView';
import { Collection40PlusView } from './components/Collection40PlusView';
import { StudentWorkoutView } from './components/StudentWorkoutView';
import { TrainerEditor } from './components/TrainerEditor';
import { ShareModal } from './components/ShareModal';
import { HostingerGuideModal } from './components/HostingerGuideModal';
import { MuscleWikiModal } from './components/MuscleWikiModal';
import { RestTimer } from './components/RestTimer';
import { StudentHistoryModal } from './components/StudentHistoryModal';
import { saveStudentWorkout } from './utils/studentStorage';
import { 
  Play, 
  Sparkles, 
  Dumbbell, 
  Users, 
  Layers, 
  Film, 
  CheckCircle2, 
  ChevronRight,
  Share2
} from 'lucide-react';

const STORAGE_KEY = 'mf_treino_v1_lite_plan';

export default function App() {
  const [plan, setPlan] = useState<WorkoutPlan>(SAMPLE_WORKOUT_PLAN);
  // Default view starts on the new Streaming Home (Melhor Forma Play 40+)
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [collectionLevelTarget, setCollectionLevelTarget] = useState<string>('nivel-1');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHostingerModalOpen, setIsHostingerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // Check URL on load for #plan=... or #colecao
  useEffect(() => {
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
          // If loaded from a shared student URL link, start in Student Mode!
          setViewMode('student');
          return;
        }
      }

      if (hash.includes('colecao') || search.includes('colecao')) {
        setViewMode('collection');
        return;
      }

      // If no URL plan, load from local storage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.sessions)) {
            setPlan(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not load saved plan:', err);
      }
    };

    parseUrl();

    window.addEventListener('hashchange', parseUrl);
    return () => window.removeEventListener('hashchange', parseUrl);
  }, []);

  // Save to localStorage when modified in editor
  const handleUpdatePlan = (updated: WorkoutPlan) => {
    setPlan(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Auto-sync into student history if student has a name
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start">
      {/* ========================================================================= */}
      {/* GLOBAL STREAMING NAVIGATION BAR (Melhor Forma Play) */}
      {/* ========================================================================= */}
      {/* CABEÇALHO RESPONSIVO (Compacto e em 2 linhas no mobile, 1 linha no desktop) */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 px-3 sm:px-6 py-2 transition shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Top Row on Mobile: Brand Logo & 40+ Tagline */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div 
              onClick={() => setViewMode('home')}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setViewMode('home'); }}
              aria-label="Ir para a página inicial"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/50 group-hover:scale-105 transition shrink-0">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-emerald-300 transition leading-none">
                    Melhor Forma Play
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0 leading-none">
                    40+
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400/90 font-medium tracking-tight mt-0.5 hidden xs:block">
                  Treine para viver mais e melhor
                </span>
              </div>
            </div>

            {/* Micro Tagline on ultra-small mobile screens */}
            <span className="text-[10px] text-emerald-400 font-bold xs:hidden bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              Longevidade
            </span>
          </div>

          {/* Navigation Tabs: Grid 4 columns on mobile, Flex row on sm+ (Touch targets >= 44x44px) */}
          <div className="grid grid-cols-4 sm:flex sm:items-center gap-1 sm:gap-1.5 text-xs font-bold w-full sm:w-auto pt-1 sm:pt-0 border-t border-slate-900 sm:border-0">
            <button
              onClick={() => setViewMode('home')}
              className={`min-h-[44px] px-2 sm:px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                viewMode === 'home'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Catálogo Play</span>
              <span className="sm:hidden text-[11px]">Início</span>
            </button>

            <button
              onClick={() => handleOpenCollectionWithLevel()}
              className={`min-h-[44px] px-2 sm:px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                viewMode === 'collection'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Coleção 40+</span>
              <span className="sm:hidden text-[11px]">40+</span>
            </button>

            <button
              onClick={() => setViewMode('student')}
              className={`min-h-[44px] px-2 sm:px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                viewMode === 'student'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Meu Treino</span>
              <span className="sm:hidden text-[11px]">Treino</span>
            </button>

            <button
              onClick={() => setViewMode('editor')}
              className={`min-h-[44px] px-2 sm:px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                viewMode === 'editor'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Treinador</span>
              <span className="sm:hidden text-[11px]">Editor</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* ACTIVE VIEW ROUTING */}
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
          />
          {/* Integrated Floating Rest Timer for Student */}
          <RestTimer />
        </>
      )}

      {viewMode === 'editor' && (
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
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
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
    </main>
  );
}
