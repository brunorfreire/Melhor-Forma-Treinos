import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Download,
  Upload,
  Trash2,
  Copy,
  MessageCircle,
  Dumbbell,
  Plus,
  X,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { WorkoutPlan, SavedStudentWorkout } from '../types';
import {
  getSavedStudents,
  saveStudentWorkout,
  deleteSavedStudent,
  duplicateSavedStudent,
  exportStudentsBackupJSON,
  importStudentsBackupJSON
} from '../utils/studentStorage';

interface StudentHistoryModalProps {
  currentPlan: WorkoutPlan;
  onSelectPlan: (plan: WorkoutPlan) => void;
  onClose: () => void;
  onOpenShareModal: (plan: WorkoutPlan) => void;
}

export function StudentHistoryModal({
  currentPlan,
  onSelectPlan,
  onClose,
  onOpenShareModal
}: StudentHistoryModalProps) {
  const [students, setStudents] = useState<SavedStudentWorkout[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega alunos do LocalStorage
  const refreshStudents = () => {
    setStudents(getSavedStudents());
  };

  useEffect(() => {
    refreshStudents();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Salvar o aluno que está atualmente no editor
  const handleSaveCurrentStudent = () => {
    if (!currentPlan.studentName.trim()) {
      showFeedback('⚠️ Digite o nome do aluno no treino antes de salvar.');
      return;
    }
    saveStudentWorkout(currentPlan);
    refreshStudents();
    showFeedback(`✅ Ficha de "${currentPlan.studentName}" salva no seu histórico!`);
  };

  // Deletar aluno
  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o histórico de "${name}"?`)) {
      const updated = deleteSavedStudent(id);
      setStudents(updated);
      showFeedback(`Ficha de "${name}" removida.`);
    }
  };

  // Duplicar aluno / Criar nova fase
  const handleDuplicate = (id: string, name: string) => {
    const duplicated = duplicateSavedStudent(id);
    if (duplicated) {
      refreshStudents();
      showFeedback(`Cópia criada: "${duplicated.studentName}"!`);
    }
  };

  // Importar JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importStudentsBackupJSON(content);
        if (result.success) {
          refreshStudents();
          showFeedback(`🎉 Backup importado com sucesso! Total: ${result.count} alunos.`);
        } else {
          alert(`Erro ao importar backup: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Formatação de data amigável
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Data recente';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recente';
    }
  };

  // Filtragem da busca
  const filteredStudents = students.filter((s) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      s.studentName.toLowerCase().includes(query) ||
      s.goal.toLowerCase().includes(query) ||
      s.frequency.toLowerCase().includes(query) ||
      (s.trainerName && s.trainerName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white leading-tight">
                  Carteira & Histórico de Alunos
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% no seu navegador • Sem mensalidade de banco de dados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition flex items-center justify-center"
            aria-label="Fechar carteira de alunos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Search & Actions Toolbar */}
        <div className="p-4 space-y-3 border-b border-slate-800/60 bg-slate-900/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno por nome, objetivo..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Action Buttons: Save Current, Export, Import */}
          <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
            <button
              onClick={handleSaveCurrentStudent}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition active:scale-98 shadow-sm"
              title="Salvar a ficha aberta atualmente no editor"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Salvar Ficha Aberta</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={exportStudentsBackupJSON}
                disabled={students.length === 0}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl flex items-center gap-1 transition"
                title="Baixar cópia de segurança em arquivo JSON"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium">Exportar Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1 transition"
                title="Restaurar backup anterior"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-medium">Restaurar</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Student Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredStudents.length === 0 ? (
            <div className="py-10 text-center space-y-3 text-slate-400">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">
                  {searchTerm ? 'Nenhum aluno encontrado para essa busca.' : 'Nenhum aluno no histórico ainda.'}
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {searchTerm
                    ? 'Tente buscar com outro termo ou limpe o campo de busca.'
                    : 'Ao montar treinos ou clicar em "Salvar Ficha Aberta", os treinos dos seus alunos ficarão organizados aqui sem custo de banco de dados.'}
                </p>
              </div>

              {!searchTerm && currentPlan.studentName && (
                <button
                  onClick={handleSaveCurrentStudent}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Salvar "{currentPlan.studentName}" como 1º Aluno
                </button>
              )}
            </div>
          ) : (
            filteredStudents.map((item) => {
              const isCurrentOpen = currentPlan.id === item.plan.id || currentPlan.studentName === item.studentName;
              return (
                <div
                  key={item.id}
                  className={`bg-slate-950/70 border rounded-2xl p-3.5 space-y-3 transition ${
                    isCurrentOpen
                      ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md shadow-emerald-950/30'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm uppercase shrink-0">
                        {item.studentName.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            {item.studentName}
                          </h4>
                          {isCurrentOpen && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                              Aberta no Editor
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {item.goal} • {item.frequency}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(item.id, item.studentName)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                        title="Duplicar ficha (criar nova fase/treino)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(item.id, item.studentName)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        title="Excluir aluno do histórico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sessions and Exercises badges */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Dumbbell className="w-3 h-3 text-emerald-400" />
                      {item.sessionsCount} {item.sessionsCount === 1 ? 'treino' : 'treinos'} ({item.exercisesCount} exercícios)
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.updatedAt)}
                    </span>
                  </div>

                  {/* Action Buttons Row (Touch Target >= 44px) */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        onSelectPlan(item.plan);
                        onClose();
                      }}
                      className="flex-1 min-h-[44px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Abrir no Editor</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenShareModal(item.plan);
                      }}
                      className="min-h-[44px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      title="Compartilhar link de WhatsApp deste aluno"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="hidden xs:inline">
            💡 Dica: Ao trocar de computador ou celular, use <strong>Exportar Backup</strong>.
          </span>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition flex items-center justify-center ml-auto"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
