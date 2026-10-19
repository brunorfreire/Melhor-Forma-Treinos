/**
 * ARQUITETURA DE AUTENTICAÇÃO REAL E SEGURANÇA (SUPABASE AUTH)
 * Melhor Forma Play 40+
 * 
 * Regras Obrigatórias de Produção:
 * 1. Não utiliza modos simulados (sem isDevFallback, sem transitional_dev, sem verificação fictícia de OTP).
 * 2. Se o Supabase não estiver configurado no .env, bloqueia o acesso protegido e orienta a configuração.
 * 3. Todas as permissões (app_role e subscription_status) são validadas diretamente no Supabase (public.profiles),
 *    sem confiar em valores manipuláveis no cliente.
 * 4. Exige confirmação real de e-mail antes de liberar o acesso de alunos aos treinos Free.
 * 5. Restauração e revalidação viva da sessão no servidor (GET /auth/v1/user) em cada carregamento.
 */

import { UserProfile, SubscriptionStatus, UserRole } from '../types';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  message: string;
}

const SUPABASE_URL = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL || '') : '';
const SUPABASE_ANON_KEY = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || '') : '';

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const isConfigured = Boolean(
    SUPABASE_URL && 
    SUPABASE_ANON_KEY && 
    SUPABASE_URL.startsWith('http') &&
    !SUPABASE_URL.includes('your-project')
  );
  return {
    isConfigured,
    url: isConfigured ? SUPABASE_URL : null,
    message: isConfigured
      ? 'Supabase Auth conectado ativamente na nuvem.'
      : 'Supabase pendente de credenciais VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'
  };
}

const LOCAL_SESSION_KEY = 'mf_play_user_session_auth_v2';

export interface AuthSession {
  user: UserProfile;
  token: string;
  isDevFallback: false;
  expiresAt?: number;
}

/**
 * Lê a sessão gravada localmente
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
 * Persiste ou remove a sessão local
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
 * Consulta de forma autoritativa os dados de perfil no Supabase
 */
async function fetchAuthoritativeProfile(
  userId: string, 
  token: string
): Promise<{ appRole: UserRole; subscriptionStatus: SubscriptionStatus; nome?: string; cref?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=app_role,subscription_status,nome,cref`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const appRole: UserRole = (item.app_role === 'admin' || item.app_role === 'trainer') ? item.app_role : 'student';
        const subscriptionStatus: SubscriptionStatus = 
          ['active', 'canceled', 'past_due', 'trialing', 'refunded', 'free'].includes(item.subscription_status)
            ? item.subscription_status
            : 'free';
        return {
          appRole,
          subscriptionStatus,
          nome: item.nome || undefined,
          cref: item.cref || undefined
        };
      }
    }
  } catch (err) {
    console.warn('Não foi possível sincronizar perfil do banco:', err);
  }

  return { appRole: 'student', subscriptionStatus: 'free' };
}

/**
 * Validação rigorosa e revalidação viva da sessão junto ao Supabase Auth
 * NUNCA confia apenas na presença de dados em localStorage.
 */
export async function validateCurrentSession(): Promise<{
  valid: boolean;
  session: AuthSession | null;
  isEmailUnconfirmed?: boolean;
  error?: string;
}> {
  const status = getSupabaseConfigStatus();
  if (!status.isConfigured) {
    storeSession(null);
    return {
      valid: false,
      session: null,
      error: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'
    };
  }

  const stored = getStoredSession();
  if (!stored || !stored.token) {
    return { valid: false, session: null };
  }

  try {
    // 1. Revalidação viva do token com o servidor Supabase Auth
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${stored.token}`
      }
    });

    if (!userRes.ok) {
      // Token expirou ou foi revogado
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

    // 2. Validação obrigatória de e-mail confirmado
    const isEmailConfirmed = Boolean(userData.email_confirmed_at || userData.confirmed_at);
    if (!isEmailConfirmed) {
      storeSession(null);
      return {
        valid: false,
        session: null,
        isEmailUnconfirmed: true,
        error: 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.'
      };
    }

    // 3. Consulta autoritativa na tabela public.profiles
    const profile = await fetchAuthoritativeProfile(userData.id, stored.token);

    const refreshedProfile: UserProfile = {
      id: userData.id,
      nome: profile.nome || userData.user_metadata?.full_name || userData.user_metadata?.nome || userData.email.split('@')[0],
      email: userData.email,
      role: profile.appRole,
      cref: profile.cref,
      created_at: userData.created_at,
      subscription_status: profile.subscriptionStatus
    };

    const refreshedSession: AuthSession = {
      user: refreshedProfile,
      token: stored.token,
      isDevFallback: false,
      expiresAt: stored.expiresAt
    };

    storeSession(refreshedSession);
    return { valid: true, session: refreshedSession };
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
    return {
      success: false,
      error: 'Supabase não configurado. O login obrigatório requer credenciais reais no servidor.'
    };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
  }
  if (!password) {
    return { success: false, error: 'Por favor, informe sua senha.' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
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
          error: 'E-mail não confirmado. O acesso requer confirmação obrigatória. Verifique sua caixa de entrada ou solicite o reenvio.'
        };
      }
      if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
        return { success: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
      }
      return { success: false, error: data.error_description || data.message || 'Falha ao autenticar no servidor.' };
    }

    // Validação estrita de confirmação de e-mail mesmo se retornar token
    const isConfirmed = Boolean(data.user?.email_confirmed_at || data.user?.confirmed_at);
    if (!isConfirmed) {
      return {
        success: false,
        isEmailUnconfirmed: true,
        error: 'Seu e-mail ainda não foi confirmado. O acesso só é liberado após validação real.'
      };
    }

    // Consulta perfil autoritativo
    const profile = await fetchAuthoritativeProfile(data.user.id, data.access_token);

    const userProfile: UserProfile = {
      id: data.user.id,
      nome: profile.nome || data.user.user_metadata?.full_name || data.user.user_metadata?.nome || email.split('@')[0],
      email: data.user.email,
      role: profile.appRole,
      cref: profile.cref,
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
    return { success: false, error: `Erro de conexão com o Supabase: ${err.message}` };
  }
}

/**
 * Cadastro de novo usuário com confirmação obrigatória de e-mail
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
    return {
      success: false,
      error: 'Supabase não configurado. O cadastro de novos usuários requer credenciais ativas do servidor.'
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

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
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
          error: 'Este e-mail já está cadastrado. Por favor, clique em "Já tenho conta / Entrar" ou recupere sua senha.'
        };
      }
      if (msg.includes('rate limit')) {
        return {
          success: false,
          error: 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente.'
        };
      }
      return { success: false, error: data.error_description || data.message || 'Falha ao cadastrar no Supabase.' };
    }

    // Regra Obrigatória: Não conceder acesso antes da confirmação real do e-mail
    return {
      success: true,
      requiresEmailConfirmation: true,
      email: cleanEmail
    };
  } catch (err: any) {
    return { success: false, error: `Erro ao conectar com o Supabase: ${err.message}` };
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
    return { success: false, error: 'Supabase não configurado.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!cleanEmail || !cleanToken) {
    return { success: false, error: 'Informe o e-mail e o código de verificação recebido.' };
  }

  // Tenta verificação tipo 'signup' e em caso de falha tenta 'email'
  const verifyTypes: Array<'signup' | 'email'> = ['signup', 'email'];

  for (const vType of verifyTypes) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          type: vType,
          email: cleanEmail,
          token: cleanToken
        })
      });

      const data = await res.json();
      if (res.ok && data.access_token && data.user) {
        const profile = await fetchAuthoritativeProfile(data.user.id, data.access_token);

        const userProfile: UserProfile = {
          id: data.user.id,
          nome: profile.nome || data.user.user_metadata?.full_name || data.user.user_metadata?.nome || cleanEmail.split('@')[0],
          email: data.user.email,
          role: profile.appRole,
          cref: profile.cref,
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
    return { success: false, message: 'Supabase não configurado.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Informe um e-mail válido.' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
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
    return {
      success: false,
      message: 'Supabase não configurado. A recuperação de acesso requer conexão ativa com o servidor.'
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Informe um e-mail válido para recuperação.' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
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
 * Encerra a sessão no Supabase e limpa o armazenamento local
 */
export async function logoutUser(): Promise<void> {
  const status = getSupabaseConfigStatus();
  const current = getStoredSession();

  if (status.isConfigured && current?.token) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${current.token}`
        }
      });
    } catch {}
  }

  storeSession(null);
}
