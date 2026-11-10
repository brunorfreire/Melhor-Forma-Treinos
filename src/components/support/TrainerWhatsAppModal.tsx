/**
 * MODAL DE ESCALONAMENTO PARA O WHATSAPP COM O TREINADOR BRUNO FREIRE
 * Melhor Forma Play 40+ (Benefício Exclusivo Premium)
 * 
 * Regras:
 * 1. Não expõe o número de telefone em código estático de frontend.
 * 2. Valida o status do aluno no servidor antes de liberar o link.
 * 3. Mostra mensagem clara de horário comercial (não prometer 24/7).
 * 4. Permite ao aluno revisar e editar a mensagem antes do envio.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Crown, 
  Clock, 
  ShieldCheck, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { requestPremiumWhatsAppAccess, buildWhatsAppMessage, PremiumWhatsAppResponse } from '../../services/supportService';

interface TrainerWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  initialSubject?: string;
  initialQuestion?: string;
  onOpenPremiumModal?: () => void;
}

export const TrainerWhatsAppModal: React.FC<TrainerWhatsAppModalProps> = ({
  isOpen,
  onClose,
  userName,
  initialSubject = 'Dúvida sobre meus treinos',
  initialQuestion = '',
  onOpenPremiumModal
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<PremiumWhatsAppResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isFreeUser, setIsFreeUser] = useState(false);

  const [subject, setSubject] = useState(initialSubject);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg('');
    setIsFreeUser(false);

    requestPremiumWhatsAppAccess().then(res => {
      if (!isMounted) return;
      setIsLoading(false);

      if (res.success && res.data) {
        setAuthData(res.data);
        const built = buildWhatsAppMessage({
          userName,
          subject: initialSubject,
          questionSummary: initialQuestion
        });
        setCustomMessage(built);
      } else {
        if (res.isFreeUser) {
          setIsFreeUser(true);
        }
        setErrorMsg(res.errorMessage || 'Acesso não autorizado.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userName, initialSubject, initialQuestion]);

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    if (!authData?.whatsappPhone) return;
    const phone = authData.whatsappPhone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(customMessage.trim());
    const waUrl = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Atendimento com o Treinador Bruno Freire"
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-slideUp sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Benefício Exclusivo Premium
            </span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Falar com Bruno Freire
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Suporte direto com seu treinador pelo WhatsApp para orientações e dúvidas individuais.
          </p>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {isLoading ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Verificando autorização do plano...</p>
            </div>
          ) : isFreeUser ? (
            <div className="py-6 px-4 bg-slate-950 rounded-2xl border border-amber-500/30 text-center space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Canal Exclusivo para Alunos Premium</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                O contato individual via WhatsApp com o treinador Bruno Freire é exclusivo para assinantes Premium.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                Você pode tirar todas as suas dúvidas sobre exercícios, uso do aplicativo e organização da semana gratuitamente pelo <strong className="text-emerald-400">MF Assist</strong>.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                {onOpenPremiumModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPremiumModal();
                    }}
                    className="min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>Conhecer o Plano Premium</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition"
                >
                  Continuar com o MF Assist
                </button>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl space-y-2 text-center">
              <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
              <p className="text-xs text-red-200">{errorMsg}</p>
              <button
                onClick={onClose}
                className="mt-2 text-xs text-slate-300 underline"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              {/* Informativo de Horário Comercial */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-0.5">
                  <strong className="text-white block">Horário de Atendimento Comercial:</strong>
                  <span>{authData?.supportHours || 'Segunda a sexta-feira, das 8h às 18h (não é atendimento 24/7).' }</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    Bruno Freire responde a cada aluno de forma personalizada por ordem de chegada.
                  </span>
                </div>
              </div>

              {/* Assunto da Dúvida */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Assunto da sua dúvida:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Adaptação de exercício para dor no joelho"
                />
              </div>

              {/* Mensagem Pré-formatada para Revisão */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Mensagem a ser enviada no WhatsApp:
                  </label>
                  <span className="text-[10px] text-slate-400">Você pode editar antes de enviar</span>
                </div>
                <textarea
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Botão de Envio para WhatsApp */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>ABRIR WHATSAPP COM BRUNO FREIRE</span>
                </button>

                <p className="text-center text-[10px] text-slate-400">
                  Ao clicar, você será direcionado ao aplicativo WhatsApp para enviar a mensagem.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
