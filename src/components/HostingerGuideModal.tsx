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
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition flex items-center justify-center"
            aria-label="Fechar guia Hostinger"
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

          {/* Quick ZIP Download Banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                Pacote de Publicação Gerado
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                ZIP • 105 KB
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Geramos o arquivo <strong>hostinger-deploy.zip</strong> com o <code>index.html</code>, estilos, scripts e <code>.htaccess</code> configurados para subdomínio.
            </p>
            <a
              href="./hostinger-deploy.zip"
              download="hostinger-deploy.zip"
              className="w-full min-h-[44px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950 text-center"
            >
              <Download className="w-4 h-4" />
              Baixar hostinger-deploy.zip (Pronto para Upload)
            </a>
          </div>

          {/* 3 Step Deployment Guide */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Como subir no seu subdomínio da Hostinger em 3 passos:
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400">1. Criar o Subdomínio no hPanel</span>
                <p className="text-slate-400 text-[11px]">
                  No hPanel da Hostinger, vá em <strong>Domínios ➔ Subdomínios</strong> e crie o nome desejado (ex: <code>treino</code>). A Hostinger criará a pasta <code>public_html/treino/</code>.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400">2. Enviar e Extrair o ZIP</span>
                <p className="text-slate-400 text-[11px]">
                  Abra o <strong>Gerenciador de Arquivos</strong> da Hostinger, entre na pasta <code>public_html/treino/</code>, clique em <strong>Fazer Upload</strong> do <code>hostinger-deploy.zip</code> e depois com o botão direito clique em <strong>Extrair</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400">3. Acessar seu App!</span>
                <p className="text-slate-400 text-[11px]">
                  Acesse <code>https://treino.seusite.com.br</code> no celular ou computador. O app abre instantaneamente e já gera links do WhatsApp direto no seu subdomínio!
                </p>
              </div>
            </div>
          </div>

          {/* Automation GitHub notice */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-[11px] space-y-1">
            <span className="font-bold text-slate-300 block">Deploy Automático via GitHub Actions:</span>
            <p>
              O arquivo de automação <code>.github/workflows/deploy-hostinger.yml</code> e o guia completo <code>HOSTINGER_DEPLOY.md</code> já foram criados no repositório.
            </p>
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
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
