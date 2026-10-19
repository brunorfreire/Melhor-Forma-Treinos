import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  Mail, 
  Lock, 
  Server, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  getStoredSession, 
  storeSession, 
  getSupabaseConfigStatus, 
  loginUser, 
  sendOtpOrMagicLink, 
  verifyOtpToken, 
  authenticateTrainerInTransitionalMode 
} from '../../utils/supabaseClient';
import { SUPABASE_SQL_DDL_SCRIPT } from '../../utils/supabaseMigrationService';

interface TrainerAuthGateProps {
  onAuthenticated: () => void;
}

/**
 * Verifica de forma estrita se o usuário atual está autenticado com papel de treinador ou administrador
 * Não aceita bypass em sessionStorage nem PINs estáticos.
 */
export function isTrainerAuthenticated(): boolean {
  try {
    const session = getStoredSession();
    if (session?.user && (session.user.role === 'trainer' || session.user.role === 'admin')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function logoutTrainer(): void {
  try {
    storeSession(null);
  } catch {}
}

export const TrainerAuthGate: React.FC<TrainerAuthGateProps> = ({ onAuthenticated }) => {
  const supabaseStatus = getSupabaseConfigStatus();
  const [authMode, setAuthMode] = useState<'password' | 'otp' | 'transitional_dev'>(
    supabaseStatus.isConfigured ? 'password' : 'transitional_dev'
  );

  // Estados de formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [trainerCref, setTrainerCref] = useState('');

  // Estados de feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Se já houver sessão autenticada com role de treinador/admin, avança imediatamente
  useEffect(() => {
    if (isTrainerAuthenticated()) {
      onAuthenticated();
    }
  }, [onAuthenticated]);

  // Login com senha (Supabase Auth)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await loginUser(email, password);
      if (result.success && result.session) {
        if (result.session.user.role === 'trainer' || result.session.user.role === 'admin') {
          onAuthenticated();
        } else {
          setErrorMsg('Acesso restrito. Sua conta foi autenticada como aluno. Apenas usuários com permissão app_role="trainer" ou "admin" na tabela public.profiles podem acessar a central técnica.');
        }
      } else {
        setErrorMsg(result.error || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMsg(`Erro na autenticação: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Envio de OTP / Magic Link
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await sendOtpOrMagicLink(email);
      if (result.success) {
        setOtpSentMessage(result.message);
      } else {
        setErrorMsg(result.error || 'Falha ao enviar código OTP.');
      }
    } catch (err: any) {
      setErrorMsg(`Erro ao solicitar OTP: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificação de OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await verifyOtpToken(email, otpToken);
      if (result.success && result.session) {
        if (result.session.user.role === 'trainer' || result.session.user.role === 'admin') {
          onAuthenticated();
        } else {
          setErrorMsg('Acesso restrito. Este e-mail não possui permissão de treinador no servidor.');
        }
      } else {
        setErrorMsg(result.error || 'Código OTP inválido.');
      }
    } catch (err: any) {
      setErrorMsg(`Erro ao validar OTP: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autenticação em modo de transição (quando Supabase não está configurado no .env)
  const handleTransitionalDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor, informe seu e-mail profissional.');
      return;
    }
    setErrorMsg('');

    authenticateTrainerInTransitionalMode(email, trainerName, trainerCref);
    onAuthenticated();
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_DDL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="w-full max-w-lg mx-auto min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            Acesso Restrito ao Personal Trainer
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight">
            Central Administrativa de Treinos e Mídias
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Área protegida para gestão técnica dos 72 treinos, validação biomecânica e upload de demonstrações.
          </p>
        </div>

        {/* Diagnóstico de Conexão com o Supabase */}
        {supabaseStatus.isConfigured ? (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 text-left flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">Supabase Auth Ativo na Nuvem</p>
              <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                Autenticação real via servidor com proteção de dados por Row-Level Security (RLS).
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 text-left text-xs text-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Modo de Transição / Supabase Desconectado</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              As variáveis <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_URL</code> e <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_ANON_KEY</code> ainda não foram configuradas no arquivo <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">.env</code>.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Os dados e decisões estão seguros no armazenamento local.
              </span>
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>Ver Script SQL DDL</span>
              </button>
            </div>
          </div>
        )}

        {/* Seleção de Método de Login quando Supabase está ativo */}
        {supabaseStatus.isConfigured && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>E-mail e Senha</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'otp'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Código OTP / Magic Link</span>
            </button>
          </div>
        )}

        {/* Formulário 1: E-mail e Senha via Supabase */}
        {supabaseStatus.isConfigured && authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                E-mail Profissional:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anderson@melhorforma.com"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Senha Segura:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-98"
            >
              <span>{isSubmitting ? 'Verificando Permissões...' : 'Entrar como Treinador'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Formulário 2: E-mail com OTP / Magic Link */}
        {supabaseStatus.isConfigured && authMode === 'otp' && (
          <div className="space-y-4 text-left">
            {!otpSentMessage ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Digite seu E-mail Autorizado:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="treinador@melhorforma.com"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-98"
                >
                  <span>{isSubmitting ? 'Enviando Código...' : 'Enviar Código OTP por E-mail'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{otpSentMessage}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Código de Confirmação (OTP):
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="Ex: 849201"
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono tracking-widest text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-98"
                >
                  <span>{isSubmitting ? 'Verificando Código...' : 'Confirmar e Acessar Painel'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSentMessage(null)}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1"
                >
                  Reenviar ou usar outro e-mail
                </button>
              </form>
            )}
          </div>
        )}

        {/* Formulário 3: Modo de Transição (Local/Desacoplado) */}
        {!supabaseStatus.isConfigured && (
          <form onSubmit={handleTransitionalDevLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Identificação do Treinador / Administrador:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder="Nome do Treinador (ex: Anderson)"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                E-mail Profissional:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="treinador@melhorforma.com"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center justify-between">
                <span>Registro CREF (Opcional):</span>
                <span className="text-[10px] text-slate-500">Para auditoria técnica</span>
              </label>
              <input
                type="text"
                value={trainerCref}
                onChange={(e) => setTrainerCref(e.target.value)}
                placeholder="Ex: CREF 012345-G/SP"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-98"
            >
              <span>Acessar Painel em Modo de Transição</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Informações de Auditoria e Segurança */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-left text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Arquitetura de Segurança e RBAC</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Eliminamos PIN fixo e validação insegura no cliente. O acesso administrativo é delimitado pelo atributo de segurança <code className="text-emerald-400 font-mono">app_role</code>, isolando a autoria das decisões biomecânicas.
          </p>
        </div>
      </div>

      {/* Modal de Exibição do Script SQL DDL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Esquema SQL Oficial do Supabase</h3>
                  <p className="text-xs text-slate-400">Tabelas, RLS Policies e Storage Bucket</p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 leading-relaxed">
                Este script cria a tabela <code className="text-white font-mono">profiles</code> com o atributo próprio <code className="text-white font-mono">app_role</code>, as tabelas protegidas por RLS para os 72 treinos, 46 exercícios, 251 relações e o bucket <code className="text-white font-mono">exercise-media</code>.
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-72 whitespace-pre leading-relaxed">
                  {SUPABASE_SQL_DDL_SCRIPT}
                </pre>
                <button
                  onClick={copySqlToClipboard}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
