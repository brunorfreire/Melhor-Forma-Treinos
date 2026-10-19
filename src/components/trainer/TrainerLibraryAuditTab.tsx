import React, { useState, useMemo, useEffect } from 'react';
import { CentralExercise, Exercise, VideoValidationStatus } from '../../types';
import { 
  getAllCentralExercises, 
  getAllWorkoutExerciseItems,
  getAllCatalogWorkouts 
} from '../../data/workoutCatalogService';
import { 
  getStoredAuditRecords, 
  getOrCreateAuditRecord,
  calculateAuditMetrics,
  getCorrectionPriorities,
  verifyExerciseMedia,
  recordBiomechanicalReview,
  updateExerciseAvailability,
  exportAuditToCSV,
  detectExerciseMediaFormat,
  getExerciseWorkoutRelations,
  AuditRecord,
  BiomechanicalStatus,
  MediaAvailability,
  LinkedWorkoutInfo,
  CorrectionPriorityItem
} from '../../utils/libraryAuditService';
import { 
  Search, 
  Plus,
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  VideoOff, 
  Play, 
  Edit3, 
  Upload, 
  Filter, 
  RotateCcw, 
  Download, 
  ExternalLink, 
  Clock, 
  Layers, 
  ChevronRight, 
  Info, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  Film, 
  Image as ImageIcon, 
  Youtube, 
  Video, 
  Sparkles,
  ArrowRight,
  Database,
  CloudUpload,
  FileUp,
  Copy,
  Lock
} from 'lucide-react';
import { 
  downloadBackupAsJsonFile, 
  validateBackupPackage, 
  restoreFullAdministrativeBackup, 
  BackupValidationResult 
} from '../../utils/backupService';
import { 
  SUPABASE_SQL_DDL_SCRIPT, 
  testSupabaseConnection, 
  runIdempotentCloudMigration, 
  MigrationReport,
  MigrationStepProgress 
} from '../../utils/supabaseMigrationService';
import { getStoredSession, getSupabaseConfigStatus } from '../../utils/supabaseClient';

interface TrainerLibraryAuditTabProps {
  onPreviewExerciseVideo: (ex: Exercise) => void;
  onOpenEditExercise: (ex: CentralExercise, initialTab?: 'upload' | 'youtube' | 'vimeo' | 'external' | 'preset') => void;
  onOpenCreateExercise: () => void;
  onSwitchToCatalogManager?: () => void;
}

export const TrainerLibraryAuditTab: React.FC<TrainerLibraryAuditTabProps> = ({
  onPreviewExerciseVideo,
  onOpenEditExercise,
  onOpenCreateExercise,
  onSwitchToCatalogManager
}) => {
  const [exercises, setExercises] = useState<CentralExercise[]>(() => getAllCentralExercises());
  const [auditRecords, setAuditRecords] = useState<Record<string, AuditRecord>>(() => getStoredAuditRecords());
  
  // Abas da auditoria: 'table' (Visão Geral & Tabela) | 'priorities' (Prioridades de Correção)
  const [activeAuditView, setActiveAuditView] = useState<'table' | 'priorities'>('table');

  // Filtros de busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBiomech, setFilterBiomech] = useState<string>('todos');
  const [filterAvailability, setFilterAvailability] = useState<string>('todos');
  const [filterFormat, setFilterFormat] = useState<string>('todos');
  const [filterMuscle, setFilterMuscle] = useState<string>('todos');
  const [filterUsage, setFilterUsage] = useState<string>('todos');

  // Estado de verificação em lote / sob demanda
  const [isVerifyingBatch, setIsVerifyingBatch] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Modais de Auditoria
  const [reviewingExercise, setReviewingExercise] = useState<CentralExercise | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [viewingLinkedWorkouts, setViewingLinkedWorkouts] = useState<{ exercise: CentralExercise; workouts: LinkedWorkoutInfo[] } | null>(null);

  // Estados de Backup & Restauração
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupExportNotice, setBackupExportNotice] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFileContent, setRestoreFileContent] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string | null>(null);
  const [restoreValidation, setRestoreValidation] = useState<BackupValidationResult | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Estados de Nuvem & Supabase
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<any>(null);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [isMigratingCloud, setIsMigratingCloud] = useState(false);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);
  const [copiedCloudSql, setCopiedCloudSql] = useState(false);

  const refreshData = () => {
    const freshExs = getAllCentralExercises();
    setExercises(freshExs);
    setAuditRecords(getStoredAuditRecords());
  };

  useEffect(() => {
    const handleRestoredEvent = () => {
      refreshData();
    };
    window.addEventListener('mf-backup-restored', handleRestoredEvent);
    return () => window.removeEventListener('mf-backup-restored', handleRestoredEvent);
  }, []);

  // Recalcula métricas reais dinamicamente
  const metrics = useMemo(() => {
    return calculateAuditMetrics(exercises, auditRecords);
  }, [exercises, auditRecords]);

  // Lista de prioridades de correção calculada
  const priorities = useMemo(() => {
    return getCorrectionPriorities(exercises, auditRecords);
  }, [exercises, auditRecords]);

  // Grupos musculares únicos
  const muscleGroups = useMemo(() => {
    return Array.from(new Set(exercises.map(e => e.muscleGroup))).sort();
  }, [exercises]);

  // Mapeamento de relações para contagem instantânea
  const workoutRelations = useMemo(() => getAllWorkoutExerciseItems(), []);
  const usageCountMap = useMemo(() => {
    const map = new Map<string, number>();
    workoutRelations.forEach(r => {
      map.set(r.exerciseId, (map.get(r.exerciseId) || 0) + 1);
    });
    return map;
  }, [workoutRelations]);

  // Filtragem da lista
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const rec = auditRecords[ex.id] || getOrCreateAuditRecord(ex, auditRecords);
      const workoutCount = usageCountMap.get(ex.id) || 0;

      // Filtro Biomecânico
      if (filterBiomech !== 'todos' && rec.biomechanicalStatus !== filterBiomech) {
        return false;
      }

      // Filtro Disponibilidade
      if (filterAvailability !== 'todos' && rec.mediaAvailability !== filterAvailability) {
        return false;
      }

      // Filtro Formato
      if (filterFormat !== 'todos' && rec.mediaFormat !== filterFormat) {
        return false;
      }

      // Filtro Músculo
      if (filterMuscle !== 'todos' && ex.muscleGroup !== filterMuscle) {
        return false;
      }

      // Filtro de Utilização
      if (filterUsage === 'com_treinos' && workoutCount === 0) return false;
      if (filterUsage === 'sem_treinos' && workoutCount > 0) return false;

      // Busca Textual
      if (searchTerm.trim()) {
        const q = searchTerm
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const normName = (ex.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normNameEn = (ex.nameEn || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normEquip = (ex.equipment || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normMuscle = (ex.muscleGroup || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normId = (ex.id || '').toLowerCase();

        if (
          !normName.includes(q) && 
          !normNameEn.includes(q) && 
          !normEquip.includes(q) && 
          !normMuscle.includes(q) &&
          !normId.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [exercises, auditRecords, filterBiomech, filterAvailability, filterFormat, filterMuscle, filterUsage, searchTerm, usageCountMap]);

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterBiomech('todos');
    setFilterAvailability('todos');
    setFilterFormat('todos');
    setFilterMuscle('todos');
    setFilterUsage('todos');
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    filterBiomech !== 'todos' ||
    filterAvailability !== 'todos' ||
    filterFormat !== 'todos' ||
    filterMuscle !== 'todos' ||
    filterUsage !== 'todos'
  );

  // Executar verificação técnica sob demanda
  const handleRunVerification = async () => {
    setIsVerifyingBatch(true);
    setVerificationFeedback('Iniciando auditoria técnica de disponibilidade das mídias...');

    let availableCount = 0;
    let brokenCount = 0;
    let noMediaCount = 0;

    for (const ex of exercises) {
      const result = await verifyExerciseMedia(ex);
      updateExerciseAvailability(ex.id, result.availability, result.details);
      if (result.availability === 'disponivel') availableCount++;
      else if (result.availability === 'indisponivel') brokenCount++;
      else if (result.availability === 'sem_midia') noMediaCount++;
    }

    setAuditRecords(getStoredAuditRecords());
    setIsVerifyingBatch(false);
    setVerificationFeedback(
      `Verificação concluída: ${availableCount} disponíveis, ${brokenCount} com erro comprovado, ${noMediaCount} sem mídia.`
    );
    setTimeout(() => setVerificationFeedback(null), 5000);
  };

  // Verificação individual
  const handleVerifySingle = async (ex: CentralExercise) => {
    const res = await verifyExerciseMedia(ex);
    updateExerciseAvailability(ex.id, res.availability, res.details);
    setAuditRecords(getStoredAuditRecords());
  };

  // Abrir modal de revisão
  const handleOpenReview = (ex: CentralExercise) => {
    const rec = auditRecords[ex.id] || getOrCreateAuditRecord(ex, auditRecords);
    setReviewNotes(rec.reviewNotes || '');
    setReviewingExercise(ex);
  };

  // Salvar decisão do treinador com identidade autenticada
  const handleDecision = (status: BiomechanicalStatus) => {
    if (!reviewingExercise) return;
    const session = getStoredSession();
    const currentReviewer = (session?.user?.nome && session.user.nome.trim()) || 'Personal Trainer Autorizado';
    recordBiomechanicalReview({
      exerciseId: reviewingExercise.id,
      status,
      reviewerName: currentReviewer,
      notes: reviewNotes.trim() || undefined
    });
    setReviewingExercise(null);
    refreshData();
  };

  // Exportar Backup Completo com SHA-256
  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    setBackupExportNotice(null);
    try {
      const session = getStoredSession();
      const res = await downloadBackupAsJsonFile(session?.user?.nome);
      setBackupExportNotice(`Backup exportado com sucesso: ${res.filename} (Hash SHA-256 gerado).`);
      setTimeout(() => setBackupExportNotice(null), 6000);
    } catch (err: any) {
      alert(`Erro ao exportar backup: ${err.message}`);
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Seleção de arquivo de backup para restauração
  const handleFileSelectForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFileName(file.name);
    setRestoreFeedback(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setRestoreFileContent(content);
      const validation = await validateBackupPackage(content);
      setRestoreValidation(validation);
    };
    reader.readAsText(file);
  };

  // Executar restauração
  const handleExecuteRestore = async () => {
    if (!restoreFileContent) return;
    setIsRestoring(true);
    setRestoreFeedback(null);
    try {
      const res = await restoreFullAdministrativeBackup(restoreFileContent);
      setRestoreFeedback({ success: true, message: res.message });
      refreshData();
      setTimeout(() => {
        setShowRestoreModal(false);
        setRestoreFileContent(null);
        setRestoreValidation(null);
        setRestoreFeedback(null);
      }, 2000);
    } catch (err: any) {
      setRestoreFeedback({ success: false, message: err.message });
    } finally {
      setIsRestoring(false);
    }
  };

  // Abrir Modal de Nuvem / Supabase
  const handleOpenCloudModal = async () => {
    setShowCloudModal(true);
    setIsTestingCloud(true);
    setMigrationReport(null);
    try {
      const status = await testSupabaseConnection();
      setCloudStatus(status);
    } catch (e: any) {
      setCloudStatus({ connected: false, url: null, message: e.message, hasTables: false, hasStorageBucket: false });
    } finally {
      setIsTestingCloud(false);
    }
  };

  // Executar migração para Supabase
  const handleExecuteCloudMigration = async () => {
    setIsMigratingCloud(true);
    try {
      const report = await runIdempotentCloudMigration();
      setMigrationReport(report);
    } catch (err: any) {
      alert(`Erro na migração: ${err.message}`);
    } finally {
      setIsMigratingCloud(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO DA AUDITORIA & BOTÕES DE AÇÃO SUPERIOR                       */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Auditoria Profissional
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Central de Controle & Garantia Técnica
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Auditoria da Biblioteca de Exercícios
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitore a conformidade biomecânica e a disponibilidade técnica de cada demonstração. Separação rigorosa entre validação profissional e integridade de arquivo.
            </p>
          </div>

          {/* Botões de Ação Global da Auditoria */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunVerification}
              disabled={isVerifyingBatch}
              className="min-h-[42px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700 active:scale-95 shadow-sm"
              title="Executar verificação não destrutiva da disponibilidade técnica das mídias"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isVerifyingBatch ? 'animate-spin' : ''}`} />
              <span>{isVerifyingBatch ? 'Verificando...' : 'Verificar Mídias'}</span>
            </button>

            {/* Botão de Backup Completo */}
            <button
              onClick={handleExportBackup}
              disabled={isExportingBackup}
              className="min-h-[42px] px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 shadow-sm"
              title="Exportar arquivo JSON com backup completo de treinos, relações, auditorias e arquivos do IndexedDB com SHA-256"
            >
              <Download className={`w-3.5 h-3.5 text-emerald-400 ${isExportingBackup ? 'animate-bounce' : ''}`} />
              <span>{isExportingBackup ? 'Gerando Backup...' : 'Backup Completo (JSON)'}</span>
            </button>

            {/* Botão de Restaurar Backup */}
            <button
              onClick={() => {
                setShowRestoreModal(true);
                setRestoreFileContent(null);
                setRestoreValidation(null);
                setRestoreFeedback(null);
              }}
              className="min-h-[42px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700 active:scale-95 shadow-sm"
              title="Restaurar backup com validação de contagens e integridade sem perda de dados"
            >
              <FileUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Restaurar Backup</span>
            </button>

            {/* Botão de Status e Migração Supabase */}
            <button
              onClick={handleOpenCloudModal}
              className="min-h-[42px] px-3.5 py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 shadow-sm"
              title="Verificar status da conexão com Supabase e executar migração idempotente"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Nuvem & Supabase</span>
            </button>

            <button
              onClick={() => exportAuditToCSV(exercises, auditRecords, filteredExercises)}
              className="min-h-[42px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700 active:scale-95 shadow-sm"
              title="Exportar planilha CSV compatível com Excel e Google Sheets com todos os dados da auditoria"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>CSV</span>
            </button>

            {onSwitchToCatalogManager && (
              <button
                onClick={onSwitchToCatalogManager}
                className="min-h-[42px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md shadow-emerald-950 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gerenciar</span>
              </button>
            )}
          </div>
        </div>

        {/* Notificação de Exportação de Backup */}
        {backupExportNotice && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{backupExportNotice}</span>
          </div>
        )}

        {/* Feedback de Verificação */}
        {verificationFeedback && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{verificationFeedback}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. INDICADORES COM CONTAGENS REAIS & ATUALIZAÇÃO AUTOMÁTICA               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total de Exercícios */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
            <Layers className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{metrics.totalExercises}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {metrics.usedCount} em treinos • {metrics.unusedCount} sem uso
          </div>
        </div>

        {/* Demonstrações Validadas */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Validadas</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{metrics.validatedCount}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 font-bold">
            {metrics.approvedPercent}% da biblioteca
          </div>
        </div>

        {/* Pendentes de Revisão */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pendentes</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{metrics.pendingCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">
            Aguardando avaliação
          </div>
        </div>

        {/* Sem Demonstração */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sem Mídia</span>
            <VideoOff className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-400">{metrics.noMediaCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Sem arquivo ou link
          </div>
        </div>

        {/* Mídia com Problema Comprovado */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Com Falha</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">{metrics.brokenMediaCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-0.5 font-bold">
            {metrics.brokenMediaCount === 0 ? 'Nenhuma falha ativa' : 'Exige correção'}
          </div>
        </div>

        {/* Cobertura de Mídia */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cobertura</span>
            <Film className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-300">{metrics.mediaCoveragePercent}%</div>
          <div className="text-[10px] text-teal-400/80 mt-0.5 font-bold">
            {metrics.totalWorkoutsLinked} vínculos em 72 treinos
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SELETOR DE MODO: TABELA COMPLETA OU PRIORIDADES DE CORREÇÃO            */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveAuditView('table')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeAuditView === 'table'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tabela Geral de Auditoria ({filteredExercises.length})</span>
          </button>

          <button
            onClick={() => setActiveAuditView('priorities')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeAuditView === 'priorities'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>Prioridades de Correção ({priorities.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          {activeAuditView === 'table' ? 'Visão detalhada por exercício' : 'Fila inteligente ordenada por impacto'}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 4. VISÃO A: PRIORIDADES DE CORREÇÃO INTELIGENTES                          */}
      {/* ========================================================================= */}
      {activeAuditView === 'priorities' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Fila Inteligente de Prioridades ({priorities.length} pendências mapeadas)
                </h4>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Os exercícios com pendências reais são ordenados pelo impacto no catálogo (quantidade de treinos que contêm o exercício, ausência de mídia e necessidade de validação biomecânica formal).
                </p>
              </div>
            </div>
          </div>

          {priorities.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Nenhuma pendência crítica encontrada!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Todas as demonstrações ativas estão validadas biomecanicamente e disponíveis.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorities.map((item, index) => {
                const ex = item.exercise;
                const rec = item.auditRecord;

                // Converte para Exercise temporário para preview
                const exForPreview: Exercise = {
                  id: ex.id,
                  name: ex.name,
                  muscleGroup: ex.muscleGroup,
                  sets: '3',
                  reps: '10',
                  rest: '60s',
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
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {/* Posição no Ranking */}
                        <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          #{index + 1}
                        </span>

                        {/* Nível de Prioridade */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.priorityLevel === 'alta' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          item.priorityLevel === 'media' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          Prioridade {item.priorityLevel}
                        </span>

                        {/* Formato de Mídia */}
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                          {rec.mediaFormat.toUpperCase()}
                        </span>

                        {/* Músculo */}
                        <span className="text-[10px] text-slate-400">
                          {ex.muscleGroup} • {ex.equipment}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <h4 className="text-sm sm:text-base font-black text-white">{ex.name}</h4>
                        {ex.nameEn && <span className="text-xs text-slate-400 italic">({ex.nameEn})</span>}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{item.justification}</span>
                      </p>
                    </div>

                    {/* Botões de Ação Imediata */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <button
                        onClick={() => onPreviewExerciseVideo(exForPreview)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                        title="Visualizar demonstração atual"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ver Mídia</span>
                      </button>

                      <button
                        onClick={() => handleOpenReview(ex)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-950 active:scale-95"
                        title="Revisar e registrar aprovação biomecânica"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Revisar</span>
                      </button>

                      <button
                        onClick={() => onOpenEditExercise(ex, 'upload')}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                        title="Substituir mídia por arquivo ou link"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-400" />
                        <span>Substituir</span>
                      </button>

                      {item.workoutCount > 0 && (
                        <button
                          onClick={() => setViewingLinkedWorkouts({ exercise: ex, workouts: item.linkedWorkouts })}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition flex items-center gap-1"
                          title="Ver treinos do catálogo que usam este exercício"
                        >
                          <span>{item.workoutCount} treinos</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VISÃO B: TABELA GERAL DE AUDITORIA COM FILTROS COMBINADOS              */}
      {/* ========================================================================= */}
      {activeAuditView === 'table' && (
        <div className="space-y-4">
          {/* Barra de Filtros Combinados */}
          <div className="space-y-3 bg-slate-900/70 border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
            {/* Campo de Busca em Tempo Real */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome do exercício, sinônimo em inglês, ID canônico, músculo ou equipamento..."
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

            {/* 5 Controles de Filtragem Combinados */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
              {/* Validação Biomecânica */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Status Biomecânico:</label>
                <select
                  value={filterBiomech}
                  onChange={(e) => setFilterBiomech(e.target.value)}
                  className="w-full min-h-[38px] px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="validado">● Validado</option>
                  <option value="pendente_revisao">▲ Pendente de Revisão</option>
                  <option value="sem_avaliacao">○ Sem Avaliação</option>
                </select>
              </div>

              {/* Disponibilidade da Mídia */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Disponibilidade Técnica:</label>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full min-h-[38px] px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="todos">Todas as Disponibilidades</option>
                  <option value="disponivel">✓ Disponível</option>
                  <option value="indisponivel">✗ Indisponível / Com Erro</option>
                  <option value="sem_midia">○ Sem Mídia</option>
                  <option value="nao_verificado">? Não Verificado</option>
                </select>
              </div>

              {/* Formato da Mídia */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Formato da Mídia:</label>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="w-full min-h-[38px] px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="todos">Todos os Formatos</option>
                  <option value="gif">GIF Animado (.gif)</option>
                  <option value="webp">WebP Animado (.webp)</option>
                  <option value="mp4">Vídeo MP4 (.mp4)</option>
                  <option value="youtube">YouTube Embed</option>
                  <option value="vimeo">Vimeo Embed</option>
                  <option value="nenhum">Sem Mídia</option>
                </select>
              </div>

              {/* Grupo Muscular */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Grupo Muscular:</label>
                <select
                  value={filterMuscle}
                  onChange={(e) => setFilterMuscle(e.target.value)}
                  className="w-full min-h-[38px] px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="todos">Todos os Grupos ({muscleGroups.length})</option>
                  {muscleGroups.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Vínculo em Treinos */}
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Uso no Catálogo:</label>
                <select
                  value={filterUsage}
                  onChange={(e) => setFilterUsage(e.target.value)}
                  className="w-full min-h-[38px] px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="todos">Todos os Exercícios</option>
                  <option value="com_treinos">Presentes em Treinos ({metrics.usedCount})</option>
                  <option value="sem_treinos">Sem Utilização ({metrics.unusedCount})</option>
                </select>
              </div>
            </div>

            {/* Sumário e Botão Limpar Filtros */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div>
                Mostrando <strong>{filteredExercises.length}</strong> de {exercises.length} exercícios
                {hasActiveFilters && <span className="text-emerald-400 font-bold"> (filtros ativos)</span>}
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
          {/* TABELA RESPONSIVA (DESKTOP) & CARDS COMPACTOS (MOBILE)                    */}
          {/* ========================================================================= */}
          {filteredExercises.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <VideoOff className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Nenhum exercício encontrado</h3>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                Nenhum exercício corresponde aos filtros e termos de busca selecionados.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <>
              {/* Tabela Desktop (md+) */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                      <th className="py-3 px-3.5">Exercício</th>
                      <th className="py-3 px-3">Músculo / Equip.</th>
                      <th className="py-3 px-2.5">Formato</th>
                      <th className="py-3 px-3">Status Biomecânico</th>
                      <th className="py-3 px-3">Disponibilidade</th>
                      <th className="py-3 px-2.5 text-center">Treinos</th>
                      <th className="py-3 px-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredExercises.map(ex => {
                      const rec = auditRecords[ex.id] || getOrCreateAuditRecord(ex, auditRecords);
                      const workoutCount = usageCountMap.get(ex.id) || 0;
                      const isVal = rec.biomechanicalStatus === 'validado';
                      const isPend = rec.biomechanicalStatus === 'pendente_revisao';

                      const exForPreview: Exercise = {
                        id: ex.id,
                        name: ex.name,
                        muscleGroup: ex.muscleGroup,
                        sets: '3',
                        reps: '10',
                        rest: '60s',
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
                        <tr key={ex.id} className="hover:bg-slate-850/60 transition">
                          {/* Nome e ID */}
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-white leading-snug">{ex.name}</div>
                            {ex.nameEn && (
                              <div className="text-[11px] text-slate-400 italic line-clamp-1">{ex.nameEn}</div>
                            )}
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">{ex.id}</div>
                          </td>

                          {/* Músculo e Equipamento */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-200">{ex.muscleGroup}</div>
                            <div className="text-[11px] text-slate-400">{ex.equipment}</div>
                          </td>

                          {/* Formato */}
                          <td className="py-3 px-2.5">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                              {rec.mediaFormat.toUpperCase()}
                            </span>
                          </td>

                          {/* Status Biomecânico */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              {isVal ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Validado</span>
                                </span>
                              ) : isPend ? (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Pendente</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                                  Sem Avaliação
                                </span>
                              )}
                            </div>
                            {rec.isLegacyApproval && (
                              <div className="text-[10px] text-amber-400/90 mt-1 italic leading-tight">
                                Aprovação legada, origem não documentada
                              </div>
                            )}
                            {rec.reviewerName && !rec.isLegacyApproval && (
                              <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                                Por {rec.reviewerName}
                              </div>
                            )}
                          </td>

                          {/* Disponibilidade Técnica */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              {rec.mediaAvailability === 'disponivel' ? (
                                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Disponível</span>
                                </span>
                              ) : rec.mediaAvailability === 'indisponivel' ? (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Indisponível</span>
                                </span>
                              ) : rec.mediaAvailability === 'sem_midia' ? (
                                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                  Sem Mídia
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  <span>Não Verificado</span>
                                </span>
                              )}
                            </div>
                            {rec.mediaAvailabilityDetails && (
                              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1" title={rec.mediaAvailabilityDetails}>
                                {rec.mediaAvailabilityDetails}
                              </div>
                            )}
                          </td>

                          {/* Treinos Vinculados */}
                          <td className="py-3 px-2.5 text-center">
                            {workoutCount > 0 ? (
                              <button
                                onClick={() => setViewingLinkedWorkouts({ exercise: ex, workouts: getExerciseWorkoutRelations(ex.id) })}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold hover:underline"
                                title="Ver quais treinos usam este exercício"
                              >
                                {workoutCount} {workoutCount === 1 ? 'treino' : 'treinos'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">Sem uso</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onPreviewExerciseVideo(exForPreview)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Visualizar reprodução no player"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-400" />
                              </button>

                              <button
                                onClick={() => handleOpenReview(ex)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1"
                                title="Registrar decisão profissional de revisão biomecânica"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Revisar</span>
                              </button>

                              <button
                                onClick={() => onOpenEditExercise(ex, 'upload')}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Substituir mídia"
                              >
                                <Upload className="w-3.5 h-3.5 text-teal-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile (< md) */}
              <div className="md:hidden space-y-3">
                {filteredExercises.map(ex => {
                  const rec = auditRecords[ex.id] || getOrCreateAuditRecord(ex, auditRecords);
                  const workoutCount = usageCountMap.get(ex.id) || 0;
                  const isVal = rec.biomechanicalStatus === 'validado';
                  const isPend = rec.biomechanicalStatus === 'pendente_revisao';

                  const exForPreview: Exercise = {
                    id: ex.id,
                    name: ex.name,
                    muscleGroup: ex.muscleGroup,
                    sets: '3',
                    reps: '10',
                    rest: '60s',
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
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                            <span className="font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {rec.mediaFormat.toUpperCase()}
                            </span>
                            <span className="text-slate-400 font-semibold">{ex.muscleGroup}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{ex.equipment}</span>
                          </div>
                          <h4 className="text-sm font-black text-white mt-1 leading-snug">{ex.name}</h4>
                          {ex.nameEn && <p className="text-[11px] text-slate-400 italic">{ex.nameEn}</p>}
                        </div>

                        {workoutCount > 0 ? (
                          <button
                            onClick={() => setViewingLinkedWorkouts({ exercise: ex, workouts: getExerciseWorkoutRelations(ex.id) })}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 shrink-0"
                          >
                            {workoutCount} treinos
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-850 px-1.5 py-0.5 rounded shrink-0">
                            Sem uso
                          </span>
                        )}
                      </div>

                      {/* Status Row */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block uppercase font-bold">Validação:</span>
                          <span className={`font-bold mt-0.5 inline-block ${
                            isVal ? 'text-emerald-400' : isPend ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {isVal ? '● Validado' : isPend ? '▲ Pendente' : '○ Sem Avaliação'}
                          </span>
                          {rec.isLegacyApproval && (
                            <span className="block text-[9px] text-amber-400/80 italic mt-0.5">
                              Aprovação legada
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-500 block uppercase font-bold">Disponibilidade:</span>
                          <span className={`font-bold mt-0.5 inline-block ${
                            rec.mediaAvailability === 'disponivel' ? 'text-teal-400' :
                            rec.mediaAvailability === 'indisponivel' ? 'text-rose-400' :
                            'text-slate-400'
                          }`}>
                            {rec.mediaAvailability === 'disponivel' ? '✓ Disponível' :
                             rec.mediaAvailability === 'indisponivel' ? '✗ Com Falha' :
                             rec.mediaAvailability === 'sem_midia' ? 'Sem Mídia' : '? Não Verificado'}
                          </span>
                        </div>
                      </div>

                      {/* Botões Mobile (Touch Targets >= 44px) */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => onPreviewExerciseVideo(exForPreview)}
                          className="min-h-[44px] px-2 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mídia</span>
                        </button>

                        <button
                          onClick={() => handleOpenReview(ex)}
                          className="min-h-[44px] px-2 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-emerald-950"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Revisar</span>
                        </button>

                        <button
                          onClick={() => onOpenEditExercise(ex, 'upload')}
                          className="min-h-[44px] px-2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 border border-slate-700"
                        >
                          <Upload className="w-3.5 h-3.5 text-teal-400" />
                          <span>Substituir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE REVISÃO PROFISSIONAL (PERSONAL TRAINER AUTORIZADO)            */}
      {/* ========================================================================= */}
      {reviewingExercise && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Revisão Biomecânica da Demonstração
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Exercício: <strong className="text-white">{reviewingExercise.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingExercise(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Preview Rápido */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Mídia Cadastrada</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {reviewingExercise.videoUrl || reviewingExercise.youtubeId || reviewingExercise.vimeoId || 'Nenhuma mídia configurada'}
                  </span>
                </div>
                <button
                  onClick={() => onPreviewExerciseVideo({
                    id: reviewingExercise.id,
                    name: reviewingExercise.name,
                    muscleGroup: reviewingExercise.muscleGroup,
                    sets: '3',
                    reps: '10',
                    rest: '60s',
                    instructions: reviewingExercise.instructions,
                    cautions: reviewingExercise.cautions,
                    videoUrl: reviewingExercise.videoUrl,
                    fallbackMediaUrl: reviewingExercise.fallbackMediaUrl,
                    youtubeId: reviewingExercise.youtubeId,
                    vimeoId: reviewingExercise.vimeoId,
                    mediaType: reviewingExercise.mediaType,
                    videoValidationStatus: reviewingExercise.videoValidationStatus
                  })}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Reproduzir Demonstração</span>
                </button>
              </div>

              {/* Informações Técnicas */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Grupo Muscular</span>
                    <span className="font-bold text-white">{reviewingExercise.muscleGroup}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Equipamento</span>
                    <span className="font-bold text-white">{reviewingExercise.equipment}</span>
                  </div>
                </div>

                {reviewingExercise.instructions && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-400 block text-[10px] uppercase mb-0.5">Instruções Biomecânicas:</strong>
                    {reviewingExercise.instructions}
                  </div>
                )}

                {reviewingExercise.cautions && (
                  <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
                    <strong className="text-amber-300 block text-[10px] uppercase mb-0.5">Cuidados Articulares 40+:</strong>
                    {reviewingExercise.cautions}
                  </div>
                )}
              </div>

              {/* Campo de Observações do Revisor */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Observações Técnicas / Parecer do Personal Trainer (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Ex: Execução impecável no plano escapular / Ajustar cotovelos na descida..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Botões de Decisão Explícita */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecision('validado')}
                    className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar Demonstração</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('pendente_revisao')}
                    className="min-h-[44px] px-3 py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-950"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Manter Pendente</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const ex = reviewingExercise;
                    setReviewingExercise(null);
                    onOpenEditExercise(ex, 'upload');
                  }}
                  className="w-full min-h-[40px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  <span>Substituir Mídia Atual (Upload / Links)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: TREINOS VINCULADOS AO EXERCÍCIO                                 */}
      {/* ========================================================================= */}
      {viewingLinkedWorkouts && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Treinos Vinculados</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{viewingLinkedWorkouts.exercise.name}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingLinkedWorkouts(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
              <p className="text-[11px] text-slate-400 mb-2">
                Este exercício está presente em <strong>{viewingLinkedWorkouts.workouts.length}</strong> treinos do catálogo 40+:
              </p>
              {viewingLinkedWorkouts.workouts.map((w, idx) => (
                <div key={`${w.id}-${idx}`} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-white text-xs">{w.title}</span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">{w.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                    <span>Ordem: #{w.order}</span>
                    <span>•</span>
                    <span>Séries: {w.sets}</span>
                    <span>•</span>
                    <span>Reps: {w.reps}</span>
                    <span>•</span>
                    <span>Descanso: {w.rest}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setViewingLinkedWorkouts(null)}
                className="min-h-[36px] px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: RESTAURAÇÃO DE BACKUP COM VALIDAÇÃO DE INTEGRIDADE             */}
      {/* ========================================================================= */}
      {showRestoreModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Restaurar Backup Administrativo</h3>
                  <p className="text-xs text-slate-400">Importação segura com verificação de integridade e SHA-256</p>
                </div>
              </div>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              {/* Seleção do Arquivo */}
              <div className="space-y-1.5">
                <label className="text-slate-200 font-bold block text-xs">
                  Selecione o arquivo de backup (.json):
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelectForRestore}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer bg-slate-950 p-2 rounded-2xl border border-slate-800"
                />
              </div>

              {/* Relatório de Validação */}
              {restoreValidation && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs">Diagnóstico do Pacote:</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      restoreValidation.isValid 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {restoreValidation.isValid ? '✓ Pacote Válido' : '✗ Pacote com Erros'}
                    </span>
                  </div>

                  {restoreValidation.exportedAt && (
                    <div className="text-[11px] text-slate-400">
                      Exportado em: <strong className="text-slate-300">{new Date(restoreValidation.exportedAt).toLocaleString('pt-BR')}</strong>
                    </div>
                  )}

                  {/* Checklist de Contagens */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Treinos:</span>
                      <strong className="text-white text-xs">{restoreValidation.counts.catalogWorkouts}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Exercícios:</span>
                      <strong className="text-white text-xs">{restoreValidation.counts.centralExercises}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Vínculos:</span>
                      <strong className="text-white text-xs">{restoreValidation.counts.workoutRelations}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Auditorias:</span>
                      <strong className="text-white text-xs">{restoreValidation.counts.auditRecords}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Mídias IndexedDB:</span>
                      <strong className="text-white text-xs">{restoreValidation.counts.indexedDbFiles}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Alunos Salvos:</span>
                      <strong className="text-white text-xs">{restoreValidation.counts.savedStudents}</strong>
                    </div>
                  </div>

                  {/* Avisos */}
                  {restoreValidation.warnings.length > 0 && (
                    <div className="space-y-1 text-[11px] text-amber-300 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
                      <strong className="block font-bold">Observações:</strong>
                      {restoreValidation.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Erros Fatais */}
                  {restoreValidation.errors.length > 0 && (
                    <div className="space-y-1 text-[11px] text-rose-300 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/20">
                      <strong className="block font-bold">Erros que impedem a restauração:</strong>
                      {restoreValidation.errors.map((e, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span>✗</span>
                          <span>{e}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback pós-restauração */}
              {restoreFeedback && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  restoreFeedback.success
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}>
                  {restoreFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                  <span>{restoreFeedback.message}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!restoreValidation?.isValid || isRestoring}
                onClick={handleExecuteRestore}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-blue-950 active:scale-95"
              >
                <FileUp className="w-4 h-4" />
                <span>{isRestoring ? 'Restaurando...' : 'Confirmar e Restaurar Backup'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: NUVEM & MIGRAÇÃO SEGURA PARA SUPABASE                           */}
      {/* ========================================================================= */}
      {showCloudModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Integração e Migração para Supabase</h3>
                  <p className="text-xs text-slate-400">Persistência permanente na nuvem com PostgreSQL, RLS e Storage</p>
                </div>
              </div>
              <button
                onClick={() => setShowCloudModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              {/* Diagnóstico da Conexão */}
              {isTestingCloud ? (
                <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Testando conectividade com o Supabase...</span>
                </div>
              ) : cloudStatus && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Status da Infraestrutura:</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      cloudStatus.connected && cloudStatus.hasTables
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : cloudStatus.connected
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {cloudStatus.connected && cloudStatus.hasTables 
                        ? '✓ Conectado e Pronto' 
                        : cloudStatus.connected 
                        ? '⚠ Conectado (Tabelas Ausentes)' 
                        : '✗ Supabase Desconectado'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {cloudStatus.message}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Tabelas Relacionais:</span>
                      <strong className={cloudStatus.hasTables ? 'text-emerald-400' : 'text-amber-400'}>
                        {cloudStatus.hasTables ? 'Detectadas no Postgres' : 'Pendente de Script DDL'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Bucket 'exercise-media':</span>
                      <strong className={cloudStatus.hasStorageBucket ? 'text-emerald-400' : 'text-amber-400'}>
                        {cloudStatus.hasStorageBucket ? 'Pronto para Uploads' : 'Pendente no Storage'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Migração Idempotente quando conectado */}
              {cloudStatus?.connected && cloudStatus?.hasTables && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <CloudUpload className="w-4 h-4 text-purple-400" />
                    <span>Sincronização Idempotente com a Nuvem</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Esta operação envia com segurança os 72 treinos, 251 vínculos, 46 exercícios, arquivos de mídia do IndexedDB e registros de auditoria para o Supabase. Dados já existentes serão atualizados (UPSERT) sem duplicidade. As cópias locais serão preservadas intactas.
                  </p>
                  <button
                    type="button"
                    disabled={isMigratingCloud}
                    onClick={handleExecuteCloudMigration}
                    className="min-h-[42px] px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-950 active:scale-95"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>{isMigratingCloud ? 'Sincronizando com o Supabase...' : 'Executar Migração Idempotente'}</span>
                  </button>
                </div>
              )}

              {/* Relatório de Migração */}
              {migrationReport && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Resultado da Migração:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      migrationReport.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {migrationReport.success ? 'Concluída com Sucesso' : 'Finalizada com Alertas'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Treinos:</span>
                      <strong className="text-white text-xs">{migrationReport.counts.workoutsUploaded}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Exercícios:</span>
                      <strong className="text-white text-xs">{migrationReport.counts.exercisesUploaded}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Vínculos:</span>
                      <strong className="text-white text-xs">{migrationReport.counts.relationsUploaded}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Auditorias:</span>
                      <strong className="text-white text-xs">{migrationReport.counts.auditRecordsUploaded}</strong>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] pt-1">
                    {migrationReport.steps.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                        <span className="text-slate-400">{st.step}</span>
                        <span className={`font-bold text-[10px] ${
                          st.status === 'success' ? 'text-emerald-400' : st.status === 'failed' ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {st.details || st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guia de Configuração e Script DDL */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">Script DDL Oficial com Políticas RLS:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_DDL_SCRIPT);
                      setCopiedCloudSql(true);
                      setTimeout(() => setCopiedCloudSql(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1.5 shadow"
                  >
                    {copiedCloudSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCloudSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Para provisionar a persistência na nuvem, cole este script no <strong>SQL Editor</strong> do painel do seu projeto Supabase. Ele cria as tabelas de catálogo, auditoria, bucket de mídias e políticas de segurança RLS (leitura pública, escrita exclusiva para <code className="text-emerald-400 font-mono">app_role IN ('trainer', 'admin')</code>).
                </p>

                <pre className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-400 overflow-x-auto max-h-48 whitespace-pre leading-relaxed">
                  {SUPABASE_SQL_DDL_SCRIPT}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowCloudModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
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
