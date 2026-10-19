import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  ShieldAlert, 
  Mail, 
  Lock, 
  CheckCircle2, 
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { 
  getStoredSession, 
  storeSession, 
  getSupabaseConfigStatus, 
  loginUser,
  verifyEmailOtp,
  resendConfirmationEmail
} from '../../utils/supabaseClient';
import { SUPABASE_SQL_DDL_SCRIPT } from '../../utils/supabaseMigrationService';

interface TrainerAuthGateProps {
  onAuthenticated: () => void;
}

/**
 * Verifica de forma estrita se o usuário atual está autenticado com papel de treinador ou administrador
 * no banco de dados. Nunca confia em bypasses nem em modo simulado.
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
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Estados de formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');

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
          setErrorMsg('Acesso restrito. Sua conta foi autenticada como Aluno. Apenas usuários com permissão app_role="trainer" ou "admin" na tabela public.profiles podem acessar a central técnica.');
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

  // Verificação de OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await verifyEmailOtp(email, otpToken);
      if (result.success && result.session) {
        if (result.session.user.role === 'trainer' || result.session.user.role === 'admin') {
          onAuthenticated();
        } else {
          setErrorMsg('Acesso restrito. Este usuário não possui permissão de treinador ou administrador no banco.');
        }
      } else {
        setErrorMsg(result.error || 'Código de verificação inválido.');
      }
    } catch (err: any) {
      setErrorMsg(`Erro ao validar OTP: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Informe seu e-mail para receber o código.');
      return;
    }
    setErrorMsg('');
    const res = await resendConfirmationEmail(email);
    if (res.success) {
      setOtpSentMessage(res.message);
    } else {
      setErrorMsg(res.message);
    }
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
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 text-left text-xs text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Configuração Obrigatória do Supabase</span>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              As variáveis <code className="bg-slate-950 px-1 py-0.5 rounded text-rose-300 font-mono">VITE_SUPABASE_URL</code> e <code className="bg-slate-950 px-1 py-0.5 rounded text-rose-300 font-mono">VITE_SUPABASE_ANON_KEY</code> devem ser configuradas no arquivo <code className="bg-slate-950 px-1 py-0.5 rounded text-rose-300 font-mono">.env</code> para habilitar o acesso administrativo com segurança real.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                O modo simulado está desativado em produção.
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
              <span>Código de Verificação</span>
            </button>
          </div>
        )}

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Mensagem de OTP Enviado */}
        {otpSentMessage && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="flex-1">{otpSentMessage}</p>
          </div>
        )}

        {/* Formulário: E-mail e Senha */}
        {supabaseStatus.isConfigured && authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                E-mail Profissional (Administrador ou Treinador)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Autenticando no Supabase...</span>
              ) : (
                <span>Entrar na Central do Treinador</span>
              )}
            </button>
          </form>
        )}

        {/* Formulário: OTP */}
        {supabaseStatus.isConfigured && authMode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Código de 6 Dígitos
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  Enviar / Reenviar Código
                </button>
              </div>
              <input
                type="text"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                placeholder="123456"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-center font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Validando Código no Supabase...</span>
              ) : (
                <span>Confirmar e Acessar</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Modal Visualizador do DDL SQL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Script DDL & RLS Supabase</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg"
              >
                Fechar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto my-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
              <pre>{SUPABASE_SQL_DDL_SCRIPT}</pre>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={copySqlToClipboard}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
