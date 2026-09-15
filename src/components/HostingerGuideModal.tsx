import React from 'react';
import { X, Server, Check, HelpCircle, HardDrive, Download, ExternalLink } from 'lucide-react';
import { WorkoutPlan } from '../types';

interface HostingerGuideModalProps {
  plan: WorkoutPlan;
  onClose: () => void;
}

export const HostingerGuideModal: React.FC<HostingerGuideModalProps> = ({ plan, onClose }) => {
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `melhor-forma-treino-${plan.studentName.replace(/\s+/g, '_').toLowerCase() || 'backup'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Compatibilidade Hostinger & Hospedagem
              </h3>
              <span className="text-xs text-slate-400">
                100% Estático • Sem MySQL • Sem Banco de Dados
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-200">
          <div className="bg-purple-950/30 border border-purple-800/40 p-3.5 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Por que este app funciona perfeitamente na Hostinger?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              O <strong>Melhor Forma Treino V1 Lite</strong> foi construído em arquitetura estática leve (Client-Side). Ele <strong>não necessita de banco de dados MySQL</strong> nem de backend complexo. Você pode colocá-lo na pasta <code>public_html</code> do seu domínio ou subdomínio (ex: <code>treino.seusite.com.br</code>) em qualquer plano da Hostinger!
            </p>
          </div>

          {/* 3 Step Deployment Guide */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Como subir no seu hPanel / Hostinger em 3 passos:
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400">1. Gerar os arquivos estáticos</span>
                <p className="text-slate-400 text-[11px]">
                  Ao baixar o projeto (ou rodar <code>npm run build</code>), a pasta <code>dist/</code> é criada com os arquivos HTML, JS e CSS prontos para produção.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400">2. Enviar para a Hostinger</span>
                <p className="text-slate-400 text-[11px]">
                  No painel da Hostinger, abra o <strong>Gerenciador de Arquivos (File Manager)</strong> e arraste os arquivos de <code>dist/</code> diretamente para dentro da pasta <code>public_html</code>.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400">3. Pronto para usar!</span>
                <p className="text-slate-400 text-[11px]">
                  Ao acessar seu domínio no celular, você já pode montar fichas e gerar links do WhatsApp que abrirão direto no seu próprio domínio sem qualquer mensalidade de banco de dados.
                </p>
              </div>
            </div>
          </div>

          {/* Backup Action */}
          <div className="border-t border-slate-800 pt-3">
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Baixar Cópia de Segurança (Backup JSON) desta Ficha
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
