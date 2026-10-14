import React, { useState, useMemo } from 'react';
import { CentralExercise, VideoValidationStatus, WorkoutLevel } from '../../types';
import { 
  getAllCentralExercises, 
  saveAllCentralExercises, 
  updateCentralExercise, 
  validateVideoStatus 
} from '../../data/workoutCatalogService';
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  VideoOff, 
  Play, 
  Edit3, 
  Dumbbell, 
  ShieldAlert, 
  BookOpen, 
  X, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

interface TrainerExercisesTabProps {
  onPreviewExerciseVideo: (ex: any) => void;
}

export const TrainerExercisesTab: React.FC<TrainerExercisesTabProps> = ({
  onPreviewExerciseVideo
}) => {
  const [exercises, setExercises] = useState<CentralExercise[]>(() => getAllCentralExercises());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedPattern, setSelectedPattern] = useState<string>('todos');

  // Modal de edição / adição de exercício central
  const [editingExercise, setEditingExercise] = useState<CentralExercise | null>(null);
  const [isNewExercise, setIsNewExercise] = useState(false);

  const refreshExercises = () => {
    setExercises(getAllCentralExercises());
  };

  // Métricas de validação
  const total = exercises.length;
  const validated = exercises.filter(e => e.videoValidationStatus === 'validado').length;
  const pending = exercises.filter(e => e.videoValidationStatus === 'pendente_revisao').length;
  const noVideo = exercises.filter(e => e.videoValidationStatus === 'sem_video').length;

  // Grupos musculares únicos
  const muscleGroups = useMemo(() => {
    return Array.from(new Set(exercises.map(e => e.muscleGroup))).sort();
  }, [exercises]);

  // Padrões de movimento únicos
  const movementPatterns = useMemo(() => {
    return Array.from(new Set(exercises.map(e => e.movementPattern))).sort();
  }, [exercises]);

  // Filtragem
  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (selectedMuscle !== 'todos' && ex.muscleGroup !== selectedMuscle) return false;
      if (selectedStatus !== 'todos' && ex.videoValidationStatus !== selectedStatus) return false;
      if (selectedPattern !== 'todos' && ex.movementPattern !== selectedPattern) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesNameEn = ex.nameEn?.toLowerCase().includes(q);
        const matchesEquip = ex.equipment.toLowerCase().includes(q);
        if (!matchesName && !matchesNameEn && !matchesEquip) return false;
      }
      return true;
    });
  }, [exercises, selectedMuscle, selectedStatus, selectedPattern, searchTerm]);

  // Alterar status de validação com 1 clique
  const handleQuickValidate = (id: string, newStatus: VideoValidationStatus) => {
    validateVideoStatus(id, newStatus);
    refreshExercises();
  };

  // Abrir modal de criação
  const handleOpenCreateModal = () => {
    setIsNewExercise(true);
    setEditingExercise({
      id: `ex-custom-${Date.now()}`,
      name: '',
      nameEn: '',
      muscleGroup: 'Peito',
      movementPattern: 'Empurrar',
      equipment: 'Halteres',
      difficulty: 'iniciante',
      instructions: '',
      cautions: '',
      youtubeId: '',
      licenseSource: 'manual',
      videoValidationStatus: 'pendente_revisao',
      demonstratorInfo: { gender: 'feminino', targetAgeGroup: '40+' }
    });
  };

  // Salvar exercício central
  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise || !editingExercise.name.trim()) return;

    const allExercises = getAllCentralExercises();
    if (isNewExercise) {
      allExercises.push(editingExercise);
    } else {
      const idx = allExercises.findIndex(ex => ex.id === editingExercise.id);
      if (idx !== -1) {
        allExercises[idx] = editingExercise;
      }
    }
    saveAllCentralExercises(allExercises);
    setEditingExercise(null);
    refreshExercises();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Métricas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Biblioteca Central (EXERCISES)
              </span>
              <span className="text-xs font-bold text-slate-400">
                Correspondência Técnica Exata
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight">
              Repositório Central de Exercícios
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Cada exercício possui instrução biomecânica, cuidados posturais para o público 40+ e vídeo correspondente validado.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-2 rounded-xl border border-slate-800/80 shrink-0">
              <div className="px-2">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Validados</span>
                <span className="text-sm font-black text-emerald-400">{validated}</span>
              </div>
              <div className="px-2 border-l border-slate-800">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Pendentes</span>
                <span className="text-sm font-black text-amber-400">{pending}</span>
              </div>
              <div className="px-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sem Vídeo</span>
                <span className="text-sm font-black text-slate-400">{noVideo}</span>
              </div>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-md shadow-emerald-950"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Exercício</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome do exercício (português/inglês) ou equipamento..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Grupo Muscular */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Músculo:</label>
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full min-h-[38px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
            >
              <option value="todos">Todos os Grupos</option>
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
              className="w-full min-h-[38px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
            >
              <option value="todos">Todos os Padrões</option>
              {movementPatterns.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status do Vídeo */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Validação do Vídeo:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full min-h-[38px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
            >
              <option value="todos">Todos os Status</option>
              <option value="validado">● Validado (Correspondência confirmada)</option>
              <option value="pendente_revisao">▲ Pendente de Revisão</option>
              <option value="sem_video">○ Sem Vídeo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Exercícios */}
      <div className="space-y-3">
        <div className="text-xs text-slate-400">
          Mostrando <strong>{filtered.length}</strong> de {exercises.length} exercícios centrais
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map(ex => (
            <div 
              key={ex.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {ex.muscleGroup}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-mono">
                        {ex.movementPattern}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                        {ex.equipment}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                      {ex.name}
                    </h3>
                    {ex.nameEn && (
                      <span className="text-[11px] text-slate-500 italic block">
                        {ex.nameEn}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                    ex.videoValidationStatus === 'validado'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : ex.videoValidationStatus === 'pendente_revisao'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    {ex.videoValidationStatus === 'validado' ? '✓ Validado' : ex.videoValidationStatus === 'pendente_revisao' ? '▲ Pendente' : 'Sem Vídeo'}
                  </span>
                </div>

                {/* Instructions snippet */}
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-emerald-400 text-[10px] uppercase">
                    <BookOpen className="w-3 h-3" /> Técnica:
                  </div>
                  <p className="line-clamp-2 leading-relaxed">{ex.instructions}</p>
                </div>

                {ex.cautions && (
                  <div className="bg-rose-950/30 p-2 rounded-xl border border-rose-900/40 text-[11px] text-rose-300">
                    <span className="font-bold text-[10px] uppercase block text-rose-400">Cuidados 40+:</span>
                    <p className="line-clamp-2 leading-relaxed">{ex.cautions}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Testar Vídeo */}
                  {ex.youtubeId || ex.videoUrl ? (
                    <button
                      onClick={() => onPreviewExerciseVideo(ex)}
                      className="min-h-[38px] px-2.5 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      title="Assistir demonstração para conferir correspondência exata"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                      <span>Testar Vídeo</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic flex items-center gap-1">
                      <VideoOff className="w-3.5 h-3.5" /> Sem vídeo
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Quick Validation status toggle */}
                  {ex.videoValidationStatus !== 'validado' ? (
                    <button
                      onClick={() => handleQuickValidate(ex.id, 'validado')}
                      className="min-h-[38px] px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      title="Confirmar que o vídeo demonstra exatamente este exercício"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Validar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuickValidate(ex.id, 'pendente_revisao')}
                      className="min-h-[38px] px-2 py-1.5 bg-slate-800 hover:bg-amber-900/40 text-slate-300 hover:text-amber-300 rounded-xl text-xs font-medium transition"
                      title="Marcar como pendente de revisão técnica"
                    >
                      Revisar
                    </button>
                  )}

                  {/* Editar */}
                  <button
                    onClick={() => {
                      setIsNewExercise(false);
                      setEditingExercise({ ...ex });
                    }}
                    className="min-h-[38px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE EDIÇÃO / CADASTRO DE EXERCÍCIO CENTRAL                           */}
      {/* ========================================================================= */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isNewExercise ? 'Novo Exercício Central' : `Editar: ${editingExercise.name}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingExercise(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Nome em Português *</label>
                <input
                  type="text"
                  value={editingExercise.name}
                  onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                  placeholder="Ex: Agachamento Goblet com Halter"
                  className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Nome Alternativo em Inglês</label>
                <input
                  type="text"
                  value={editingExercise.nameEn || ''}
                  onChange={(e) => setEditingExercise({ ...editingExercise, nameEn: e.target.value })}
                  placeholder="Ex: Dumbbell Goblet Squat"
                  className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Grupo Muscular</label>
                  <input
                    type="text"
                    value={editingExercise.muscleGroup}
                    onChange={(e) => setEditingExercise({ ...editingExercise, muscleGroup: e.target.value })}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Padrão de Movimento</label>
                  <input
                    type="text"
                    value={editingExercise.movementPattern}
                    onChange={(e) => setEditingExercise({ ...editingExercise, movementPattern: e.target.value })}
                    placeholder="Agachar, Empurrar, Puxar, etc."
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Equipamento</label>
                  <input
                    type="text"
                    value={editingExercise.equipment}
                    onChange={(e) => setEditingExercise({ ...editingExercise, equipment: e.target.value })}
                    placeholder="Halteres, Peso corporal, etc."
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Status do Vídeo</label>
                  <select
                    value={editingExercise.videoValidationStatus}
                    onChange={(e) => setEditingExercise({ ...editingExercise, videoValidationStatus: e.target.value as VideoValidationStatus })}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="validado">● Validado (Técnica conferida)</option>
                    <option value="pendente_revisao">▲ Pendente de Revisão</option>
                    <option value="sem_video">○ Sem Vídeo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">ID do Vídeo YouTube ou Link</label>
                <input
                  type="text"
                  value={editingExercise.youtubeId || ''}
                  onChange={(e) => setEditingExercise({ ...editingExercise, youtubeId: e.target.value })}
                  placeholder="Ex: aclHkVaku9U ou https://youtube.com/watch?v=..."
                  className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Instruções Técnicas</label>
                <textarea
                  rows={3}
                  value={editingExercise.instructions}
                  onChange={(e) => setEditingExercise({ ...editingExercise, instructions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Cuidados e Contraindicações (Especialmente 40+)</label>
                <textarea
                  rows={2}
                  value={editingExercise.cautions}
                  onChange={(e) => setEditingExercise({ ...editingExercise, cautions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950"
                >
                  Salvar Exercício
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
