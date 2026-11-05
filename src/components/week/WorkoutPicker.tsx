import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  Clock,
  Layers,
  Dumbbell,
  Filter,
  Sparkles
} from 'lucide-react';
import {
  CatalogWorkout,
  DayScheduleItem,
  SubscriptionStatus,
  UserRole
} from '../../types';
import {
  WeekCalendarDayMeta,
  doesWorkoutMatchFocus,
  getFocusLabel,
  getWorkoutSummaryDetails
} from '../../services/weeklyScheduleService';
import {
  canUserAccessWorkout,
  getAllCatalogWorkouts
} from '../../data/workoutCatalogService';

interface WorkoutPickerProps {
  isOpen: boolean;
  dayItem: DayScheduleItem;
  dayMeta: WeekCalendarDayMeta;
  currentWorkout: CatalogWorkout | null;
  userStatus?: SubscriptionStatus;
  userRole?: UserRole;
  purchasedWorkoutIds?: string[];
  isDemoMode?: boolean;
  onClose: () => void;
  onConfirmSelectWorkout: (workout: CatalogWorkout, confirmTrainerOverride?: boolean) => void;
  onOpenPremiumInfo?: (workout: CatalogWorkout) => void;
}

function parseMinutesFromDuration(durationStr?: string): number {
  if (!durationStr) return 30;
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

export const WorkoutPicker: React.FC<WorkoutPickerProps> = ({
  isOpen,
  dayItem,
  dayMeta,
  currentWorkout,
  userStatus,
  userRole,
  purchasedWorkoutIds,
  isDemoMode = false,
  onClose,
  onConfirmSelectWorkout,
  onOpenPremiumInfo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'todos' | 'iniciante' | 'intermediario' | 'avancado'>('todos');
  const [durationFilter, setDurationFilter] = useState<'todos' | 'curto' | 'medio' | 'longo'>('todos');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('todos');
  const [accessFilter, setAccessFilter] = useState<'todos' | 'liberados'>(
    isDemoMode ? 'liberados' : 'todos'
  );
  const [showOtherFocus, setShowOtherFocus] = useState<boolean>(true);

  // Treino candidato selecionado aguardando confirmação explícita do aluno
  const [pendingWorkout, setPendingWorkout] = useState<CatalogWorkout | null>(null);

  const catalogWorkouts = useMemo(() => {
    return getAllCatalogWorkouts().filter(w => w.status === 'publicado');
  }, []);

  const availableEquipments = useMemo(() => {
    const set = new Set<string>();
    catalogWorkouts.forEach(w => {
      (w.equipments || []).forEach(eq => {
        if (eq && eq.trim()) set.add(eq.trim());
      });
    });
    return Array.from(set).sort();
  }, [catalogWorkouts]);

  const plannedFocusLabel = getFocusLabel(dayItem?.plannedFocus, dayItem?.plannedFocusLabel);

  const filteredAndSortedWorkouts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = catalogWorkouts.filter((w) => {
      const hasAccess = canUserAccessWorkout(w, userStatus, userRole, purchasedWorkoutIds);
      if (accessFilter === 'liberados' && !hasAccess) {
        return false;
      }

      if (levelFilter !== 'todos' && w.level !== levelFilter) {
        return false;
      }

      if (durationFilter !== 'todos') {
        const mins = parseMinutesFromDuration(w.duration);
        if (durationFilter === 'curto' && mins > 25) return false;
        if (durationFilter === 'medio' && (mins <= 25 || mins > 38)) return false;
        if (durationFilter === 'longo' && mins <= 38) return false;
      }

      if (equipmentFilter !== 'todos') {
        const eqs = (w.equipments || []).map(e => e.toLowerCase());
        if (!eqs.includes(equipmentFilter.toLowerCase())) return false;
      }

      const matchesFocus = doesWorkoutMatchFocus(w, dayItem.plannedFocus);
      if (!showOtherFocus && !matchesFocus) {
        return false;
      }

      if (query) {
        const haystack = `${w.title} ${w.objective} ${w.description} ${(w.equipments || []).join(' ')}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    // Prioriza no topo:
    // 1. Treinos compatíveis com o foco planejado para o dia
    // 2. Treinos liberados para o nível de acesso do aluno
    return filtered.sort((a, b) => {
      const aMatch = doesWorkoutMatchFocus(a, dayItem.plannedFocus) ? 1 : 0;
      const bMatch = doesWorkoutMatchFocus(b, dayItem.plannedFocus) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;

      const aAccess = canUserAccessWorkout(a, userStatus, userRole, purchasedWorkoutIds) ? 1 : 0;
      const bAccess = canUserAccessWorkout(b, userStatus, userRole, purchasedWorkoutIds) ? 1 : 0;
      if (aAccess !== bAccess) return bAccess - aAccess;

      return a.title.localeCompare(b.title);
    });
  }, [
    catalogWorkouts,
    accessFilter,
    levelFilter,
    durationFilter,
    equipmentFilter,
    showOtherFocus,
    searchTerm,
    dayItem?.plannedFocus,
    userStatus,
    userRole,
    purchasedWorkoutIds
  ]);

  if (!isOpen || !dayItem || !dayMeta) return null;

  const isReplacing = Boolean(currentWorkout);

  const handleCandidateClick = (workout: CatalogWorkout) => {
    const hasAccess = canUserAccessWorkout(workout, userStatus, userRole, purchasedWorkoutIds);
    if (!hasAccess) {
      if (onOpenPremiumInfo) {
        onOpenPremiumInfo(workout);
      }
      return;
    }
    setPendingWorkout(workout);
  };

  const handleConfirm = () => {
    if (!pendingWorkout) return;
    onConfirmSelectWorkout(pendingWorkout, true);
    setPendingWorkout(null);
  };

  const pendingMatchesFocus = pendingWorkout
    ? doesWorkoutMatchFocus(pendingWorkout, dayItem.plannedFocus)
    : true;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isReplacing ? 'Trocar treino do dia' : 'Escolher treino do dia'}
      data-testid="workout-picker-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/80">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {dayMeta.formattedFullDate}
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                Foco planejado: <strong className="text-emerald-400">{plannedFocusLabel}</strong>
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white">
              {isReplacing ? 'Trocar treino deste dia' : 'Escolher treino para este dia'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setPendingWorkout(null);
              onClose();
            }}
            data-testid="close-workout-picker-btn"
            aria-label="Fechar seletor de treinos"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca e Filtros Confiáveis (Nível, Duração, Equipamento, Foco) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, foco ou equipamento..."
                className="w-full min-h-[42px] bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-6 grid grid-cols-3 gap-1.5">
              {/* Filtro Nível */}
              <select
                aria-label="Filtrar por nível"
                data-testid="picker-level-filter"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl px-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Todos os níveis</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>

              {/* Filtro Duração */}
              <select
                aria-label="Filtrar por duração"
                data-testid="picker-duration-filter"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as any)}
                className="min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl px-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Qualquer duração</option>
                <option value="curto">Até 25 min</option>
                <option value="medio">26 a 38 min</option>
                <option value="longo">40+ min</option>
              </select>

              {/* Filtro Equipamento */}
              <select
                aria-label="Filtrar por equipamento"
                data-testid="picker-equipment-filter"
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl px-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Equipamentos</option>
                {availableEquipments.map(eq => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOtherFocus(prev => !prev)}
                data-testid="toggle-other-focus-btn"
                className={`min-h-[34px] px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition ${
                  !showOtherFocus
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <Filter className="w-3 h-3 text-emerald-400" />
                <span>
                  {!showOtherFocus
                    ? `Apenas foco: ${plannedFocusLabel}`
                    : 'Priorizando foco do dia no topo'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAccessFilter(prev => (prev === 'liberados' ? 'todos' : 'liberados'))
                }
                data-testid="toggle-access-filter-btn"
                className={`min-h-[34px] px-3 py-1 rounded-lg border font-bold transition ${
                  accessFilter === 'liberados'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                {accessFilter === 'liberados' ? 'Apenas liberados p/ minha conta' : 'Todos (Free + Premium)'}
              </button>
            </div>

            <span className="text-slate-400 font-semibold">
              {filteredAndSortedWorkouts.length} opções disponíveis
            </span>
          </div>
        </div>

        {/* Confirmação Explícita antes de Substituir ou Definir Treino */}
        {pendingWorkout && (
          <div
            data-testid="picker-confirmation-banner"
            className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/50 space-y-3 animate-fadeIn"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    Confirmação necessária
                  </span>
                  {!pendingMatchesFocus && (
                    <span
                      data-testid="different-focus-warning"
                      className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Atenção: este treino tem foco diferente de "{plannedFocusLabel}"
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-white">
                  {isReplacing ? (
                    <>
                      Deseja substituir <span className="text-slate-300">"{currentWorkout?.title}"</span> por{' '}
                      <span className="text-emerald-300">"{pendingWorkout.title}"</span> em {dayMeta.fullName}?
                    </>
                  ) : (
                    <>
                      Confirmar <span className="text-emerald-300">"{pendingWorkout.title}"</span> para {dayMeta.fullName}?
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPendingWorkout(null)}
                  data-testid="cancel-workout-replace-btn"
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  data-testid="confirm-workout-replace-btn"
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{isReplacing ? 'Confirmar troca' : 'Confirmar escolha'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Treinos Disponíveis */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2.5">
          {filteredAndSortedWorkouts.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 border border-slate-800 rounded-2xl space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">
                Nenhum treino encontrado com estes filtros
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setLevelFilter('todos');
                  setDurationFilter('todos');
                  setEquipmentFilter('todos');
                  setShowOtherFocus(true);
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filteredAndSortedWorkouts.map((w) => {
              const matchesFocus = doesWorkoutMatchFocus(w, dayItem.plannedFocus);
              const hasAccess = canUserAccessWorkout(w, userStatus, userRole, purchasedWorkoutIds);
              const isCurrent = currentWorkout?.id === w.id;
              const isSelectedCandidate = pendingWorkout?.id === w.id;
              const summary = getWorkoutSummaryDetails(w.id);

              return (
                <div
                  key={w.id}
                  data-testid={`picker-workout-option-${w.id}`}
                  className={`p-3 sm:p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelectedCandidate
                      ? 'bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-400/30'
                      : isCurrent
                        ? 'bg-slate-950/90 border-teal-500/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {matchesFocus ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Compatível com o foco do dia
                        </span>
                      ) : (
                        <span
                          data-testid={`picker-focus-mismatch-${w.id}`}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1"
                        >
                          <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                          Foco diferente do planejado para o dia
                        </span>
                      )}

                      {hasAccess ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                          Liberado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Premium
                        </span>
                      )}

                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                          Atual neste dia
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                      {w.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {w.objective}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-300 font-semibold pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> {w.duration}
                      </span>
                      {summary.exerciseCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3 h-3 text-teal-400" /> {summary.exerciseCount} exercícios
                        </span>
                      )}
                      <span className="capitalize">Nível {w.level}</span>
                      {w.equipments && w.equipments.length > 0 && (
                        <span className="text-slate-400">
                          • {w.equipments.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        Selecionado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCandidateClick(w)}
                        data-testid={`select-candidate-workout-${w.id}`}
                        className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
                          hasAccess
                            ? isSelectedCandidate
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40'
                            : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {hasAccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isReplacing ? 'Substituir por este' : 'Selecionar treino'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Exclusivo Premium</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
