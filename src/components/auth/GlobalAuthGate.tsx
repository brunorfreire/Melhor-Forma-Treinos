import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  KeyRound, 
  Sparkles, 
  Dumbbell, 
  HeartPulse, 
  ChevronLeft,
  ShieldAlert,
  Flame,
  Check
} from 'lucide-react';
import { MelhorFormaLogo } from '../MelhorFormaLogo';
import { 
  loginUser, 
  registerUser, 
  verifyEmailOtp, 
  resendConfirmationEmail, 
  requestPasswordReset, 
  getSupabaseConfigStatus,
  AuthSession 
} from '../../utils/supabaseClient';

interface GlobalAuthGateProps {
  onAuthenticated: (session: AuthSession) => void;
  configError?: string;
}

type AuthViewMode = 'landing' | 'register' | 'login' | 'verify_email' | 'recover';

export const GlobalAuthGate: React.FC<GlobalAuthGateProps> = ({ 
  onAuthenticated,
  configError
}) => {
  const [view, setView] = useState<AuthViewMode>('landing');

  // Campos de formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Estados de feedback e controle
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');

  const configStatus = getSupabaseConfigStatus();

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
        `Conta criada com sucesso! Enviamos um código e link de confirmação para ${res.email || email}. Por favor, confirme seu e-mail para ativar seu acesso aos treinos.`
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
      setErrorMsg(res.error || 'Código inválido ou expirado. Tente reenviar.');
    }
  };

  // 4. Reenvio de Confirmação
  const handleResend = async () => {
    const targetEmail = unconfirmedEmail || email;
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Informe seu e-mail para receber o link de confirmação.');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Barra Superior Minimalista de Segurança */}
      <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MelhorFormaLogo size={32} />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-tight text-white">Melhor Forma Play</span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
              40+
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acesso Seguro & RLS</span>
        </div>
      </header>

      {/* Conteúdo Central Responsivo */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Bloqueio de Configuração (se o Supabase estiver pendente no .env) */}
        {(!configStatus.isConfigured || configError) && (
          <div className="w-full max-w-lg mb-6 bg-rose-950/40 border border-rose-500/40 rounded-3xl p-5 sm:p-6 text-left shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Configuração Obrigatória do Servidor Supabase</span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              O Melhor Forma Play 40+ opera exclusivamente com autenticação real no servidor e políticas RLS de banco de dados. Para liberar o cadastro e login, adicione suas credenciais no arquivo <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-300 font-mono">.env</code>:
            </p>
            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div>VITE_SUPABASE_URL="https://sua-instancia.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="sua-chave-anon"</div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Nenhum modo de autenticação simulada é aceito em ambiente protegido.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 1: LANDING DE ENTRADA OBRIGATÓRIA */}
        {/* ========================================================================= */}
        {view === 'landing' && (
          <div className="w-full max-w-xl mx-auto text-center space-y-8 animate-fadeIn">
            {/* Badge de Destaque */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 shadow-sm shadow-emerald-950/50">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Treinos Especializados para a Longevidade 40+</span>
            </div>

            {/* Chamada Principal */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Treine para continuar capaz. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                  Comece gratuitamente.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                Acesse o catálogo com <strong className="text-emerald-400">12 treinos gratuitos completos</strong> desenvolvidos para manter sua força, postura, mobilidade e independência para a vida toda.
              </p>
            </div>

            {/* Vitrine Rápida dos Benefícios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">12 Treinos Free</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Prescrições reais, séries e pausas liberadas para usuários cadastrados.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-2">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Segurança 40+</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Exercícios sem impacto agressivo, foco articular e autonomia diária.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">60 Treinos Premium</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Conteúdos avançados e compras avulsas protegidos por servidor e RLS.
                </p>
              </div>
            </div>

            {/* Botões de Ação Principais (Touch target >= 44x44px) */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => { setView('register'); setErrorMsg(''); setInfoMsg(''); }}
                className="w-full min-h-[48px] py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-sm font-black rounded-2xl transition shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Criar minha conta gratuita</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); setErrorMsg(''); setInfoMsg(''); }}
                className="w-full min-h-[48px] py-3.5 px-6 bg-slate-900 hover:bg-slate-850 active:scale-[0.99] text-slate-200 hover:text-white border border-slate-800 text-sm font-bold rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Já tenho conta / Entrar</span>
              </button>

              <button
                type="button"
                onClick={() => { setView('recover'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition underline underline-offset-4 py-2 cursor-pointer"
              >
                Esqueci minha senha / Recuperar acesso
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: FORMULÁRIO DE CADASTRO (SIGNUP) */}
        {/* ========================================================================= */}
        {view === 'register' && (
          <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setView('landing'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Cadastro Gratuito
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Crie sua conta no Play 40+
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cadastre-se para liberar imediatamente os 12 treinos gratuitos após a confirmação do seu e-mail.
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
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Identificação do perfil no aplicativo (LGPD: dados mínimos).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
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
                  Senha Segura (Mínimo de 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Confirmação Real de E-mail Obrigatória</span>
                </div>
                <p>
                  Para prevenir cadastros falsos e proteger a integridade do sistema, um e-mail de confirmação será enviado. O acesso somente é liberado após a validação.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Criando conta no Supabase...</span>
                ) : (
                  <span>Criar Conta e Receber Confirmação</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setView('login'); setErrorMsg(''); setInfoMsg(''); }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Já tem conta? <span className="font-bold underline">Entrar agora</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: LOGIN COM E-MAIL E SENHA */}
        {/* ========================================================================= */}
        {view === 'login' && (
          <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setView('landing'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Entrar
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Acesse sua conta
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Entre com seu e-mail e senha cadastrados no Melhor Forma Play.
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
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
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
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('recover'); setErrorMsg(''); setInfoMsg(''); }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
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
                disabled={loading}
                className="w-full min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Autenticando no Supabase...</span>
                ) : (
                  <span>Entrar no Melhor Forma Play</span>
                )}
              </button>

              <div className="text-center pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => { setView('register'); setErrorMsg(''); setInfoMsg(''); }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition block w-full"
                >
                  Ainda não tem conta? <span className="font-bold underline">Criar conta gratuita</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setView('verify_email'); setUnconfirmedEmail(email); setErrorMsg(''); setInfoMsg(''); }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline block w-full"
                >
                  Precisa confirmar seu e-mail? Digite o código aqui
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 4: CONFIRMAÇÃO DE E-MAIL (OTP OU LINK) */}
        {/* ========================================================================= */}
        {view === 'verify_email' && (
          <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setView('login'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar para Login</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Confirmação Obrigatória
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={10}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm text-center font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Validando no Supabase...</span>
                ) : (
                  <span>Confirmar E-mail e Acessar Treinos</span>
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
        {/* VISTA 5: RECUPERAÇÃO DE ACESSO */}
        {/* ========================================================================= */}
        {view === 'recover' && (
          <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setView('login'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                Recuperação
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Recupere seu acesso
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Informe o e-mail da sua conta para receber o link seguro de redefinição de senha.
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
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
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

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Enviando link...</span>
                ) : (
                  <span>Enviar Link de Recuperação</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Rodapé Minimalista de Conformidade & LGPD */}
      <footer className="border-t border-slate-900 px-4 py-4 text-center text-[11px] text-slate-500 space-y-1">
        <p>
          Melhor Forma Play 40+ © {new Date().getFullYear()} — Plataforma de Longevidade e Força Humana.
        </p>
        <p className="text-[10px] text-slate-600">
          Privacidade & Segurança: dados protegidos por autenticação oficial Supabase e Row Level Security (RLS).
        </p>
      </footer>
    </div>
  );
};
