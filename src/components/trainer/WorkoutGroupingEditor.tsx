import React, { useState } from 'react';
import { WorkoutExecutionGroup, WorkoutSession } from '../../types';
import { getSets, methodLabels, validateExecutionGroups } from '../../utils/workoutExecutionPlan';

interface Props {
  session: WorkoutSession;
  onChange: (next: WorkoutSession) => void;
}

export const WorkoutGroupingEditor: React.FC<Props> = ({ session, onChange }) => {
  const [kind, setKind] = useState<WorkoutExecutionGroup['kind']>('combinado');
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(1);
  const [restBetweenExercises, setRestBetweenExercises] = useState(0);
  const [restBetweenRounds, setRestBetweenRounds] = useState(60);
  const [feedback, setFeedback] = useState('');

  const exercises = session.exercises;
  const groups = session.executionGroups || [];
  const { warnings } = validateExecutionGroups(session);
  const chosen = exercises.slice(startIndex, endIndex + 1);
  const suggestedRounds = chosen[0] ? getSets(chosen[0]) : 0;

  const addGroup = () => {
    const current = exercises.slice(startIndex, endIndex + 1);
    if (current.length < (kind === 'circuitado' ? 3 : 2)) {
      setFeedback(kind === 'circuitado' ? 'Para o circuito, selecione pelo menos três exercícios em sequência.' : 'Selecione pelo menos dois exercícios em sequência.');
      return;
    }
    if (current.some(ex => groups.some(group => group.exerciseIds.includes(ex.id)))) {
      setFeedback('Um exercício já pertence a outro bloco. Exclua ou edite o bloco existente primeiro.');
      return;
    }
    const rounds = getSets(current[0]);
    if (!current.every(ex => getSets(ex) === rounds)) {
      setFeedback('Ajuste o número de séries dos exercícios para ser igual ao número de rodadas. Nada foi alterado automaticamente.');
      return;
    }
    const group: WorkoutExecutionGroup = {
      id: 'grupo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      kind, exerciseIds: current.map(ex => ex.id), rounds,
      restBetweenExercisesSeconds: restBetweenExercises,
      restBetweenRoundsSeconds: restBetweenRounds
    };
    onChange({ ...session, executionGroups: [...groups, group] });
    setFeedback('Bloco criado nesta ficha. Confira a sequência e salve a ficha pelo procedimento habitual.');
  };

  const removeGroup = (id: string) => {
    onChange({ ...session, executionGroups: groups.filter(group => group.id !== id) });
    setFeedback('Bloco removido. As prescrições dos exercícios foram preservadas.');
  };

  return (
    <section className="rounded-2xl border border-emerald-600/30 bg-slate-950/70 p-3 sm:p-4 space-y-3"
      aria-label="Métodos de execução por blocos">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">Métodos de Execução Guiada</h3>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Deixe sem blocos para usar séries simples. Combinado: grupamentos diferentes;
          conjugado: mesmo grupamento; circuitado: três ou mais exercícios em rodadas.
          O treinador define a ordem, sem alterar automaticamente séries, cargas ou vídeos.
        </p>
      </div>

      {groups.length > 0 && (
        <div className="space-y-2">
          {groups.map(group => (
            <div key={group.id} className="rounded-xl border border-slate-700 bg-slate-900 p-3 flex gap-2 justify-between items-start">
              <div className="min-w-0 space-y-1">
                <strong className="text-xs text-emerald-300">{methodLabels[group.kind] || 'Bloco personalizado'}</strong>
                <p className="text-xs text-white">{group.exerciseIds.map(id => exercises.find(ex => ex.id === id)?.name || '(exercício removido)').join(' → ')}</p>
                <p className="text-[11px] text-slate-400">{group.rounds} rodadas • {group.restBetweenExercisesSeconds}s entre exercícios • {group.restBetweenRoundsSeconds}s entre rodadas</p>
              </div>
              <button type="button" onClick={() => removeGroup(group.id)}
                className="shrink-0 min-h-[44px] rounded-lg border border-rose-800 px-3 text-xs font-bold text-rose-300">
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {warnings.map((warning, i) => (
        <p key={i} className="text-xs text-amber-200 border border-amber-800/50 bg-amber-950/20 rounded-lg p-2" role="alert">{warning}</p>
      ))}

      {exercises.length < 2 ? (
        <p className="text-xs text-slate-400">Adicione pelo menos dois exercícios para formar um bloco.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-[11px] text-slate-300">Tipo de bloco
            <select value={kind} onChange={e => setKind(e.target.value as WorkoutExecutionGroup['kind'])}
              className="mt-1 w-full min-h-[44px] rounded-lg bg-slate-900 border border-slate-700 px-2 text-white">
              <option value="combinado">Combinado (grupamentos diferentes)</option>
              <option value="conjugado">Conjugado (mesmo grupamento)</option>
              <option value="circuitado">Circuitado (sequência em rodadas)</option>
            </select>
          </label>

          <label className="text-[11px] text-slate-300">Começa no exercício
            <select value={startIndex} onChange={e => {
              const next = Number(e.target.value);
              setStartIndex(next);
              setEndIndex(Math.max(next + 1, endIndex));
            }}
              className="mt-1 w-full min-h-[44px] rounded-lg bg-slate-900 border border-slate-700 px-2 text-white">
              {exercises.slice(0, -1).map((ex, i) => <option key={ex.id} value={i}>{i + 1}. {ex.name}</option>)}
            </select>
          </label>

          <label className="text-[11px] text-slate-300">Termina no exercício
            <select value={Math.min(exercises.length - 1, Math.max(startIndex + 1, endIndex))}
              onChange={e => setEndIndex(Number(e.target.value))}
              className="mt-1 w-full min-h-[44px] rounded-lg bg-slate-900 border border-slate-700 px-2 text-white">
              {exercises.map((ex, i) => i > startIndex ? <option key={ex.id} value={i}>{i + 1}. {ex.name}</option> : null)}
            </select>
          </label>

          <div className="text-[11px] text-slate-300">
            Rodadas previstas
            <div className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 min-h-[44px] flex items-center">
              <strong className="text-white">{suggestedRounds}</strong>
              <span className="ml-2 text-slate-400">Conforme séries prescritas</span>
            </div>
          </div>

          <label className="text-[11px] text-slate-300">Descanso entre exercícios (segundos)
            <input type="number" min={0} max={600} step={5} value={restBetweenExercises}
              onChange={e => setRestBetweenExercises(Math.min(600, Math.max(0, Number(e.target.value) || 0)))}
              className="mt-1 w-full min-h-[44px] rounded-lg bg-slate-900 border border-slate-700 px-3 text-white"/>
          </label>
          <label className="text-[11px] text-slate-300">Descanso entre rodadas (segundos)
            <input type="number" min={0} max={600} step={5} value={restBetweenRounds}
              onChange={e => setRestBetweenRounds(Math.min(600, Math.max(0, Number(e.target.value) || 0)))}
              className="mt-1 w-full min-h-[44px] rounded-lg bg-slate-900 border border-slate-700 px-3 text-white"/>
          </label>
        </div>
      )}

      {exercises.length >= 2 && (
        <button type="button" onClick={addGroup}
          className="w-full min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold">
          Criar bloco {kind}
        </button>
      )}
      {feedback && <p className="text-[11px] text-amber-200" role="status">{feedback}</p>}
      <p className="text-[11px] text-slate-400">
        Defina as séries e a ordem dos exercícios antes de criar os blocos. Caso altere a ficha depois, os blocos inválidos não serão executados como grupo.
      </p>
    </section>
  );
};
