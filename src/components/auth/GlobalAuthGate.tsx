import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft,
  Flame,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { MelhorFormaLogo } from '../MelhorFormaLogo';
import { 
  loginUser, 
  registerUser, 
  verifyEmailOtp, 
  resendConfirmationEmail, 
  requestPasswordReset, 
  AuthSession 
} from '../../utils/supabaseClient';

export type AuthGateViewMode = 'login' | 'register' | 'verify_email' | 'recover';

interface GlobalAuthGateProps {
  initialView?: AuthGateViewMode;
  onAuthenticated: (session: AuthSession) => void;
  onNavigate?: (route: string) => void;
  onBackToLanding?: () => void;
}

export const GlobalAuthGate: React.FC<GlobalAuthGateProps> = ({ 
  initialView = 'login',
  onAuthenticated,
  onNavigate,
  onBackToLanding
}) => {
  const [view, setView] = useState<AuthGateViewMode>(initialView);

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
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');

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

  // 1. Criar Conta (Signup)
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

  // 2. Entrar (Login)
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
      {/* Barra Superior Minimalista */}
      <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button 
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
          title="Voltar para a página inicial"
        >
          <MelhorFormaLogo size={32} />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-tight text-white group-hover:text-emerald-300 transition">
              Melhor Forma Play
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
              40+
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleBack}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar ao início</span>
        </button>
      </header>

      {/* Conteúdo Central Responsivo */}
      <div className="flex-1 max-w-md w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* ========================================================================= */}
        {/* FORMULÁRIO DE LOGIN */}
        {/* ========================================================================= */}
        {view === 'login' && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Acesso Seguro
              </span>
              <button
                type="button"
                onClick={() => switchView('register')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
              >
                Criar conta
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Entrar no Melhor Forma Play
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Acesse sua área de treinos e acompanhamento.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            {infoMsg && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="flex-1">{infoMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    required
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('recover')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span>Autenticando...</span>
                ) : (
                  <span>Entrar</span>
                )}
              </button>

              <div className="text-center pt-2 space-y-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition block w-full py-1"
                >
                  Não tem conta? <span className="font-bold underline">Começar gratuitamente</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setUnconfirmedEmail(email); switchView('verify_email'); }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline block w-full"
                >
                  Recebeu um código de verificação? Clique aqui
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORMULÁRIO DE CADASTRO */}
        {/* ========================================================================= */}
        {view === 'register' && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                12 Treinos Gratuitos
              </span>
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                Já tenho conta
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Criar minha conta gratuita
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cadastre-se para liberar imediatamente os 12 treinos gratuitos após confirmar seu e-mail.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    required
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Senha (mínimo de 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Confirmação de e-mail obrigatória</span>
                </div>
                <p>
                  Para proteger sua conta, um código real de verificação será enviado ao seu e-mail.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span>Criando conta...</span>
                ) : (
                  <span>Criar Conta e Receber Confirmação</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Já possui conta? <span className="font-bold underline">Entrar agora</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONFIRMAÇÃO DE E-MAIL (OTP) */}
        {/* ========================================================================= */}
        {view === 'verify_email' && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar ao login</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
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
              <p className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-800 break-all">
                {unconfirmedEmail || email || 'seu-email@exemplo.com'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            {infoMsg && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="flex-1">{infoMsg}</p>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={10}
                  className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-base text-center font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
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
        {/* RECUPERAÇÃO DE ACESSO */}
        {/* ========================================================================= */}
        {view === 'recover' && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar ao login</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                Recuperação
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Recupere seu acesso
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Informe seu e-mail para receber as instruções seguras de redefinição de senha.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            {infoMsg && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-left flex items-start gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="flex-1">{infoMsg}</p>
              </div>
            )}

            <form onSubmit={handleRecover} className="space-y-4 text-left">
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
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
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
