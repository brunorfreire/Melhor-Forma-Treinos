/**
 * Serviço de Integração com MuscleWiki
 * Comunicação exclusiva via backend proxy /api/musclewiki sem expor chaves ao navegador.
 * Caso o servidor não possua a chave MUSCLEWIKI_API_KEY, mantém o modo pendente ativo
 * e permite cadastro manual de vídeos licenciados.
 */

export interface MuscleWikiStatus {
  configured: boolean;
  mode: 'active' | 'pending_license';
  status: string;
  message: string;
}

export async function checkMuscleWikiStatus(): Promise<MuscleWikiStatus> {
  try {
    const res = await fetch('/api/musclewiki/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Modo SPA / Fallback quando executado sem backend proxy local
  }
  return {
    configured: false,
    mode: 'pending_license',
    status: 'Pendente de Licença / API Key',
    message: 'Nenhuma chave comercial configurada no servidor backend. O catálogo funciona em modo manual seguro.'
  };
}

export async function searchMuscleWikiExercises(term: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const res = await fetch(`/api/musclewiki/search?q=${encodeURIComponent(term)}`);
    if (res.status === 503) {
      return {
        success: false,
        message: 'Modo pendente ativo: chave da API oficial não configurada no servidor.'
      };
    }
    if (!res.ok) {
      return {
        success: false,
        message: `Falha na busca (status ${res.status}).`
      };
    }
    const data = await res.json();
    return { success: true, data: Array.isArray(data) ? data : data.results || [] };
  } catch (err) {
    return {
      success: false,
      message: 'Não foi possível conectar ao proxy do MuscleWiki.'
    };
  }
}
