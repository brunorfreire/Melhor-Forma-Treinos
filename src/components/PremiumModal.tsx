import React, { useState } from 'react';
import { 
  Crown, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Dumbbell, 
  Activity, 
  Heart, 
  Scale, 
  Layers, 
  ArrowRight,
  MessageCircle,
  Mail,
  UserCheck
} from 'lucide-react';
import { CatalogWorkout } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWorkout?: CatalogWorkout | null;
  onOpenAuth?: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  targetWorkout,
  onOpenAuth
}) => {
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [submittedInterest, setSubmittedInterest] = useState(false);

  if (!isOpen) return null;

  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentContact.trim()) return;

    // Salva na lista de interesse localmente para o treinador consultar
    try {
      const existing = JSON.parse(localStorage.getItem('mf_premium_interest_leads_v1') || '[]');
      existing.unshift({
        name: studentName.trim() || 'Aluno Interessado',
        contact: studentContact.trim(),
        targetWorkoutTitle: targetWorkout?.title || 'Catálogo Geral',
        date: new Date().toISOString()
      });
      localStorage.setItem('mf_premium_interest_leads_v1', JSON.stringify(existing));
    } catch {}

    setSubmittedInterest(true);
  };

  const handleDirectWhatsApp = () => {
    const phone = '5511999999999'; // Número institucional da equipe
    const text = encodeURIComponent(
      `Olá, Prof. Anderson! Estou no Melhor Forma Play e tenho interesse em desbloquear o Acesso Premium${
        targetWorkout ? ` para treinar "${targetWorkout.title}"` : ''
      }. Como posso garantir minha vaga?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Apresentação do Acesso Premium"
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com degradê elegante */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-b border-slate-800/80">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              Conteúdo Exclusivo
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            DESBLOQUEIE TODO O SEU POTENCIAL
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Tenha acesso ao catálogo completo do Melhor Forma Play e encontre novas possibilidades para cuidar da sua saúde, força e qualidade de vida.
          </p>

          {/* Destaque se o usuário clicou em um treino específico */}
          {targetWorkout && (
            <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                <img 
                  src={targetWorkout.coverImage} 
                  alt={targetWorkout.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">
                  Treino Selecionado (Exclusivo Premium)
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {targetWorkout.title}
                </h4>
                <span className="text-[11px] text-slate-400 block">
                  {targetWorkout.duration} • Nível {targetWorkout.level}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Corpo com Benefícios Oficiais do Catálogo */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {!showInterestForm ? (
            <>
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  O que está incluído no Acesso Premium:
                </span>

                <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">72 Treinos sob Demanda:</strong>
                      <span>Acesso irrestrito a todas as 72 sessões cadastradas no catálogo inicial.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Seis Coleções Completas:</strong>
                      <span>Força 40+, Membros Superiores, Inferiores, Full Body, Cardio e Mobilidade/Equilíbrio.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Diferentes Níveis & Filtros por Tempo:</strong>
                      <span>Iniciante, intermediário e avançado, com sessões de 15, 20, 30 e 40+ minutos para sua rotina.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Vídeos Demonstrativos Validados:</strong>
                      <span>Orientações técnicas com postura, biomecânica e cuidados para articulações seguras.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nota de Transparência sobre Pagamentos */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1 -mt-0.5" />
                <strong>Fase de Homologação:</strong> O Melhor Forma Play não cobra valores automaticamente nem armazena cartões. Para liberar sua assinatura com suporte do professor Anderson, cadastre-se na lista de interesse oficial.
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowInterestForm(true)}
                  className="w-full min-h-[48px] px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition"
                >
                  <Crown className="w-4 h-4 fill-current" />
                  <span>QUERO ACESSO PREMIUM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDirectWhatsApp}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Falar com o Treinador no WhatsApp</span>
                </button>

                {onOpenAuth && (
                  <p className="text-center text-[11px] text-slate-400 pt-1">
                    Já possui conta ou assinatura?{' '}
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Entrar na Minha Conta
                    </button>
                  </p>
                )}
              </div>
            </>
          ) : submittedInterest ? (
            <div className="p-6 text-center space-y-4 bg-slate-950 rounded-2xl border border-emerald-500/30">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Interesse Registrado com Sucesso!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Obrigado pelo seu interesse! Nossa equipe de educação física entrará em contato para apresentar as condições e liberar seu acesso completo.
              </p>
              <button
                onClick={onClose}
                className="min-h-[44px] px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs transition"
              >
                Voltar ao Catálogo Gratuito
              </button>
            </div>
          ) : (
            <form onSubmit={handleInterestSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Lista de Interesse Oficial
                </span>
                <button
                  type="button"
                  onClick={() => setShowInterestForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Voltar
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Informe seus dados para receber o convite prioritário de liberação do catálogo completo.
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase block">
                  Seu Nome:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: Maria de Fátima"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase block">
                  WhatsApp ou E-mail:
                </label>
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  required
                  placeholder="Ex: (11) 99999-9999 ou seu@email.com"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950 mt-2"
              >
                Confirmar Interesse na Assinatura
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
