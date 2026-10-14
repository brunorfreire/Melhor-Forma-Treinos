/**
 * ARQUITETURA DE AUTENTICAÇÃO E BACKEND DESACOPLADA (SUPABASE)
 * 
 * Este módulo provê a camada de abstração para autenticação segura via Supabase Auth.
 * Quando as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estiverem configuradas,
 * o cliente opera com segurança real no servidor e Row-Level Security (RLS).
 * 
 * Se as variáveis ainda não estiverem configuradas pelo proprietário, o sistema
 * entra automaticamente em MODO DE DESENVOLVIMENTO / OFFLINE LOCAL claramente sinalizado,
 * permitindo navegação sem quebrar o aplicativo e sem simular falsamente uma segurança inexistente.
 */

import { UserProfile, SubscriptionStatus, UserRole } from '../types';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  mode: 'production_cloud' | 'development_decoupled';
  message: string;
}

const SUPABASE_URL = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL || '') : '';
const SUPABASE_ANON_KEY = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || '') : '';

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));
  return {
    isConfigured,
    url: isConfigured ? SUPABASE_URL : null,
    mode: isConfigured ? 'production_cloud' : 'development_decoupled',
    message: isConfigured
      ? 'Supabase Auth conectado ativamente na nuvem.'
      : 'Modo de Desenvolvimento Ativo: Supabase pendente de credenciais VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'
  };
}

const LOCAL_SESSION_KEY = 'mf_play_local_user_session_v1';

export interface AuthSession {
  user: UserProfile;
  token?: string;
  isDevFallback: boolean;
}

/**
 * Recupera sessão salva
 */
export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao carregar sessão:', e);
    return null;
  }
}

/**
 * Salva sessão de autenticação
 */
export function storeSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    console.error('Erro ao persistir sessão:', e);
  }
}

/**
 * Login de usuário
 */
export async function loginUser(email: string, password: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const status = getSupabaseConfigStatus();

  // Se Supabase estiver conectado via REST API oficial
  if (status.isConfigured) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error_description || data.message || 'Falha na autenticação via Supabase.' };
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        nome: data.user.user_metadata?.nome || email.split('@')[0],
        email: data.user.email,
        role: data.user.user_metadata?.role || 'student',
        created_at: data.user.created_at,
        subscription_status: data.user.user_metadata?.subscription_status || 'free'
      };

      const session: AuthSession = {
        user: userProfile,
        token: data.access_token,
        isDevFallback: false
      };
      storeSession(session);
      return { success: true, session };
    } catch (err: any) {
      return { success: false, error: `Erro de conexão com o Supabase: ${err.message}` };
    }
  }

  // MODO DESENVOLVIMENTO DESACOPLADO
  // Validação preliminar local sem enganar o usuário
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Por favor, insira um e-mail válido.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
  }

  // Verifica se é o treinador oficial
  const isTrainerEmail = email.toLowerCase().includes('anderson') || email.toLowerCase().includes('treinador') || email.toLowerCase().includes('admin');

  const userProfile: UserProfile = {
    id: `usr-dev-${Date.now().toString(36)}`,
    nome: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    email: email.toLowerCase().trim(),
    role: isTrainerEmail ? 'trainer' : 'student',
    created_at: new Date().toISOString(),
    subscription_status: isTrainerEmail ? 'active' : 'free'
  };

  const devSession: AuthSession = {
    user: userProfile,
    isDevFallback: true
  };
  storeSession(devSession);
  return { success: true, session: devSession };
}

/**
 * Cadastro de novo usuário
 */
export async function registerUser(nome: string, email: string, password: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const status = getSupabaseConfigStatus();

  if (!nome || nome.trim().length < 2) {
    return { success: false, error: 'Por favor, informe seu nome completo.' };
  }
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Por favor, informe um e-mail válido.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'A senha precisa ter no mínimo 6 dígitos.' };
  }

  if (status.isConfigured) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email,
          password,
          data: { nome, role: 'student', subscription_status: 'free' }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error_description || data.message || 'Falha no cadastro Supabase.' };
      }

      const userProfile: UserProfile = {
        id: data.user?.id || `usr-${Date.now()}`,
        nome,
        email,
        role: 'student',
        created_at: new Date().toISOString(),
        subscription_status: 'free'
      };

      const session: AuthSession = {
        user: userProfile,
        token: data.access_token,
        isDevFallback: false
      };
      storeSession(session);
      return { success: true, session };
    } catch (err: any) {
      return { success: false, error: `Erro ao conectar com Supabase: ${err.message}` };
    }
  }

  // Modo desacoplado de desenvolvimento
  const userProfile: UserProfile = {
    id: `usr-dev-${Date.now().toString(36)}`,
    nome: nome.trim(),
    email: email.toLowerCase().trim(),
    role: 'student',
    created_at: new Date().toISOString(),
    subscription_status: 'free'
  };

  const devSession: AuthSession = {
    user: userProfile,
    isDevFallback: true
  };
  storeSession(devSession);
  return { success: true, session: devSession };
}

/**
 * Logout
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

/**
 * Recuperação de senha
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const status = getSupabaseConfigStatus();
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Informe um e-mail válido para recuperação.' };
  }

  if (status.isConfigured) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, message: data.message || 'Erro ao solicitar recuperação.' };
      }
      return { success: true, message: 'Link de redefinição de senha enviado para o seu e-mail!' };
    } catch (err: any) {
      return { success: false, message: `Erro de rede: ${err.message}` };
    }
  }

  return {
    success: true,
    message: 'Em modo de desenvolvimento: na versão em produção com Supabase configurado, um link de recuperação será enviado para este e-mail.'
  };
}
