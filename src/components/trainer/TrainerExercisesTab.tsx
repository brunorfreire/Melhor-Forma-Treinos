import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CentralExercise, VideoValidationStatus, WorkoutLevel, Exercise } from '../../types';
import { 
  getAllCentralExercises, 
  saveAllCentralExercises, 
  validateVideoStatus 
} from '../../data/workoutCatalogService';
import { resolveExerciseMedia } from '../../utils/exerciseMedia';
import { extractYouTubeId, buildYouTubeEmbedUrl } from '../../utils/youtube';
import { extractVimeoId, buildVimeoEmbedUrl } from '../../utils/vimeo';
import { 
  uploadExerciseMedia, 
  logExerciseChange, 
  getExerciseAuditLog, 
  ExerciseAuditLogEntry,
  resolveIndexedDbMediaUrl
} from '../../utils/mediaStorageService';
import { getSupabaseConfigStatus } from '../../utils/supabaseClient';
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  VideoOff, 
  Play, 
  Edit3, 
  Dumbbell, 
  BookOpen, 
  X, 
  Sparkles,
  ExternalLink,
  Upload,
  Film,
  Image as ImageIcon,
  Youtube,
  Video,
  Trash2,
  History,
  Check,
  Info,
  ShieldCheck,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TrainerLibraryAuditTab } from './TrainerLibraryAuditTab';

interface TrainerExercisesTabProps {
  onPreviewExerciseVideo: (ex: Exercise) => void;
  initialSubSection?: 'library' | 'audit';
  initialExerciseId?: string;
}

// 13 arquivos pré-instalados fisicamente na pasta public/exercises/
const LOCAL_PRESET_MEDIA = [
  {
    name: 'Agachamento Sumô com Halter',
    webp: '/exercises/agachamento-sumo-halter.webp',
    gif: '/exercises/agachamento-sumo-halter.gif'
  },
  {
    name: 'Elevação Pélvica Unilateral',
    webp: '/exercises/elevacao-pelvica-unilateral.webp',
    gif: '/exercises/elevacao-pelvica-unilateral.gif'
  },
  {
    name: 'Flexão de Braço Inclinada',
    webp: '/exercises/flexao-braco-inclinada.webp',
    gif: null
  },
  {
    name: 'Mesa Flexora',
    webp: '/exercises/mesa-flexora.webp',
    gif: '/exercises/mesa-flexora.gif'
  },
  {
    name: 'Remada Curvada com Halteres',
    webp: '/exercises/remada-curvada-halteres.webp',
    gif: '/exercises/remada-curvada-halteres.gif'
  },
  {
    name: 'Subida no Step / Degrau',
    webp: '/exercises/subida-step-degrau.webp',
    gif: '/exercises/subida-step-degrau.gif'
  },
  {
    name: 'Tríceps Francês com Halter',
    webp: '/exercises/triceps-frances-halter.webp',
    gif: '/exercises/triceps-frances-halter.gif'
  }
];

export const TrainerExercisesTab: React.FC<TrainerExercisesTabProps> = ({
  onPreviewExerciseVideo,
  initialSubSection = 'library',
  initialExerciseId
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'library' | 'audit'>(initialSubSection);

  useEffect(() => {
    if (initialSubSection) {
      setActiveSubSection(initialSubSection);
    }
  }, [initialSubSection]);

  const [exercises, setExercises] = useState<CentralExercise[]>(() => getAllCentralExercises());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedPattern, setSelectedPattern] = useState<string>('todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('todos');
  const [selectedMediaSource, setSelectedMediaSource] = useState<string>('todos');

  // Modal de edição / adição de exercício central
  const [editingExercise, setEditingExercise] = useState<CentralExercise | null>(null);
  const [isNewExercise, setIsNewExercise] = useState(false);
  const [mediaTab, setMediaTab] = useState<'upload' | 'youtube' | 'vimeo' | 'external' | 'preset'>('upload');

  // Estados de upload de mídia
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de histórico de auditoria
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ExerciseAuditLogEntry[]>([]);

  // Status de conexão Supabase
  const supabaseStatus = useMemo(() => getSupabaseConfigStatus(), []);

  const refreshExercises = () => {
    setExercises(getAllCentralExercises());
  };

  // Métricas reais e dinâmicas
  const total = exercises.length;
  const validated = exercises.filter(e => e.videoValidationStatus === 'validado').length;
  const pending = exercises.filter(e => e.videoValidationStatus === 'pendente_revisao').length;
  const noVideo = exercises.filter(e => e.videoValidationStatus === 'sem_video').length;

  const countLocalDemonstrations = useMemo(() => {
    return exercises.filter(e => {
      const u = (e.videoUrl || '').toLowerCase();
      return u.includes('/exercises/') || u.endsWith('.webp') || u.endsWith('.gif') || u.endsWith('.mp4') || u.startsWith('indexeddb://');
    }).length;
  }, [exercises]);

  const countExternalStreaming = useMemo(() => {
    return exercises.filter(e => {
      return Boolean(e.youtubeId || e.vimeoId || (e.videoUrl && (e.videoUrl.includes('youtube') || e.videoUrl.includes('vimeo'))));
    }).length;
  }, [exercises]);

  // Grupos musculares únicos
  const muscleGroups = useMemo(() => {
    return Array.from(new Set(exercises.map(e => e.muscleGroup))).sort();
  }, [exercises]);

  // Padrões de movimento únicos
  const movementPatterns = useMemo(() => {
    return Array.from(new Set(exercises.map(e => e.movementPattern))).sort();
  }, [exercises]);

  // Função auxiliar para identificar origem da mídia
  const getExerciseMediaCategory = (ex: CentralExercise): 'gif' | 'webp' | 'mp4' | 'youtube' | 'vimeo' | 'none' => {
    const videoUrl = (ex.videoUrl || '').toLowerCase();
    const fallbackUrl = (ex.fallbackMediaUrl || '').toLowerCase();

    if (ex.vimeoId || videoUrl.includes('vimeo.com') || (ex.vimeoUrl && ex.vimeoUrl.length > 3)) {
      return 'vimeo';
    }
    if (videoUrl.endsWith('.gif') || fallbackUrl.endsWith('.gif')) {
      return 'gif';
    }
    if (videoUrl.endsWith('.webp') || fallbackUrl.endsWith('.webp')) {
      return 'webp';
    }
    if (videoUrl.endsWith('.mp4') || (videoUrl.startsWith('indexeddb://') && ex.mediaType === 'video')) {
      return 'mp4';
    }
    if (ex.youtubeId || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return 'youtube';
    }
    if (ex.videoValidationStatus === 'sem_video' || !ex.videoUrl) {
      return 'none';
    }
    return 'webp';
  };

  // Filtragem flexível e responsiva
  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (selectedMuscle !== 'todos' && ex.muscleGroup !== selectedMuscle) return false;
      if (selectedStatus !== 'todos' && ex.videoValidationStatus !== selectedStatus) return false;
      if (selectedPattern !== 'todos' && ex.movementPattern !== selectedPattern) return false;
      if (selectedDifficulty !== 'todos' && ex.difficulty !== selectedDifficulty) return false;

      if (selectedMediaSource !== 'todos') {
        const cat = getExerciseMediaCategory(ex);
        if (selectedMediaSource === 'gif' && cat !== 'gif') return false;
        if (selectedMediaSource === 'webp' && cat !== 'webp') return false;
        if (selectedMediaSource === 'mp4' && cat !== 'mp4') return false;
        if (selectedMediaSource === 'youtube' && cat !== 'youtube') return false;
        if (selectedMediaSource === 'vimeo' && cat !== 'vimeo') return false;
        if (selectedMediaSource === 'sem_demonstracao' && cat !== 'none' && ex.videoValidationStatus !== 'sem_video') return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const normName = (ex.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normNameEn = (ex.nameEn || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normEquip = (ex.equipment || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normMuscle = (ex.muscleGroup || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!normName.includes(q) && !normNameEn.includes(q) && !normEquip.includes(q) && !normMuscle.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [exercises, selectedMuscle, selectedStatus, selectedPattern, selectedDifficulty, selectedMediaSource, searchTerm]);

  // Alterar status de validação com 1 clique
  const handleQuickValidate = (id: string, newStatus: VideoValidationStatus) => {
    validateVideoStatus(id, newStatus);
    const ex = exercises.find(e => e.id === id);
    if (ex) {
      logExerciseChange({
        exerciseId: id,
        exerciseName: ex.name,
        action: 'status_alterado',
        details: `Status alterado para: ${newStatus}`,
        author: 'Personal Trainer'
      });
    }
    refreshExercises();
  };

  // Abrir modal de criação de exercício novo
  const handleOpenCreateModal = () => {
    setIsNewExercise(true);
    setUploadError(null);
    setUploadSuccess(null);
    setEditingExercise({
      id: `ex-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      nameEn: '',
      muscleGroup: 'Peito',
      movementPattern: 'Empurrar',
      equipment: 'Halteres',
      difficulty: 'iniciante',
      instructions: '',
      cautions: '',
      videoUrl: '',
      fallbackMediaUrl: '',
      youtubeId: '',
      vimeoId: '',
      vimeoUrl: '',
      mediaType: 'none',
      licenseSource: 'manual',
      videoValidationStatus: 'pendente_revisao',
      demonstratorInfo: { gender: 'feminino', targetAgeGroup: '40+' }
    });
    setMediaTab('upload');
  };

  // Abrir modal de edição
  const handleOpenEditModal = (ex: CentralExercise, initialTab: 'upload' | 'youtube' | 'vimeo' | 'external' | 'preset' = 'upload') => {
    setIsNewExercise(false);
    setUploadError(null);
    setUploadSuccess(null);
    setEditingExercise({ ...ex });
    setMediaTab(initialTab);
  };

  // Abre diretamente a ficha escolhida na Central de Curadoria, sem recriar dados.
  useEffect(() => {
    if (!initialExerciseId) return;
    const target = getAllCentralExercises().find(ex => ex.id === initialExerciseId);
    if (target) handleOpenEditModal(target);
  }, [initialExerciseId]);

  // Salvar exercício central
  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise || !editingExercise.name.trim()) {
      alert('Por favor, informe ao menos o nome do exercício.');
      return;
    }

    const allExercises = getAllCentralExercises();
    if (isNewExercise) {
      allExercises.push(editingExercise);
      logExerciseChange({
        exerciseId: editingExercise.id,
        exerciseName: editingExercise.name,
        action: 'criado',
        details: `Novo exercício cadastrado (${editingExercise.muscleGroup} / ${editingExercise.equipment})`,
        author: 'Personal Trainer'
      });
    } else {
      const idx = allExercises.findIndex(ex => ex.id === editingExercise.id);
      if (idx !== -1) {
        allExercises[idx] = editingExercise;
        logExerciseChange({
          exerciseId: editingExercise.id,
          exerciseName: editingExercise.name,
          action: 'editado',
          details: `Exercício atualizado com sucesso`,
          author: 'Personal Trainer'
        });
      }
    }

    saveAllCentralExercises(allExercises);
    setEditingExercise(null);
    refreshExercises();
  };

  // Handler para upload direto de arquivo (.gif, .webp, .mp4)
  const handleProcessUploadFile = async (file: File) => {
    if (!editingExercise) return;
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const result = await uploadExerciseMedia(file);
      if (!result.success || !result.url) {
        setUploadError(result.error || 'Falha no processamento da mídia.');
        setUploadLoading(false);
        return;
      }

      const mediaType = result.mediaType || (file.type.includes('video') ? 'video' : 'image');
      setEditingExercise(prev => {
        if (!prev) return null;
        return {
          ...prev,
          videoUrl: result.url,
          fallbackMediaUrl: result.url.endsWith('.webp') ? result.url.replace('.webp', '.gif') : prev.fallbackMediaUrl,
          mediaType,
          videoValidationStatus: 'validado',
          licenseSource: 'original'
        };
      });

      const targetMsg = result.storageTarget === 'supabase_storage'
        ? 'Upload concluído com sucesso e enviado para o Supabase Storage!'
        : 'Mídia salva com sucesso no armazenamento local seguro (IndexedDB)!';
      setUploadSuccess(targetMsg);
    } catch (err: any) {
      setUploadError(`Erro ao carregar arquivo: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessUploadFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Limpa todos os filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMuscle('todos');
    setSelectedStatus('todos');
    setSelectedPattern('todos');
    setSelectedDifficulty('todos');
    setSelectedMediaSource('todos');
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || 
    selectedMuscle !== 'todos' || 
    selectedStatus !== 'todos' || 
    selectedPattern !== 'todos' || 
    selectedDifficulty !== 'todos' || 
    selectedMediaSource !== 'todos'
  );

  return (
    <div className="space-y-6">
      {/* Sub-navegação do Módulo Gerenciar Exercícios */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubSection('library')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubSection === 'library'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Biblioteca de Exercícios</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubSection('audit')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubSection === 'audit'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Auditoria da Biblioteca</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          {activeSubSection === 'library' ? 'Gestão e cadastro de exercícios' : 'Auditoria biomecânica e integridade de mídias'}
        </span>
      </div>

      {activeSubSection === 'audit' ? (
        <TrainerLibraryAuditTab
          onPreviewExerciseVideo={onPreviewExerciseVideo}
          onOpenEditExercise={(ex, initialTab) => handleOpenEditModal(ex, initialTab)}
          onOpenCreateExercise={handleOpenCreateModal}
          onSwitchToCatalogManager={() => setActiveSubSection('library')}
        />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. TOP BANNER & MÉTRICAS REAIS DA CENTRAL DE EXERCÍCIOS                   */}
          {/* ========================================================================= */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Painel do Treinador 40+
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Acesso Administrativo Exclusivo
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Gerenciar Exercícios & Demonstrações
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cadastre, pesquise, edite e vincule demonstrações técnicas por upload direto de arquivos GIF animados, WebP, vídeos MP4 ou links de YouTube e Vimeo.
            </p>
          </div>

          {/* Quick Metrics Bar & Storage Indicator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="grid grid-cols-4 gap-2 text-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
              <div className="px-1.5">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total</span>
                <span className="text-sm font-black text-white">{total}</span>
              </div>
              <div className="px-1.5 border-l border-slate-800">
                <span className="text-[9px] text-emerald-400 uppercase font-semibold block">Validados</span>
                <span className="text-sm font-black text-emerald-400">{validated}</span>
              </div>
              <div className="px-1.5 border-l border-slate-800">
                <span className="text-[9px] text-amber-400 uppercase font-semibold block">Pendentes</span>
                <span className="text-sm font-black text-amber-400">{pending}</span>
              </div>
              <div className="px-1.5 border-l border-slate-800">
                <span className="text-[9px] text-rose-400 uppercase font-semibold block">Sem Mídia</span>
                <span className="text-sm font-black text-rose-400">{noVideo}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenCreateModal}
                className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/60"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Exercício</span>
              </button>

              <button
                onClick={() => {
                  setAuditLogs(getExerciseAuditLog());
                  setIsAuditModalOpen(true);
                }}
                className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700"
                title="Ver histórico de alterações e auditoria de mídias"
              >
                <History className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Histórico</span>
              </button>
            </div>
          </div>
        </div>

        {/* Storage Target Status Ribbon */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">
              {supabaseStatus.isConfigured ? 'Armazenamento em Nuvem:' : 'Armazenamento Local Persistente:'}
            </span>
            <span className={supabaseStatus.isConfigured ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'}>
              {supabaseStatus.isConfigured ? 'Supabase Storage Ativo' : 'IndexedDB Seguro (Navegador)'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>• {countLocalDemonstrations} mídias locais (GIF/WebP/MP4)</span>
            <span>• {countExternalStreaming} vídeos externos (YouTube/Vimeo)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BARRA DE PESQUISA E FILTROS COMPLETOS                                  */}
      {/* ========================================================================= */}
      <div className="space-y-3 bg-slate-900/70 border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome do exercício em português, sinônimos em inglês, equipamento ou músculo..."
            className="w-full min-h-[46px] pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              aria-label="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grid de 5 Filtros Técnicos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {/* Grupo Muscular */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Músculo Principal:</label>
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="todos">Todos os Grupos ({muscleGroups.length})</option>
              {muscleGroups.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Padrão de Movimento */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Padrão de Movimento:</label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="todos">Todos os Padrões</option>
              {movementPatterns.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Nível de Dificuldade */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Dificuldade 40+:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="todos">Todas as Dificuldades</option>
              <option value="iniciante">Iniciante (Nível 1)</option>
              <option value="intermediario">Intermediário (Nível 2)</option>
              <option value="avancado">Avançado (Nível 3)</option>
            </select>
          </div>

          {/* Origem da Demonstração (Mídia) */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Origem da Mídia:</label>
            <select
              value={selectedMediaSource}
              onChange={(e) => setSelectedMediaSource(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="todos">Todas as Mídias</option>
              <option value="gif">GIF Animado (.gif)</option>
              <option value="webp">WebP Animado (.webp)</option>
              <option value="mp4">Vídeo MP4 (.mp4)</option>
              <option value="youtube">YouTube Embed</option>
              <option value="vimeo">Vimeo Embed</option>
              <option value="sem_demonstracao">Sem Demonstração</option>
            </select>
          </div>

          {/* Status de Validação Técnica */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Status Técnico:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="validado">● Validado</option>
              <option value="pendente_revisao">▲ Pendente de Revisão</option>
              <option value="sem_video">○ Sem Demonstração</option>
            </select>
          </div>
        </div>

        {/* Resumo de Resultados & Limpar Filtros */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div>
            Mostrando <strong>{filtered.length}</strong> de {exercises.length} exercícios
            {hasActiveFilters && <span className="text-emerald-400 font-medium"> (filtros ativos)</span>}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GRADE DE EXERCÍCIOS CADASTRADOS                                        */}
      {/* ========================================================================= */}
      {filtered.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl max-w-md mx-auto">
          <VideoOff className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-bold text-white mb-1">Nenhum exercício encontrado</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Não há exercícios com os critérios de busca e filtros selecionados. Tente ajustar os termos ou redefinir os filtros.
          </p>
          <button
            onClick={handleClearFilters}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition"
          >
            Redefinir Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map(ex => {
            const mediaCat = getExerciseMediaCategory(ex);
            const isVal = ex.videoValidationStatus === 'validado';
            const isPend = ex.videoValidationStatus === 'pendente_revisao';

            // Mapeia para Exercise temporário para o preview interativo
            const exerciseForPreview: Exercise = {
              id: ex.id,
              name: ex.name,
              muscleGroup: ex.muscleGroup,
              sets: '3',
              reps: '10 a 12',
              rest: '60s',
              movementPattern: ex.movementPattern,
              equipment: ex.equipment,
              instructions: ex.instructions,
              cautions: ex.cautions,
              videoUrl: ex.videoUrl,
              fallbackMediaUrl: ex.fallbackMediaUrl,
              youtubeId: ex.youtubeId,
              vimeoId: ex.vimeoId,
              mediaType: ex.mediaType,
              videoValidationStatus: ex.videoValidationStatus
            };

            return (
              <div 
                key={ex.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition shadow-sm"
              >
                <div className="space-y-2">
                  {/* Header Row: Músculo + Badges de Mídia e Status */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {ex.muscleGroup}
                      </span>
                      <span className="text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                        {ex.equipment}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-850 px-1.5 py-0.5 rounded">
                        {ex.difficulty}
                      </span>
                    </div>

                    {/* Origem da Mídia Badge */}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      mediaCat === 'gif' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      mediaCat === 'webp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      mediaCat === 'mp4' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      mediaCat === 'vimeo' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      mediaCat === 'youtube' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {mediaCat === 'gif' && <ImageIcon className="w-3 h-3" />}
                      {mediaCat === 'webp' && <ImageIcon className="w-3 h-3" />}
                      {mediaCat === 'mp4' && <Film className="w-3 h-3" />}
                      {mediaCat === 'vimeo' && <Video className="w-3 h-3" />}
                      {mediaCat === 'youtube' && <Youtube className="w-3 h-3" />}
                      {mediaCat === 'none' && <VideoOff className="w-3 h-3" />}
                      <span>{mediaCat.toUpperCase()}</span>
                    </span>
                  </div>

                  {/* Nome do Exercício & Sinônimo */}
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                      {ex.name}
                    </h3>
                    {ex.nameEn && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                        {ex.nameEn}
                      </p>
                    )}
                  </div>

                  {/* Instruções Resumidas */}
                  {ex.instructions && (
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                      {ex.instructions}
                    </p>
                  )}

                  {/* Cuidados e Segurança 40+ */}
                  {ex.cautions && (
                    <div className="text-[10px] text-amber-300/90 flex items-start gap-1 leading-relaxed bg-amber-500/5 p-1.5 rounded-lg border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{ex.cautions}</span>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Ações e Validação */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  {/* Status Toggle Row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Validação:</span>
                    <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
                      <button
                        onClick={() => handleQuickValidate(ex.id, 'validado')}
                        className={`px-2 py-0.5 rounded transition font-bold flex items-center gap-1 ${
                          isVal ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Marcar como técnica e mídia validadas"
                      >
                        <Check className="w-2.5 h-2.5" />
                        <span>Validado</span>
                      </button>
                      <button
                        onClick={() => handleQuickValidate(ex.id, 'pendente_revisao')}
                        className={`px-2 py-0.5 rounded transition font-bold ${
                          isPend ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Marcar como pendente de revisão técnica"
                      >
                        Pendente
                      </button>
                      <button
                        onClick={() => handleQuickValidate(ex.id, 'sem_video')}
                        className={`px-2 py-0.5 rounded transition font-bold ${
                          !isVal && !isPend ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Marcar como sem demonstração"
                      >
                        Sem Mídia
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => onPreviewExerciseVideo(exerciseForPreview)}
                      className="min-h-[38px] px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      title="Testar reprodução da mídia"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Visualizar</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(ex, 'upload')}
                      className="min-h-[38px] px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      title="Editar todos os dados do exercício"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(ex, 'upload')}
                      className="min-h-[38px] px-2 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      title="Fazer upload ou substituir demonstração"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Substituir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL ADMINISTRATIVO: CADASTRAR OU EDITAR EXERCÍCIO COM UPLOAD DE MÍDIA */}
      {/* ========================================================================= */}
      {editingExercise && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {isNewExercise ? 'Cadastrar Novo Exercício' : `Editar: ${editingExercise.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ID Canônico: <code className="font-mono text-emerald-400">{editingExercise.id}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingExercise(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveExercise} className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              
              {/* Informações Básicas */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                  1. Dados Técnicos do Exercício
                </span>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Nome do Exercício (em Português) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                    placeholder="Ex: Remada Curvada com Halteres"
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Nome em Inglês / Sinônimos
                    </label>
                    <input
                      type="text"
                      value={editingExercise.nameEn || ''}
                      onChange={(e) => setEditingExercise({ ...editingExercise, nameEn: e.target.value })}
                      placeholder="Ex: Dumbbell Bent-over Row"
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Grupo Muscular Principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingExercise.muscleGroup}
                      onChange={(e) => setEditingExercise({ ...editingExercise, muscleGroup: e.target.value })}
                      placeholder="Ex: Costas, Peito, Quadríceps, Glúteos..."
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Padrão de Movimento
                    </label>
                    <select
                      value={editingExercise.movementPattern}
                      onChange={(e) => setEditingExercise({ ...editingExercise, movementPattern: e.target.value })}
                      className="w-full min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white focus:outline-none"
                    >
                      <option value="Empurrar">Empurrar</option>
                      <option value="Puxar">Puxar</option>
                      <option value="Agachar">Agachar</option>
                      <option value="Dobradiça de quadril">Dobradiça de quadril</option>
                      <option value="Estabilidade de core">Estabilidade de core</option>
                      <option value="Locomoção">Locomoção</option>
                      <option value="Mobilidade">Mobilidade</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Equipamento
                    </label>
                    <input
                      type="text"
                      value={editingExercise.equipment}
                      onChange={(e) => setEditingExercise({ ...editingExercise, equipment: e.target.value })}
                      placeholder="Ex: Halteres, Peso corporal..."
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Nível de Dificuldade
                    </label>
                    <select
                      value={editingExercise.difficulty}
                      onChange={(e) => setEditingExercise({ ...editingExercise, difficulty: e.target.value as WorkoutLevel })}
                      className="w-full min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white focus:outline-none"
                    >
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Instruções de Execução Biomecânica
                  </label>
                  <textarea
                    rows={2}
                    value={editingExercise.instructions}
                    onChange={(e) => setEditingExercise({ ...editingExercise, instructions: e.target.value })}
                    placeholder="Descreva o passo a passo da postura inicial, trajetória e respiração..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Cuidados e Orientações Articulares 40+
                  </label>
                  <textarea
                    rows={2}
                    value={editingExercise.cautions}
                    onChange={(e) => setEditingExercise({ ...editingExercise, cautions: e.target.value })}
                    placeholder="Cuidados específicos para proteção de ombros, coluna, joelhos ou quadris..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Seção 2: Demonstração e Mídia (Upload Direto ou Links) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    2. Demonstração em Mídia (GIF / WebP / MP4 / YouTube / Vimeo)
                  </span>
                  {editingExercise.videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExercise({
                          ...editingExercise,
                          videoUrl: '',
                          fallbackMediaUrl: '',
                          youtubeId: '',
                          vimeoId: '',
                          vimeoUrl: '',
                          mediaType: 'none',
                          videoValidationStatus: 'sem_video'
                        });
                      }}
                      className="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover Demonstração</span>
                    </button>
                  )}
                </div>

                {/* Abas de Origem de Mídia */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMediaTab('upload')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      mediaTab === 'upload' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Arquivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaTab('youtube')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      mediaTab === 'youtube' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaTab('vimeo')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      mediaTab === 'vimeo' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vimeo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaTab('preset')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      mediaTab === 'preset' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Mídias Pré-instaladas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaTab('external')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      mediaTab === 'external' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Link Direto / CDN</span>
                  </button>
                </div>

                {/* Conteúdo da Aba 1: Upload Direto (GIF, WebP, MP4) */}
                {mediaTab === 'upload' && (
                  <div className="space-y-3">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".gif,.webp,.mp4,image/gif,image/webp,video/mp4"
                        onChange={handleFileSelectChange}
                        className="hidden"
                      />

                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          {uploadLoading ? (
                            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold text-white">
                            Arraste seu arquivo aqui ou clique para selecionar
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Formatos suportados: <strong>GIF animado</strong>, <strong>WebP animado</strong> ou vídeo <strong>MP4</strong>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Tamanho máximo: até 20MB para imagens animadas e 50MB para vídeos MP4
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={uploadLoading}
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Selecionar Arquivo no Computador ou Celular</span>
                        </button>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{uploadSuccess}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Conteúdo da Aba 2: YouTube */}
                {mediaTab === 'youtube' && (
                  <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <label className="text-slate-300 font-bold block">
                      URL do Vídeo no YouTube ou Código ID:
                    </label>
                    <input
                      type="text"
                      value={editingExercise.youtubeId || ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        const extracted = extractYouTubeId(val) || val;
                        setEditingExercise({
                          ...editingExercise,
                          youtubeId: extracted,
                          videoUrl: extracted ? `https://www.youtube.com/watch?v=${extracted}` : '',
                          mediaType: extracted ? 'youtube' : 'none',
                          videoValidationStatus: extracted ? 'validado' : 'sem_video'
                        });
                      }}
                      placeholder="Ex: https://www.youtube.com/watch?v=MeIiIdhvXT4 ou MeIiIdhvXT4"
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      Aceita links completos (desktop, mobile e shorts) ou o código alfanumérico do YouTube.
                    </p>
                  </div>
                )}

                {/* Conteúdo da Aba 3: Vimeo */}
                {mediaTab === 'vimeo' && (
                  <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <label className="text-slate-300 font-bold block">
                      URL do Vídeo no Vimeo ou ID Numérico:
                    </label>
                    <input
                      type="text"
                      value={editingExercise.vimeoId || editingExercise.vimeoUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        const extracted = extractVimeoId(val) || val;
                        setEditingExercise({
                          ...editingExercise,
                          vimeoId: extracted,
                          vimeoUrl: extracted ? `https://vimeo.com/${extracted}` : '',
                          videoUrl: extracted ? `https://vimeo.com/${extracted}` : '',
                          mediaType: extracted ? 'vimeo' : 'none',
                          videoValidationStatus: extracted ? 'validado' : 'sem_video'
                        });
                      }}
                      placeholder="Ex: https://vimeo.com/76979871 ou 76979871"
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      Aceita links do Vimeo ou o identificador numérico de 6 a 12 dígitos.
                    </p>
                  </div>
                )}

                {/* Conteúdo da Aba 4: Mídias Pré-instaladas na pasta /exercises/ */}
                {mediaTab === 'preset' && (
                  <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-[11px] text-slate-400">
                      Selecione uma das 13 demonstrações disponíveis no repositório local:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {LOCAL_PRESET_MEDIA.map(preset => {
                        const isSelected = editingExercise.videoUrl === preset.webp;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setEditingExercise({
                                ...editingExercise,
                                videoUrl: preset.webp,
                                fallbackMediaUrl: preset.gif || undefined,
                                mediaType: 'image',
                                videoValidationStatus: 'validado',
                                licenseSource: 'original'
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold truncate block">{preset.name}</span>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                WebP {preset.gif ? '+ GIF de fallback' : ''}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conteúdo da Aba 5: Link Direto / Hospedagem Externa */}
                {mediaTab === 'external' && (
                  <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <label className="text-slate-300 font-bold block">
                      URL Direta da Mídia (Hostinger, Supabase ou CDN):
                    </label>
                    <input
                      type="text"
                      value={editingExercise.videoUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        const isVid = /\.(mp4|webm|mov)(\?.*)?$/i.test(val);
                        setEditingExercise({
                          ...editingExercise,
                          videoUrl: val,
                          mediaType: isVid ? 'video' : 'image',
                          videoValidationStatus: val ? 'validado' : 'sem_video'
                        });
                      }}
                      placeholder="Ex: https://meuservidor.com/midias/exercicio.webp"
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      Informe o endereço completo HTTPS para carregar demonstrações hospedadas externamente.
                    </p>
                  </div>
                )}

                {/* Preview em Tempo Real da Mídia Vinculada */}
                {editingExercise.videoUrl && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        Preview da Demonstração Antes de Salvar:
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 truncate max-w-xs">
                        {editingExercise.videoUrl}
                      </span>
                    </div>

                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                      {editingExercise.mediaType === 'image' || editingExercise.videoUrl.match(/\.(webp|gif|png|jpe?g)(\?.*)?$/i) ? (
                        <img
                          src={editingExercise.videoUrl.startsWith('indexeddb://') ? undefined : editingExercise.videoUrl}
                          alt="Preview da demonstração"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            if (editingExercise.videoUrl?.startsWith('indexeddb://')) {
                              resolveIndexedDbMediaUrl(editingExercise.videoUrl).then(url => {
                                (e.target as HTMLImageElement).src = url;
                              });
                            }
                          }}
                        />
                      ) : editingExercise.mediaType === 'video' || editingExercise.videoUrl.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                        <video
                          src={editingExercise.videoUrl.startsWith('indexeddb://') ? undefined : editingExercise.videoUrl}
                          controls
                          autoPlay
                          muted
                          loop
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            if (editingExercise.videoUrl?.startsWith('indexeddb://')) {
                              resolveIndexedDbMediaUrl(editingExercise.videoUrl).then(url => {
                                (e.target as HTMLVideoElement).src = url;
                              });
                            }
                          }}
                        />
                      ) : editingExercise.mediaType === 'youtube' && editingExercise.youtubeId ? (
                        <iframe
                          src={buildYouTubeEmbedUrl(editingExercise.youtubeId, false)}
                          title="Preview YouTube"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : editingExercise.mediaType === 'vimeo' && editingExercise.vimeoId ? (
                        <iframe
                          src={buildVimeoEmbedUrl(editingExercise.vimeoId, false)}
                          title="Preview Vimeo"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-slate-500 text-xs">Mídia vinculada pronta para salvar</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Validação Técnica Final */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Status da Validação Técnica:
                  </label>
                  <select
                    value={editingExercise.videoValidationStatus}
                    onChange={(e) => setEditingExercise({ ...editingExercise, videoValidationStatus: e.target.value as VideoValidationStatus })}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white focus:outline-none"
                  >
                    <option value="validado">● Validado (Demonstração corresponde exatamente ao exercício)</option>
                    <option value="pendente_revisao">▲ Pendente de Revisão (Aguardando verificação do treinador)</option>
                    <option value="sem_video">○ Sem Vídeo / Sem Demonstração</option>
                  </select>
                </div>
              </div>

              {/* Botões do Rodapé do Formulário */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="min-h-[42px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Exercício</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: HISTÓRICO DE ALTERAÇÕES E AUDITORIA                             */}
      {/* ========================================================================= */}
      {isAuditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Histórico de Alterações de Exercícios
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Registro de auditoria administrativa do Personal Trainer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma alteração registrada nesta sessão ainda.</p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          log.action === 'criado' ? 'bg-emerald-500/20 text-emerald-300' :
                          log.action === 'midia_substituida' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                        <strong className="text-white">{log.exerciseName}</strong>
                      </div>
                      <p className="text-slate-400 text-[11px]">{log.details}</p>
                    </div>

                    <div className="text-right shrink-0 text-[10px] text-slate-500">
                      <div>{new Date(log.timestamp).toLocaleDateString('pt-BR')}</div>
                      <div>{new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="min-h-[38px] px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
