/**
 * ARQUITETURA DE AUTENTICAÇÃO REAL E SEGURANÇA (SUPABASE AUTH + OAUTH 2.0 GOOGLE)
 * Melhor Forma Play 40+
 * 
 * Regras Obrigatórias de Produção:
 * 1. Não utiliza modos simulados (sem isDevFallback, sem transitional_dev, sem verificação fictícia de OTP).
 * 2. Se o Supabase não estiver configurado no build, bloqueia todas as rotas protegidas e exibe
 *    apenas uma mensagem discreta e amigável: "O acesso está temporariamente indisponível. Tente novamente mais tarde."
 *    Detalhes técnicos são registrados exclusivamente no console/ambiente dev.
 * 3. Todas as permissões (app_role e subscription_status) são validadas diretamente no Supabase (public.profiles),
 *    sem confiar em valores manipuláveis no cliente.
 * 4. Exige confirmação real de e-mail antes de liberar o acesso de alunos cadastrados por e-mail/senha,
 *    e aceita e-mails verificados pelo provedor Google OAuth.
 * 5. Restauração e revalidação viva da sessão no servidor (GET /auth/v1/user) em cada carregamento.
 * 6. Sistema único de sessão sincronizado na chave local 'mf_play_user_session_auth_v2',
 *    sem apagar indiscriminadamente outras chaves do localStorage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, SubscriptionStatus, UserRole } from '../types';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  message: string;
}

export const SUPABASE_PROJECT_ID = 'fjzikpukrwarjjfwsgek';
export const PRODUCTION_SITE_URL = 'https://treinos.melhorformateam.com';
export const SUPABASE_OAUTH_CALLBACK_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/callback`;

export const GENERIC_CONFIG_ERROR = 'O acesso está temporariamente indisponível. Tente novamente mais tarde.';

const LOCAL_SESSION_KEY = 'mf_play_user_session_auth_v2';
const OAUTH_PENDING_KEY = 'mf_oauth_pending_v1';
const OAUTH_ORIGIN_VIEW_KEY = 'mf_oauth_origin_view_v1';

function getRuntimeEnv(key: string): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return String(import.meta.env[key]).trim();
  }
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.__MF_CONFIG__ && win.__MF_CONFIG__[key]) return String(win.__MF_CONFIG__[key]).trim();
    if (win.__ENV__ && win.__ENV__[key]) return String(win.__ENV__[key]).trim();
  }
  return '';
}

export function getSupabaseUrl(): string {
  return getRuntimeEnv('VITE_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  return getRuntimeEnv('VITE_SUPABASE_ANON_KEY');
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('http') &&
    !url.includes('your-project')
  );

  return {
    isConfigured,
    url: isConfigured ? url : null,
    message: isConfigured
      ? 'Supabase Auth conectado ativamente na nuvem.'
      : 'Credenciais de autenticação não configuradas no ambiente.'
  };
}

/**
 * Instância singleton do cliente oficial @supabase/supabase-js
 * Utilizada para o fluxo oficial signInWithOAuth({ provider: 'google' }),
 * troca de códigos PKCE/Implicit e renovação segura de token, mantendo
 * 'mf_play_user_session_auth_v2' como fonte unificada de sessão da aplicação.
 */
let supabaseInstance: SupabaseClient | null = null;
let supabaseInstanceUrl = '';

export function getSupabaseClient(): SupabaseClient | null {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) return null;

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!supabaseInstance || supabaseInstanceUrl !== url) {
    supabaseInstanceUrl = url;
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return supabaseInstance;
}

/**
 * Determina a URL de retorno após autorização OAuth no Google/Supabase.
 * Em produção no domínio oficial, retorna sempre https://treinos.melhorformateam.com.
 */
export function getOAuthRedirectUrl(): string {
  const customRedirect = getRuntimeEnv('VITE_AUTH_REDIRECT_URL');
  if (customRedirect && customRedirect.startsWith('http')) {
    return customRedirect;
  }

  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname.toLowerCase();
    if (host === 'treinos.melhorformateam.com' || host.endsWith('.melhorformateam.com')) {
      return PRODUCTION_SITE_URL;
    }
    return window.location.origin;
  }

  return PRODUCTION_SITE_URL;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  isDevFallback: false;
  expiresAt?: number;
}

/**
 * Lê a sessão gravada localmente na chave oficial mf_play_user_session_auth_v2
 */
export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token || parsed.isDevFallback) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('Erro ao carregar sessão local:', e);
    return null;
  }
}

/**
 * Persiste ou remove exclusivamente a chave de sessão local, sem afetar outros dados do localStorage
 */
export function storeSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session && session.token && !session.isDevFallback) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    console.error('Erro ao salvar sessão local:', e);
  }
}

/**
 * Retorna o token JWT ativo
 */
export function getValidSessionToken(): string | null {
  const session = getStoredSession();
  return session?.token || null;
}

/**
 * Verifica dinamicamente nas configurações públicas do Supabase Auth (/auth/v1/settings)
 * se o provedor Google OAuth já foi ativado com Client ID e Secret válidos.
 */
let cachedGoogleProviderEnabled: boolean | null = null;
let cachedGoogleCheckTimestamp = 0;

export async function checkGoogleProviderEnabled(forceRefresh = false): Promise<{
  enabled: boolean;
  checkedLive: boolean;
}> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    return { enabled: false, checkedLive: false };
  }

  const now = Date.now();
  if (!forceRefresh && cachedGoogleProviderEnabled !== null && now - cachedGoogleCheckTimestamp < 30000) {
    return { enabled: cachedGoogleProviderEnabled, checkedLive: true };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey
      }
    });

    if (res.ok) {
      const data = await res.json();
      const isGoogleEnabled = Boolean(data?.external?.google);
      cachedGoogleProviderEnabled = isGoogleEnabled;
      cachedGoogleCheckTimestamp = now;
      return { enabled: isGoogleEnabled, checkedLive: true };
    }
  } catch (err) {
    console.warn('[Supabase OAuth] Não foi possível consultar /auth/v1/settings:', err);
  }

  return { enabled: false, checkedLive: false };
}

/**
 * Traduz códigos de erro OAuth (cancelamento, falha de vinculação, provedor desabilitado)
 * para mensagens claras e amigáveis em português.
 */
function translateOAuthError(errorCode: string, errorDescription: string): string {
  const code = (errorCode || '').toLowerCase();
  const desc = decodeURIComponent((errorDescription || '').replace(/\+/g, ' ')).toLowerCase();

  if (
    code === 'access_denied' ||
    desc.includes('access_denied') ||
    desc.includes('user_cancelled') ||
    desc.includes('canceled') ||
    desc.includes('cancelled') ||
    desc.includes('consent_required')
  ) {
    return 'Você cancelou a entrada com o Google. Quando quiser, tente novamente ou continue com seu e-mail.';
  }

  if (
    desc.includes('provider is not enabled') ||
    desc.includes('unsupported provider')
  ) {
    return 'O login com Google ainda está em fase final de ativação no servidor. Por favor, utilize a opção "Continuar com e-mail".';
  }

  if (
    desc.includes('database error saving new user') ||
    desc.includes('duplicate key') ||
    desc.includes('unique constraint') ||
    desc.includes('already registered') ||
    desc.includes('identity_already_exists')
  ) {
    return 'Identificamos que este e-mail já está vinculado a uma conta existente. Por favor, acesse utilizando "Continuar com e-mail".';
  }

  if (desc.includes('email_not_verified') || desc.includes('unverified email')) {
    return 'Sua conta do Google precisa ter um endereço de e-mail verificado para acessar a plataforma.';
  }

  if (code === 'Invalid Refresh Token' || desc.includes('expired') || code === 'otp_expired') {
    return 'O link de autorização expirou. Por favor, tente entrar novamente.';
  }

  return 'Não foi possível concluir a autenticação com o Google. Tente novamente ou entre com seu e-mail e senha.';
}

/**
 * Inspeciona a URL atual em busca de parâmetros de retorno do fluxo OAuth 2.0
 * (erros, cancelamentos, access_token no hash ou code PKCE na query string)
 * e limpa a barra de endereços sem recarregar a página.
 */
function inspectOAuthCallbackUrl(): {
  hasOAuthError: boolean;
  oauthErrorMsg?: string;
  hasOAuthTokens: boolean;
  hashAccessToken?: string;
  hashRefreshToken?: string;
  hashExpiresAt?: number;
  pkceCode?: string;
  isRecoveryFlow?: boolean;
  originView?: 'login' | 'register';
} {
  if (typeof window === 'undefined') {
    return { hasOAuthError: false, hasOAuthTokens: false };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  // Trata hashes que não sejam rotas SPA (ex: #/entrar)
  const hashParams = new URLSearchParams(rawHash.startsWith('/') ? '' : rawHash);

  const originViewRaw = sessionStorage.getItem(OAUTH_ORIGIN_VIEW_KEY);
  const originView: 'login' | 'register' = originViewRaw === 'register' ? 'register' : 'login';

  // 1. Verifica erro ou cancelamento OAuth
  const error = searchParams.get('error') || hashParams.get('error');
  const errorCode = searchParams.get('error_code') || hashParams.get('error_code') || '';
  const errorDescription = searchParams.get('error_description') || hashParams.get('error_description') || '';

  if (error) {
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
    sessionStorage.removeItem(OAUTH_ORIGIN_VIEW_KEY);

    // Limpa os parâmetros de erro da URL
    try {
      const cleanPath = window.location.pathname || '/';
      window.history.replaceState(null, '', cleanPath);
    } catch {}

    return {
      hasOAuthError: true,
      oauthErrorMsg: translateOAuthError(error || errorCode, errorDescription),
      hasOAuthTokens: false,
      originView
    };
  }

  // 2. Verifica tokens no fragmento (#access_token=...) ou código PKCE (?code=...)
  const hashAccessToken = hashParams.get('access_token') || undefined;
  const hashRefreshToken = hashParams.get('refresh_token') || undefined;
  const expiresAtParam = hashParams.get('expires_at');
  const expiresInParam = hashParams.get('expires_in');
  const authType = hashParams.get('type') || searchParams.get('type') || '';
  const pkceCode = searchParams.get('code') || undefined;

  let hashExpiresAt: number | undefined;
  if (expiresAtParam) {
    hashExpiresAt = Number(expiresAtParam) * 1000;
  } else if (expiresInParam) {
    hashExpiresAt = Date.now() + Number(expiresInParam) * 1000;
  }

  const hasOAuthTokens = Boolean(hashAccessToken || pkceCode);

  if (hasOAuthTokens) {
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
    sessionStorage.removeItem(OAUTH_ORIGIN_VIEW_KEY);
  }

  return {
    hasOAuthError: false,
    hasOAuthTokens,
    hashAccessToken,
    hashRefreshToken,
    hashExpiresAt,
    pkceCode,
    isRecoveryFlow: authType === 'recovery',
    originView
  };
}

/**
 * Inicia o fluxo oficial de autenticação OAuth 2.0 com Google via Supabase Auth:
 * supabase.auth.signInWithOAuth({ provider: 'google' })
 */
export async function signInWithGoogle(
  originView: 'login' | 'register' = 'login'
): Promise<{
  success: boolean;
  providerNotConfigured?: boolean;
  error?: string;
}> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    console.error('[Supabase Auth] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.');
    return {
      success: false,
      error: GENERIC_CONFIG_ERROR
    };
  }

  // Verifica se o provedor Google está habilitado no projeto Supabase antes de redirecionar
  const providerStatus = await checkGoogleProviderEnabled(true);
  if (!providerStatus.enabled) {
    return {
      success: false,
      providerNotConfigured: true,
      error: 'O acesso com Google está aguardando a conclusão da configuração do provedor no painel Supabase. Por enquanto, escolha "Continuar com e-mail".'
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: GENERIC_CONFIG_ERROR
    };
  }

  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(OAUTH_PENDING_KEY, '1');
      sessionStorage.setItem(OAUTH_ORIGIN_VIEW_KEY, originView);
    }

    const redirectTo = getOAuthRedirectUrl();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        sessionStorage.removeItem(OAUTH_ORIGIN_VIEW_KEY);
      }
      return {
        success: false,
        error: translateOAuthError(error.name || '', error.message || '')
      };
    }

    return { success: true };
  } catch (err: any) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      sessionStorage.removeItem(OAUTH_ORIGIN_VIEW_KEY);
    }
    return {
      success: false,
      error: `Erro ao iniciar conexão com o Google: ${err.message || 'Tente novamente.'}`
    };
  }
}

/**
 * Consulta de forma autoritativa os dados de perfil na tabela public.profiles.
 * - NUNCA confia em app_role ou subscription_status vindos do cliente/navegador.
 * - NUNCA sobrescreve privilégios administrativos (admin/trainer) ou assinaturas existentes.
 * - Para usuários Google novos cujo nome em public.profiles ficou apenas com o prefixo do e-mail,
 *   sincroniza de forma segura apenas nome e avatar_url verificados pelo Google.
 */
async function fetchAuthoritativeProfile(
  userId: string, 
  token: string,
  authUserData?: {
    email?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
  }
): Promise<{
  appRole: UserRole;
  subscriptionStatus: SubscriptionStatus;
  nome?: string;
  cref?: string;
  avatarUrl?: string;
}> {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  const meta = authUserData?.user_metadata || {};
  const verifiedGoogleName = String(meta.nome || meta.full_name || meta.name || '').trim();
  const verifiedGoogleAvatar = String(meta.avatar_url || meta.picture || '').trim();
  const userEmail = String(authUserData?.email || '').trim().toLowerCase();
  const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0] : '';

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=id,app_role,subscription_status,nome,cref,avatar_url,email`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const appRole: UserRole =
          item.app_role === 'admin' || item.app_role === 'trainer' ? item.app_role : 'student';
        const subscriptionStatus: SubscriptionStatus = 
          ['active', 'canceled', 'past_due', 'trialing', 'refunded', 'free'].includes(item.subscription_status)
            ? item.subscription_status
            : 'free';

        let currentNome: string | undefined = item.nome ? String(item.nome).trim() : undefined;
        let currentAvatar: string | undefined = item.avatar_url ? String(item.avatar_url).trim() : undefined;

        // Se o perfil foi criado pelo trigger apenas com o prefixo do e-mail e o provedor OAuth
        // forneceu o nome completo verificado, atualiza exclusivamente nome/avatar_url (preservando app_role e subscription_status)
        const shouldSyncName =
          verifiedGoogleName.length >= 2 &&
          (!currentNome || currentNome === emailPrefix);
        const shouldSyncAvatar = Boolean(verifiedGoogleAvatar && !currentAvatar);

        if (shouldSyncName || shouldSyncAvatar) {
          const updatePayload: Record<string, string> = {};
          if (shouldSyncName) {
            updatePayload.nome = verifiedGoogleName;
            currentNome = verifiedGoogleName;
          }
          if (shouldSyncAvatar) {
            updatePayload.avatar_url = verifiedGoogleAvatar;
            currentAvatar = verifiedGoogleAvatar;
          }

          try {
            await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(updatePayload)
            });
          } catch {
            // Ignora falha silenciosa de sincronização cosmética; perfil autoritativo permanece intacto
          }
        }

        return {
          appRole,
          subscriptionStatus,
          nome: currentNome || verifiedGoogleName || undefined,
          cref: item.cref || undefined,
          avatarUrl: currentAvatar || verifiedGoogleAvatar || undefined
        };
      }

      // Caso extremo: usuário recém-autenticado no Supabase Auth mas sem registro em public.profiles
      // Cria perfil estritamente como student/free com resolução ignore-duplicates para NUNCA sobrescrever conta existente
      if (Array.isArray(data) && data.length === 0 && userEmail) {
        const initialName = verifiedGoogleName || emailPrefix || 'Aluno';
        try {
          await fetch(`${supabaseUrl}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${token}`,
              'Prefer': 'resolution=ignore-duplicates,return=minimal'
            },
            body: JSON.stringify({
              id: userId,
              nome: initialName,
              email: userEmail,
              app_role: 'student',
              subscription_status: 'free',
              ...(verifiedGoogleAvatar ? { avatar_url: verifiedGoogleAvatar } : {})
            })
          });
        } catch {}

        return {
          appRole: 'student',
          subscriptionStatus: 'free',
          nome: initialName,
          avatarUrl: verifiedGoogleAvatar || undefined
        };
      }
    }
  } catch (err) {
    console.warn('Não foi possível sincronizar perfil do banco:', err);
  }

  return {
    appRole: 'student',
    subscriptionStatus: 'free',
    nome: verifiedGoogleName || undefined,
    avatarUrl: verifiedGoogleAvatar || undefined
  };
}

/**
 * Validação rigorosa e revalidação viva da sessão junto ao Supabase Auth.
 * Processa também retornos de Google OAuth (#access_token ou ?code) e erros/cancelamentos.
 * NUNCA confia apenas na presença de dados em localStorage.
 */
export async function validateCurrentSession(): Promise<{
  valid: boolean;
  session: AuthSession | null;
  isOAuthCallback?: boolean;
  oauthError?: string;
  oauthOriginView?: 'login' | 'register';
  isEmailUnconfirmed?: boolean;
  error?: string;
}> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    storeSession(null);
    return {
      valid: false,
      session: null
    };
  }

  // 1. Verifica se a URL atual é um retorno de fluxo OAuth (erro, cancelamento ou tokens)
  const oauthOutcome = inspectOAuthCallbackUrl();
  if (oauthOutcome.hasOAuthError) {
    return {
      valid: false,
      session: null,
      oauthError: oauthOutcome.oauthErrorMsg,
      oauthOriginView: oauthOutcome.originView
    };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const supabase = getSupabaseClient();

  let activeToken: string | null = null;
  let activeExpiresAt: number | undefined;
  let isOAuthCallback = oauthOutcome.hasOAuthTokens;

  // 2. Se retornou do OAuth com código PKCE (?code=...) ou hash (#access_token=...)
  if (supabase && oauthOutcome.pkceCode) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(oauthOutcome.pkceCode);
      if (!error && data?.session?.access_token) {
        activeToken = data.session.access_token;
        activeExpiresAt = data.session.expires_at ? Number(data.session.expires_at) * 1000 : undefined;
      }
    } catch (e) {
      console.warn('[Supabase OAuth] Falha ao trocar código PKCE:', e);
    }
  }

  if (!activeToken && oauthOutcome.hashAccessToken) {
    activeToken = oauthOutcome.hashAccessToken;
    activeExpiresAt = oauthOutcome.hashExpiresAt;
    if (supabase && oauthOutcome.hashAccessToken && oauthOutcome.hashRefreshToken) {
      try {
        await supabase.auth.setSession({
          access_token: oauthOutcome.hashAccessToken,
          refresh_token: oauthOutcome.hashRefreshToken
        });
      } catch {}
    }
  }

  // Se ainda não temos token da URL, verifica se o SDK @supabase/supabase-js capturou/renovou uma sessão
  if (!activeToken && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        activeToken = data.session.access_token;
        activeExpiresAt = data.session.expires_at ? Number(data.session.expires_at) * 1000 : undefined;
      }
    } catch {}
  }

  // Fallback para a sessão persistida em mf_play_user_session_auth_v2
  const stored = getStoredSession();
  if (!activeToken && stored?.token) {
    activeToken = stored.token;
    activeExpiresAt = stored.expiresAt;
  }

  // Limpa parâmetros sensíveis de OAuth da barra de endereços após leitura
  if (oauthOutcome.hasOAuthTokens && typeof window !== 'undefined') {
    try {
      const cleanPath = window.location.pathname || '/';
      window.history.replaceState(null, '', cleanPath);
    } catch {}
  }

  if (!activeToken) {
    return { valid: false, session: null };
  }

  try {
    // 3. Revalidação viva do token com o servidor Supabase Auth
    let userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${activeToken}`
      }
    });

    // Se o token local expirou mas o SDK possui refresh_token válido, tenta renovar
    if (!userRes.ok && supabase) {
      try {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData?.session?.access_token) {
          activeToken = refreshData.session.access_token;
          activeExpiresAt = refreshData.session.expires_at
            ? Number(refreshData.session.expires_at) * 1000
            : undefined;
          userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: 'GET',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${activeToken}`
            }
          });
        }
      } catch {}
    }

    if (!userRes.ok) {
      storeSession(null);
      return {
        valid: false,
        session: null,
        error: 'Sua sessão expirou ou foi revogada. Por favor, entre novamente.'
      };
    }

    const userData = await userRes.json();
    if (!userData || !userData.id) {
      storeSession(null);
      return { valid: false, session: null, error: 'Usuário não encontrado no servidor.' };
    }

    // 4. Validação obrigatória de e-mail confirmado (aceitando confirmação por e-mail ou provedor Google verificado)
    const isGoogleVerified =
      userData.app_metadata?.provider === 'google' ||
      (Array.isArray(userData.app_metadata?.providers) && userData.app_metadata.providers.includes('google')) ||
      userData.user_metadata?.email_verified === true;

    const isEmailConfirmed = Boolean(
      userData.email_confirmed_at ||
      userData.confirmed_at ||
      isGoogleVerified
    );

    if (!isEmailConfirmed) {
      storeSession(null);
      return {
        valid: false,
        session: null,
        isEmailUnconfirmed: true,
        error: 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.'
      };
    }

    // 5. Consulta autoritativa na tabela public.profiles
    const profile = await fetchAuthoritativeProfile(userData.id, activeToken, userData);

    const refreshedProfile: UserProfile = {
      id: userData.id,
      nome:
        profile.nome ||
        userData.user_metadata?.nome ||
        userData.user_metadata?.full_name ||
        userData.user_metadata?.name ||
        (userData.email ? userData.email.split('@')[0] : 'Aluno'),
      email: userData.email,
      role: profile.appRole,
      cref: profile.cref,
      avatar_url: profile.avatarUrl || userData.user_metadata?.avatar_url || userData.user_metadata?.picture,
      created_at: userData.created_at,
      subscription_status: profile.subscriptionStatus
    };

    const refreshedSession: AuthSession = {
      user: refreshedProfile,
      token: activeToken,
      isDevFallback: false,
      expiresAt: activeExpiresAt
    };

    storeSession(refreshedSession);
    return {
      valid: true,
      session: refreshedSession,
      isOAuthCallback
    };
  } catch (err: any) {
    return {
      valid: false,
      session: null,
      error: `Erro ao validar sessão: ${err.message}`
    };
  }
}

/**
 * Login com e-mail e senha via Supabase Auth
 */
export async function loginUser(
  email: string, 
  password: string
): Promise<{ 
  success: boolean; 
  session?: AuthSession; 
  isEmailUnconfirmed?: boolean; 
  error?: string 
}> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    console.error('[Supabase Auth] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão disponíveis no build de produção.');
    return {
      success: false,
      error: GENERIC_CONFIG_ERROR
    };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
  }
  if (!password) {
    return { success: false, error: 'Por favor, informe sua senha.' };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = (data.error_description || data.message || '').toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('not confirmed') || msg.includes('email_not_confirmed')) {
        return {
          success: false,
          isEmailUnconfirmed: true,
          error: 'E-mail não confirmado. O acesso requer confirmação obrigatória. Verifique sua caixa de entrada ou solicite o reenvio do código.'
        };
      }
      if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
        return { success: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
      }
      return { success: false, error: data.error_description || data.message || 'Falha ao autenticar no servidor.' };
    }

    // Validação estrita de confirmação de e-mail
    const isConfirmed = Boolean(data.user?.email_confirmed_at || data.user?.confirmed_at);
    if (!isConfirmed) {
      return {
        success: false,
        isEmailUnconfirmed: true,
        error: 'Seu e-mail ainda não foi confirmado. O acesso só é liberado após validação real.'
      };
    }

    // Sincroniza tokens com a instância @supabase/supabase-js sem criar sessões conflitantes
    const supabase = getSupabaseClient();
    if (supabase && data.access_token && data.refresh_token) {
      try {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });
      } catch {}
    }

    // Consulta perfil autoritativo
    const profile = await fetchAuthoritativeProfile(data.user.id, data.access_token, data.user);

    const userProfile: UserProfile = {
      id: data.user.id,
      nome: profile.nome || data.user.user_metadata?.full_name || data.user.user_metadata?.nome || email.split('@')[0],
      email: data.user.email,
      role: profile.appRole,
      cref: profile.cref,
      avatar_url: profile.avatarUrl || data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at,
      subscription_status: profile.subscriptionStatus
    };

    const session: AuthSession = {
      user: userProfile,
      token: data.access_token,
      isDevFallback: false,
      expiresAt: data.expires_at ? Number(data.expires_at) * 1000 : undefined
    };

    storeSession(session);
    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: `Erro de conexão: ${err.message}` };
  }
}

/**
 * Cadastro de novo usuário com confirmação obrigatória de e-mail.
 * Detecta identidades já existentes (identities === []) para impedir contas duplicadas.
 */
export async function registerUser(
  nome: string, 
  email: string, 
  password: string
): Promise<{ 
  success: boolean; 
  requiresEmailConfirmation?: boolean; 
  email?: string; 
  error?: string 
}> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    console.error('[Supabase Auth] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão disponíveis no build de produção.');
    return {
      success: false,
      error: GENERIC_CONFIG_ERROR
    };
  }

  const cleanName = (nome || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || cleanName.length < 3) {
    return { success: false, error: 'Por favor, informe seu nome completo (mínimo de 3 caracteres).' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        data: {
          full_name: cleanName,
          nome: cleanName
        }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = (data.error_description || data.message || '').toLowerCase();
      if (msg.includes('user already registered') || msg.includes('already exists')) {
        return {
          success: false,
          error: 'Este e-mail já está cadastrado. Por favor, clique em "Já tenho conta" para entrar ou recuperar sua senha.'
        };
      }
      if (msg.includes('rate limit')) {
        return {
          success: false,
          error: 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente.'
        };
      }
      return { success: false, error: data.error_description || data.message || 'Falha ao cadastrar conta.' };
    }

    // Proteção contra duplicidade de conta quando o e-mail já existe (via Google ou senha anterior)
    const identities = data?.identities ?? data?.user?.identities;
    if (Array.isArray(identities) && identities.length === 0) {
      return {
        success: false,
        error: 'Este e-mail já possui uma conta cadastrada. Por favor, clique em "Já tenho conta" para entrar com seu e-mail ou com o Google.'
      };
    }

    return {
      success: true,
      requiresEmailConfirmation: true,
      email: cleanEmail
    };
  } catch (err: any) {
    return { success: false, error: `Erro ao conectar com o servidor: ${err.message}` };
  }
}

/**
 * Validação de código OTP ou Token de verificação recebido por e-mail
 */
export async function verifyEmailOtp(
  email: string, 
  token: string
): Promise<{ 
  success: boolean; 
  session?: AuthSession; 
  error?: string 
}> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    console.error('[Supabase Auth] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.');
    return { success: false, error: GENERIC_CONFIG_ERROR };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!cleanEmail || !cleanToken) {
    return { success: false, error: 'Informe o e-mail e o código de verificação recebido.' };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  const verifyTypes: Array<'signup' | 'email'> = ['signup', 'email'];

  for (const vType of verifyTypes) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          type: vType,
          email: cleanEmail,
          token: cleanToken
        })
      });

      const data = await res.json();
      if (res.ok && data.access_token && data.user) {
        const supabase = getSupabaseClient();
        if (supabase && data.access_token && data.refresh_token) {
          try {
            await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token
            });
          } catch {}
        }

        const profile = await fetchAuthoritativeProfile(data.user.id, data.access_token, data.user);

        const userProfile: UserProfile = {
          id: data.user.id,
          nome: profile.nome || data.user.user_metadata?.full_name || data.user.user_metadata?.nome || cleanEmail.split('@')[0],
          email: data.user.email,
          role: profile.appRole,
          cref: profile.cref,
          avatar_url: profile.avatarUrl,
          created_at: data.user.created_at,
          subscription_status: profile.subscriptionStatus
        };

        const session: AuthSession = {
          user: userProfile,
          token: data.access_token,
          isDevFallback: false,
          expiresAt: data.expires_at ? Number(data.expires_at) * 1000 : undefined
        };

        storeSession(session);
        return { success: true, session };
      }
    } catch {}
  }

  return {
    success: false,
    error: 'Código de verificação incorreto, expirado ou e-mail inválido. Solicite um novo código.'
  };
}

/**
 * Reenvia o e-mail de confirmação de cadastro via Supabase Auth
 */
export async function resendConfirmationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    console.error('[Supabase Auth] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.');
    return { success: false, message: GENERIC_CONFIG_ERROR };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Informe um e-mail válido.' };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        type: 'signup',
        email: cleanEmail
      })
    });

    if (res.ok) {
      return {
        success: true,
        message: `Novo link e código de confirmação enviados para ${cleanEmail}. Verifique sua caixa de entrada e pasta de spam.`
      };
    }

    const data = await res.json();
    return {
      success: false,
      message: data.error_description || data.message || 'Falha ao reenviar confirmação. Aguarde alguns instantes.'
    };
  } catch (err: any) {
    return { success: false, message: `Erro de rede: ${err.message}` };
  }
}

/**
 * Recuperação de senha via e-mail real
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    console.error('[Supabase Auth] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.');
    return {
      success: false,
      message: GENERIC_CONFIG_ERROR
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Informe um e-mail válido para recuperação.' };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ email: cleanEmail })
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data.message || 'Erro ao solicitar recuperação de senha.' };
    }

    return {
      success: true,
      message: `Se o e-mail ${cleanEmail} estiver cadastrado, você receberá instruções de redefinição em sua caixa de entrada.`
    };
  } catch (err: any) {
    return { success: false, message: `Erro de rede: ${err.message}` };
  }
}

/**
 * Encerra a sessão no Supabase e limpa apenas a sessão de autenticação,
 * preservando integralmente o histórico, progresso e planos locais do usuário.
 */
export async function logoutUser(): Promise<void> {
  const status = getSupabaseConfigStatus();
  const current = getStoredSession();

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (status.isConfigured && current?.token) {
    try {
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${current.token}`
        }
      });
    } catch {}
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {}
  }

  storeSession(null);
}
