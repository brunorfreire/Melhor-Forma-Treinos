import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Crown, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  LogOut,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile, SubscriptionStatus } from '../../types';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  requestPasswordReset, 
  getSupabaseConfigStatus,
  AuthSession 
} from '../../utils/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: AuthSession | null;
  onSessionChange: (session: AuthSession | null) => void;
  onOpenPremiumPresentation?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onSessionChange,
  onOpenPremiumPresentation
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'recover' | 'profile'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const configStatus = getSupabaseConfigStatus();
  const user = currentSession?.user;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success && res.session) {
      onSessionChange(res.session);
      onClose();
    } else {
      setErrorMsg(res.error || 'Erro ao realizar login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await registerUser(nome, email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Conta criada com sucesso! Enviamos um link e código de confirmação para ${email}. Confirme seu e-mail para ativar seu acesso.`);
      setTab('login');
    } else {
      setErrorMsg(res.error || 'Erro ao criar conta.');
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    onSessionChange(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {user ? 'Minha Conta de Aluno' : tab === 'login' ? 'Entrar no Play' : tab === 'register' ? 'Criar Conta' : 'Recuperar Senha'}
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                {user ? user.email : 'Acesso a treinos e histórico'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status de Integração Supabase (Honestidade Técnica) */}
        <div className={`px-4 py-2 border-b text-[10px] flex items-center gap-2 ${
          configStatus.isConfigured 
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50' 
            : 'bg-amber-950/40 text-amber-300 border-amber-900/50'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {configStatus.isConfigured ? 'Autenticação Oficial Supabase Ativa' : 'Modo de Desenvolvimento Desacoplado'}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto space-y-4">
          {user ? (
            /* Visualização de Perfil Logado */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nome</span>
                    <span className="text-sm font-bold text-white">{user.nome}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    user.role === 'trainer' || user.role === 'admin'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {user.role === 'trainer' ? 'Treinador' : user.role === 'admin' ? 'Administrador' : 'Aluno'}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Status do Plano</span>
                    <span className={`text-xs font-black flex items-center gap-1 ${
                      user.subscription_status === 'active' || user.subscription_status === 'trialing' || user.role === 'trainer' || user.role === 'admin'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {user.subscription_status === 'active' || user.role === 'trainer' || user.role === 'admin' ? (
                        <>
                          <Crown className="w-3.5 h-3.5 fill-current" /> Assinante Premium
                        </>
                      ) : (
                        'Acesso Gratuito (12 Treinos)'
                      )}
                    </span>
                  </div>

                  {user.subscription_status !== 'active' && user.role === 'student' && onOpenPremiumPresentation && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPremiumPresentation();
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Crown className="w-3 h-3 fill-current" />
                      <span>Fazer Upgrade</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full min-h-[44px] py-2.5 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          ) : (
            /* Formulários: Login, Cadastro ou Recuperação */
            <div className="space-y-4">
              {/* Seletor de Abas */}
              {tab !== 'recover' && (
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`min-h-[38px] py-1.5 rounded-lg text-xs font-bold transition ${
                      tab === 'login' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`min-h-[38px] py-1.5 rounded-lg text-xs font-bold transition ${
                      tab === 'register' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>
              )}

              {/* Mensagens de Feedback */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase block">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300 uppercase">Senha</label>
                      <button
                        type="button"
                        onClick={() => { setTab('recover'); setErrorMsg(''); setSuccessMsg(''); }}
                        className="text-[10px] text-emerald-400 hover:underline"
                      >
                        Esqueci a senha
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950 mt-2 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Entrando...' : 'Entrar na Conta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : tab === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase block">Seu Nome</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      placeholder="Ex: Ana Lúcia"
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase block">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase block">Senha (mínimo 6 dígitos)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950 mt-2 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Criando conta...' : 'Cadastrar Gratuitamente'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRecover} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase">Recuperar Acesso</span>
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Voltar ao Login
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Digite seu e-mail cadastrado. Um link de redefinição de senha será enviado com segurança.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase block">E-mail Cadastrado</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950"
                  >
                    <span>{loading ? 'Enviando...' : 'Enviar Link de Recuperação'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
