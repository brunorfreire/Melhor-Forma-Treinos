import React, { useState, useMemo, useEffect } from 'react';
import { 
  CatalogWorkout, 
  WorkoutCollectionCategory, 
  WorkoutLevel, 
  WorkoutStatus, 
  WorkoutPlan, 
  CentralExercise, 
  WorkoutExerciseItem 
} from '../../types';
import { CATALOG_COLLECTIONS } from '../../data/catalogWorkouts';
import { 
  getAllCatalogWorkouts, 
  saveAllCatalogWorkouts, 
  updateWorkoutStatus, 
  duplicateWorkout, 
  convertCatalogWorkoutToWorkoutPlan, 
  getHydratedWorkout, 
  getAllCentralExercises, 
  getAllWorkoutExerciseItems, 
  saveAllWorkoutExerciseItems,
  resetCatalogToDefaults,
  updateWorkoutAccessLevel
} from '../../data/workoutCatalogService';
import { 
  Play, 
  Copy, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Dumbbell, 
  X, 
  Eye, 
  Layers, 
  Activity, 
  Heart, 
  Scale,
  RotateCcw,
  Crown,
  Lock,
  Unlock
} from 'lucide-react';

interface TrainerCatalogTabProps {
  onStartTestWorkout: (plan: WorkoutPlan) => void;
  onPreviewExerciseVideo: (ex: any) => void;
  initialWorkoutId?: string;
}

export const TrainerCatalogTab: React.FC<TrainerCatalogTabProps> = ({
  onStartTestWorkout,
  onPreviewExerciseVideo,
  initialWorkoutId
}) => {
  const [workouts, setWorkouts] = useState<CatalogWorkout[]>(() => getAllCatalogWorkouts());
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedAccess, setSelectedAccess] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Edição de Sessão
  const [editingWorkout, setEditingWorkout] = useState<CatalogWorkout | null>(null);
  const [workoutRelations, setWorkoutRelations] = useState<WorkoutExerciseItem[]>([]);
  const [showAddExerciseToWorkout, setShowAddExerciseToWorkout] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const centralExercises = useMemo(() => getAllCentralExercises(), []);

  // Recarregar treinos
  const refreshWorkouts = () => {
    setWorkouts(getAllCatalogWorkouts());
  };

  // Métricas
  const totalCount = workouts.length;
  const publishedCount = workouts.filter(w => w.status === 'publicado').length;
  const reviewCount = workouts.filter(w => w.status === 'revisao').length;
  const draftCount = workouts.filter(w => w.status === 'rascunho').length;
  const freeCount = workouts.filter(w => w.accessLevel === 'free').length;
  const premiumCount = workouts.filter(w => w.accessLevel === 'premium').length;

  // Filtragem
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      if (selectedCategory !== 'todos' && w.category !== selectedCategory) return false;
      if (selectedLevel !== 'todos' && w.level !== selectedLevel) return false;
      if (selectedStatus !== 'todos' && w.status !== selectedStatus) return false;
      if (selectedAccess !== 'todos' && w.accessLevel !== selectedAccess) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = w.title.toLowerCase().includes(q);
        const matchesDesc = w.description.toLowerCase().includes(q);
        const matchesObj = w.objective.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesObj) return false;
      }
      return true;
    });
  }, [workouts, selectedCategory, selectedLevel, selectedStatus, selectedAccess, searchTerm]);

  // Alternar status de publicação com 1 clique
  const handleTogglePublish = (workout: CatalogWorkout) => {
    const nextStatus: WorkoutStatus = workout.status === 'publicado' ? 'rascunho' : 'publicado';
    updateWorkoutStatus(workout.id, nextStatus);
    refreshWorkouts();
  };

  // Alternar nível de acesso (Gratuito / Premium) com 1 clique
  const handleToggleAccessLevel = (workout: CatalogWorkout) => {
    const nextAccess = workout.accessLevel === 'free' ? 'premium' : 'free';
    updateWorkoutAccessLevel(workout.id, nextAccess);
    refreshWorkouts();
  };

  // Duplicar sessão
  const handleDuplicate = (workoutId: string) => {
    duplicateWorkout(workoutId);
    refreshWorkouts();
  };

  // Abrir editor de sessão
  const handleOpenEditModal = (workout: CatalogWorkout) => {
    setEditingWorkout({ ...workout });
    const allRelations = getAllWorkoutExerciseItems();
    const relations = allRelations
      .filter(r => r.workoutId === workout.id)
      .sort((a, b) => a.order - b.order);
    setWorkoutRelations(relations);
  };

  // Abre imediatamente o treino escolhido na Central de Curadoria.
  useEffect(() => {
    if (!initialWorkoutId) return;
    const target = getAllCatalogWorkouts().find(workout => workout.id === initialWorkoutId);
    if (target) handleOpenEditModal(target);
  }, [initialWorkoutId]);

  // Salvar alterações da sessão
  const handleSaveWorkoutEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;

    const allWorkouts = getAllCatalogWorkouts();
    const index = allWorkouts.findIndex(w => w.id === editingWorkout.id);
    if (index !== -1) {
      allWorkouts[index] = {
        ...editingWorkout,
        updatedAt: new Date().toISOString()
      };
      saveAllCatalogWorkouts(allWorkouts);
    }

    // Salvar relações de exercícios
    const allRelations = getAllWorkoutExerciseItems();
    const filteredOther = allRelations.filter(r => r.workoutId !== editingWorkout.id);
    saveAllWorkoutExerciseItems([...filteredOther, ...workoutRelations]);

    setEditingWorkout(null);
    refreshWorkouts();
  };

  // Adicionar exercício da biblioteca central ao treino editado
  const handleAddExerciseRel = (exId: string) => {
    if (!editingWorkout) return;
    const newOrder = workoutRelations.length + 1;
    const newItem: WorkoutExerciseItem = {
      workoutId: editingWorkout.id,
      exerciseId: exId,
      order: newOrder,
      sets: '3',
      reps: '10 a 12',
      rest: '60s',
      load: 'Carga moderada',
      notes: ''
    };
    setWorkoutRelations(prev => [...prev, newItem]);
    setShowAddExerciseToWorkout(false);
  };

  // Remover exercício do treino editado
  const handleRemoveExerciseRel = (index: number) => {
    setWorkoutRelations(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  // Mover exercício (ordem)
  const handleMoveExerciseRel = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workoutRelations.length) return;

    setWorkoutRelations(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  // Atualizar campo de repetição/série na relação
  const handleUpdateRelField = (index: number, field: keyof WorkoutExerciseItem, value: string) => {
    setWorkoutRelations(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Restaurar aos padrões de fábrica
  const handleResetFactory = () => {
    resetCatalogToDefaults();
    refreshWorkouts();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Métricas do Catálogo de 72 Treinos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Arquitetura de Catálogo
              </span>
              <span className="text-xs font-bold text-slate-400">
                6 Coleções • 72 Sessões
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight">
              Gestão de Treinos Sob Demanda
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Publique apenas as sessões aprovadas tecnicamente. As sessões em rascunho permanecem restritas à área do treinador.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center bg-slate-950 p-2 rounded-xl border border-slate-800/80 shrink-0">
            <div className="px-1.5 sm:px-2">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
              <span className="text-xs sm:text-sm font-black text-white">{totalCount}</span>
            </div>
            <div className="px-1.5 sm:px-2 border-l border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-emerald-400 uppercase font-semibold block">Grátis</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">{freeCount}</span>
            </div>
            <div className="px-1.5 sm:px-2 border-l border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-amber-400 uppercase font-semibold block">Premium</span>
              <span className="text-xs sm:text-sm font-black text-amber-400">{premiumCount}</span>
            </div>
            <div className="px-1.5 sm:px-2 border-l border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-teal-400 uppercase font-semibold block">Publicados</span>
              <span className="text-xs sm:text-sm font-black text-teal-400">{publishedCount}</span>
            </div>
            <div className="px-1.5 sm:px-2 border-l border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block">Rascunho</span>
              <span className="text-xs sm:text-sm font-black text-slate-400">{draftCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por título, objetivo ou equipamento..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Coleções Filter Chips */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
            Coleção:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === 'todos'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Todas (72)
            </button>
            {CATALOG_COLLECTIONS.map(col => (
              <button
                key={col.id}
                onClick={() => setSelectedCategory(col.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === col.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {col.name} ({workouts.filter(w => w.category === col.id).length || 12})
              </button>
            ))}
          </div>
        </div>

        {/* Nível e Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Nível:</span>
            {['todos', 'iniciante', 'intermediario', 'avancado'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                  selectedLevel === lvl
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {lvl === 'todos' ? 'Todos os Níveis' : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-start sm:justify-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Status:</span>
            {['todos', 'publicado', 'revisao', 'rascunho'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                  selectedStatus === st
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {st === 'todos' ? 'Todos' : st === 'revisao' ? 'Em Revisão' : st}
              </button>
            ))}
          </div>

          {/* Filtro por Nível de Acesso (Freemium vs Premium) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-start sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
            <span className="text-[10px] text-amber-400 font-bold uppercase shrink-0 flex items-center gap-1">
              <Crown className="w-3 h-3" /> Acesso:
            </span>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'free', label: `Grátis (${freeCount})` },
              { id: 'premium', label: `Premium (${premiumCount})` }
            ].map(acc => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccess(acc.id)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedAccess === acc.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Treinos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <span>Mostrando <strong>{filteredWorkouts.length}</strong> de {workouts.length} sessões</span>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="min-h-[36px] px-3 py-1.5 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Restaurar dados de fábrica do catálogo (limpa edições salvas no dispositivo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Fábrica</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWorkouts.map(workout => (
            <div 
              key={workout.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition ${
                workout.status === 'publicado'
                  ? 'border-slate-800 hover:border-emerald-500/50'
                  : workout.status === 'revisao'
                  ? 'border-amber-900/60 bg-slate-900/90'
                  : 'border-slate-800/60 opacity-85'
              }`}
            >
              {/* Top Banner Image with Badges (Modern mobile-first proportion) */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                <img
                  src={workout.coverImage}
                  alt={workout.photoAlt || workout.title}
                  className="w-full h-full object-cover object-[center_20%] sm:object-[center_25%]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback para imagem segura caso falhe
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&crop=faces,center&w=600&h=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Status & Access Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border backdrop-blur-md ${
                      workout.status === 'publicado'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : workout.status === 'revisao'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950/80 text-slate-400 border-slate-700'
                    }`}>
                      {workout.status === 'publicado' ? '● Publicado' : workout.status === 'revisao' ? '▲ Em Revisão' : '○ Rascunho'}
                    </span>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border backdrop-blur-md ${
                      workout.accessLevel === 'free'
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                        : 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                    }`}>
                      {workout.accessLevel === 'free' ? '★ Grátis' : '👑 Premium'}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-300">
                    {workout.duration}
                  </span>
                </div>

                {/* Level Tag Bottom Left & Model Demographic indicator */}
                <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900/90 text-emerald-400 border border-emerald-500/20">
                    {workout.level}
                  </span>
                  {workout.modelGender && (
                    <span 
                      className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700/60 shadow-sm"
                      title={`Identidade fotográfica: ${workout.modelGender} (${workout.modelAgeGroup || '40+'})`}
                    >
                      {workout.modelGender === 'feminino' ? '♀' : '♂'} {workout.modelAgeGroup || '40+'}
                    </span>
                  )}
                </div>
              </div>

              {/* Workout Details */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">
                    {workout.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {workout.objective}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {workout.equipments.map((eq, i) => (
                      <span key={i} className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded font-medium">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                  {/* Publicar / Despublicar Toggle */}
                  <button
                    onClick={() => handleTogglePublish(workout)}
                    className={`flex-1 min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                      workout.status === 'publicado'
                        ? 'bg-emerald-600/20 hover:bg-amber-600/20 text-emerald-300 hover:text-amber-300 border border-emerald-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                    title={workout.status === 'publicado' ? 'Clique para despublicar' : 'Aprovar e publicar no catálogo'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{workout.status === 'publicado' ? 'Publicado' : 'Publicar'}</span>
                  </button>

                  {/* Alternar Grátis / Premium */}
                  <button
                    onClick={() => handleToggleAccessLevel(workout)}
                    className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${
                      workout.accessLevel === 'free'
                        ? 'bg-slate-950 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-800'
                        : 'bg-amber-500/15 hover:bg-emerald-950/40 text-amber-300 hover:text-emerald-300 border border-amber-500/30'
                    }`}
                    title={workout.accessLevel === 'free' ? 'Alterar para Exclusivo Premium' : 'Alterar para Treino Gratuito'}
                  >
                    {workout.accessLevel === 'free' ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{workout.accessLevel === 'free' ? 'Grátis' : 'Premium'}</span>
                  </button>

                  {/* Editar Sessão */}
                  <button
                    onClick={() => handleOpenEditModal(workout)}
                    className="min-h-[40px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                    title="Editar exercícios e dados da sessão"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Editar</span>
                  </button>

                  {/* Duplicar */}
                  <button
                    onClick={() => handleDuplicate(workout.id)}
                    className="min-h-[40px] min-w-[40px] p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition flex items-center justify-center"
                    title="Duplicar como novo rascunho"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Testar Treino no Modo Aluno */}
                  <button
                    onClick={() => {
                      const plan = convertCatalogWorkoutToWorkoutPlan(workout);
                      onStartTestWorkout(plan);
                    }}
                    className="min-h-[40px] min-w-[40px] p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 rounded-xl transition flex items-center justify-center"
                    title="Testar execução como aluno"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE EDIÇÃO DE SESSÃO & RELACIONAMENTO COM EXERCÍCIOS CENTRAIS        */}
      {/* ========================================================================= */}
      {editingWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Editar Sessão: {editingWorkout.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingWorkout(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              <form onSubmit={handleSaveWorkoutEdits} id="workout-edit-form" className="space-y-4">
                {/* Metadados Básicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Título do Treino</label>
                    <input
                      type="text"
                      value={editingWorkout.title}
                      onChange={(e) => setEditingWorkout({ ...editingWorkout, title: e.target.value })}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Duração Estimada</label>
                    <input
                      type="text"
                      value={editingWorkout.duration}
                      onChange={(e) => setEditingWorkout({ ...editingWorkout, duration: e.target.value })}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      placeholder="Ex: 25 a 35 min"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Nível de Dificuldade</label>
                    <select
                      value={editingWorkout.level}
                      onChange={(e) => setEditingWorkout({ ...editingWorkout, level: e.target.value as WorkoutLevel })}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Status de Publicação</label>
                    <select
                      value={editingWorkout.status}
                      onChange={(e) => setEditingWorkout({ ...editingWorkout, status: e.target.value as WorkoutStatus })}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="publicado">Publicado no Catálogo</option>
                      <option value="revisao">Em Revisão</option>
                      <option value="rascunho">Rascunho</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-400 block mb-1 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Acesso Comercial
                    </label>
                    <select
                      value={editingWorkout.accessLevel}
                      onChange={(e) => setEditingWorkout({ ...editingWorkout, accessLevel: e.target.value as 'free' | 'premium' })}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="free">★ Gratuito (Sessão Modelo Aberta)</option>
                      <option value="premium">👑 Exclusivo Premium (Assinantes)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Objetivo Técnico</label>
                  <textarea
                    rows={2}
                    value={editingWorkout.objective}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, objective: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">URL da Imagem de Capa (Preferência 40+)</label>
                  <input
                    type="text"
                    value={editingWorkout.coverImage}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, coverImage: e.target.value })}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </form>

              {/* Lista Relacional de Exercícios Centrais */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Exercícios da Sessão ({workoutRelations.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Exercícios vinculados da biblioteca central (sem duplicação de vídeos).
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddExerciseToWorkout(true)}
                    className="min-h-[38px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Exercício</span>
                  </button>
                </div>

                {/* Submodal para selecionar exercício da biblioteca central */}
                {showAddExerciseToWorkout && (
                  <div className="bg-slate-950 border border-emerald-500/40 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">
                        Selecione um Exercício da Biblioteca Central:
                      </span>
                      <button
                        onClick={() => setShowAddExerciseToWorkout(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={exerciseSearchTerm}
                      onChange={(e) => setExerciseSearchTerm(e.target.value)}
                      placeholder="Filtrar por nome ou grupo muscular..."
                      className="w-full min-h-[38px] px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />

                    <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
                      {centralExercises
                        .filter(ex => 
                          !exerciseSearchTerm || 
                          ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
                          ex.muscleGroup.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
                        )
                        .map(ex => (
                          <div 
                            key={ex.id}
                            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-between gap-2 border border-slate-800/80"
                          >
                            <div>
                              <div className="text-xs font-bold text-white">{ex.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {ex.muscleGroup} • {ex.equipment}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddExerciseRel(ex.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Inserir
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Lista Ordenada */}
                <div className="space-y-2">
                  {workoutRelations.map((rel, index) => {
                    const central = centralExercises.find(e => e.id === rel.exerciseId);
                    return (
                      <div 
                        key={`${rel.exerciseId}-${index}`}
                        className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-800">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">
                                {central ? central.name : rel.exerciseId}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {central?.muscleGroup || 'Geral'} • {central?.equipment}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveExerciseRel(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Subir ordem"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveExerciseRel(index, 'down')}
                              disabled={index === workoutRelations.length - 1}
                              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Descer ordem"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExerciseRel(index)}
                              className="p-1.5 text-rose-400 hover:text-rose-300"
                              title="Remover do treino"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Prescrição Séries/Reps/Descanso/Carga */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Séries:</span>
                            <input
                              type="text"
                              value={rel.sets}
                              onChange={(e) => handleUpdateRelField(index, 'sets', e.target.value)}
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Reps / Duração:</span>
                            <input
                              type="text"
                              value={rel.reps}
                              onChange={(e) => handleUpdateRelField(index, 'reps', e.target.value)}
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Intervalo:</span>
                            <input
                              type="text"
                              value={rel.rest}
                              onChange={(e) => handleUpdateRelField(index, 'rest', e.target.value)}
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Carga Orientativa:</span>
                            <input
                              type="text"
                              value={rel.load || ''}
                              onChange={(e) => handleUpdateRelField(index, 'load', e.target.value)}
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                              placeholder="Ex: 4kg a 6kg"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950">
              <button
                type="button"
                onClick={() => setEditingWorkout(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="workout-edit-form"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950"
              >
                Salvar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Reset de Fábrica */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Restaurar Catálogo aos Padrões?
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ação irreversível para personalizações locais
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Isso apagará alterações de treinos, novos rascunhos criados no navegador e restaurará as <strong>72 sessões originais</strong> e os <strong>46 exercícios centrais</strong> aos dados de fábrica. O aplicativo continuará funcionando perfeitamente.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetFactory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950"
              >
                Confirmar e Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
