import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  AlertTriangle,
  Check,
  Sparkles,
  Clock,
  Repeat
} from 'lucide-react';
import {
  ExecutionMethodType,
  GuidedExecutionBlock,
  WorkoutSession
} from '../../types';
import {
  EXECUTION_METHODS_META,
  formatRestSecondsLabel,
  validateSessionExecutionBlocks
} from '../../utils/guidedExecutionEngine';

interface TrainerExecutionBlocksSectionProps {
  session: WorkoutSession;
  onUpdateSession: (updatedSession: WorkoutSession) => void;
}

export const TrainerExecutionBlocksSection: React.FC<TrainerExecutionBlocksSectionProps> = ({
  session,
  onUpdateSession
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<ExecutionMethodType>('combinado');
  const [blockName, setBlockName] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [rounds, setRounds] = useState<number>(3);
  const [restBetweenExercisesSeconds, setRestBetweenExercisesSeconds] = useState<number>(0);
  const [restBetweenRoundsSeconds, setRestBetweenRoundsSeconds] = useState<number>(60);
  const [formError, setFormError] = useState<string | null>(null);

  const blocks = session.executionBlocks || [];
  const validation = useMemo(() => validateSessionExecutionBlocks(session), [session]);

  const assignedExerciseIds = useMemo(() => {
    const set = new Set<string>();
    blocks.forEach((b) => {
      b.exerciseIds.forEach((id) => set.add(id));
    });
    return set;
  }, [blocks]);

  const handleSelectMethodPreset = (method: ExecutionMethodType) => {
    setSelectedMethod(method);
    setFormError(null);
    if (method === 'simples') {
      setRestBetweenExercisesSeconds(60);
      setRestBetweenRoundsSeconds(60);
      if (selectedExerciseIds.length > 1) {
        setSelectedExerciseIds([selectedExerciseIds[0]]);
      }
    } else if (method === 'combinado' || method === 'conjugado') {
      setRestBetweenExercisesSeconds(0);
      setRestBetweenRoundsSeconds(60);
    } else if (method === 'circuitado') {
      setRestBetweenExercisesSeconds(15);
      setRestBetweenRoundsSeconds(90);
    }
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setFormError(null);
    if (selectedMethod === 'simples') {
      setSelectedExerciseIds((prev) => (prev.includes(exerciseId) ? [] : [exerciseId]));
      return;
    }
    setSelectedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const moveSelectedExercise = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedExerciseIds.length) return;
    const copy = [...selectedExerciseIds];
    const [removed] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, removed);
    setSelectedExerciseIds(copy);
  };

  const handleCreateBlock = () => {
    const meta = EXECUTION_METHODS_META[selectedMethod];
    if (selectedExerciseIds.length < meta.minExercises) {
      setFormError(
        `O método ${meta.shortLabel} exige pelo menos ${meta.minExercises} exercício(s) selecionado(s).`
      );
      return;
    }

    const newBlock: GuidedExecutionBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name:
        blockName.trim() ||
        `Bloco ${blocks.length + 1} • ${meta.shortLabel}`,
      method: selectedMethod,
      exerciseIds: selectedExerciseIds,
      rounds: Math.max(1, Math.min(20, Math.round(rounds || 3))),
      restBetweenExercisesSeconds: Math.max(0, Math.round(restBetweenExercisesSeconds || 0)),
      restBetweenRoundsSeconds: Math.max(0, Math.round(restBetweenRoundsSeconds || 0))
    };

    // Preserva integralmente séries, repetições e cargas originais dos exercícios
    onUpdateSession({
      ...session,
      executionBlocks: [...blocks, newBlock]
    });

    setBlockName('');
    setSelectedExerciseIds([]);
    setFormError(null);
    setIsCreating(false);
  };

  const handleRemoveBlock = (blockId: string) => {
    onUpdateSession({
      ...session,
      executionBlocks: blocks.filter((b) => b.id !== blockId)
    });
  };

  const handleUpdateBlockField = <K extends keyof GuidedExecutionBlock>(
    blockId: string,
    field: K,
    value: GuidedExecutionBlock[K]
  ) => {
    onUpdateSession({
      ...session,
      executionBlocks: blocks.map((b) =>
        b.id === blockId ? { ...b, [field]: value } : b
      )
    });
  };

  const handleMoveExerciseInsideBlock = (
    blockId: string,
    index: number,
    direction: 'up' | 'down'
  ) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= block.exerciseIds.length) return;
    const nextIds = [...block.exerciseIds];
    const [moved] = nextIds.splice(index, 1);
    nextIds.splice(targetIdx, 0, moved);
    handleUpdateBlockField(blockId, 'exerciseIds', nextIds);
  };

  const exerciseById = useMemo(() => {
    const map = new Map<string, typeof session.exercises[number]>();
    session.exercises.forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [session.exercises]);

  return (
    <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3.5">
      {/* Cabeçalho da Seção */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400">
              Métodos de Execução Guiada
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Configure blocos <strong className="text-slate-200">Simples</strong>,{' '}
            <strong className="text-cyan-300">Combinado</strong>,{' '}
            <strong className="text-amber-300">Conjugado</strong> ou{' '}
            <strong className="text-purple-300">Circuitado</strong>. Exercícios sem bloco
            continuam funcionando normalmente como séries simples.
          </p>
        </div>

        {!isCreating && (
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsCreating(true);
            }}
            disabled={session.exercises.length === 0}
            className="min-h-[40px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Bloco Guiado</span>
          </button>
        )}
      </div>

      {/* Avisos de Validação */}
      {validation.warnings.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Atenção na Configuração dos Blocos (Prescrição Original Preservada):</span>
          </div>
          <ul className="text-[11px] text-amber-200/90 space-y-0.5 pl-4 list-disc">
            {validation.warnings.map((w, idx) => (
              <li key={`${w.blockId}-${idx}`}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de Blocos Existentes */}
      {blocks.length > 0 ? (
        <div className="space-y-2.5">
          {blocks.map((block, bIdx) => {
            const meta = EXECUTION_METHODS_META[block.method] || EXECUTION_METHODS_META.simples;
            return (
              <div
                key={block.id}
                className={`bg-slate-900/90 border rounded-xl p-3 space-y-2.5 ${meta.borderClass}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
                      >
                        {meta.shortLabel}
                      </span>
                      <input
                        type="text"
                        value={block.name || ''}
                        onChange={(e) =>
                          handleUpdateBlockField(block.id, 'name', e.target.value)
                        }
                        placeholder={`Bloco #${bIdx + 1}`}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none min-w-[140px] flex-1"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(block.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition shrink-0"
                    title="Remover bloco (os exercícios permanecem na ficha)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Configuração de Rodadas e Descansos do Bloco */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Rodadas:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={block.rounds}
                      onChange={(e) =>
                        handleUpdateBlockField(
                          block.id,
                          'rounds',
                          Math.max(1, parseInt(e.target.value, 10) || 1)
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Desc. entre Exerc. (s):
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={block.restBetweenExercisesSeconds}
                      onChange={(e) =>
                        handleUpdateBlockField(
                          block.id,
                          'restBetweenExercisesSeconds',
                          Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-emerald-300 focus:outline-none"
                    />
                  </div>

                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Desc. entre Rodadas (s):
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={block.restBetweenRoundsSeconds}
                      onChange={(e) =>
                        handleUpdateBlockField(
                          block.id,
                          'restBetweenRoundsSeconds',
                          Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Ordem dos Exercícios no Bloco */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Ordem de Execução no Bloco ({block.exerciseIds.length} exercício(s)):
                  </span>
                  <div className="space-y-1">
                    {block.exerciseIds.map((exId, exIdx) => {
                      const ex = exerciseById.get(exId);
                      return (
                        <div
                          key={`${block.id}-${exId}`}
                          className="flex items-center justify-between gap-2 bg-slate-950/90 border border-slate-800/90 rounded-lg px-2.5 py-1.5 text-xs"
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded">
                              {exIdx + 1}º
                            </span>
                            {ex ? (
                              <div className="min-w-0">
                                <span className="font-bold text-white truncate block">
                                  {ex.name}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {ex.muscleGroup} • Prescrito: {ex.sets}x {ex.reps}{' '}
                                  {ex.weight ? `(${ex.weight})` : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-rose-400 italic">
                                Exercício removido da ficha
                              </span>
                            )}
                          </div>

                          {block.exerciseIds.length > 1 && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveExerciseInsideBlock(block.id, exIdx, 'up')
                                }
                                disabled={exIdx === 0}
                                className="p-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300"
                                title="Subir na ordem do bloco"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveExerciseInsideBlock(block.id, exIdx, 'down')
                                }
                                disabled={exIdx === block.exerciseIds.length - 1}
                                className="p-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300"
                                title="Descer na ordem do bloco"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isCreating && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>
              Nenhum bloco especial configurado nesta sessão. Todos os{' '}
              <strong className="text-slate-200">{session.exercises.length}</strong> exercícios
              serão guiados no método <strong className="text-emerald-400">Simples</strong>.
            </span>
          </div>
        )
      )}

      {/* Formulário de Criação de Novo Bloco */}
      {isCreating && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3.5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Configurar Novo Bloco de Execução
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white font-semibold"
            >
              Cancelar
            </button>
          </div>

          {/* 1. Escolha do Método */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              1. Escolha o Método de Execução:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                ['simples', 'combinado', 'conjugado', 'circuitado'] as ExecutionMethodType[]
              ).map((mKey) => {
                const m = EXECUTION_METHODS_META[mKey];
                const isSelected = selectedMethod === mKey;
                return (
                  <button
                    key={mKey}
                    type="button"
                    onClick={() => handleSelectMethodPreset(mKey)}
                    className={`p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? `${m.badgeClass} shadow-sm`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-black block">{m.shortLabel}</span>
                    <span className="text-[10px] opacity-85 block leading-tight mt-0.5">
                      Mín. {m.minExercises} exerc.
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <strong className="text-slate-200">
                {EXECUTION_METHODS_META[selectedMethod].label}:
              </strong>{' '}
              {EXECUTION_METHODS_META[selectedMethod].description}
            </p>
          </div>

          {/* 2. Nome Opcional do Bloco */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              2. Título do Bloco (opcional):
            </label>
            <input
              type="text"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              placeholder={`Ex: Bi-Set ${EXECUTION_METHODS_META[selectedMethod].shortLabel}`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* 3. Seleção de Exercícios da Sessão */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              3. Selecione os Exercícios do Bloco (mínimo{' '}
              {EXECUTION_METHODS_META[selectedMethod].minExercises}):
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {session.exercises.map((ex, idx) => {
                const isSelected = selectedExerciseIds.includes(ex.id);
                const alreadyInOtherBlock = assignedExerciseIds.has(ex.id);
                const orderInSelection = selectedExerciseIds.indexOf(ex.id) + 1;

                return (
                  <button
                    key={ex.id}
                    type="button"
                    disabled={alreadyInOtherBlock}
                    onClick={() => toggleExerciseSelection(ex.id)}
                    className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between gap-2 transition ${
                      alreadyInOtherBlock
                        ? 'bg-slate-950/40 border-slate-800/50 text-slate-600 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold block truncate">
                        #{idx + 1} {ex.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {ex.muscleGroup} • {ex.sets} séries × {ex.reps}
                        {alreadyInOtherBlock ? ' (Já vinculado a outro bloco)' : ''}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] shrink-0">
                        {orderInSelection}º no bloco
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reordenação dos Exercícios Selecionados */}
          {selectedExerciseIds.length > 1 && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                Ordem da Sequência Selecionada:
              </span>
              {selectedExerciseIds.map((id, i) => {
                const ex = exerciseById.get(id);
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2 text-xs bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800"
                  >
                    <span className="truncate font-semibold text-white">
                      {i + 1}º • {ex?.name} ({ex?.muscleGroup})
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveSelectedExercise(i, 'up')}
                        disabled={i === 0}
                        className="p-1 bg-slate-800 rounded disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSelectedExercise(i, 'down')}
                        disabled={i === selectedExerciseIds.length - 1}
                        className="p-1 bg-slate-800 rounded disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Rodadas e Intervalos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                Quantidade de Rodadas:
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={rounds}
                onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
              />
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Descanso entre Exercícios:
              </label>
              <div className="flex gap-1 flex-wrap">
                {[0, 15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRestBetweenExercisesSeconds(sec)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      restBetweenExercisesSeconds === sec
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                step={5}
                value={restBetweenExercisesSeconds}
                onChange={(e) =>
                  setRestBetweenExercisesSeconds(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-300"
              />
              <span className="text-[10px] text-slate-400 block">
                Atual: {formatRestSecondsLabel(restBetweenExercisesSeconds)}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Descanso entre Rodadas:
              </label>
              <div className="flex gap-1 flex-wrap">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRestBetweenRoundsSeconds(sec)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      restBetweenRoundsSeconds === sec
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                step={5}
                value={restBetweenRoundsSeconds}
                onChange={(e) =>
                  setRestBetweenRoundsSeconds(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300"
              />
              <span className="text-[10px] text-slate-400 block">
                Atual: {formatRestSecondsLabel(restBetweenRoundsSeconds)}
              </span>
            </div>
          </div>

          {formError && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-200 font-semibold">
              {formError}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateBlock}
            className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Adicionar Bloco à Sessão</span>
          </button>
        </div>
      )}
    </div>
  );
};
