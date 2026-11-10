/**
 * WIDGET FLUTUANTE E PAINEL DE ATENDIMENTO MF ASSIST 40+
 * Melhor Forma Play 40+
 * 
 * Canal principal de suporte e orientação para alunos Free e Premium.
 * Design acessível 40+, targets >= 44px/48px, contraste WCAG AA,
 * integração com a base oficial curada, IA segura e escalonamento
 * exclusivo para WhatsApp com o treinador Bruno Freire (somente Premium).
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  MessageCircle, 
  Crown, 
  ChevronRight, 
  LifeBuoy, 
  Clock, 
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  FileQuestion,
  Wrench
} from 'lucide-react';
import { 
  ChatMessage, 
  sendMFAssistMessage 
} from '../../services/supportService';
import { 
  MF_ASSIST_KNOWLEDGE_BASE 
} from '../../services/mfAssistKnowledgeBase';
import { TrainerWhatsAppModal } from './TrainerWhatsAppModal';
import { SupportTicketModal } from './SupportTicketModal';

interface MFAssistFloatingWidgetProps {
  hidden?: boolean;
  isPremium?: boolean;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  onOpenPremiumModal?: () => void;
  isOpenExternally?: boolean;
  onCloseExternal?: () => void;
}

const QUICK_SUGGESTIONS = [
  { label: 'Minha Semana em 3 passos', query: 'Como funciona a Minha Semana em 3 passos?' },
  { label: 'Recuperação Ativa', query: 'O que é Recuperação Ativa e dia de descanso?' },
  { label: 'Trocar treino na semana', query: 'Como trocar um treino planejado na minha semana?' },
  { label: 'Catálogo de 72 treinos', query: 'Como funciona o catálogo de 72 treinos?' },
  { label: 'Aumentar o tamanho da letra', query: 'Como aumentar o tamanho das letras do aplicativo?' },
  { label: 'Problemas de login e senha', query: 'Esqueci minha senha ou não consigo entrar' }
];

export const MFAssistFloatingWidget: React.FC<MFAssistFloatingWidgetProps> = ({
  hidden = false,
  isPremium = false,
  userRole = 'student',
  userName = 'Aluno',
  userEmail = '',
  onOpenPremiumModal,
  isOpenExternally = false,
  onCloseExternal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Modais de escalonamento
  const [isTrainerWhatsAppModalOpen, setIsTrainerWhatsAppModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [escalationSubject, setEscalationSubject] = useState('');
  const [escalationQuestion, setEscalationQuestion] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sincroniza abertura disparada externamente (ex: do menu "Mais")
  useEffect(() => {
    if (isOpenExternally) {
      setIsOpen(true);
    }
  }, [isOpenExternally]);

  // Mensagens iniciais acolhedoras
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      title: 'Olá! Sou o MF Assist',
      text: `Olá, ${userName.split(' ')[0]}! Estou aqui para te ajudar a aproveitar o Melhor Forma Play 40+ ao máximo. Você pode tirar dúvidas sobre como organizar sua semana, encontrar treinos no catálogo, executar exercícios com segurança e acompanhar sua evolução.`,
      source: 'verified_faq',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      practicalSteps: [
        'Toque em uma das perguntas rápidas abaixo ou digite sua dúvida.',
        'Se você é aluno Premium e precisar de suporte direto com o treinador Bruno Freire, posso conectar você ao WhatsApp oficial.'
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    const cleanText = rawText.trim();
    if (!cleanText || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsSending(true);

    try {
      const response = await sendMFAssistMessage(cleanText, {
        isPremium,
        role: userRole,
        userName
      });

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: 'assistant',
        title: response.title,
        text: response.text,
        source: response.source,
        practicalSteps: response.practicalSteps,
        relatedTopics: response.relatedTopics,
        canEscalateToWhatsApp: response.canEscalateToWhatsApp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        resolvedStatus: 'unanswered'
      };

      setMessages(prev => [...prev, assistantMsg]);
      setEscalationSubject(response.title || cleanText);
      setEscalationQuestion(cleanText);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Não consegui buscar essa resposta no momento. Por favor, tente novamente ou consulte as perguntas frequentes.',
        source: 'curated_fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveFeedback = (msgId: string, isResolved: boolean) => {
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, resolvedStatus: isResolved ? 'resolved' : 'unresolved' } : m))
    );
  };

  const handleOpenTrainerEscalation = (subject?: string, question?: string) => {
    if (subject) setEscalationSubject(subject);
    if (question) setEscalationQuestion(question);
    setIsTrainerWhatsAppModalOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  if (hidden) return null;

  return (
    <>
      {/* Botão Flutuante (Posicionado acima da barra mobile bottom nav com clearance generoso) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          data-testid="mf-assist-floating-btn"
          aria-label="Abrir suporte e ajuda MF Assist"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 min-h-[50px] px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-950/80 border border-emerald-400/30 flex items-center gap-2.5 transition active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-tight leading-none block">
                MF Assist
              </span>
              <span className="text-[9px] font-mono font-bold bg-white/20 px-1 py-0.2 rounded leading-none text-emerald-100">
                40+
              </span>
            </div>
            <span className="text-[10px] text-emerald-100 leading-tight block">
              Suporte & Dúvidas
            </span>
          </div>
        </button>
      )}

      {/* Drawer / Painel Lateral de Atendimento */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={handleCloseDrawer}
          role="dialog"
          aria-modal="true"
          aria-label="Painel de Suporte MF Assist"
        >
          <div 
            className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] animate-slideUp sm:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do MF Assist */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-black text-white">
                        MF Assist
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                        Oficial 40+
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Base Curada Verificada · Resposta Imediata
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  aria-label="Fechar painel de atendimento"
                  className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status do usuário (Free ou Premium) */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-400">Plano do aluno:</span>
                  {isPremium ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-amber-400" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-slate-300 font-semibold">
                      Gratuito (Free)
                    </span>
                  )}
                </div>

                {isPremium ? (
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    WhatsApp com Bruno Freire incluído
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenPremiumModal) onOpenPremiumModal();
                    }}
                    className="text-[10px] text-emerald-400 hover:underline font-bold"
                  >
                    Conhecer Premium
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Mensagens com Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Sugestões Rápidas de Tópicos */}
              {messages.length <= 2 && (
                <div className="space-y-2 pb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dúvidas mais comuns:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(item.query)}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left transition flex items-center gap-1.5 active:scale-95 text-[11px]"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Balões da Conversa */}
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[90%] rounded-2xl p-3.5 space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs shadow-md'
                    }`}
                  >
                    {/* Título ou origem se for assistente */}
                    {msg.sender === 'assistant' && msg.title && (
                      <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg.title}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap leading-relaxed text-xs">
                      {msg.text}
                    </p>

                    {/* Passos práticos se houver */}
                    {msg.practicalSteps && msg.practicalSteps.length > 0 && (
                      <div className="pt-1.5 space-y-1.5 border-t border-slate-800/80 text-[11px] text-slate-300">
                        <span className="font-bold text-white block">Como fazer:</span>
                        <ul className="space-y-1 pl-1">
                          {msg.practicalSteps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold shrink-0">{sIdx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{msg.timestamp}</span>
                      {msg.source === 'verified_faq' && (
                        <span className="text-emerald-400">Base Curada</span>
                      )}
                    </div>
                  </div>

                  {/* Feedback: "Conseguiu resolver sua dúvida?" */}
                  {msg.sender === 'assistant' && msg.id !== 'welcome-1' && (
                    <div className="mt-2 pl-1 space-y-2 w-full max-w-[90%]">
                      {msg.resolvedStatus === 'unanswered' ? (
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            Conseguiu resolver sua dúvida?
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleResolveFeedback(msg.id, true)}
                              className="min-h-[36px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>Sim</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveFeedback(msg.id, false)}
                              className="min-h-[36px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                            >
                              <ThumbsDown className="w-3 h-3" />
                              <span>Não</span>
                            </button>
                          </div>
                        </div>
                      ) : msg.resolvedStatus === 'resolved' ? (
                        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Que ótimo! Bons treinos e continue firme no seu ritmo.</span>
                        </div>
                      ) : (
                        /* Se o aluno indicou "Não", aplica a regra estrita de escalonamento */
                        <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2.5 animate-fadeIn">
                          {isPremium ? (
                            <>
                              <div className="flex items-start gap-2">
                                <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-white text-xs block">
                                    Atendimento com Bruno Freire
                                  </strong>
                                  <span className="text-[11px] text-slate-300 leading-relaxed block">
                                    Como assinante Premium, você tem direito ao contato direto com seu treinador pelo WhatsApp.
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenTrainerEscalation(msg.title, msg.text)}
                                className="w-full min-h-[44px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-950"
                              >
                                <MessageCircle className="w-4 h-4 fill-current" />
                                <span>Falar com Bruno Freire no WhatsApp</span>
                              </button>

                              <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-center">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>Atendimento comercial: Seg a Sex, das 8h às 18h</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-white text-xs block">
                                    Ainda precisa de ajuda?
                                  </strong>
                                  <span className="text-[11px] text-slate-300 leading-relaxed block">
                                    O contato direto via WhatsApp com Bruno Freire é um benefício exclusivo de alunos Premium.
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setIsTicketModalOpen(true)}
                                  className="w-full min-h-[40px] px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                                >
                                  <Wrench className="w-3.5 h-3.5 text-teal-400" />
                                  <span>Reportar problema técnico ou de acesso</span>
                                </button>

                                {onOpenPremiumModal && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCloseDrawer();
                                      onOpenPremiumModal();
                                    }}
                                    className="w-full min-h-[40px] px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                                  >
                                    <Crown className="w-3.5 h-3.5 fill-current" />
                                    <span>Conhecer o Plano Premium</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs animate-pulse max-w-[80%]">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Consultando orientações oficiais 40+...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua dúvida aqui..."
                  className="flex-1 min-h-[46px] px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  aria-label="Enviar mensagem"
                  className="min-h-[46px] min-w-[46px] px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 text-white font-bold rounded-xl flex items-center justify-center transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
                <span>Respostas revisadas para longevidade e força 40+</span>
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(true)}
                  className="text-slate-400 hover:text-white underline"
                >
                  Suporte técnico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escalonamento para o WhatsApp com Bruno Freire (Premium) */}
      <TrainerWhatsAppModal
        isOpen={isTrainerWhatsAppModalOpen}
        onClose={() => setIsTrainerWhatsAppModalOpen(false)}
        userName={userName}
        initialSubject={escalationSubject}
        initialQuestion={escalationQuestion}
        onOpenPremiumModal={onOpenPremiumModal}
      />

      {/* Modal de Chamado Técnico (Livre para Free e Premium) */}
      <SupportTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        defaultUserName={userName}
        defaultEmailOrPhone={userEmail}
      />
    </>
  );
};
