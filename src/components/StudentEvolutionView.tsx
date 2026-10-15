import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Dumbbell, 
  Activity, 
  Scale, 
  HeartPulse, 
  CheckCircle2, 
  Trash2, 
  Play, 
  Plus, 
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import { UserProgressRecord, WorkoutPlan, CatalogWorkout } from '../types';
import { 
  getCompletedWorkoutsHistory, 
  getStudentProgressStats, 
  removeCompletedWorkout,
  recordCompletedWorkout 
} from '../utils/studentProgressService';
import { getAllCatalogWorkouts, convertCatalogWorkoutToWorkoutPlan } from '../data/workoutCatalogService';

interface StudentEvolutionViewProps {
  onBackToCatalog: () => void;
  onSelectSessionToTrain: (plan: WorkoutPlan) => void;
  onOpenTodayRecommender: () => void;
}

export const StudentEvolutionView: React.FC<StudentEvolutionViewProps> = ({
  onBackToCatalog,
  onSelectSessionToTrain,
  onOpenTodayRecommender
}) => {
  const [history, setHistory] = useState<UserProgressRecord[]>([]);
  const [stats, setStats] = useState(getStudentProgressStats());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedManualWorkoutId, setSelectedManualWorkoutId] = useState<string>('');
  const [allWorkouts, setAllWorkouts] = useState<CatalogWorkout[]>([]);

  const loadData = () => {
    const hist = getCompletedWorkoutsHistory();
    setHistory(hist);
    setStats(getStudentProgressStats());
  };

  useEffect(() => {
    loadData();
    setAllWorkouts(getAllCatalogWorkouts());
  }, []);

  const handleRemove = (id: string) => {
    if (confirm('Deseja remover este registro de treino do histórico?')) {
      removeCompletedWorkout(id);
      loadData();
    }
  };

  const handleRepeatWorkout = (workoutId: string) => {
    const workout = allWorkouts.find(w => w.id === workoutId);
    if (workout) {
      const plan = convertCatalogWorkoutToWorkoutPlan(workout);
      if (plan) {
        onSelectSessionToTrain(plan);
      }
    } else {
      onBackToCatalog();
    }
  };

  const handleManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManualWorkoutId) return;

    const workout = allWorkouts.find(w => w.id === selectedManualWorkoutId);
    if (workout) {
      recordCompletedWorkout(
        workout.id,
        workout.title,
        workout.category,
        parseInt(workout.duration.match(/\d+/)?.[0] || '30', 10),
        [workout.objective],
        workout.equipments,
        workout.level
      );
      loadData();
      setIsManualModalOpen(false);
      setSelectedManualWorkoutId('');
    }
  };

  // Formata data amigável
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      if (isToday) return `Hoje às ${timeStr}`;
      if (isYesterday) return `Ontem às ${timeStr}`;

      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCatalog}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center"
              aria-label="Voltar para o catálogo"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Histórico Real do Aluno
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Sem calorias fictícias</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white">
                Minha Evolução 40+
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="min-h-[42px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition active:scale-95"
              title="Registrar treino feito anteriormente"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Registrar Conclusão</span>
              <span className="sm:hidden">Registrar</span>
            </button>

            <button
              onClick={onOpenTodayRecommender}
              className="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-950/50 active:scale-95"
            >
              <Target className="w-3.5 h-3.5 text-slate-950" />
              <span>Treino de Hoje</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-6 space-y-6 flex-1">
        
        {/* Banner Motivacional com Princípio da Longevidade Ativa */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 sm:p-6 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Constância & Preservação Muscular
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Mais força hoje. Mais autonomia amanhã.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Cada treino concluído preserva massa magra, protege suas articulações e reforça sua independência diária. Acompanhe seu tempo real em movimento.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shrink-0 self-start md:self-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Meta de Frequência</span>
                <span className="text-sm font-black text-white">2 a 4 sessões semanais</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Cards de Métricas Reais (Sem estimativas de queima calórica falsa) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Treinos Concluídos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats.completedWorkoutsCount}
              </span>
              <span className="text-xs text-slate-400 ml-1">sessões</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium mt-1">Registrados com sucesso</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Tempo em Movimento</span>
              <Clock className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalTrainingMinutes}
              </span>
              <span className="text-xs text-slate-400 ml-1">minutos</span>
            </div>
            <span className="text-[10px] text-teal-300 font-medium mt-1">Investidos na sua saúde</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Frequência Semanal</span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats.weeklyFrequency}
              </span>
              <span className="text-xs text-slate-400 ml-1">últimos 7 dias</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-medium mt-1">
              {stats.weeklyFrequency >= 3 ? 'Ótimo ritmo semanal!' : 'Mantenha o foco'}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Última Sessão</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <span className="text-sm sm:text-base font-bold text-white truncate block">
                {stats.lastCompletedDate ? formatDate(stats.lastCompletedDate) : 'Nenhuma ainda'}
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-medium mt-1">
              {stats.lastCompletedDate ? 'Histórico atualizado' : 'Comece hoje mesmo'}
            </span>
          </div>
        </div>

        {/* Linha do Tempo / Histórico de Sessões Concluídas */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Histórico de Sessões ({history.length})
              </h3>
              <p className="text-xs text-slate-400">
                Sessões finalizadas que alimentam as próximas recomendações para evitar repetições.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={onOpenTodayRecommender}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Recomendar Próximo Treino</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-base font-bold text-white">Nenhum treino concluído ainda</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quando você finalizar uma sessão no Modo Aluno ou clicar em "Concluir Treino", ela aparecerá aqui automaticamente.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={onOpenTodayRecommender}
                  className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-950"
                >
                  <Target className="w-4 h-4" />
                  <span>Descobrir Meu Treino de Hoje</span>
                </button>
                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="min-h-[44px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition"
                >
                  Registrar Sessão Feita
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => {
                const durationMin = Math.round((item.duration_seconds || 1800) / 60);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-400">
                            {formatDate(item.completed_at)}
                          </span>
                          <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-emerald-300 font-semibold">
                            {durationMin} min
                          </span>
                          {item.level && (
                            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-slate-400 capitalize">
                              {item.level}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-black text-white truncate">
                          {item.workout_title || 'Treino Concluído'}
                        </h4>

                        {/* Objetivos & Músculos */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.goals && item.goals.map((g, i) => (
                            <span key={i} className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                              ✓ {g}
                            </span>
                          ))}
                          {item.muscle_groups && item.muscle_groups.slice(0, 3).map((m, i) => (
                            <span key={i} className="text-[9px] font-medium text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleRepeatWorkout(item.workout_id)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                        title="Repetir este treino no modo aluno"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Repetir</span>
                      </button>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="min-h-[38px] min-w-[38px] p-2 rounded-xl bg-slate-950 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition flex items-center justify-center"
                        title="Remover do histórico"
                        aria-label="Remover do histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Aviso de Transparência Ética */}
        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-2.5 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300 font-semibold">Princípio de Saúde Real:</strong> O Melhor Forma Play não exibe contadores de calorias artificiais. Nosso foco é tempo real de estímulo motor, constância e evolução na qualidade de vida com autonomia acima dos 40 anos.
          </p>
        </div>

      </main>

      {/* Modal de Registro Manual de Treino */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Registrar Treino Concluído</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualRecord} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Selecione o treino que você realizou:
                </label>
                <select
                  value={selectedManualWorkoutId}
                  onChange={(e) => setSelectedManualWorkoutId(e.target.value)}
                  className="w-full min-h-[46px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Escolha um treino do catálogo (72 sessões) --</option>
                  {allWorkouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.level} • {w.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p>✓ Registrará a data e hora atual.</p>
                <p>✓ Incorporará os objetivos aos seus dados de constância.</p>
                <p>✓ O algoritmo de recomendação considerará esta sessão como recém-realizada.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedManualWorkoutId}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-emerald-950"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
