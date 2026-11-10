import React, { useEffect, useRef } from 'react';
import {
  Film,
  Calendar,
  Layers,
  Target,
  Menu,
  Sparkles,
  Trophy,
  Dumbbell,
  X,
  User,
  ShieldCheck,
  ChevronRight,
  Type,
  Bot
} from 'lucide-react';
import { ViewMode } from '../../types';
import { AccessibilityTextSizeToggle } from '../accessibility/AccessibilityTextSizeToggle';

interface MobileBottomNavProps {
  currentViewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenTodayModal: () => void;
  isTodayModalOpen?: boolean;
  isPrivilegedUser?: boolean;
  isMoreMenuOpen: boolean;
  onToggleMoreMenu: () => void;
  onCloseMoreMenu: () => void;
  userRole?: string;
  userName?: string;
  isPremium?: boolean;
  onShowAccessibilityFeedback?: (msg: string) => void;
  onOpenMFAssist?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentViewMode,
  onSelectViewMode,
  onOpenTodayModal,
  isTodayModalOpen = false,
  isPrivilegedUser = false,
  isMoreMenuOpen,
  onToggleMoreMenu,
  onCloseMoreMenu,
  userRole,
  userName = 'Aluno',
  isPremium = false,
  onShowAccessibilityFeedback,
  onOpenMFAssist
}) => {
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Fecha o menu Mais ao pressionar Escape
  useEffect(() => {
    if (!isMoreMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMoreMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoreMenuOpen, onCloseMoreMenu]);

  // Itens secundários no menu Mais: Coleção, Evolução, Editor (quando autorizado)
  const isMoreActive =
    isMoreMenuOpen ||
    currentViewMode === 'collection' ||
    currentViewMode === 'evolution' ||
    currentViewMode === 'editor';

  const handleSelectTab = (mode: ViewMode) => {
    onCloseMoreMenu();
    onSelectViewMode(mode);
  };

  const handleTodayClick = () => {
    onCloseMoreMenu();
    onOpenTodayModal();
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* SHEET / MODAL DO MENU MAIS (Acessível, sem scroll horizontal, < 768px)    */}
      {/* ========================================================================= */}
      {isMoreMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mais opções de navegação"
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={onCloseMoreMenu}
        >
          <div
            ref={moreMenuRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] animate-slideUp"
          >
            {/* Cabeçalho do Menu Mais */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Mais opções</h3>
                  <p className="text-[11px] text-slate-400">
                    Recursos e ferramentas do Melhor Forma Play
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMoreMenu}
                aria-label="Fechar menu de mais opções"
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações da conta ativa */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Perfil {userRole === 'admin' ? 'Administrador' : userRole === 'trainer' ? 'Treinador' : isPremium ? 'Premium' : 'Aluno Free'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                40+
              </span>
            </div>

            {/* Controle de Acessibilidade: Tamanho das Letras */}
            <AccessibilityTextSizeToggle
              variant="full"
              onShowFeedback={onShowAccessibilityFeedback}
            />

            {/* Lista de Opções Secundárias */}
            <div className="space-y-1.5" role="menu">
              {/* Opção Coleção 40+ */}
              <button
                type="button"
                role="menuitem"
                onClick={() => handleSelectTab('collection')}
                className={`w-full min-h-[52px] p-3 rounded-2xl flex items-center justify-between gap-3 text-left transition active:scale-[0.99] ${
                  currentViewMode === 'collection'
                    ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-950/60'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      currentViewMode === 'collection'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold block">Coleção 40+</span>
                    <span
                      className={`text-[11px] block truncate ${
                        currentViewMode === 'collection' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      Programas organizados por nível e metodologia
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
              </button>

              {/* Opção Minha Evolução */}
              <button
                type="button"
                role="menuitem"
                onClick={() => handleSelectTab('evolution')}
                className={`w-full min-h-[52px] p-3 rounded-2xl flex items-center justify-between gap-3 text-left transition active:scale-[0.99] ${
                  currentViewMode === 'evolution'
                    ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-950/60'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      currentViewMode === 'evolution'
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-500/15 text-teal-400 border border-teal-500/25'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold block">Minha Evolução</span>
                    <span
                      className={`text-[11px] block truncate ${
                        currentViewMode === 'evolution' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      Histórico real de treinos concluídos e frequência
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
              </button>

              {/* Opção Editor do Treinador (Exclusiva para Perfis Autorizados) */}
              {isPrivilegedUser && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectTab('editor')}
                  className={`w-full min-h-[52px] p-3 rounded-2xl flex items-center justify-between gap-3 text-left transition active:scale-[0.99] ${
                    currentViewMode === 'editor'
                      ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-950/60'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        currentViewMode === 'editor'
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                      }`}
                    >
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold block">
                          Editor do Treinador
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-purple-500/25 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/35">
                          Técnico
                        </span>
                      </div>
                      <span
                        className={`text-[11px] block truncate ${
                          currentViewMode === 'editor' ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        Prescrição de treinos, blocos e biblioteca de exercícios
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
                </button>
              )}

              {/* Opção Suporte & Ajuda (MF Assist) */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onCloseMoreMenu();
                  if (onOpenMFAssist) onOpenMFAssist();
                }}
                className="w-full min-h-[52px] p-3 rounded-2xl flex items-center justify-between gap-3 text-left transition active:scale-[0.99] bg-slate-950/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold block">
                        Suporte & Ajuda (MF Assist)
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/25 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/35">
                        IA First
                      </span>
                    </div>
                    <span className="text-[11px] block truncate text-slate-400">
                      Tire dúvidas sobre treinos, Minha Semana ou fale com o treinador
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRA INFERIOR FIXA MOBILE (5 OPÇÕES PERFEITAMENTE VISÍVEIS, < 768px)       */}
      {/* 1. Início | 2. Semana | 3. Treinos | 4. Hoje | 5. Mais                    */}
      {/* ========================================================================= */}
      <nav
        aria-label="Navegação móvel principal"
        data-testid="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800/95 shadow-2xl shadow-black pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] pt-1"
      >
        <div className="grid grid-cols-5 items-center w-full px-1">
          {/* 1. Início */}
          <button
            type="button"
            onClick={() => handleSelectTab('home')}
            aria-label="Início - Catálogo Play"
            aria-current={currentViewMode === 'home' ? 'page' : undefined}
            className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              currentViewMode === 'home'
                ? 'text-emerald-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition ${
                currentViewMode === 'home' ? 'bg-emerald-500/15 text-emerald-400' : ''
              }`}
            >
              <Film className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[11px] tracking-tight leading-none truncate max-w-full">
              Início
            </span>
          </button>

          {/* 2. Semana */}
          <button
            type="button"
            onClick={() => handleSelectTab('my_week')}
            aria-label="Minha Semana de Treinos"
            aria-current={currentViewMode === 'my_week' ? 'page' : undefined}
            className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              currentViewMode === 'my_week'
                ? 'text-emerald-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition ${
                currentViewMode === 'my_week' ? 'bg-emerald-500/15 text-emerald-400' : ''
              }`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[11px] tracking-tight leading-none truncate max-w-full">
              Semana
            </span>
          </button>

          {/* 3. Treinos */}
          <button
            type="button"
            onClick={() => handleSelectTab('student')}
            aria-label="Treinos - Ficha e Execução Guiada"
            aria-current={currentViewMode === 'student' ? 'page' : undefined}
            className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              currentViewMode === 'student'
                ? 'text-emerald-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition ${
                currentViewMode === 'student' ? 'bg-emerald-500/15 text-emerald-400' : ''
              }`}
            >
              <Layers className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[11px] tracking-tight leading-none truncate max-w-full">
              Treinos
            </span>
          </button>

          {/* 4. Hoje */}
          <button
            type="button"
            onClick={handleTodayClick}
            aria-label="Hoje - Recomendador de treino ideal"
            aria-current={isTodayModalOpen ? 'page' : undefined}
            className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              isTodayModalOpen
                ? 'text-emerald-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition ${
                isTodayModalOpen ? 'bg-emerald-500/15 text-emerald-400' : ''
              }`}
            >
              <Target className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[11px] tracking-tight leading-none truncate max-w-full">
              Hoje
            </span>
          </button>

          {/* 5. Mais */}
          <button
            type="button"
            onClick={onToggleMoreMenu}
            aria-label="Mais opções: Coleção, Evolução e Editor"
            aria-expanded={isMoreMenuOpen}
            className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              isMoreActive
                ? 'text-emerald-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition ${
                isMoreActive ? 'bg-emerald-500/15 text-emerald-400' : ''
              }`}
            >
              <Menu className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[11px] tracking-tight leading-none truncate max-w-full">
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
