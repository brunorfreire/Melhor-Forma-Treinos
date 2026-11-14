import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Lock,
  Clock,
  Layers,
  Dumbbell,
  Sparkles,
  Target,
  ArrowLeft,
  RotateCcw
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
  filterWorkoutsForDayFocus,
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

  // Treino candidato selecionado aguardando confirmação explícita do aluno
  const [pendingWorkout, setPendingWorkout] = useState<CatalogWorkout | null>(null);

  // Limpa seleção pendente ao abrir ou trocar o dia selecionado
  useEffect(() => {
    if (isOpen) {
      setPendingWorkout(null);
      setAccessFilter(isDemoMode ? 'liberados' : 'todos');
    }
  }, [isOpen, dayItem?.dateISO, dayItem?.plannedFocus, isDemoMode]);

  const catalogWorkouts = useMemo(() => {
    return getAllCatalogWorkouts().filter(w => w.status === 'publicado');
  }, []);

  // Treinos elegíveis estritamente pelo foco/grupamento muscular planejado para o dia
  const focusEligibleWorkouts = useMemo(() => {
    return catalogWorkouts.filter(w => doesWorkoutMatchFocus(w, dayItem?.plannedFocus));
  }, [catalogWorkouts, dayItem?.plannedFocus]);

  // Equipamentos disponíveis dentro do grupamento muscular selecionado
  const availableEquipments = useMemo(() => {
    const set = new Set<string>();
    focusEligibleWorkouts.forEach(w => {
      (w.equipments || []).forEach(eq => {
        if (eq && eq.trim()) set.add(eq.trim());
      });
    });
    return Array.from(set).sort();
  }, [focusEligibleWorkouts]);

  const plannedFocusLabel = getFocusLabel(dayItem?.plannedFocus, dayItem?.plannedFocusLabel);
  const hasSpecificFocus = Boolean(
    dayItem?.plannedFocus &&
      dayItem.plannedFocus !== 'livre' &&
      dayItem.plannedFocus !== 'todos'
  );

  // Filtragem estrita: o filtro de grupamento muscular é obrigatório e precede busca, filtros e ordenação
  const filteredAndSortedWorkouts = useMemo(() => {
    return filterWorkoutsForDayFocus(catalogWorkouts, {
      plannedFocus: dayItem?.plannedFocus,
      searchTerm,
      levelFilter,
      durationFilter,
      equipmentFilter,
      accessFilter,
      userStatus,
      userRole,
      purchasedWorkoutIds
    });
  }, [
    catalogWorkouts,
    dayItem?.plannedFocus,
    accessFilter,
    levelFilter,
    durationFilter,
    equipmentFilter,
    searchTerm,
    userStatus,
    userRole,
    purchasedWorkoutIds
  ]);

  const hasActiveSecondaryFilters =
    levelFilter !== 'todos' ||
    durationFilter !== 'todos' ||
    equipmentFilter !== 'todos' ||
    searchTerm.trim() !== '';

  const hasUnlockedInFocusWithoutSecondaryFilters = useMemo(() => {
    return focusEligibleWorkouts.some(w =>
      canUserAccessWorkout(w, userStatus, userRole, purchasedWorkoutIds)
    );
  }, [focusEligibleWorkouts, userStatus, userRole, purchasedWorkoutIds]);

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

  const handleCloseModal = () => {
    setPendingWorkout(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isReplacing ? 'Trocar treino do dia' : 'Escolher treino do dia'}
      data-testid="workout-picker-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overflow-x-hidden"
    >
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Cabeçalho do Modal */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-2.5 bg-slate-950/80">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {dayMeta.formattedFullDate}
              </span>
              <span
                data-testid="picker-selected-focus-badge"
                className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 max-w-full"
              >
                <Target className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {hasSpecificFocus ? `Foco exclusivo: ${plannedFocusLabel}` : `Foco: ${plannedFocusLabel}`}
                </span>
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white leading-tight">
              {isReplacing ? 'Trocar treino deste dia' : 'Escolher treino para este dia'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            data-testid="close-workout-picker-btn"
            aria-label="Fechar seletor de treinos"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca e Filtros Transversais (sempre restritos ao foco do dia) */}
        <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5 relative min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="picker-search-input"
                placeholder="Buscar neste foco..."
                className="w-full min-h-[42px] bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-1.5 min-w-0">
              {/* Filtro Nível */}
              <select
                aria-label="Filtrar por nível"
                data-testid="picker-level-filter"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="w-full min-w-0 min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl px-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
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
                className="w-full min-w-0 min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl px-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
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
                className="col-span-2 sm:col-span-1 w-full min-w-0 min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl px-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Todos os equipamentos</option>
                {availableEquipments.map(eq => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() =>
                  setAccessFilter(prev => (prev === 'liberados' ? 'todos' : 'liberados'))
                }
                data-testid="toggle-access-filter-btn"
                className={`min-h-[36px] px-3 py-1 rounded-lg border font-bold transition ${
                  accessFilter === 'liberados'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                {accessFilter === 'liberados'
                  ? 'Apenas liberados (neste foco)'
                  : 'Todos (Free + Premium)'}
              </button>
            </div>

            <span
              data-testid="picker-results-count"
              className="text-slate-300 font-bold"
            >
              {filteredAndSortedWorkouts.length}{' '}
              {filteredAndSortedWorkouts.length === 1 ? 'treino disponível' : 'treinos disponíveis'}
            </span>
          </div>
        </div>

        {/* Confirmação Explícita antes de Substituir ou Definir Treino */}
        {pendingWorkout && (
          <div
            data-testid="picker-confirmation-banner"
            className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/50 space-y-3 animate-fadeIn"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    Confirmação necessária
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300">
                    {plannedFocusLabel}
                  </span>
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

        {/* Lista de Treinos Disponíveis (estritamente do foco selecionado) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {filteredAndSortedWorkouts.length === 0 ? (
            <div
              data-testid="picker-empty-state"
              className="p-5 sm:p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4"
            >
              <Dumbbell className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="space-y-1.5 max-w-md mx-auto">
                <p className="text-sm sm:text-base font-black text-white">
                  {accessFilter === 'liberados' && hasActiveSecondaryFilters && hasUnlockedInFocusWithoutSecondaryFilters
                    ? 'Nenhum treino gratuito neste foco corresponde aos filtros aplicados.'
                    : 'Não encontramos treinos para este grupamento com os filtros escolhidos.'}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {accessFilter === 'liberados' && hasActiveSecondaryFilters && hasUnlockedInFocusWithoutSecondaryFilters ? (
                    <>
                      Os filtros de nível, duração ou equipamento não encontraram opções gratuitas dentro de{' '}
                      <strong className="text-emerald-300">{plannedFocusLabel}</strong>. Limpe os filtros abaixo ou veja todas as opções deste mesmo grupamento.
                    </>
                  ) : (
                    <>
                      O filtro de grupamento (<strong className="text-emerald-300">{plannedFocusLabel}</strong>) foi mantido para proteger sua divisão semanal. Limpe os filtros abaixo ou volte ao planejamento para alterar o foco do dia.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLevelFilter('todos')}
                  disabled={levelFilter === 'todos'}
                  data-testid="clear-level-filter-btn"
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition ${
                    levelFilter !== 'todos'
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar filtros de nível</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDurationFilter('todos')}
                  disabled={durationFilter === 'todos'}
                  data-testid="clear-duration-filter-btn"
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition ${
                    durationFilter !== 'todos'
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar filtros de duração</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEquipmentFilter('todos')}
                  disabled={equipmentFilter === 'todos'}
                  data-testid="clear-equipment-filter-btn"
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition ${
                    equipmentFilter !== 'todos'
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar filtros de equipamentos</span>
                </button>

                {searchTerm.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    data-testid="clear-search-filter-btn"
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpar busca</span>
                  </button>
                )}

                {accessFilter === 'liberados' && (
                  <button
                    type="button"
                    onClick={() => setAccessFilter('todos')}
                    data-testid="show-all-access-same-focus-btn"
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Ver Free + Premium deste foco</span>
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-center">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  data-testid="back-to-planning-btn"
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao planejamento para alterar o foco do dia</span>
                </button>
              </div>
            </div>
          ) : (
            filteredAndSortedWorkouts.map((w) => {
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
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 shrink-0" />
                        <span>{plannedFocusLabel}</span>
                      </span>

                      {w.accessLevel === 'free' ? (
                        <span
                          data-testid={`picker-badge-free-${w.id}`}
                          className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        >
                          Gratuito
                        </span>
                      ) : hasAccess ? (
                        <span
                          data-testid={`picker-badge-unlocked-${w.id}`}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30"
                        >
                          Premium • Liberado
                        </span>
                      ) : (
                        <span
                          data-testid={`picker-badge-premium-${w.id}`}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1"
                        >
                          <Lock className="w-2.5 h-2.5 shrink-0" /> Premium
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
                        <Clock className="w-3 h-3 text-emerald-400 shrink-0" /> {w.duration}
                      </span>
                      {summary.exerciseCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3 h-3 text-teal-400 shrink-0" /> {summary.exerciseCount} exercícios
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
