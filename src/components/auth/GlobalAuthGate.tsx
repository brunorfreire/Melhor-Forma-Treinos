import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { MelhorFormaLogo } from '../MelhorFormaLogo';
import { 
  loginUser, 
  registerUser, 
  verifyEmailOtp, 
  resendConfirmationEmail, 
  requestPasswordReset, 
  signInWithGoogle,
  checkGoogleProviderEnabled,
  AuthSession 
} from '../../utils/supabaseClient';

export type AuthGateViewMode = 'login' | 'register' | 'verify_email' | 'recover';

interface GlobalAuthGateProps {
  initialView?: AuthGateViewMode;
  initialError?: string;
  onAuthenticated: (session: AuthSession) => void;
  onNavigate?: (route: string) => void;
  onBackToLanding?: () => void;
}

const GoogleBrandIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

export const GlobalAuthGate: React.FC<GlobalAuthGateProps> = ({ 
  initialView = 'login',
  initialError = '',
  onAuthenticated,
  onNavigate,
  onBackToLanding
}) => {
  const [view, setView] = useState<AuthGateViewMode>(initialView);
  const [showEmailForm, setShowEmailForm] = useState<boolean>(true);
  const [googleEnabled, setGoogleEnabled] = useState<boolean>(false);
  const [checkingGoogle, setCheckingGoogle] = useState<boolean>(true);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  // Campos de formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(initialError);
  const [infoMsg, setInfoMsg] = useState('');
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');

  useEffect(() => {
    if (initialError) {
      setErrorMsg(initialError);
    }
  }, [initialError]);

  // Verifica no Supabase Auth (/auth/v1/settings) se o provedor Google já está habilitado em produção
  useEffect(() => {
    let mounted = true;
    checkGoogleProviderEnabled().then((res) => {
      if (mounted) {
        setGoogleEnabled(res.enabled);
        setCheckingGoogle(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const switchView = (newView: AuthGateViewMode) => {
    setView(newView);
    setErrorMsg('');
    setInfoMsg('');
    if (onNavigate) {
      if (newView === 'login') onNavigate('/entrar');
      else if (newView === 'register') onNavigate('/cadastro');
      else if (newView === 'recover') onNavigate('/recuperar');
    }
  };

  const handleSelectEmailOption = () => {
    setShowEmailForm(true);
    setErrorMsg('');
    setTimeout(() => {
      if (view === 'register' && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 60);
  };

  // 0. Continuar com Google (OAuth 2.0 real via Supabase Auth)
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setGoogleLoading(true);

    const origin = view === 'register' ? 'register' : 'login';
    const res = await signInWithGoogle(origin);

    if (!res.success) {
      setGoogleLoading(false);
      if (res.providerNotConfigured) {
        setGoogleEnabled(false);
        setShowEmailForm(true);
        setInfoMsg(
          'O acesso com Google aguarda a ativação final do provedor. Enquanto isso, continue com seu e-mail abaixo.'
        );
        handleSelectEmailOption();
      } else {
        setErrorMsg(res.error || 'Não foi possível iniciar a autenticação com o Google.');
      }
    }
  };

  // 1. Criar Conta por E-mail (Signup)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    const res = await registerUser(nome, email, password);
    setLoading(false);

    if (res.success && res.requiresEmailConfirmation) {
      setUnconfirmedEmail(res.email || email);
      setInfoMsg(
        `Conta criada com sucesso! Enviamos um código de verificação para ${res.email || email}. Por favor, confirme seu e-mail para ativar seu acesso aos 12 treinos gratuitos.`
      );
      setView('verify_email');
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  // 2. Entrar com E-mail e Senha (Login de Alunos e Administradores)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success && res.session) {
      onAuthenticated(res.session);
    } else if (res.isEmailUnconfirmed) {
      setUnconfirmedEmail(email);
      setErrorMsg(res.error || 'E-mail não confirmado.');
      setView('verify_email');
    } else {
      setErrorMsg(res.error || 'Falha ao autenticar.');
    }
  };

  // 3. Validação do Código de Confirmação (OTP)
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const targetEmail = unconfirmedEmail || email;
    if (!targetEmail || !verificationCode) {
      setErrorMsg('Informe o e-mail e o código de verificação recebido.');
      return;
    }

    setLoading(true);
    const res = await verifyEmailOtp(targetEmail, verificationCode);
    setLoading(false);

    if (res.success && res.session) {
      onAuthenticated(res.session);
    } else {
      setErrorMsg(res.error || 'Código incorreto ou expirado. Tente solicitar um novo código.');
    }
  };

  // 4. Reenvio de Confirmação
  const handleResend = async () => {
    const targetEmail = unconfirmedEmail || email;
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Informe seu e-mail para receber o código de confirmação.');
      return;
    }

    setErrorMsg('');
    setResending(true);
    const res = await resendConfirmationEmail(targetEmail);
    setResending(false);

    if (res.success) {
      setInfoMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // 5. Recuperação de Acesso
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setInfoMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleBack = () => {
    if (onBackToLanding) {
      onBackToLanding();
    } else if (onNavigate) {
      onNavigate('/');
    } else {
      switchView('login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Barra Superior Minimalista (320px a 430px Mobile-First) */}
      <header className="border-b border-slate-900/80 bg-slate-950/90 backdrop-blur-md px-3.5 sm:px-8 py-3.5 flex items-center justify-between">
        <button 
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-left cursor-pointer group min-w-0"
          title="Voltar para a página inicial"
        >
          <MelhorFormaLogo size={30} className="shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-black tracking-tight text-white group-hover:text-emerald-300 transition truncate">
              Melhor Forma Play
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
              40+
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleBack}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer py-2 px-2.5 sm:px-3 rounded-xl hover:bg-slate-900 shrink-0 min-h-[40px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Início</span>
        </button>
      </header>

      {/* Conteúdo Central Responsivo (Otimizado para celulares de 320px a 430px) */}
      <div className="flex-1 w-full max-w-[430px] mx-auto px-3.5 sm:px-5 py-6 sm:py-10 flex flex-col items-center justify-center">
        {/* ========================================================================= */}
        {/* TELA DE CADASTRO: "Comece sua melhor fase"                                */}
        {/* ========================================================================= */}
        {view === 'register' && (
          <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                12 Treinos Gratuitos
              </span>
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer py-1"
              >
                Já tenho conta
              </button>
            </div>

            <div className="space-y-1.5 text-left">
              <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-tight">
                Comece sua melhor fase
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Crie sua conta gratuita e tenha acesso aos primeiros 12 treinos.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {infoMsg && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="flex-1 leading-relaxed">{infoMsg}</p>
              </div>
            )}

            {/* OPÇÕES PRINCIPAIS: 1. Continuar com Google | 2. Continuar com e-mail */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading || checkingGoogle}
                aria-disabled={!googleEnabled}
                className={`w-full min-h-[52px] px-4 py-3.5 font-extrabold text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] ${
                  googleEnabled
                    ? 'bg-white hover:bg-slate-100 text-slate-900'
                    : 'bg-white/95 hover:bg-white text-slate-900'
                } disabled:opacity-60`}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                    <span>Conectando com Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleBrandIcon className="w-5 h-5 shrink-0" />
                    <span>Continuar com Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center py-0.5">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  ou
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <button
                type="button"
                onClick={handleSelectEmailOption}
                className={`w-full min-h-[52px] px-4 py-3.5 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] border ${
                  showEmailForm
                    ? 'bg-slate-950/90 border-emerald-500/50 text-emerald-300 shadow-inner'
                    : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Continuar com e-mail</span>
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                    showEmailForm ? 'rotate-180 text-emerald-400' : 'text-slate-300'
                  }`}
                />
              </button>
            </div>

            {/* Formulário Completo de Cadastro por E-mail (Preservado Integralmente) */}
            {showEmailForm && (
              <form onSubmit={handleRegister} className="space-y-4 text-left pt-2 border-t border-slate-800/80 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu-email@exemplo.com"
                      required
                      className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Senha (mínimo de 6 caracteres)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Confirmação de e-mail obrigatória</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Para proteger sua conta, um código de verificação será enviado ao seu e-mail.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full min-h-[52px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-sm font-black rounded-2xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Criando conta...</span>
                    </>
                  ) : (
                    <span>Criar Conta Gratuita</span>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-xs text-slate-300 hover:text-emerald-400 transition py-1 cursor-pointer"
              >
                Já possui conta? <span className="font-bold underline text-emerald-400">Entrar agora</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TELA DE LOGIN: Opções Continuar com Google + Continuar com e-mail         */}
        {/* ========================================================================= */}
        {view === 'login' && (
          <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Acesso Seguro
              </span>
              <button
                type="button"
                onClick={() => switchView('register')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer py-1"
              >
                Criar conta gratuita
              </button>
            </div>

            <div className="space-y-1.5 text-left">
              <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-tight">
                Entrar no Melhor Forma Play
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Acesse sua área de treinos e acompanhamento.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {infoMsg && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="flex-1 leading-relaxed">{infoMsg}</p>
              </div>
            )}

            {/* OPÇÕES DE ACESSO: 1. Continuar com Google | 2. Continuar com e-mail */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading || checkingGoogle}
                aria-disabled={!googleEnabled}
                className={`w-full min-h-[52px] px-4 py-3.5 font-extrabold text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] ${
                  googleEnabled
                    ? 'bg-white hover:bg-slate-100 text-slate-900'
                    : 'bg-white/95 hover:bg-white text-slate-900'
                } disabled:opacity-60`}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                    <span>Conectando com Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleBrandIcon className="w-5 h-5 shrink-0" />
                    <span>Continuar com Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center py-0.5">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  ou
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <button
                type="button"
                onClick={handleSelectEmailOption}
                className={`w-full min-h-[52px] px-4 py-3.5 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] border ${
                  showEmailForm
                    ? 'bg-slate-950/90 border-emerald-500/50 text-emerald-300 shadow-inner'
                    : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Continuar com e-mail</span>
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                    showEmailForm ? 'rotate-180 text-emerald-400' : 'text-slate-300'
                  }`}
                />
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleLogin} className="space-y-4 text-left pt-2 border-t border-slate-800/80 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu-email@exemplo.com"
                      required
                      className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView('recover')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full min-h-[52px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-sm font-black rounded-2xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <span>Entrar</span>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2 space-y-2.5 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => switchView('register')}
                className="text-xs text-slate-300 hover:text-emerald-400 transition block w-full py-1 cursor-pointer"
              >
                Não tem conta? <span className="font-bold underline text-emerald-400">Começar gratuitamente</span>
              </button>
              <button
                type="button"
                onClick={() => { setUnconfirmedEmail(email); switchView('verify_email'); }}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline block w-full cursor-pointer"
              >
                Recebeu um código de verificação por e-mail? Clique aqui
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONFIRMAÇÃO DE E-MAIL (OTP)                                               */}
        {/* ========================================================================= */}
        {view === 'verify_email' && (
          <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar ao login</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Confirmação
              </span>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Confirme seu E-mail
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para liberar seu acesso gratuito aos 12 treinos, digite o código de 6 dígitos enviado para:
              </p>
              <p className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 py-2 px-3 rounded-xl border border-slate-800 break-all">
                {unconfirmedEmail || email || 'seu-email@exemplo.com'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            {infoMsg && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="flex-1">{infoMsg}</p>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 text-center">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={10}
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-base text-center font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-sm font-black rounded-2xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span>Validando...</span>
                ) : (
                  <span>Confirmar E-mail e Acessar</span>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Não recebeu o código?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline disabled:opacity-50 cursor-pointer"
                >
                  {resending ? 'Enviando...' : 'Reenviar código'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RECUPERAÇÃO DE ACESSO                                                     */}
        {/* ========================================================================= */}
        {view === 'recover' && (
          <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar ao login</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                Recuperação
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Recupere seu acesso
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Informe seu e-mail para receber as instruções seguras de redefinição de senha.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            {infoMsg && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="flex-1">{infoMsg}</p>
              </div>
            )}

            <form onSubmit={handleRecover} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    required
                    className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-sm font-black rounded-2xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span>Enviando link...</span>
                ) : (
                  <span>Enviar Instruções de Recuperação</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Rodapé Minimalista */}
      <footer className="border-t border-slate-900 px-4 py-4 text-center text-[11px] text-slate-500">
        <p>
          Melhor Forma Play 40+ © {new Date().getFullYear()} — Plataforma de Longevidade e Força Humana.
        </p>
      </footer>
    </div>
  );
};
