/**
 * SERVIÇO DE AUDITORIA DA BIBLIOTECA DE EXERCÍCIOS
 * Melhor Forma Play 40+
 *
 * Princípios Fundamentais:
 * 1. Separação conceitual estrita entre Validação Biomecânica e Disponibilidade Técnica da Mídia.
 * 2. Transparência de aprovações legadas ("Aprovação legada, origem não documentada").
 * 3. Cálculos 100% reais baseados nos dados ativos (72 treinos, 251 relacionamentos, 46 exercícios).
 * 4. Verificação não destrutiva sob demanda (arquivos locais, IndexedDB, YouTube, Vimeo).
 * 5. Priorização inteligente de correções ponderada pelo impacto no catálogo de treinos.
 * 6. Exportação CSV com BOM UTF-8 compatível com Excel e Google Sheets.
 */

import { CentralExercise, VideoValidationStatus, CatalogWorkout, WorkoutExerciseItem } from '../types';
import { 
  getAllCentralExercises, 
  getAllWorkoutExerciseItems, 
  getAllCatalogWorkouts,
  updateCentralExercise
} from '../data/workoutCatalogService';
import { resolveAssetUrl } from './exerciseMedia';
import { extractYouTubeId } from './youtube';
import { extractVimeoId } from './vimeo';
import { getMediaFromIndexedDB, logExerciseChange } from './mediaStorageService';

export type BiomechanicalStatus = 'validado' | 'pendente_revisao' | 'sem_avaliacao';
export type MediaAvailability = 'disponivel' | 'indisponivel' | 'sem_midia' | 'nao_verificado';

export interface AuditRecord {
  exerciseId: string;
  biomechanicalStatus: BiomechanicalStatus;
  isLegacyApproval: boolean;
  mediaAvailability: MediaAvailability;
  mediaAvailabilityDetails?: string;
  lastVerifiedAt?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  mediaFormat: 'gif' | 'webp' | 'mp4' | 'youtube' | 'vimeo' | 'nenhum';
  mediaSourceUrl?: string;
}

export interface LinkedWorkoutInfo {
  id: string;
  title: string;
  category: string;
  level: string;
  accessLevel: 'free' | 'premium';
  order: number;
  sets: string;
  reps: string;
  rest: string;
}

export interface AuditSummaryMetrics {
  totalExercises: number;
  validatedCount: number;
  pendingCount: number;
  noMediaCount: number;
  brokenMediaCount: number;
  verifiedAvailableCount: number;
  unverifiedCount: number;
  unusedCount: number;
  usedCount: number;
  mediaCoveragePercent: number;
  approvedPercent: number;
  totalWorkoutsLinked: number;
}

export interface CorrectionPriorityItem {
  exercise: CentralExercise;
  auditRecord: AuditRecord;
  linkedWorkouts: LinkedWorkoutInfo[];
  workoutCount: number;
  priorityScore: number;
  priorityLevel: 'alta' | 'media' | 'baixa';
  justification: string;
}

const AUDIT_STORAGE_KEY = 'mf_library_audit_records_v1';

// Os 7 exercícios que foram conferidos com mídias físicas existentes
const VALIDATED_LOCAL_EXERCISE_IDS = new Set([
  'ex-agachamento-sumo-halter',
  'ex-elevacao-pelvica-unilateral',
  'ex-flexao-braco-inclinada',
  'ex-mesa-flexora',
  'ex-remada-curvada-halteres',
  'ex-subida-step-degrau',
  'ex-triceps-frances-halter'
]);

/**
 * Carrega registros de auditoria persistidos no navegador
 */
export function getStoredAuditRecords(): Record<string, AuditRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    console.warn('Erro ao carregar registros de auditoria:', e);
    return {};
  }
}

/**
 * Salva registros de auditoria no localStorage
 */
export function saveStoredAuditRecords(records: Record<string, AuditRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Erro ao salvar registros de auditoria:', e);
  }
}

/**
 * Determina o formato de mídia de um exercício
 */
export function detectExerciseMediaFormat(ex: CentralExercise): 'gif' | 'webp' | 'mp4' | 'youtube' | 'vimeo' | 'nenhum' {
  const videoUrl = (ex.videoUrl || '').toLowerCase();
  const fallbackUrl = (ex.fallbackMediaUrl || '').toLowerCase();

  if (ex.vimeoId || videoUrl.includes('vimeo.com') || (ex.vimeoUrl && ex.vimeoUrl.length > 3)) {
    return 'vimeo';
  }
  if (videoUrl.endsWith('.gif') || fallbackUrl.endsWith('.gif')) {
    return 'gif';
  }
  if (videoUrl.endsWith('.webp') || fallbackUrl.endsWith('.webp')) {
    return 'webp';
  }
  if (videoUrl.endsWith('.mp4') || (videoUrl.startsWith('indexeddb://') && ex.mediaType === 'video')) {
    return 'mp4';
  }
  if (ex.youtubeId || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (!ex.videoUrl && !ex.youtubeId && !ex.vimeoId) {
    return 'nenhum';
  }
  return 'webp';
}

/**
 * Obtém ou inicializa o registro de auditoria de um exercício
 */
export function getOrCreateAuditRecord(ex: CentralExercise, storedRecords: Record<string, AuditRecord>): AuditRecord {
  if (storedRecords[ex.id]) {
    return storedRecords[ex.id];
  }

  const format = detectExerciseMediaFormat(ex);
  const hasMedia = format !== 'nenhum' && ex.videoValidationStatus !== 'sem_video';

  // Biomechanical Status
  let biomechanicalStatus: BiomechanicalStatus = 'sem_avaliacao';
  let isLegacyApproval = false;

  if (ex.videoValidationStatus === 'validado') {
    biomechanicalStatus = 'validado';
    // Se for um dos 7 conferidos, tem aprovação profissional conferida; os demais são aprovação legada
    isLegacyApproval = !VALIDATED_LOCAL_EXERCISE_IDS.has(ex.id);
  } else if (ex.videoValidationStatus === 'pendente_revisao') {
    biomechanicalStatus = 'pendente_revisao';
  } else {
    biomechanicalStatus = 'sem_avaliacao';
  }

  // Media Availability inicial
  let mediaAvailability: MediaAvailability = 'nao_verificado';
  if (!hasMedia) {
    mediaAvailability = 'sem_midia';
  } else if (VALIDATED_LOCAL_EXERCISE_IDS.has(ex.id)) {
    // 7 arquivos físicos comprovadamente presentes no workspace
    mediaAvailability = 'disponivel';
  }

  return {
    exerciseId: ex.id,
    biomechanicalStatus,
    isLegacyApproval,
    mediaAvailability,
    mediaAvailabilityDetails: VALIDATED_LOCAL_EXERCISE_IDS.has(ex.id) 
      ? 'Arquivo físico verificado na pasta public/exercises/'
      : undefined,
    mediaFormat: format,
    mediaSourceUrl: ex.videoUrl || ex.youtubeId || ex.vimeoId || undefined
  };
}

/**
 * Obtém os treinos vinculados a um exercício no catálogo
 */
export function getExerciseWorkoutRelations(exerciseId: string): LinkedWorkoutInfo[] {
  const relations = getAllWorkoutExerciseItems();
  const workouts = getAllCatalogWorkouts();
  const workoutMap = new Map(workouts.map(w => [w.id, w]));

  const matchingRelations = relations.filter(r => r.exerciseId === exerciseId);

  return matchingRelations.map(rel => {
    const workout = workoutMap.get(rel.workoutId);
    return {
      id: rel.workoutId,
      title: workout?.title || `Treino (${rel.workoutId})`,
      category: workout?.category || 'forca_40_plus',
      level: workout?.level || 'iniciante',
      accessLevel: workout?.accessLevel || 'free',
      order: rel.order,
      sets: rel.sets,
      reps: rel.reps,
      rest: rel.rest
    };
  });
}

/**
 * Realiza verificação não destrutiva de um exercício individual
 */
export async function verifyExerciseMedia(ex: CentralExercise): Promise<{ availability: MediaAvailability; details: string }> {
  const format = detectExerciseMediaFormat(ex);

  if (format === 'nenhum' || (!ex.videoUrl && !ex.youtubeId && !ex.vimeoId)) {
    return {
      availability: 'sem_midia',
      details: 'Nenhum arquivo ou link de demonstração cadastrado'
    };
  }

  // 1. Arquivo no IndexedDB
  if (ex.videoUrl && ex.videoUrl.startsWith('indexeddb://')) {
    const id = ex.videoUrl.replace('indexeddb://', '').trim();
    try {
      const stored = await getMediaFromIndexedDB(id);
      if (stored && stored.blob) {
        return {
          availability: 'disponivel',
          details: `Arquivo local presente no IndexedDB (${(stored.size / (1024 * 1024)).toFixed(2)} MB, ${stored.mimeType})`
        };
      }
      return {
        availability: 'indisponivel',
        details: 'Registro da mídia não localizado no IndexedDB do navegador'
      };
    } catch (err: any) {
      return {
        availability: 'nao_verificado',
        details: `Erro ao consultar IndexedDB: ${err.message}`
      };
    }
  }

  // 2. Arquivos locais em /exercises/ ou no servidor público
  if (ex.videoUrl && (ex.videoUrl.startsWith('/exercises/') || ex.videoUrl.startsWith('exercises/'))) {
    const resolvedPath = resolveAssetUrl(ex.videoUrl);
    if (!resolvedPath) {
      return { availability: 'indisponivel', details: 'Caminho de mídia inválido' };
    }

    try {
      // Faz probe leve via fetch com headers para checar MIME type
      const response = await fetch(resolvedPath, { method: 'HEAD' });
      if (response.ok) {
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        if (contentType.includes('text/html')) {
          return {
            availability: 'indisponivel',
            details: 'Servidor respondeu com text/html em vez do arquivo de mídia (provável 404 do SPA)'
          };
        }
        return {
          availability: 'disponivel',
          details: `Arquivo local acessível via servidor (${contentType || 'binário'})`
        };
      } else {
        return {
          availability: 'indisponivel',
          details: `Servidor retornou status HTTP ${response.status} (${response.statusText})`
        };
      }
    } catch {
      // Fallback via teste de elemento Image para evitar falhas de CORS ou proxy
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({
          availability: 'disponivel',
          details: 'Imagem carregada com sucesso no navegador'
        });
        img.onerror = () => resolve({
          availability: 'indisponivel',
          details: 'Falha ao carregar a imagem física no navegador'
        });
        img.src = resolvedPath;
      });
    }
  }

  // 3. YouTube (com sondagem real de oEmbed)
  if (format === 'youtube') {
    const rawId = ex.youtubeId || (ex.videoUrl ? extractYouTubeId(ex.videoUrl) : null);
    if (!rawId) {
      return { availability: 'indisponivel', details: 'ID do YouTube ausente ou malformatado' };
    }
    const cleanId = rawId.trim();
    if (!/^[a-zA-Z0-9_-]{11}$/.test(cleanId)) {
      return {
        availability: 'indisponivel',
        details: `ID do YouTube com formato sintático inválido: "${cleanId}" (esperado 11 caracteres)`
      };
    }

    try {
      // Sondagem real na API pública de oEmbed do YouTube
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(cleanId)}&format=json`;

      const res = await fetch(oembedUrl, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          availability: 'disponivel',
          details: `Vídeo verificado via YouTube oEmbed (ID: ${cleanId}, incorporação autorizada)`
        };
      } else if (res.status === 404) {
        return {
          availability: 'indisponivel',
          details: `Vídeo não encontrado ou excluído do YouTube (HTTP 404, ID: ${cleanId})`
        };
      } else if (res.status === 401 || res.status === 403) {
        return {
          availability: 'indisponivel',
          details: `Vídeo privado ou com incorporação externa desativada pelo canal (HTTP ${res.status})`
        };
      } else {
        return {
          availability: 'nao_verificado',
          details: `Resposta inconclusiva do YouTube oEmbed (HTTP ${res.status}). Aguardando confirmação no player.`
        };
      }
    } catch (err: any) {
      // Falha de rede, timeout ou bloqueio de CORS no navegador
      return {
        availability: 'nao_verificado',
        details: `Sondagem oEmbed inconclusiva (${err.name === 'AbortError' ? 'timeout' : 'restrição de rede/CORS'}). ID sintático válido (${cleanId}), aguardando teste de reprodução.`
      };
    }
  }

  // 4. Vimeo (com sondagem real de oEmbed)
  if (format === 'vimeo') {
    const rawId = ex.vimeoId || (ex.vimeoUrl ? extractVimeoId(ex.vimeoUrl) : null) || (ex.videoUrl ? extractVimeoId(ex.videoUrl) : null);
    if (!rawId) {
      return { availability: 'indisponivel', details: 'ID do Vimeo ausente ou malformatado' };
    }
    const cleanId = rawId.trim();
    if (!/^\d{6,12}$/.test(cleanId)) {
      return {
        availability: 'indisponivel',
        details: `ID do Vimeo com formato inválido: "${cleanId}" (esperado 6 a 12 dígitos)`
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${encodeURIComponent(cleanId)}`;

      const res = await fetch(oembedUrl, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          availability: 'disponivel',
          details: `Vídeo verificado via Vimeo oEmbed (ID: ${cleanId}, pronto para reprodução)`
        };
      } else if (res.status === 404) {
        return {
          availability: 'indisponivel',
          details: `Vídeo não encontrado ou excluído do Vimeo (HTTP 404)`
        };
      } else {
        return {
          availability: 'nao_verificado',
          details: `Resposta do Vimeo oEmbed (HTTP ${res.status}). Aguardando confirmação no player.`
        };
      }
    } catch {
      return {
        availability: 'nao_verificado',
        details: `Sondagem oEmbed inconclusiva no Vimeo. ID sintático válido (${cleanId}), aguardando teste de reprodução.`
      };
    }
  }

  // 5. Links externos diretos (CDN / Hostinger / Supabase)
  if (ex.videoUrl && /^https?:\/\//i.test(ex.videoUrl)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(ex.videoUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          availability: 'disponivel',
          details: 'URL externa acessível com sucesso (HTTP 200)'
        };
      } else if (res.status === 404) {
        return {
          availability: 'indisponivel',
          details: `URL externa retornou status 404 (arquivo não encontrado no servidor remoto)`
        };
      } else {
        return {
          availability: 'nao_verificado',
          details: `Servidor remoto retornou HTTP ${res.status}. Aguardando teste de reprodução.`
        };
      }
    } catch {
      return {
        availability: 'nao_verificado',
        details: 'URL externa configurada. Sondagem direta bloqueada por CORS do navegador, aguardando teste no player.'
      };
    }
  }

  return {
    availability: 'nao_verificado',
    details: 'Mídia configurada aguardando verificação manual'
  };
}

/**
 * Registra formalmente a decisão de revisão biomecânica tomada pelo Personal Trainer
 */
export function recordBiomechanicalReview(params: {
  exerciseId: string;
  status: BiomechanicalStatus;
  reviewerName: string;
  notes?: string;
}): AuditRecord {
  const records = getStoredAuditRecords();
  const exercises = getAllCentralExercises();
  const target = exercises.find(e => e.id === params.exerciseId);

  const existing = records[params.exerciseId] || (target ? getOrCreateAuditRecord(target, records) : null);

  const videoValStatus: VideoValidationStatus = 
    params.status === 'validado' ? 'validado' :
    params.status === 'pendente_revisao' ? 'pendente_revisao' : 'sem_video';

  const updatedRecord: AuditRecord = {
    ...(existing || {
      exerciseId: params.exerciseId,
      mediaAvailability: 'disponivel',
      mediaFormat: target ? detectExerciseMediaFormat(target) : 'webp'
    }),
    biomechanicalStatus: params.status,
    isLegacyApproval: false,
    reviewerName: params.reviewerName || 'Personal Trainer Autorizado',
    reviewedAt: new Date().toISOString(),
    reviewNotes: params.notes || undefined
  };

  records[params.exerciseId] = updatedRecord;
  saveStoredAuditRecords(records);

  // Sincroniza o status no repositório de exercícios centrais
  updateCentralExercise(params.exerciseId, {
    videoValidationStatus: videoValStatus
  });

  // Registra no log de auditoria
  logExerciseChange({
    exerciseId: params.exerciseId,
    exerciseName: target?.name || params.exerciseId,
    action: 'status_alterado',
    details: `Revisão Biomecânica registrada: ${params.status.toUpperCase()} por ${params.reviewerName}. ${params.notes ? `Nota: "${params.notes}"` : ''}`,
    author: params.reviewerName || 'Personal Trainer'
  });

  return updatedRecord;
}

/**
 * Atualiza o status de disponibilidade técnica verificado de um exercício
 */
export function updateExerciseAvailability(
  exerciseId: string, 
  availability: MediaAvailability, 
  details?: string
): AuditRecord {
  const records = getStoredAuditRecords();
  const exercises = getAllCentralExercises();
  const target = exercises.find(e => e.id === exerciseId);

  const existing = records[exerciseId] || (target ? getOrCreateAuditRecord(target, records) : null);

  const updatedRecord: AuditRecord = {
    ...(existing || {
      exerciseId,
      biomechanicalStatus: target?.videoValidationStatus === 'validado' ? 'validado' : 'pendente_revisao',
      isLegacyApproval: true,
      mediaFormat: target ? detectExerciseMediaFormat(target) : 'webp'
    }),
    mediaAvailability: availability,
    mediaAvailabilityDetails: details,
    lastVerifiedAt: new Date().toISOString()
  };

  records[exerciseId] = updatedRecord;
  saveStoredAuditRecords(records);
  return updatedRecord;
}

/**
 * Calcula os indicadores reais de auditoria da biblioteca
 */
export function calculateAuditMetrics(
  exercises: CentralExercise[],
  auditRecords: Record<string, AuditRecord>
): AuditSummaryMetrics {
  const relations = getAllWorkoutExerciseItems();
  const usedExerciseIds = new Set(relations.map(r => r.exerciseId));

  let validatedCount = 0;
  let pendingCount = 0;
  let noMediaCount = 0;
  let brokenMediaCount = 0;
  let verifiedAvailableCount = 0;
  let unverifiedCount = 0;

  exercises.forEach(ex => {
    const rec = auditRecords[ex.id] || getOrCreateAuditRecord(ex, auditRecords);
    
    // Status Biomecânico
    if (rec.biomechanicalStatus === 'validado') {
      validatedCount++;
    } else if (rec.biomechanicalStatus === 'pendente_revisao') {
      pendingCount++;
    }

    // Disponibilidade da Mídia
    if (rec.mediaAvailability === 'sem_midia' || rec.mediaFormat === 'nenhum') {
      noMediaCount++;
    } else if (rec.mediaAvailability === 'indisponivel') {
      brokenMediaCount++;
    } else if (rec.mediaAvailability === 'disponivel') {
      verifiedAvailableCount++;
    } else {
      unverifiedCount++;
    }
  });

  const totalExercises = exercises.length;
  const exercisesWithMedia = totalExercises - noMediaCount;
  const mediaCoveragePercent = totalExercises > 0 ? Math.round((exercisesWithMedia / totalExercises) * 100) : 0;
  const approvedPercent = totalExercises > 0 ? Math.round((validatedCount / totalExercises) * 100) : 0;

  const usedCount = exercises.filter(e => usedExerciseIds.has(e.id)).length;
  const unusedCount = totalExercises - usedCount;

  return {
    totalExercises,
    validatedCount,
    pendingCount,
    noMediaCount,
    brokenMediaCount,
    verifiedAvailableCount,
    unverifiedCount,
    usedCount,
    unusedCount,
    mediaCoveragePercent,
    approvedPercent,
    totalWorkoutsLinked: relations.length
  };
}

/**
 * Calcula a lista de prioridades de correção inteligente ponderada pelo impacto no catálogo
 */
export function getCorrectionPriorities(
  exercises: CentralExercise[],
  auditRecords: Record<string, AuditRecord>
): CorrectionPriorityItem[] {
  const relations = getAllWorkoutExerciseItems();
  const workoutCountMap = new Map<string, number>();

  relations.forEach(r => {
    const count = workoutCountMap.get(r.exerciseId) || 0;
    workoutCountMap.set(r.exerciseId, count + 1);
  });

  const items: CorrectionPriorityItem[] = [];

  exercises.forEach(ex => {
    const rec = auditRecords[ex.id] || getOrCreateAuditRecord(ex, auditRecords);
    const workoutCount = workoutCountMap.get(ex.id) || 0;
    const linked = getExerciseWorkoutRelations(ex.id);

    // Se o exercício já estiver 100% validado biomecanicamente e com mídia disponível, não é pendência
    const isFullyApprovedAndFunctional = rec.biomechanicalStatus === 'validado' && rec.mediaAvailability === 'disponivel';
    if (isFullyApprovedAndFunctional && !rec.isLegacyApproval) {
      return;
    }

    let score = 0;
    let priorityLevel: 'alta' | 'media' | 'baixa' = 'baixa';
    const issues: string[] = [];

    // Fator 1: Mídia indisponível / quebrada (Gravidade Máxima)
    if (rec.mediaAvailability === 'indisponivel') {
      score += 500;
      issues.push('Mídia com falha comprovada');
    }

    // Fator 2: Sem mídia
    if (rec.mediaAvailability === 'sem_midia' || rec.mediaFormat === 'nenhum') {
      score += 300;
      issues.push('Sem demonstração vinculada');
    }

    // Fator 3: Pendente de revisão biomecânica
    if (rec.biomechanicalStatus === 'pendente_revisao') {
      score += 150;
      issues.push('Aguardando aprovação biomecânica do profissional');
    } else if (rec.isLegacyApproval) {
      score += 60;
      issues.push('Aprovação legada sem registro de auditor');
    }

    // Fator Multiplicador: Quantidade de treinos impactados
    if (workoutCount > 0) {
      score += workoutCount * 40;
    }

    // Classificação da prioridade
    if (score >= 400 || (workoutCount >= 5 && (rec.mediaAvailability === 'sem_midia' || rec.biomechanicalStatus === 'pendente_revisao'))) {
      priorityLevel = 'alta';
    } else if (score >= 150 || workoutCount >= 2) {
      priorityLevel = 'media';
    } else {
      priorityLevel = 'baixa';
    }

    // Se não há pendência real, não adiciona
    if (score === 0) return;

    let justification = '';
    if (workoutCount > 0) {
      justification = `Impacta ${workoutCount} ${workoutCount === 1 ? 'treino' : 'treinos'} no catálogo • ${issues.join(' • ')}`;
    } else {
      justification = `Exercício no acervo (sem treinos vinculados) • ${issues.join(' • ')}`;
    }

    items.push({
      exercise: ex,
      auditRecord: rec,
      linkedWorkouts: linked,
      workoutCount,
      priorityScore: score,
      priorityLevel,
      justification
    });
  });

  // Ordena por score decrescente
  return items.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Exporta o relatório completo da auditoria para formato CSV (compatível com Excel e Google Sheets)
 */
export function exportAuditToCSV(
  exercises: CentralExercise[],
  auditRecords: Record<string, AuditRecord>,
  filteredExercises?: CentralExercise[]
): void {
  const targetList = filteredExercises || exercises;
  const relations = getAllWorkoutExerciseItems();
  const workouts = getAllCatalogWorkouts();
  const workoutMap = new Map(workouts.map(w => [w.id, w.title]));

  const headers = [
    'ID Canônico',
    'Nome do Exercício',
    'Nome Alternativo (Inglês)',
    'Grupo Muscular',
    'Padrão de Movimento',
    'Equipamento',
    'Dificuldade',
    'Formato da Mídia',
    'Origem / URL da Mídia',
    'Validação Biomecânica',
    'Origem da Aprovação',
    'Disponibilidade Técnica',
    'Detalhes da Disponibilidade',
    'Total de Treinos Vinculados',
    'Treinos que Utilizam',
    'Última Verificação',
    'Revisor Responsável',
    'Data da Revisão',
    'Observações da Revisão'
  ];

  const escapeCSV = (val?: string | number | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = targetList.map(ex => {
    const rec = auditRecords[ex.id] || getOrCreateAuditRecord(ex, auditRecords);
    const linked = relations.filter(r => r.exerciseId === ex.id);
    const workoutTitles = linked.map(r => workoutMap.get(r.workoutId) || r.workoutId).join('; ');

    const formatLabel = rec.mediaFormat.toUpperCase();
    const biomechLabel = 
      rec.biomechanicalStatus === 'validado' ? 'VALIDADO' :
      rec.biomechanicalStatus === 'pendente_revisao' ? 'PENDENTE DE REVISÃO' : 'SEM AVALIAÇÃO';

    const originLabel = 
      rec.isLegacyApproval ? 'Aprovação legada, origem não documentada' :
      rec.reviewerName ? `Aprovado por ${rec.reviewerName}` : 'Pendente de avaliação';

    const availLabel = 
      rec.mediaAvailability === 'disponivel' ? 'DISPONÍVEL' :
      rec.mediaAvailability === 'indisponivel' ? 'INDISPONÍVEL' :
      rec.mediaAvailability === 'sem_midia' ? 'SEM MÍDIA' : 'NÃO VERIFICADO';

    return [
      escapeCSV(ex.id),
      escapeCSV(ex.name),
      escapeCSV(ex.nameEn || ''),
      escapeCSV(ex.muscleGroup),
      escapeCSV(ex.movementPattern),
      escapeCSV(ex.equipment),
      escapeCSV(ex.difficulty),
      escapeCSV(formatLabel),
      escapeCSV(rec.mediaSourceUrl || ex.videoUrl || ex.youtubeId || ex.vimeoId || ''),
      escapeCSV(biomechLabel),
      escapeCSV(originLabel),
      escapeCSV(availLabel),
      escapeCSV(rec.mediaAvailabilityDetails || ''),
      escapeCSV(linked.length),
      escapeCSV(workoutTitles),
      escapeCSV(rec.lastVerifiedAt ? new Date(rec.lastVerifiedAt).toLocaleString('pt-BR') : 'Nunca verificado'),
      escapeCSV(rec.reviewerName || ''),
      escapeCSV(rec.reviewedAt ? new Date(rec.reviewedAt).toLocaleString('pt-BR') : ''),
      escapeCSV(rec.reviewNotes || '')
    ].join(';');
  });

  // Adiciona BOM UTF-8 (\uFEFF) para que o Excel abra acentuações perfeitamente
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `auditoria_biblioteca_exercicios_melhorforma_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
