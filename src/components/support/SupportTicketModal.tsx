/**
 * FORMULÁRIO DE SUPORTE TÉCNICO E ACESSO
 * Melhor Forma Play 40+
 * 
 * Permite que qualquer aluno (Free ou Premium) reporte problemas com
 * login, senha, e-mail de acesso ou falhas técnicas sem custo.
 */

import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { submitSupportTicket } from '../../services/supportService';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmailOrPhone?: string;
  defaultUserName?: string;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  defaultEmailOrPhone = '',
  defaultUserName = ''
}) => {
  const [name, setName] = useState(defaultUserName);
  const [emailOrPhone, setEmailOrPhone] = useState(defaultEmailOrPhone);
  const [issueType, setIssueType] = useState('acesso_login');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !description.trim()) {
      setErrorMessage('Por favor, preencha seu contato e descreva o problema.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await submitSupportTicket({
        name: name.trim() || 'Aluno',
        emailOrPhone: emailOrPhone.trim(),
        issueType,
        description: description.trim()
      });

      setSubmittedTicketId(res.ticketId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao enviar chamado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Suporte Técnico e de Acesso"
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-slideUp sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            Canal Aberto para Todos os Alunos
          </span>
          <h3 className="text-xl font-black text-white">
            Suporte Técnico e de Conta
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Dificuldades com login, redefinição de senha ou uso do sistema.
          </p>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {submittedTicketId ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-white">
                Chamado Registrado!
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Seu chamado foi registrado com o código:
              </p>
              <div className="inline-block px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm font-bold text-emerald-400">
                {submittedTicketId}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Nossa equipe verificará seu cadastro e responderá pelo contato informado em horário comercial.
              </p>
              <button
                onClick={onClose}
                className="min-h-[44px] px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
              >
                Voltar ao Aplicativo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase block">
                  Seu Nome:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase block">
                  WhatsApp ou E-mail para contato:
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: (11) 98765-4321 ou seu@email.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase block">
                  Tipo de Problema:
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="acesso_login">Problemas para entrar ou login bloqueado</option>
                  <option value="recuperacao_senha">Dificuldade para redefinir senha</option>
                  <option value="video_reproducao">Problema ao carregar vídeos de exercícios</option>
                  <option value="minha_semana">Dúvida sobre salvar Minha Semana</option>
                  <option value="outro">Outro problema técnico</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase block">
                  Descrição detalhada:
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  placeholder="Explique o que aconteceu, mensagem de erro na tela ou dúvida que teve..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registrando chamado...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ENVIAR CHAMADO DE SUPORTE</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Atendimento de suporte em horário comercial</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
