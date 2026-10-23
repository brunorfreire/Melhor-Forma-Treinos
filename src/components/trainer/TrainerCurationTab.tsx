import React, { useMemo, useState } from 'react';
import { CentralExercise, CatalogWorkout } from '../../types';
import {
  getAllCatalogWorkouts,
  getAllCentralExercises,
  getAllWorkoutExerciseItems
} from '../../data/workoutCatalogService';

type ItemType = 'exercise' | 'workout';
type EditorialDecision = 'pendente' | 'aprovado' | 'ajustar' | 'rejeitado';

interface EditorialRecord {
  decision: EditorialDecision;
  notes: string;
  reviewedAt: string;
}

type EditorialRecords = Record<string, EditorialRecord>;

const STORAGE_KEY = 'mf_curadoria_editorial_v1';
const MAX_NOTES = 3000;

// Sugestões editoriais, não equivalências biomecânicas automáticas.
// A mudança de um padrão de movimento exige avaliação profissional.
const FREE_WEIGHT_ALTERNATIVES: Record<string, { ids: string[]; notes: string }> = {
  'ex-leg-press-45': {
    ids: ['ex-agachamento-goblet', 'ex-sentar-levantar-banco', 'ex-afundo-estatico'],
    notes: 'Avaliar capacidade de agachar, equilíbrio, amplitude e progressão de carga.'
  },
  'ex-cadeira-extensora': {
    ids: ['ex-sentar-levantar-banco', 'ex-afundo-estatico', 'ex-subida-step-degrau'],
    notes: 'São exercícios multiarticulares, não substituições isoladas para extensão do joelho.'
  },
  'ex-mesa-flexora': {
    ids: [],
    notes: 'Sugestão para cadastro e validação: flexão de joelho com elástico ou deslize de calcanhares no solo. Não trocar automaticamente por stiff, pois o movimento articular é diferente.'
  },
  'ex-cadeira-flexora': {
    ids: [],
    notes: 'Avaliar flexão de joelho com elástico bem ancorado ou deslize de calcanhares, após criar e validar a demonstração.'
  },
  'ex-peck-deck': {
    ids: ['ex-crucifixo-halteres', 'ex-flexao-braco-inclinada'],
    notes: 'Conferir amplitude e conforto do ombro. A flexão trabalha um padrão diferente do voador.'
  },
  'ex-remada-baixa-triangulo': {
    ids: ['ex-remada-unilateral-serrote', 'ex-remada-curvada-halteres'],
    notes: 'Priorizar apoio estável e postura controlada, conforme capacidade do aluno.'
  },
  'ex-puxada-alta-pulley': {
    ids: [],
    notes: 'Avaliar puxada vertical com elástico em âncora segura ou TRX ajustado, com demonstração específica. Remada horizontal não é equivalência direta.'
  },
  'ex-puxada-fechada-triangulo': {
    ids: [],
    notes: 'Avaliar puxada vertical com elástico e pegada neutra, com ancoragem segura e instrução validada.'
  },
  'ex-triceps-corda-polia': {
    ids: ['ex-triceps-frances-halter'],
    notes: 'A posição do ombro é diferente. Conferir tolerância, técnica e opção de extensão de cotovelo com elástico.'
  }
};

const normalize = (s: string) =>
  s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const isMachineOrCable = (ex: CentralExercise): boolean =>
  /maquina|polia|pulley|crossover|smith|leg press|peck deck/.test(normalize(ex.equipment + ' ' + ex.name));

function loadRecords(): EditorialRecords {
  if (typeof window === 'undefined') return {};
  try {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const result: EditorialRecords = {};
    for (const [key, value] of Object.entries(data)) {
      const record = value as Partial<EditorialRecord> | null;
      if (!record || !['pendente', 'aprovado', 'ajustar', 'rejeitado'].includes(record.decision || '')) continue;
      result[key] = {
        decision: record.decision as EditorialDecision,
        notes: typeof record.notes === 'string' ? record.notes.slice(0, MAX_NOTES) : '',
        reviewedAt: typeof record.reviewedAt === 'string' ? record.reviewedAt : ''
      };
    }
    return result;
  } catch {
    return {};
  }
}

interface Props {
  onEditExercise: (id: string) => void;
  onEditWorkout: (id: string) => void;
}

export const TrainerCurationTab: React.FC<Props> = ({ onEditExercise, onEditWorkout }) => {
  const [kind, setKind] = useState<ItemType>('exercise');
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<EditorialRecords>(loadRecords);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<EditorialDecision>('pendente');
  const [notes, setNotes] = useState('');
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [feedback, setFeedback] = useState('');

  const exercises = useMemo(() => getAllCentralExercises(), []);
  const workouts = useMemo(() => getAllCatalogWorkouts(), []);
  const relations = useMemo(() => getAllWorkoutExerciseItems(), []);
  const exById = useMemo(() => new Map(exercises.map(ex => [ex.id, ex])), [exercises]);

  const selected = useMemo(() =>
    kind === 'exercise'
      ? exercises.find(ex => ex.id === selectedId)
      : workouts.find(w => w.id === selectedId),
    [kind, selectedId, exercises, workouts]
  );
  const selectedExercise = kind === 'exercise' ? selected as CentralExercise | undefined : undefined;
  const selectedWorkout = kind === 'workout' ? selected as CatalogWorkout | undefined : undefined;
  const machineCount = exercises.filter(isMachineOrCable).length;
  const currentItems = kind === 'exercise' ? exercises : workouts;

  const filtered = currentItems.filter(item => {
    const key = kind + ':' + item.id;
    const record = records[key];
    if (filter === 'pendentes' && record && record.decision !== 'pendente') return false;
    if (filter === 'maquinas') {
      if (kind === 'exercise') {
        if (!isMachineOrCable(item as CentralExercise)) return false;
      } else {
        const rel = relations.filter(r => r.workoutId === item.id);
        if (!rel.some(r => {
          const ex = exById.get(r.exerciseId);
          return ex ? isMachineOrCable(ex) : false;
        })) return false;
      }
    }
    if (filter === 'ajustar' && record?.decision !== 'ajustar') return false;
    if (filter === 'rejeitados' && record?.decision !== 'rejeitado') return false;
    if (search.trim()) {
      const parts = kind === 'exercise'
        ? [item.id, (item as CentralExercise).name, (item as CentralExercise).equipment, (item as CentralExercise).movementPattern]
        : [item.id, (item as CatalogWorkout).title, (item as CatalogWorkout).objective];
      if (!normalize(parts.filter(Boolean).join(' ')).includes(normalize(search.trim()))) return false;
    }
    return true;
  });

  const selectItem = (item: CentralExercise | CatalogWorkout) => {
    const key = kind + ':' + item.id;
    const record = records[key];
    setSelectedId(item.id);
    setDecision(record?.decision || 'pendente');
    setNotes(record?.notes || '');
    setReviewConfirmed(false);
    setFeedback('');
  };

  const handleSave = () => {
    if (!selectedId) return;
    if (decision === 'aprovado' && !reviewConfirmed) {
      setFeedback('Antes de aprovar, confirme que revisou a técnica, segurança e mídia.');
      return;
    }
    if ((decision === 'ajustar' || decision === 'rejeitado') && !notes.trim()) {
      setFeedback('Descreva o motivo e a alteração desejada.');
      return;
    }
    const key = kind + ':' + selectedId;
    const next = { ...records, [key]: {
      decision, notes: notes.trim(), reviewedAt: new Date().toISOString()
    }};
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRecords(next);
      setFeedback('Decisão editorial salva somente neste navegador. Não altera automaticamente a vitrine dos alunos.');
    } catch {
      setFeedback('Não foi possível salvar. Confira o armazenamento disponível no navegador.');
    }
  };

  const handleExport = () => {
    const content = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      note: 'Revisões editoriais locais; não substitui backup integral do aplicativo.',
      records
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mf-curadoria-editorial.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const suggestions = selectedExercise ? FREE_WEIGHT_ALTERNATIVES[selectedExercise.id] : undefined;
  const selectedRelations = selectedWorkout
    ? relations.filter(r => r.workoutId === selectedWorkout.id).sort((a, b) => a.order - b.order)
    : [];

  return (
    <section className="space-y-4" aria-label="Curadoria técnica de treinos">
      <div className="bg-slate-900 border border-emerald-700/40 rounded-2xl p-4 sm:p-5 space-y-2">
        <span className="text-xs font-bold text-emerald-300 uppercase">Curadoria profissional 40+</span>
        <h2 className="text-xl sm:text-2xl font-black text-white">Revisar exercício por exercício, treino por treino</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Preferir padrões naturais de movimento, halteres, barras, kettlebells, peso corporal,
          bancos, steps, elásticos e TRX. Máquinas e polias entram na fila de revisão,
          mas não são proibidas nem classificadas como inseguras por padrão.
        </p>
        <p className="text-xs text-amber-200 bg-amber-900/20 border border-amber-700/40 rounded-lg p-3">
          As decisões editoriais e edições dos gerenciadores atuais ficam neste navegador.
          Não são sincronizadas automaticamente entre dispositivos ou com o catálogo dos alunos.
          Exporte os registros antes de mudar de navegador ou limpar dados.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3"><strong className="block text-lg text-white">{exercises.length}</strong>Exercícios</div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3"><strong className="block text-lg text-white">{workouts.length}</strong>Treinos</div>
        <div className="bg-slate-900 border border-amber-800/40 rounded-xl p-3"><strong className="block text-lg text-amber-300">{machineCount}</strong>Máquinas/polias para revisar</div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button type="button" onClick={() => { setKind('exercise'); setSelectedId(null); setFilter('todos'); }}
            className={'min-h-[44px] px-4 rounded-xl font-bold text-sm ' + (kind === 'exercise' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200')}>
            Exercícios ({exercises.length})
          </button>
          <button type="button" onClick={() => { setKind('workout'); setSelectedId(null); setFilter('todos'); }}
            className={'min-h-[44px] px-4 rounded-xl font-bold text-sm ' + (kind === 'workout' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200')}>
            Treinos ({workouts.length})
          </button>
        </div>
        <button type="button" onClick={handleExport} className="min-h-[44px] px-3 rounded-xl border border-slate-700 text-slate-200 text-xs font-bold">
          Exportar decisões JSON
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-xs text-slate-300">Buscar por nome, equipamento ou padrão
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ex.: polia, agachar, kettlebell" className="mt-1 w-full min-h-[44px] rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"/>
        </label>
        <label className="text-xs text-slate-300">Filtrar fila
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="mt-1 w-full min-h-[44px] rounded-xl bg-slate-900 border border-slate-700 px-3 text-white">
            <option value="todos">Todos</option>
            <option value="pendentes">Sem decisão editorial</option>
            <option value="maquinas">Máquinas e polias identificadas</option>
            <option value="ajustar">Marcados para ajustar</option>
            <option value="rejeitados">Marcados para rejeitar</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 items-start">
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1" aria-label="Itens para revisar">
          <p className="text-xs text-slate-400">{filtered.length} itens na fila</p>
          {filtered.map(item => {
            const key = kind + ':' + item.id;
            const record = records[key];
            const machine = kind === 'exercise' && isMachineOrCable(item as CentralExercise);
            const label = kind === 'exercise' ? (item as CentralExercise).name : (item as CatalogWorkout).title;
            return <button type="button" key={item.id} onClick={() => selectItem(item)}
              className={'w-full text-left border rounded-xl p-3 min-h-[70px] space-y-1 transition ' +
                (selectedId === item.id ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-900 border-slate-800 hover:border-slate-500')}>
              <strong className="block text-sm text-white">{label}</strong>
              <span className="block text-xs text-slate-400">
                {kind === 'exercise' ? (item as CentralExercise).equipment : (item as CatalogWorkout).level}
                {machine ? ' • Equipamento em revisão' : ''}
              </span>
              <span className={'block text-[11px] font-semibold ' +
                (record?.decision === 'aprovado' ? 'text-emerald-300' :
                 record?.decision === 'rejeitado' ? 'text-rose-300' : 'text-amber-300')}>
                {record?.decision || 'Não revisado'}
              </span>
            </button>;
          })}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-4">
          {!selected ? <p className="text-slate-300 text-sm">
            Escolha um exercício ou treino na lista para registrar sua decisão e abrir o editor específico.
          </p> : <>
            <div>
              <h3 className="text-lg font-bold text-white">{selectedExercise?.name || selectedWorkout?.title}</h3>
              <p className="text-xs text-slate-400 break-all">ID preservado: {selected.id}</p>
            </div>

            {selectedExercise && <>
              <p className="text-sm text-slate-200"><strong>Equipamento:</strong> {selectedExercise.equipment}</p>
              <p className="text-sm text-slate-200"><strong>Padrão:</strong> {selectedExercise.movementPattern}</p>
              <p className="text-sm text-slate-200"><strong>Instruções:</strong> {selectedExercise.instructions}</p>
              <p className="text-sm text-amber-200"><strong>Cuidados:</strong> {selectedExercise.cautions}</p>
              <p className="text-xs text-slate-400">
                Demonstração: {selectedExercise.videoValidationStatus}; confira a execução no editor antes de aprovar.
              </p>
              {suggestions && <div className="bg-amber-950/30 border border-amber-700/40 p-3 rounded-xl space-y-1">
                <strong className="text-sm text-amber-200">Alternativas para avaliar (não aplicadas)</strong>
                {suggestions.ids.map(id => {
                  const candidate = exById.get(id);
                  return candidate ? <p key={id} className="text-xs text-slate-200">{candidate.name}</p> : null;
                })}
                <p className="text-xs text-slate-300">{suggestions.notes}</p>
              </div>}
              <button type="button" onClick={() => onEditExercise(selectedExercise.id)}
                className="w-full min-h-[44px] bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm text-white font-bold">
                Abrir editor do exercício
              </button>
            </>}

            {selectedWorkout && <>
              <p className="text-sm text-slate-200">{selectedWorkout.description}</p>
              <p className="text-xs text-slate-300">Acesso: {selectedWorkout.accessLevel} • Publicação: {selectedWorkout.status}</p>
              <p className="text-xs text-slate-300">
                Prescrições disponíveis neste navegador: {selectedRelations.length}.
                {selectedRelations.length === 0 ? ' A ausência de relações locais não prova que o treino esteja vazio no servidor.' : ''}
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {selectedRelations.map(rel => {
                  const ex = exById.get(rel.exerciseId);
                  return <p key={rel.order + ':' + rel.exerciseId} className="text-xs text-slate-300">
                    {rel.order}. {ex?.name || rel.exerciseId} • {rel.sets} × {rel.reps}
                    {ex && isMachineOrCable(ex) ? ' • Máquina/polia: revisar' : ''}
                  </p>;
                })}
              </div>
              <button type="button" onClick={() => onEditWorkout(selectedWorkout.id)}
                className="w-full min-h-[44px] bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm text-white font-bold">
                Abrir editor do treino
              </button>
            </>}

            <div className="border-t border-slate-700 pt-3 space-y-3">
              <label className="block text-xs text-slate-300">Decisão editorial
                <select value={decision} onChange={e => { setDecision(e.target.value as EditorialDecision); setReviewConfirmed(false); }}
                  className="mt-1 w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-lg px-3 text-white">
                  <option value="pendente">Pendente de revisão</option>
                  <option value="aprovado">Aprovado por mim</option>
                  <option value="ajustar">Solicitar alteração</option>
                  <option value="rejeitado">Não utilizar / rejeitado</option>
                </select>
              </label>
              <label className="block text-xs text-slate-300">Justificativa, correções e alternativas
                <textarea value={notes} maxLength={MAX_NOTES} onChange={e => setNotes(e.target.value)}
                  rows={4} placeholder="Ex.: trocar por movimento com halteres, ajustar execução e vídeo..."
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"/>
              </label>
              {decision === 'aprovado' && <label className="flex gap-2 text-xs text-slate-200">
                <input type="checkbox" checked={reviewConfirmed} onChange={e => setReviewConfirmed(e.target.checked)}/>
                Eu revisei a técnica, adequação, riscos e demonstração deste item.
              </label>}
              <button type="button" onClick={handleSave}
                className="w-full min-h-[44px] bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
                Salvar parecer editorial local
              </button>
              {feedback && <p role="status" className="text-xs text-amber-200">{feedback}</p>}
            </div>
          </>}
        </div>
      </div>
    </section>
  );
};
