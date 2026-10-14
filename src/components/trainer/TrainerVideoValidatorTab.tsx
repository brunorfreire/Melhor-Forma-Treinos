import React, { useState } from 'react';
import { CentralExercise, VideoValidationStatus } from '../../types';
import { 
  getAllCentralExercises, 
  validateVideoStatus, 
  updateCentralExercise 
} from '../../data/workoutCatalogService';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  VideoOff, 
  Play, 
  Check, 
  X, 
  Edit3, 
  Dumbbell, 
  Info, 
  HelpCircle 
} from 'lucide-react';

interface TrainerVideoValidatorTabProps {
  onPreviewExerciseVideo: (ex: any) => void;
}

export const TrainerVideoValidatorTab: React.FC<TrainerVideoValidatorTabProps> = ({
  onPreviewExerciseVideo
}) => {
  const [exercises, setExercises] = useState<CentralExercise[]>(() => getAllCentralExercises());
  const [filterMode, setFilterMode] = useState<'pendentes' | 'validados' | 'sem_video' | 'todos'>('pendentes');
  const [selectedExerciseForEdit, setSelectedExerciseForEdit] = useState<CentralExercise | null>(null);
  const [tempYoutubeId, setTempYoutubeId] = useState('');

  const refresh = () => {
    setExercises(getAllCentralExercises());
  };

  const pendingList = exercises.filter(e => e.videoValidationStatus === 'pendente_revisao');
  const validatedList = exercises.filter(e => e.videoValidationStatus === 'validado');
  const noVideoList = exercises.filter(e => e.videoValidationStatus === 'sem_video');

  const displayedList = filterMode === 'pendentes'
    ? pendingList
    : filterMode === 'validados'
    ? validatedList
    : filterMode === 'sem_video'
    ? noVideoList
    : exercises;

  const handleApprove = (id: string) => {
    validateVideoStatus(id, 'validado');
    refresh();
  };

  const handleMarkPending = (id: string) => {
    validateVideoStatus(id, 'pendente_revisao');
    refresh();
  };

  const handleMarkNoVideo = (id: string) => {
    validateVideoStatus(id, 'sem_video');
    refresh();
  };

  const handleOpenEditVideo = (ex: CentralExercise) => {
    setSelectedExerciseForEdit(ex);
    setTempYoutubeId(ex.youtubeId || '');
  };

  const handleSaveVideoId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseForEdit) return;

    let cleanId = tempYoutubeId.trim();
    if (cleanId.includes('watch?v=')) {
      cleanId = cleanId.split('watch?v=')[1]?.split('&')[0] || cleanId;
    } else if (cleanId.includes('youtu.be/')) {
      cleanId = cleanId.split('youtu.be/')[1]?.split('?')[0] || cleanId;
    }

    updateCentralExercise(selectedExerciseForEdit.id, {
      youtubeId: cleanId,
      videoValidationStatus: cleanId ? 'validado' : 'sem_video'
    });
    setSelectedExerciseForEdit(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header com Regra Obrigatória */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Regra Obrigatória
              </span>
              <span className="text-xs font-bold text-slate-400">
                Auditoria de Correspondência Exata
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              Conferência: Exercício X Demonstração em Vídeo
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
              Cada vídeo deve demonstrar rigorosamente o mesmo exercício, equipamento, posição corporal, variação e amplitude. 
              <strong> Não é permitida substituição genérica</strong> (ex: Agachamento Goblet não pode usar vídeo de agachamento com barra).
            </p>
          </div>
        </div>

        {/* Tab Selector de Status */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800 flex-wrap">
          <button
            onClick={() => setFilterMode('pendentes')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              filterMode === 'pendentes'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pendentes de Revisão ({pendingList.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('validados')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              filterMode === 'validados'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Validados com Sucesso ({validatedList.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('sem_video')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              filterMode === 'sem_video'
                ? 'bg-slate-700 text-white font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <VideoOff className="w-3.5 h-3.5" />
            <span>Sem Vídeo ({noVideoList.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('todos')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'todos'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Todos ({exercises.length})
          </button>
        </div>
      </div>

      {/* Lista de Auditoria */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            Nenhum exercício neste filtro.
          </div>
        ) : (
          displayedList.map(ex => (
            <div 
              key={ex.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Exercise Specs */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-[10px] text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-mono">
                    Padrão: {ex.movementPattern}
                  </span>
                  <span className="text-[10px] text-amber-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                    Equipamento: {ex.equipment}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white">
                  {ex.name}
                </h3>
                {ex.nameEn && (
                  <span className="text-xs text-slate-500 italic block">
                    Nome técnico oficial: {ex.nameEn}
                  </span>
                )}

                <div className="text-xs text-slate-400 line-clamp-2 pt-1 leading-relaxed">
                  <strong>Técnica Esperada:</strong> {ex.instructions}
                </div>

                {/* Checklist de Validação Obrigatória */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Nome coincide
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Equipamento exato
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Posição corporal correta
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Sem corte de amplitude
                  </span>
                </div>
              </div>

              {/* Video Preview & Action Controls */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                {/* Botão Assistir Demonstração */}
                {ex.youtubeId ? (
                  <button
                    onClick={() => onPreviewExerciseVideo(ex)}
                    className="min-h-[44px] px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    title="Assistir o vídeo agora para auditar a técnica"
                  >
                    <Play className="w-4 h-4 fill-current text-emerald-400" />
                    <span>Assistir Vídeo</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 italic px-2">Sem vídeo</span>
                )}

                {/* Aprovar como Validado */}
                {ex.videoValidationStatus !== 'validado' ? (
                  <button
                    onClick={() => handleApprove(ex.id)}
                    className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    title="Aprovar correspondência exata do vídeo"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkPending(ex.id)}
                    className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-amber-900/40 text-amber-300 rounded-xl text-xs font-semibold transition"
                    title="Voltar para pendente de revisão"
                  >
                    Pendente
                  </button>
                )}

                {/* Alterar Vídeo */}
                <button
                  onClick={() => handleOpenEditVideo(ex)}
                  className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  title="Alterar URL ou ID do vídeo deste exercício"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Trocar Vídeo</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Troca de Vídeo */}
      {selectedExerciseForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Vincular Vídeo Exato: {selectedExerciseForEdit.name}
              </h3>
              <button
                onClick={() => setSelectedExerciseForEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Informe o ID ou URL de um vídeo demonstrativo que corresponda estritamente a este movimento com {selectedExerciseForEdit.equipment}.
            </p>

            <form onSubmit={handleSaveVideoId} className="space-y-3">
              <input
                type="text"
                value={tempYoutubeId}
                onChange={(e) => setTempYoutubeId(e.target.value)}
                placeholder="Ex: aclHkVaku9U ou https://youtu.be/..."
                className="w-full min-h-[42px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExerciseForEdit(null)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Salvar e Validar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
