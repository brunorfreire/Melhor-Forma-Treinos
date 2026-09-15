import React, { useState } from 'react';
import { X, Send, Copy, Check, QrCode, Globe, ShieldCheck, Phone } from 'lucide-react';
import { WorkoutPlan } from '../types';
import { buildShareUrl } from '../utils/codec';
import { formatWhatsAppRoutineMessage, createWhatsAppShareLink } from '../utils/whatsapp';

interface ShareModalProps {
  plan: WorkoutPlan;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ plan, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [studentPhone, setStudentPhone] = useState(plan.trainerPhone ? '' : '');
  const [showQr, setShowQr] = useState(false);

  const shareUrl = buildShareUrl(plan);
  const formattedMessage = formatWhatsAppRoutineMessage(plan, shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyMsg = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSendWhatsApp = () => {
    const waLink = createWhatsAppShareLink(studentPhone, formattedMessage);
    window.open(waLink, '_blank');
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Enviar Ficha pelo WhatsApp
              </h3>
              <span className="text-xs text-slate-400">
                Sem cadastro • Sem banco de dados • Abre direto no celular
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-200">
          {/* Target Student Summary */}
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Aluno</span>
              <span className="text-sm font-bold text-white">{plan.studentName || 'Nome não informado'}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Divisão</span>
              <span className="text-sm font-bold text-emerald-400">{plan.sessions.length} Treinos</span>
            </div>
          </div>

          {/* WhatsApp Direct Sender */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Telefone do Aluno com DDD (Opcional):
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="Ex: 11987654321 ou em branco"
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950 text-sm"
            >
              <Send className="w-4 h-4" />
              Abrir WhatsApp e Enviar Ficha
            </button>
          </div>

          {/* Quick Copy Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copiedLink ? 'Link Copiado!' : 'Copiar Link Direto'}
            </button>

            <button
              onClick={handleCopyMsg}
              className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copiedMsg ? 'Mensagem Copiada!' : 'Copiar Texto Completo'}
            </button>
          </div>

          {/* QR Code Toggle */}
          <div className="border-t border-slate-800 pt-3">
            <button
              onClick={() => setShowQr(!showQr)}
              className="w-full py-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              {showQr ? 'Ocultar QR Code' : 'Mostrar QR Code para o aluno escanear na academia'}
            </button>

            {showQr && (
              <div className="mt-3 p-4 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2">
                <img
                  src={qrImageUrl}
                  alt="QR Code da Ficha"
                  className="w-48 h-48 rounded-lg"
                  loading="lazy"
                />
                <p className="text-[11px] text-slate-700 font-medium text-center">
                  Aponte a câmera do celular para abrir a ficha instantaneamente
                </p>
              </div>
            )}
          </div>

          {/* Architecture info note for user clarity */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Privacidade & Tecnologia Sem Banco de Dados</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              A ficha fica 100% gravada no próprio link gerado de forma comprimida e segura. Não há custo de banco de dados, não expira e pode ser hospedada com 1 clique na Hostinger.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
