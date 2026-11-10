/**
 * CLIENT SUPPORT SERVICE
 * Melhor Forma Play 40+
 * 
 * Gerencia a comunicação com o MF Assist, validação de elegibilidade Premium
 * e preparação da mensagem de escalonamento para o WhatsApp com o treinador Bruno Freire.
 */

import { getStoredSession } from '../utils/supabaseClient';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  source?: 'verified_faq' | 'ai_assistant' | 'curated_fallback';
  title?: string;
  practicalSteps?: string[];
  relatedTopics?: string[];
  timestamp: string;
  canEscalateToWhatsApp?: boolean;
  resolvedStatus?: 'unanswered' | 'resolved' | 'unresolved';
}

export interface PremiumWhatsAppResponse {
  authorized: boolean;
  trainerName: string;
  supportHours: string;
  whatsappPhone: string;
  messageAdvice: string;
}

export interface SupportTicketPayload {
  name?: string;
  emailOrPhone: string;
  issueType: string;
  description: string;
}

export interface SupportTicketResponse {
  success: boolean;
  ticketId: string;
  message: string;
  supportHours: string;
}

/**
 * Envia uma mensagem para o MF Assist via backend proxy
 */
export async function sendMFAssistMessage(
  userText: string,
  userProfile?: { isPremium: boolean; role?: string; userName?: string }
): Promise<{
  text: string;
  title?: string;
  source: 'verified_faq' | 'ai_assistant' | 'curated_fallback';
  practicalSteps?: string[];
  relatedTopics?: string[];
  canEscalateToWhatsApp?: boolean;
}> {
  const session = getStoredSession();
  const token = session?.token || '';
  const isPremium = userProfile?.isPremium ?? false;
  const role = userProfile?.role || 'student';
  const userName = userProfile?.userName || 'Aluno';

  try {
    const res = await fetch('/api/support/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-user-role': role,
        'x-subscription-status': isPremium ? 'active' : 'free'
      },
      body: JSON.stringify({
        message: userText,
        isPremium,
        userRole: role,
        userName
      })
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Muitas perguntas em pouco tempo. Aguarde 1 minuto para continuar.');
      }
      throw new Error('Não foi possível obter resposta no momento. Tente novamente.');
    }

    const data = await res.json();
    return {
      text: data.answer || '',
      title: data.title,
      source: data.source || 'verified_faq',
      practicalSteps: data.practicalSteps || [],
      relatedTopics: data.relatedTopics || [],
      canEscalateToWhatsApp: data.canEscalateToWhatsApp && isPremium
    };
  } catch (err: any) {
    // Se a rota falhar (ex: offline), busca diretamente na base de conhecimento local
    const { findBestFAQMatches } = await import('./mfAssistKnowledgeBase');
    const matches = findBestFAQMatches(userText, 1);
    if (matches.length > 0) {
      const top = matches[0].faq;
      return {
        text: top.answer,
        title: top.title,
        source: 'verified_faq',
        practicalSteps: top.practicalSteps || [],
        relatedTopics: top.relatedTopics || [],
        canEscalateToWhatsApp: isPremium
      };
    }

    return {
      text: 'O MF Assist está disponível para orientar sobre treinos, funcionalidades do app e rotina 40+. Como posso te ajudar hoje?',
      source: 'curated_fallback',
      canEscalateToWhatsApp: isPremium
    };
  }
}

/**
 * Consulta a autorização para contato via WhatsApp com o treinador Bruno Freire
 * Retorna 403 / error para usuários Free
 */
export async function requestPremiumWhatsAppAccess(): Promise<{
  success: boolean;
  data?: PremiumWhatsAppResponse;
  errorMessage?: string;
  isFreeUser?: boolean;
}> {
  const session = getStoredSession();
  const token = session?.token || '';

  try {
    const res = await fetch('/api/support/premium-whatsapp', {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-user-role': session?.user?.role || 'student',
        'x-subscription-status': session?.user?.subscription_status || 'free'
      }
    });

    if (res.status === 403) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        isFreeUser: true,
        errorMessage: errData.message || 'O suporte direto pelo WhatsApp com o treinador Bruno Freire é exclusivo para assinantes Premium.'
      };
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        errorMessage: errData.message || 'Falha ao validar credenciais de atendimento Premium.'
      };
    }

    const data: PremiumWhatsAppResponse = await res.json();
    return {
      success: true,
      data
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: 'Não foi possível conectar ao servidor de atendimento. Verifique sua conexão.'
    };
  }
}

/**
 * Monta o texto resumido da mensagem a ser enviada no WhatsApp pelo aluno
 */
export function buildWhatsAppMessage(params: {
  userName: string;
  subject: string;
  questionSummary?: string;
}): string {
  const { userName, subject, questionSummary } = params;
  const greeting = 'Olá, treinador Bruno Freire!';
  const intro = `Sou o aluno(a) ${userName.trim() || 'Melhor Forma Play'} (Assinante Premium).`;
  const subjectLine = `Gostaria de uma orientação sobre: ${subject.trim() || 'Treinos e Execução'}.`;
  const details = questionSummary?.trim()
    ? `\n\nDetalhes da minha dúvida:\n"${questionSummary.trim()}"`
    : '';
  const closing = '\n\nPoderia me orientar quando for possível dentro do seu horário de atendimento? Muito obrigado!';

  return `${greeting}\n${intro}\n\n${subjectLine}${details}${closing}`;
}

/**
 * Registra chamado técnico para problemas de login, senha ou falhas do sistema
 * Aberto para Free e Premium
 */
export async function submitSupportTicket(payload: SupportTicketPayload): Promise<SupportTicketResponse> {
  const session = getStoredSession();
  const token = session?.token || '';

  const res = await fetch('/api/support/ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Falha ao registrar chamado técnico.');
  }

  return await res.json();
}
