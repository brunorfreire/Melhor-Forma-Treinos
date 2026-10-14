import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface TrainerAuthGateProps {
  onAuthenticated: () => void;
}

const PIN_STORAGE_KEY = 'mf_trainer_admin_pin_v1';
const SESSION_AUTH_KEY = 'mf_trainer_authenticated_v1';
const DEFAULT_PIN = '4040';

export function isTrainerAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function logoutTrainer(): void {
  try {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  } catch {}
}

export const TrainerAuthGate: React.FC<TrainerAuthGateProps> = ({ onAuthenticated }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);

  const getStoredPin = () => {
    try {
      return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getStoredPin();

    if (pinInput.trim() === correctPin) {
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      } catch {}
      setErrorMsg('');
      onAuthenticated();
    } else {
      setErrorMsg('PIN incorreto. Tente novamente.');
      setAttempts(prev => prev + 1);
      setPinInput('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            Acesso Restrito ao Administrador
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight">
            Painel do Treinador
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Área protegida para gestão do catálogo de 72 treinos, validação de vídeos e biblioteca de exercícios.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Digite o PIN de Segurança:
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="••••"
                autoFocus
                className="w-full min-h-[48px] px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-mono tracking-widest text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-98"
          >
            <span>Acessar Painel do Treinador</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Hint / Admin Security Info */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 text-left text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Segurança do Catálogo</span>
          </div>
          <p className="text-slate-400">
            Apenas profissionais autorizados podem publicar treinos, alterar correspondência técnica de vídeos e editar exercícios centrais.
          </p>
          <div className="pt-1 text-[10px] text-emerald-400/90 font-mono">
            PIN Padrão Inicial: <strong className="text-white">4040</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
