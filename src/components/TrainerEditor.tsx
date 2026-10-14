import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Dumbbell, 
  Save, 
  Share2, 
  Eye, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  ExternalLink,
  BookOpen,
  Check,
  Server,
  RotateCcw,
  Youtube,
  Search,
  X,
  PlusCircle,
  AlertCircle,
  Filter,
  Users,
  Play,
  Video,
  VideoOff,
  Image as ImageIcon,
  ShieldAlert,
  LogOut,
  Film,
  ShieldCheck
} from 'lucide-react';
import { WorkoutPlan, WorkoutSession, Exercise } from '../types';
import { MUSCLEWIKI_CATALOG, MUSCLE_GROUPS, CatalogExercise } from '../data/muscleWikiExercises';
import { PRESET_TEMPLATES } from '../data/defaultPlans';
import { resolveExerciseYouTubeId } from '../utils/youtube';
import { getSavedStudents, saveStudentWorkout } from '../utils/studentStorage';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { MelhorFormaLogo } from './MelhorFormaLogo';
import { resolveExerciseMedia } from '../utils/exerciseMedia';
import { TrainerAuthGate, isTrainerAuthenticated, logoutTrainer } from './trainer/TrainerAuthGate';
import { TrainerCatalogTab } from './trainer/TrainerCatalogTab';
import { TrainerExercisesTab } from './trainer/TrainerExercisesTab';
import { TrainerVideoValidatorTab } from './trainer/TrainerVideoValidatorTab';
import { TrainerMuscleWikiTab } from './trainer/TrainerMuscleWikiTab';

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

interface TrainerEditorProps {
  plan: WorkoutPlan;
  onChangePlan: (updated: WorkoutPlan) => void;
  onViewAsStudent: () => void;
  onOpenShareModal: () => void;
  onOpenHostingerGuide: () => void;
  onPreviewExercise: (ex: Exercise) => void;
  onOpenStudentHistory: () => void;
  onBackToCatalog?: () => void;
}

export const TrainerEditor: React.FC<TrainerEditorProps> = ({
  plan,
  onChangePlan,
  onViewAsStudent,
  onOpenShareModal,
  onOpenHostingerGuide,
  onPreviewExercise,
  onOpenStudentHistory,
  onBackToCatalog
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isTrainerAuthenticated());
  const [activeAdminTab, setActiveAdminTab] = useState<'catalog' | 'exercises' | 'video_validator' | 'musclewiki' | 'student_sheet'>('catalog');
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(() => getSavedStudents().length);
  const [justSavedNotice, setJustSavedNotice] = useState(false);

  useEffect(() => {
    setSavedCount(getSavedStudents().length);
  }, [plan]);

  const handleManualSaveStudent = () => {
    if (!plan.studentName.trim()) {
      alert('Digite o nome do aluno antes de salvar no histórico.');
      return;
    }
    const updatedList = saveStudentWorkout(plan);
    setSavedCount(updatedList.length);
    setJustSavedNotice(true);
    setTimeout(() => setJustSavedNotice(false), 2500);
  };

  const handleGenerateWhatsApp = () => {
    if (plan.studentName && plan.studentName.trim()) {
      saveStudentWorkout(plan);
      setSavedCount(getSavedStudents().length);
    }
    onOpenShareModal();
  };
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('Peito');
  const [searchCatalogTerm, setSearchCatalogTerm] = useState('');
  const [showCustomAddForm, setShowCustomAddForm] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [justAddedName, setJustAddedName] = useState<string | null>(null);
  const [sessionExerciseFilter, setSessionExerciseFilter] = useState('');
  const [expandedMediaEditorId, setExpandedMediaEditorId] = useState<string | null>(null);

  // Custom exercise temporary form
  const [customExercise, setCustomExercise] = useState<Partial<Exercise>>({
    name: '',
    muscleGroup: 'Peito',
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    weight: '',
    notes: '',
    youtubeId: '',
    thumbnailUrl: '',
    instructions: '',
    cautions: '',
    hasNoVideo: false
  });

  const activeSession = plan.sessions[activeSessionIndex] || plan.sessions[0];

  // Helper to open manual form pre-filled with a search term that wasn't found in the library
  const handleOpenManualWithTerm = (term: string, preferredGroup?: string) => {
    let group = preferredGroup && preferredGroup !== 'Todos' ? preferredGroup : 'Peito';
    const norm = normalizeText(term);
    if (norm.includes('costas') || norm.includes('puxada') || norm.includes('remada') || norm.includes('pulley') || norm.includes('serrote')) group = 'Costas';
    else if (norm.includes('ombro') || norm.includes('desenvolvimento') || norm.includes('elevacao') || norm.includes('deltoide')) group = 'Ombros';
    else if (norm.includes('biceps') || norm.includes('rosca') || norm.includes('scott') || norm.includes('martelo')) group = 'Bíceps';
    else if (norm.includes('triceps') || norm.includes('testa') || norm.includes('frances') || norm.includes('corda')) group = 'Tríceps';
    else if (norm.includes('agachamento') || norm.includes('leg press') || norm.includes('extensora') || norm.includes('quadriceps') || norm.includes('afundo') || norm.includes('bulgaro')) group = 'Quadríceps';
    else if (norm.includes('stiff') || norm.includes('flexora') || norm.includes('gluteo') || norm.includes('pelvica') || norm.includes('posterior')) group = 'Posterior & Glúteos';
    else if (norm.includes('panturrilha') || norm.includes('gemeos')) group = 'Panturrilhas';
    else if (norm.includes('abdominal') || norm.includes('prancha') || norm.includes('core') || norm.includes('crunch')) group = 'Abdômen & Core';
    else if (norm.includes('esteira') || norm.includes('bicicleta') || norm.includes('cardio') || norm.includes('aerobico') || norm.includes('eliptico') || norm.includes('corda')) group = 'Cardio & Aquecimento';

    setCustomExercise({
      name: term.trim(),
      muscleGroup: group,
      sets: '3',
      reps: '10 a 12',
      rest: '60s',
      weight: '',
      notes: '',
      youtubeId: ''
    });
    setShowCatalogModal(false);
    setShowCustomAddForm(true);
  };

  // Helper updates
  const updateField = <K extends keyof WorkoutPlan>(field: K, value: WorkoutPlan[K]) => {
    onChangePlan({
      ...plan,
      [field]: value,
      updatedAt: new Date().toISOString()
    });
  };

  const updateActiveSession = (updatedSession: WorkoutSession) => {
    const newSessions = [...plan.sessions];
    newSessions[activeSessionIndex] = updatedSession;
    onChangePlan({
      ...plan,
      sessions: newSessions,
      updatedAt: new Date().toISOString()
    });
  };

  const addSession = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLetter = letters[plan.sessions.length] || `${plan.sessions.length + 1}`;
    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}`,
      name: `Treino ${nextLetter} - Novo Treino`,
      focus: 'Definir grupo muscular',
      exercises: []
    };
    const newSessions = [...plan.sessions, newSession];
    onChangePlan({
      ...plan,
      sessions: newSessions,
      updatedAt: new Date().toISOString()
    });
    setActiveSessionIndex(newSessions.length - 1);
  };

  const removeSession = (index: number) => {
    if (plan.sessions.length <= 1) {
      alert('A ficha precisa ter pelo menos um treino.');
      return;
    }
    const newSessions = plan.sessions.filter((_, i) => i !== index);
    onChangePlan({
      ...plan,
      sessions: newSessions,
      updatedAt: new Date().toISOString()
    });
    setActiveSessionIndex(Math.max(0, index - 1));
  };

  // Add catalog exercise to current session
  const handleAddCatalogExercise = (item: CatalogExercise, keepOpen = false) => {
    if (!activeSession) return;
    const resolvedVideo = item.youtubeId || resolveExerciseYouTubeId(item.name, undefined, item.muscleGroup);
    const newExercise: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      muscleGroup: item.muscleGroup,
      sets: item.defaultSets,
      reps: item.defaultReps,
      rest: item.defaultRest,
      weight: '',
      notes: item.tip || '',
      instructions: item.instructions || item.tip || '',
      cautions: item.cautions || '',
      youtubeId: resolvedVideo,
      thumbnailUrl: item.thumbnailUrl || ''
    };

    updateActiveSession({
      ...activeSession,
      exercises: [...activeSession.exercises, newExercise]
    });

    setJustAddedName(item.name);
    setTimeout(() => {
      setJustAddedName(prev => prev === item.name ? null : prev);
    }, 2200);

    if (!keepOpen) {
      setShowCatalogModal(false);
    }
  };

  // Add custom typed exercise
  const handleSaveCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExercise.name?.trim()) return;

    const resolvedVideo = resolveExerciseYouTubeId(
      customExercise.name.trim(),
      customExercise.youtubeId || customExercise.youtubeUrl,
      customExercise.muscleGroup
    );

    const newEx: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customExercise.name.trim(),
      muscleGroup: customExercise.muscleGroup || 'Geral',
      sets: customExercise.sets || '3',
      reps: customExercise.reps || '12',
      rest: customExercise.rest || '60s',
      weight: customExercise.weight || '',
      notes: customExercise.notes || '',
      instructions: customExercise.instructions || '',
      cautions: customExercise.cautions || '',
      youtubeId: customExercise.hasNoVideo ? undefined : resolvedVideo,
      thumbnailUrl: customExercise.thumbnailUrl || '',
      hasNoVideo: customExercise.hasNoVideo
    };

    updateActiveSession({
      ...activeSession,
      exercises: [...activeSession.exercises, newEx]
    });

    setJustAddedName(customExercise.name.trim());
    setTimeout(() => {
      setJustAddedName(prev => prev === customExercise.name?.trim() ? null : prev);
    }, 2200);

    setCustomExercise({
      name: '',
      muscleGroup: 'Peito',
      sets: '3',
      reps: '10 a 12',
      rest: '60s',
      weight: '',
      notes: '',
      youtubeId: '',
      thumbnailUrl: '',
      instructions: '',
      cautions: '',
      hasNoVideo: false
    });
    setShowCustomAddForm(false);
  };

  const removeExercise = (exId: string) => {
    if (!activeSession) return;
    updateActiveSession({
      ...activeSession,
      exercises: activeSession.exercises.filter(e => e.id !== exId)
    });
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (!activeSession) return;
    const newExercises = [...activeSession.exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newExercises.length) return;

    const temp = newExercises[index];
    newExercises[index] = newExercises[targetIndex];
    newExercises[targetIndex] = temp;

    updateActiveSession({
      ...activeSession,
      exercises: newExercises
    });
  };

  const updateExerciseField = (exId: string, field: keyof Exercise, value: string) => {
    if (!activeSession) return;
    const newExercises = activeSession.exercises.map(ex => {
      if (ex.id === exId) {
        return { ...ex, [field]: value };
      }
      return ex;
    });
    updateActiveSession({
      ...activeSession,
      exercises: newExercises
    });
  };

  // Robust multi-word, accent-insensitive catalog filter
  const filteredCatalog = useMemo(() => {
    const rawSearch = searchCatalogTerm.trim();
    const queryWords = rawSearch ? normalizeText(rawSearch).split(/\s+/).filter(Boolean) : [];

    return MUSCLEWIKI_CATALOG.filter(item => {
      const matchesGroup = selectedMuscleFilter === 'Todos' || item.muscleGroup === selectedMuscleFilter;
      if (!matchesGroup) return false;
      if (queryWords.length === 0) return true;

      const normName = normalizeText(item.name);
      const normGroup = normalizeText(item.muscleGroup);
      const normTip = item.tip ? normalizeText(item.tip) : '';

      return queryWords.every(word => 
        normName.includes(word) || normGroup.includes(word) || normTip.includes(word)
      );
    });
  }, [searchCatalogTerm, selectedMuscleFilter]);

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start pb-20">
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-white">Painel do Treinador | Acesso Restrito</span>
          </div>
          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              ← Ir ao Catálogo Play
            </button>
          )}
        </header>
        <TrainerAuthGate onAuthenticated={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-36 px-2 sm:px-4">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-lg shadow-black/40">
        <div className="flex items-center gap-2 min-w-0">
          <MelhorFormaLogo size={32} />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight truncate">
              Painel do Treinador
            </h1>
            <span className="text-[10px] text-emerald-400 font-medium block truncate">
              Administração de Catálogo & Mídias
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onBackToCatalog && (
            <button
              type="button"
              onClick={onBackToCatalog}
              className="min-h-[40px] px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
              title="Ir para o Catálogo de Treinos / Streaming"
            >
              <span>Catálogo Play</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenStudentHistory}
            className="min-h-[40px] px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition active:scale-95 shadow-sm"
            title="Carteira & Histórico de Alunos"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Alunos</span>
            <span className="text-[10px] bg-emerald-500/25 px-1.5 py-0.5 rounded-full font-mono font-bold text-emerald-300">
              {savedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenHostingerGuide}
            className="min-h-[40px] min-w-[40px] p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl transition text-xs flex items-center justify-center"
            title="Guia de Hospedagem Hostinger"
            aria-label="Guia Hostinger"
          >
            <Server className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onViewAsStudent}
            className="min-h-[40px] px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">Ver Aluno</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logoutTrainer();
              setIsAuthenticated(false);
            }}
            className="min-h-[40px] min-w-[40px] p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl transition text-xs flex items-center justify-center"
            title="Sair do modo administrador"
            aria-label="Sair do modo administrador"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Tab Navigation Bar */}
      <div className="py-2.5 sticky top-[57px] z-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setActiveAdminTab('catalog')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Catálogo (72 Treinos)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('exercises')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'exercises'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Biblioteca EXERCISES</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('video_validator')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'video_validator'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Validador de Vídeos</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('musclewiki')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'musclewiki'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>MuscleWiki & Proxy</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('student_sheet')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'student_sheet'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Ficha do Aluno</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="pt-4">
        {activeAdminTab === 'catalog' && (
          <TrainerCatalogTab
            onStartTestWorkout={(testPlan) => {
              onChangePlan(testPlan);
              onViewAsStudent();
            }}
            onPreviewExerciseVideo={onPreviewExercise}
          />
        )}

        {activeAdminTab === 'exercises' && (
          <TrainerExercisesTab
            onPreviewExerciseVideo={onPreviewExercise}
          />
        )}

        {activeAdminTab === 'video_validator' && (
          <TrainerVideoValidatorTab
            onPreviewExerciseVideo={onPreviewExercise}
          />
        )}

        {activeAdminTab === 'musclewiki' && (
          <TrainerMuscleWikiTab />
        )}

        {activeAdminTab === 'student_sheet' && (
          <div className="max-w-md mx-auto space-y-4">
            {/* Quick Presets Banner */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fichas e Modelos:</span>
              </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Deseja iniciar uma nova ficha em branco?')) {
                  onChangePlan({
                    id: `mf-treino-${Date.now()}`,
                    studentName: '',
                    trainerName: plan.trainerName || '',
                    trainerPhone: plan.trainerPhone || '',
                    goal: '',
                    frequency: '3x a 4x por semana',
                    generalNotes: '',
                    createdAt: new Date().toISOString(),
                    sessions: [
                      {
                        id: `sess-${Date.now()}`,
                        name: 'Treino A - Peito e Braços',
                        focus: 'Membros Superiores',
                        exercises: []
                      }
                    ]
                  });
                  setActiveSessionIndex(0);
                }
              }}
              className="text-slate-400 hover:text-slate-200 text-xs font-medium"
            >
              Nova em Branco
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="text-emerald-400 font-semibold hover:underline text-xs"
            >
              Modelos Prontos
            </button>
          </div>
        </div>

        {/* General Info Card (Student, Coach, Goal, Notes) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Dados do Aluno & Treino
            </h2>
            <button
              type="button"
              onClick={handleManualSaveStudent}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition active:scale-95 border ${
                justSavedNotice
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Salvar ou atualizar a ficha deste aluno no seu histórico local"
            >
              {justSavedNotice ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 text-emerald-400" />
                  <span>Salvar Aluno</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Nome do Aluno(a):</label>
              <input
                type="text"
                value={plan.studentName}
                onChange={(e) => updateField('studentName', e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Objetivo:</label>
                <input
                  type="text"
                  value={plan.goal}
                  onChange={(e) => updateField('goal', e.target.value)}
                  placeholder="Ex: Hipertrofia"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Frequência:</label>
                <input
                  type="text"
                  value={plan.frequency}
                  onChange={(e) => updateField('frequency', e.target.value)}
                  placeholder="Ex: 3x a 5x por semana"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Seu Nome / Treinador:</label>
                <input
                  type="text"
                  value={plan.trainerName}
                  onChange={(e) => updateField('trainerName', e.target.value)}
                  placeholder="Ex: Prof. Anderson"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">WhatsApp para retorno:</label>
                <input
                  type="tel"
                  value={plan.trainerPhone || ''}
                  onChange={(e) => updateField('trainerPhone', e.target.value)}
                  placeholder="Ex: 11999999999"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Instruções / Recomendações Gerais:</label>
              <textarea
                value={plan.generalNotes}
                onChange={(e) => updateField('generalNotes', e.target.value)}
                placeholder="Ex: Hidratação mínima de 3L/dia. Aquecer 5min antes..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Workout Sessions (Treino A, B, C...) Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Divisões de Treino:
            </span>
            <button
              onClick={addSession}
              className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Treino
            </button>
          </div>

          {/* Session Switcher Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {plan.sessions.map((session, idx) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionIndex(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                  idx === activeSessionIndex
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {session.name.split('-')[0].trim() || `Treino ${idx + 1}`} ({session.exercises.length})
              </button>
            ))}
          </div>

          {/* Active Session Details & Exercises */}
          {activeSession && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
              {/* Session Header Edit */}
              <div className="space-y-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={activeSession.name}
                    onChange={(e) => updateActiveSession({ ...activeSession, name: e.target.value })}
                    placeholder="Nome do Treino (ex: Treino A - Peito)"
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
                  />
                  {plan.sessions.length > 1 && (
                    <button
                      onClick={() => removeSession(activeSessionIndex)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                      title="Excluir este treino"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={activeSession.focus}
                  onChange={(e) => updateActiveSession({ ...activeSession, focus: e.target.value })}
                  placeholder="Foco muscular (ex: Peitoral, Deltóide e Tríceps)"
                  className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-3 py-1 text-xs text-slate-300 focus:outline-none"
                />
              </div>

              {/* Exercise Library Search & Add Bar */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Buscar na Biblioteca de Exercícios</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(true)}
                      className="py-1 px-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Ver catálogo completo em janela modal"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Catálogo Completo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomAddForm(!showCustomAddForm)}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition border ${
                        showCustomAddForm
                          ? 'bg-slate-800 text-white border-slate-700'
                          : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-850'
                      }`}
                      title="Inserir exercício manualmente"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      Inserir Manual
                    </button>
                  </div>
                </div>

                {/* Search input with icons */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchCatalogTerm}
                    onChange={(e) => setSearchCatalogTerm(e.target.value)}
                    placeholder="Digite o nome (ex: Supino, Puxada, Elevação, Agachamento)..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition shadow-inner"
                  />
                  {searchCatalogTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchCatalogTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                      title="Limpar busca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Muscle Filter Horizontal Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['Todos', ...MUSCLE_GROUPS].map(group => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedMuscleFilter(group)}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition active:scale-95 ${
                        selectedMuscleFilter === group
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                {/* Dynamic Search / Filter Results or Not Found State */}
                {searchCatalogTerm.trim() && filteredCatalog.length === 0 ? (
                  <div className="p-3.5 bg-slate-900 border border-amber-500/30 rounded-xl text-center space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>"{searchCatalogTerm}" não consta na biblioteca</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Não encontrou esse exercício no catálogo? Clique abaixo para inserir e personalizar manualmente agora mesmo:
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenManualWithTerm(searchCatalogTerm, selectedMuscleFilter)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Inserir "{searchCatalogTerm}" Manualmente
                    </button>
                  </div>
                ) : (
                  (searchCatalogTerm.trim() || selectedMuscleFilter !== 'Todos') && (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                        <span>{filteredCatalog.length} movimento(s) encontrado(s):</span>
                        {searchCatalogTerm.trim() && (
                          <button
                            type="button"
                            onClick={() => handleOpenManualWithTerm(searchCatalogTerm, selectedMuscleFilter)}
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Plus className="w-3 h-3" />
                            Inserir "{searchCatalogTerm}" como manual
                          </button>
                        )}
                      </div>

                      {filteredCatalog.slice(0, 12).map((item, i) => (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 hover:border-emerald-500/50 rounded-xl transition flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-semibold text-emerald-400 uppercase">
                                {item.muscleGroup}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                • {item.defaultSets}x{item.defaultReps}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-white truncate">
                              {item.name}
                            </h5>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onPreviewExercise({
                                id: 'preview',
                                name: item.name,
                                muscleGroup: item.muscleGroup,
                                sets: item.defaultSets,
                                reps: item.defaultReps,
                                rest: item.defaultRest,
                                youtubeId: item.youtubeId
                              })}
                              className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg border border-red-500/20"
                              title="Assistir vídeo de execução"
                            >
                              <Youtube className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddCatalogExercise(item, true)}
                              className={`py-1 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                justAddedName === item.name
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
                              }`}
                            >
                              {justAddedName === item.name ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Adicionado!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Adicionar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Custom Exercise Form Dropdown */}
              {showCustomAddForm && (
                <form 
                  onSubmit={handleSaveCustomExercise}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5 animate-fadeIn"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Novo Exercício Manual
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomAddForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Cancelar
                    </button>
                  </div>

                  {customExercise.name && (
                    <div className="text-[10px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Cadastrando exercício manual personalizado.</span>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={customExercise.name || ''}
                    onChange={(e) => setCustomExercise({ ...customExercise, name: e.target.value })}
                    placeholder="Nome do Exercício (ex: Supino Inclinado)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={customExercise.muscleGroup || 'Peito'}
                      onChange={(e) => setCustomExercise({ ...customExercise, muscleGroup: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      {MUSCLE_GROUPS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={customExercise.sets || ''}
                      onChange={(e) => setCustomExercise({ ...customExercise, sets: e.target.value })}
                      placeholder="Séries (ex: 4)"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customExercise.reps || ''}
                      onChange={(e) => setCustomExercise({ ...customExercise, reps: e.target.value })}
                      placeholder="Reps (ex: 10 a 12)"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={customExercise.rest || ''}
                      onChange={(e) => setCustomExercise({ ...customExercise, rest: e.target.value })}
                      placeholder="Descanso (ex: 60s)"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    value={customExercise.weight || ''}
                    onChange={(e) => setCustomExercise({ ...customExercise, weight: e.target.value })}
                    placeholder="Carga sugerida (opcional, ex: 15 kg/lado)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />

                  <input
                    type="text"
                    value={customExercise.notes || ''}
                    onChange={(e) => setCustomExercise({ ...customExercise, notes: e.target.value })}
                    placeholder="Recado para o aluno (ex: cadência 2-0-2)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />

                  {/* Campos de Mídia, Vídeo e Miniatura */}
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Mídia & Demonstração Visual:
                      </span>
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!customExercise.hasNoVideo}
                          onChange={(e) => setCustomExercise({ ...customExercise, hasNoVideo: e.target.checked })}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>Sem vídeo</span>
                      </label>
                    </div>

                    {!customExercise.hasNoVideo && (
                      <>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Link ou ID do Vídeo (YouTube):</label>
                          <input
                            type="text"
                            value={customExercise.youtubeId || ''}
                            onChange={(e) => setCustomExercise({ ...customExercise, youtubeId: e.target.value })}
                            placeholder="Ex: https://youtube.com/watch?v=... ou ID (11 dígitos)"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">URL da Miniatura Personalizada (opcional):</label>
                          <input
                            type="url"
                            value={customExercise.thumbnailUrl || ''}
                            onChange={(e) => setCustomExercise({ ...customExercise, thumbnailUrl: e.target.value })}
                            placeholder="Deixe vazio para usar a capa oficial do vídeo automaticamente"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none font-mono"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-[9px] text-slate-400 block mb-0.5">Orientações Técnicas Resumidas:</label>
                      <input
                        type="text"
                        value={customExercise.instructions || ''}
                        onChange={(e) => setCustomExercise({ ...customExercise, instructions: e.target.value })}
                        placeholder="Ex: Aduza as escápulas e empurre com os cotovelos alinhados"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 block mb-0.5">Cuidados de Execução:</label>
                      <input
                        type="text"
                        value={customExercise.cautions || ''}
                        onChange={(e) => setCustomExercise({ ...customExercise, cautions: e.target.value })}
                        placeholder="Ex: Não afaste os cotovelos em 90° para proteger o ombro"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition shadow-sm"
                  >
                    Adicionar à Lista
                  </button>
                </form>
              )}

              {/* Current Exercises in Session */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Exercícios neste treino ({activeSession.exercises.length}):
                  </span>
                  {activeSession.exercises.length >= 4 && (
                    <div className="relative w-36 sm:w-44">
                      <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={sessionExerciseFilter}
                        onChange={(e) => setSessionExerciseFilter(e.target.value)}
                        placeholder="Filtrar na ficha..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-lg pl-6 pr-5 py-1 text-[10px] text-slate-300 focus:outline-none"
                      />
                      {sessionExerciseFilter && (
                        <button
                          type="button"
                          onClick={() => setSessionExerciseFilter('')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {activeSession.exercises.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    Nenhum exercício ainda. Utilize a busca acima para adicionar da biblioteca ou cadastrar manualmente!
                  </div>
                ) : (
                  activeSession.exercises
                    .map((ex, originalIdx) => ({ ex, originalIdx }))
                    .filter(({ ex }) => {
                      if (!sessionExerciseFilter.trim()) return true;
                      const f = normalizeText(sessionExerciseFilter);
                      return normalizeText(ex.name).includes(f) || normalizeText(ex.muscleGroup).includes(f);
                    })
                    .map(({ ex, originalIdx }) => {
                      const isMediaOpen = expandedMediaEditorId === ex.id;
                      const media = resolveExerciseMedia(ex);

                      return (
                        <div
                          key={ex.id}
                          className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3.5 space-y-3 hover:border-slate-700 transition"
                        >
                          {/* Top Row: Miniatura à esquerda + Título e Ações à direita */}
                          <div className="flex items-start gap-3">
                            {/* Miniatura 16:9 */}
                            <div className="w-20 xs:w-24 sm:w-28 shrink-0">
                              <ExerciseThumbnail
                                exercise={ex}
                                onClick={media.hasVideo ? () => onPreviewExercise(ex) : undefined}
                                aspectRatio="16:9"
                                showPlayBadge={true}
                              />
                            </div>

                            {/* Informações centrais e Ações */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded shrink-0">
                                    #{originalIdx + 1}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase text-emerald-400 truncate">
                                    {ex.muscleGroup}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => moveExercise(originalIdx, 'up')}
                                    disabled={originalIdx === 0}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                                    title="Mover para cima"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveExercise(originalIdx, 'down')}
                                    disabled={originalIdx === activeSession.exercises.length - 1}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                                    title="Mover para baixo"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeExercise(ex.id)}
                                    className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10 ml-0.5"
                                    title="Remover exercício"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Input do Nome do Exercício */}
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) => updateExerciseField(ex.id, 'name', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none"
                                placeholder="Nome do exercício"
                              />

                              {/* Linha com Botões: "Ver execução" e "Mídia & Vídeo" */}
                              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                                {media.hasVideo ? (
                                  <button
                                    type="button"
                                    onClick={() => onPreviewExercise(ex)}
                                    className="py-1 px-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                                    title="Testar vídeo demonstrativo no app"
                                  >
                                    <Play className="w-3 h-3 fill-current text-emerald-400" />
                                    <span>Ver execução</span>
                                  </button>
                                ) : (
                                  <span className="py-1 px-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg text-[10px] font-medium flex items-center gap-1">
                                    <VideoOff className="w-3 h-3 text-slate-500" />
                                    <span>Sem vídeo</span>
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setExpandedMediaEditorId(isMediaOpen ? null : ex.id)}
                                  className={`py-1 px-2.5 rounded-lg text-[10px] font-semibold border flex items-center gap-1 transition ${
                                    isMediaOpen
                                      ? 'bg-blue-600/25 border-blue-500/40 text-blue-300'
                                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                  title="Editar link do vídeo, miniatura e orientações técnicas"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>{isMediaOpen ? 'Fechar Mídia' : 'Alterar Mídia'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Sets / Reps / Rest / Weight */}
                          <div className="grid grid-cols-4 gap-1.5 text-center">
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Séries</label>
                              <input
                                type="text"
                                value={ex.sets}
                                onChange={(e) => updateExerciseField(ex.id, 'sets', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Reps</label>
                              <input
                                type="text"
                                value={ex.reps}
                                onChange={(e) => updateExerciseField(ex.id, 'reps', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Descanso</label>
                              <input
                                type="text"
                                value={ex.rest}
                                onChange={(e) => updateExerciseField(ex.id, 'rest', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-emerald-400 text-center focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Carga</label>
                              <input
                                type="text"
                                value={ex.weight || ''}
                                onChange={(e) => updateExerciseField(ex.id, 'weight', e.target.value)}
                                placeholder="kg"
                                className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-amber-300 text-center focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Observação rápida do treinador */}
                          <div>
                            <input
                              type="text"
                              value={ex.notes || ''}
                              onChange={(e) => updateExerciseField(ex.id, 'notes', e.target.value)}
                              placeholder="Observação para o aluno (ex: escápulas travadas)"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                            />
                          </div>

                          {/* Painel Expansível de Mídia & Demonstração (Requisito 10 & 11) */}
                          {isMediaOpen && (
                            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5" />
                                  Personalizar Mídia & Demonstração do Exercício
                                </span>
                                <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!ex.hasNoVideo}
                                    onChange={(e) => updateExerciseField(ex.id, 'hasNoVideo', e.target.checked)}
                                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                                  />
                                  <span>Sem vídeo demonstrativo</span>
                                </label>
                              </div>

                              {!ex.hasNoVideo ? (
                                <div className="space-y-2">
                                  <div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                                      <span>Link ou ID do Vídeo (YouTube):</span>
                                      {media.videoId && (
                                        <span className="font-mono text-emerald-400">ID Ativo: {media.videoId}</span>
                                      )}
                                    </div>
                                    <input
                                      type="text"
                                      value={ex.youtubeId || ex.videoUrl || ''}
                                      onChange={(e) => {
                                        updateExerciseField(ex.id, 'youtubeId', e.target.value);
                                        updateExerciseField(ex.id, 'videoUrl', e.target.value);
                                      }}
                                      placeholder="Cole o link do YouTube (ex: https://youtube.com/watch?v=... ou ID)"
                                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-slate-400 block mb-0.5">
                                      URL da Miniatura Personalizada:
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="url"
                                        value={ex.thumbnailUrl || ''}
                                        onChange={(e) => updateExerciseField(ex.id, 'thumbnailUrl', e.target.value)}
                                        placeholder="Deixe vazio para usar a miniatura oficial do vídeo automaticamente"
                                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                                      />
                                      {ex.thumbnailUrl && (
                                        <button
                                          type="button"
                                          onClick={() => updateExerciseField(ex.id, 'thumbnailUrl', '')}
                                          className="text-[10px] text-slate-400 hover:text-white px-2 py-1.5 bg-slate-800 rounded-lg"
                                        >
                                          Resetar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-slate-950/80 rounded-lg text-[11px] text-slate-400 flex items-center gap-2 border border-slate-800">
                                  <VideoOff className="w-4 h-4 text-slate-500 shrink-0" />
                                  <span>Este exercício será exibido sem opção de vídeo, apresentando a imagem substituta padronizada.</span>
                                </div>
                              )}

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-0.5">
                                  Orientações Técnicas Resumidas:
                                </label>
                                <textarea
                                  value={ex.instructions || ''}
                                  onChange={(e) => updateExerciseField(ex.id, 'instructions', e.target.value)}
                                  placeholder="Ex: Escápulas presas no banco, desça até 90 graus controlando a carga..."
                                  rows={2}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-slate-200 focus:outline-none resize-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-0.5">
                                  Cuidados de Execução & Postura:
                                </label>
                                <input
                                  type="text"
                                  value={ex.cautions || ''}
                                  onChange={(e) => updateExerciseField(ex.id, 'cautions', e.target.value)}
                                  placeholder="Ex: Não afaste os cotovelos em excesso para proteger o ombro..."
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                />
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                {media.hasVideo ? (
                                  <button
                                    type="button"
                                    onClick={() => onPreviewExercise(ex)}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    Testar Vídeo Atual
                                  </button>
                                ) : <div />}

                                <button
                                  type="button"
                                  onClick={() => setExpandedMediaEditorId(null)}
                                  className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                                >
                                  Concluído
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
      </div>

      {/* Floating Bottom Bar with Primary Action: "Gerar Link WhatsApp" (Apenas na Ficha do Aluno) */}
      {activeAdminTab === 'student_sheet' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <button
              onClick={onViewAsStudent}
              className="py-3 px-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="hidden xs:inline">Testar</span> Aluno
            </button>

            <button
              onClick={handleGenerateWhatsApp}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              <Share2 className="w-4 h-4" />
              Gerar Link WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* MuscleWiki Catalog Picker Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Catalog Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500 fill-current" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Biblioteca de Exercícios & Vídeos
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Toque para adicionar à sessão do treino
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenManualWithTerm(searchCatalogTerm, selectedMuscleFilter)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  title="Cadastrar exercício manualmente"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manual</span>
                </button>
                <button
                  onClick={() => setShowCatalogModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Muscle Filter Horizontal Chips */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 space-y-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {['Todos', ...MUSCLE_GROUPS].map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedMuscleFilter(group)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      selectedMuscleFilter === group
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchCatalogTerm}
                  onChange={(e) => setSearchCatalogTerm(e.target.value)}
                  placeholder="Buscar por nome do exercício (ex: Supino, Puxada, Agachamento)..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition shadow-inner"
                />
                {searchCatalogTerm && (
                  <button
                    onClick={() => setSearchCatalogTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status info bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{filteredCatalog.length} movimento(s) disponível(is)</span>
                {searchCatalogTerm.trim() && (
                  <button
                    onClick={() => handleOpenManualWithTerm(searchCatalogTerm, selectedMuscleFilter)}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    Inserir "{searchCatalogTerm}" como manual
                  </button>
                )}
              </div>
            </div>

            {/* Catalog List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filteredCatalog.length === 0 ? (
                <div className="p-6 my-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Exercício não encontrado na biblioteca
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      {searchCatalogTerm ? `Nenhum resultado para "${searchCatalogTerm}".` : 'Nenhum exercício para a seleção atual.'}
                      {' '}Você pode inseri-lo manualmente agora com nome, séries e vídeo personalizados!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenManualWithTerm(searchCatalogTerm || 'Novo Exercício', selectedMuscleFilter)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Inserir {searchCatalogTerm ? `"${searchCatalogTerm}"` : 'Exercício'} Manualmente
                  </button>
                </div>
              ) : (
                filteredCatalog.map((item, i) => {
                  const previewObj: Exercise = {
                    id: `cat-${i}`,
                    name: item.name,
                    muscleGroup: item.muscleGroup,
                    sets: item.defaultSets,
                    reps: item.defaultReps,
                    rest: item.defaultRest,
                    youtubeId: item.youtubeId,
                    thumbnailUrl: item.thumbnailUrl
                  };

                  return (
                    <div
                      key={i}
                      className="p-2.5 sm:p-3 bg-slate-950/70 hover:bg-slate-800/70 border border-slate-800/70 hover:border-emerald-500/50 rounded-xl transition flex items-center justify-between gap-3"
                    >
                      <div className="w-16 sm:w-20 shrink-0">
                        <ExerciseThumbnail
                          exercise={previewObj}
                          onClick={() => onPreviewExercise(previewObj)}
                          aspectRatio="16:9"
                          showPlayBadge={true}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                            {item.muscleGroup}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {item.defaultSets}x{item.defaultReps}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.name}
                        </h4>
                        {item.tip && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {item.tip}
                          </p>
                        )}
                      </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewExercise({
                            id: 'preview',
                            name: item.name,
                            muscleGroup: item.muscleGroup,
                            sets: item.defaultSets,
                            reps: item.defaultReps,
                            rest: item.defaultRest,
                            youtubeId: item.youtubeId
                          });
                        }}
                        className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg border border-red-500/20 transition"
                        title="Assistir execução em vídeo"
                      >
                        <Youtube className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddCatalogExercise(item, true)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          justAddedName === item.name
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                        title="Adicionar ao treino atual"
                      >
                        {justAddedName === item.name ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Adicionado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>
        </div>
      )}

      {/* Preset Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Carregar Modelo de Treino
              </h3>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <p className="text-xs text-slate-400">
                Selecione um modelo abaixo para preencher automaticamente uma estrutura completa com divisões e exercícios do MuscleWiki:
              </p>

              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (confirm(`Carregar modelo "${tmpl.name}"? Isso substituirá os dados atuais.`)) {
                      onChangePlan({
                        ...tmpl.plan,
                        id: `mf-${Date.now()}`,
                        studentName: plan.studentName || tmpl.plan.studentName,
                        trainerName: plan.trainerName || tmpl.plan.trainerName
                      });
                      setShowTemplatesModal(false);
                    }
                  }}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer transition space-y-1 active:scale-98"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white">{tmpl.name}</h4>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
                      {tmpl.plan.sessions.length} Treinos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
