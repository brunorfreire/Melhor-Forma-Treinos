import React, { useState, useEffect } from 'react';
import { checkMuscleWikiStatus, searchMuscleWikiExercises, MuscleWikiStatus } from '../../utils/muscleWikiApi';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ExternalLink, 
  Lock, 
  FileCheck, 
  Database, 
  RefreshCw,
  Server
} from 'lucide-react';

export const TrainerMuscleWikiTab: React.FC = () => {
  const [status, setStatus] = useState<MuscleWikiStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    const res = await checkMuscleWikiStatus();
    setStatus(res);
    setLoadingStatus(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    setSearchFeedback(null);
    const res = await searchMuscleWikiExercises(searchTerm.trim());
    setSearchLoading(false);

    if (res.success && res.data) {
      setResults(res.data);
      if (res.data.length === 0) {
        setSearchFeedback('Nenhum resultado retornado pela API oficial.');
      }
    } else {
      setResults([]);
      setSearchFeedback(res.message || 'Falha na busca.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              status?.configured 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              {status?.configured ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Integração Oficial de Mídia
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  status?.configured
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}>
                  {status?.configured ? '● Ativo via Proxy' : '▲ Modo Pendente de Licença'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">
                MuscleWiki API & Licenciamento
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                {status?.message || 'Verificando conexão com o servidor proxy backend...'}
              </p>
            </div>
          </div>

          <button
            onClick={loadStatus}
            disabled={loadingStatus}
            className="min-h-[40px] px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Testar Status</span>
          </button>
        </div>
      </div>

      {/* Regras e Diretrizes Legais (Prompt Mestre) */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Diretrizes de Conformidade e Proteção de Direitos Autorais</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400 block text-[11px] uppercase">1. Zero Web Scraping</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              O aplicativo não realiza extração automatizada de dados nem scraping no site da MuscleWiki.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400 block text-[11px] uppercase">2. Sem Download de Vídeos</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Vídeos nunca são baixados ou hospedados sem autorização formal e licença comercial explícita.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400 block text-[11px] uppercase">3. Chaves Protegidas</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Chaves de API jamais são expostas no código React. Todas as chamadas trafegam por proxy no backend Node.
            </p>
          </div>
        </div>
      </div>

      {/* Como configurar a licença comercial */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 space-y-2.5">
        <div className="flex items-center gap-2 text-white font-bold">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Como Ativar a Conexão Direta:</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Para integrar o catálogo oficial da MuscleWiki com credenciais comerciais:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
          <li>Adquira o plano comercial na plataforma oficial MuscleWiki API.</li>
          <li>Configure a variável <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">MUSCLEWIKI_API_KEY</code> no arquivo de ambiente do servidor backend (<code className="text-slate-300">.env</code>).</li>
          <li>Reinicie o servidor para que o proxy seguro <code className="text-slate-300">/api/musclewiki/*</code> passe a autenticar as requisições upstream.</li>
        </ol>
      </div>

      {/* Ferramenta de Teste de Busca via Proxy */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Teste de Consulta do Proxy Seguro</span>
        </h3>

        <form onSubmit={handleTestSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome de um exercício para testar no proxy..."
            className="flex-1 min-h-[44px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            {searchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Consultar</span>
          </button>
        </form>

        {searchFeedback && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchFeedback}</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs text-slate-400">Resultados retornados:</span>
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {results.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                  <strong className="text-white">{item.name || item.title}</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ID: {item.id} • Categoria: {item.category || item.muscle_group}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
