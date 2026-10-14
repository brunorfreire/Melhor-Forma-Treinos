/**
 * ARQUITETURA DE PAGAMENTOS DESACOPLADA (PREPARAÇÃO FUTURA)
 * 
 * Este módulo estabelece os contratos, interfaces e estruturas necessárias para
 * futura integração com gateways de pagamento (ex: Hotmart, Kiwify, Asaas, Stripe).
 * 
 * DIRETRIZES DE SEGURANÇA & ÉTICA:
 * 1. Não processa dados de cartão no navegador (PCI-DSS compliance).
 * 2. Nenhuma cobrança real é realizada nesta fase.
 * 3. O acesso Premium JAMAIS é concedido por simples clique ou redirecionamento de URL.
 * 4. A validação de direitos de acesso dependerá obrigatoriamente de Webhook assinado
 *    e conferido no backend com tabela entitlements / subscriptions no Supabase.
 */

import { SubscriptionStatus } from '../types';

export interface PaymentWebhookPayload {
  event_id: string; // Prevenção de processamento duplicado (Idempotência)
  event_type: 'subscription.created' | 'subscription.renewed' | 'subscription.canceled' | 'payment.failed' | 'payment.refunded';
  customer: {
    email: string;
    name?: string;
    external_id?: string;
  };
  subscription: {
    id: string;
    product_id: string;
    status: SubscriptionStatus;
    current_period_end: string;
    amount_cents?: number;
    currency?: string;
  };
  signature: string; // Assinatura HMAC SHA-256 do webhook
  timestamp: string;
}

export interface CheckoutIntentRequest {
  productId: string;
  userEmail: string;
  userName?: string;
}

export interface CheckoutIntentResponse {
  configured: boolean;
  checkoutUrl?: string;
  message: string;
}

/**
 * Interface desacoplada para criação de intenção de assinatura
 * Nesta fase de pré-lançamento, não executa cobrança e direciona para lista de interesse ou contato oficial.
 */
export async function createCheckoutIntent(_req: CheckoutIntentRequest): Promise<CheckoutIntentResponse> {
  return {
    configured: false,
    message: 'O Melhor Forma Play está em fase de pré-lançamento e homologação técnica. Pagamentos reais ainda não estão habilitados. Cadastre-se na lista de interesse oficial.'
  };
}

/**
 * Validação de integridade do webhook no servidor (para implementação no backend Express/Supabase Functions)
 */
export function verifyWebhookSignature(payload: string, signature: string, secretKey: string): boolean {
  if (!signature || !secretKey) return false;
  // Em produção com backend ativo: calcular crypto.createHmac('sha256', secretKey).update(payload).digest('hex')
  return true;
}
