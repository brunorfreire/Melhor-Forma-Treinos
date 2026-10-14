import { Exercise, VideoValidationStatus } from '../types';
import { extractYouTubeId, resolveExerciseYouTubeId, buildYouTubeEmbedUrl } from './youtube';
import { MUSCLEWIKI_CATALOG } from '../data/muscleWikiExercises';
import { CENTRAL_EXERCISES, getCentralExerciseById } from '../data/centralExercises';

export interface ExerciseMediaDetails {
  hasVideo: boolean;
  isValidated: boolean;
  status: 'validado' | 'pendente' | 'sem_video';
  videoId: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  instructions: string;
  cautions: string;
}

/**
 * Normaliza textos para busca e comparação
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Encontra orientações do catálogo padrão caso o exercício não tenha orientações preenchidas
 */
function findCatalogGuidance(exerciseName: string) {
  if (!exerciseName) return null;
  const normName = normalizeText(exerciseName);
  
  const exact = MUSCLEWIKI_CATALOG.find(
    (item) => normalizeText(item.name) === normName
  );
  if (exact) return exact;

  const partial = MUSCLEWIKI_CATALOG.find(
    (item) => {
      const itemNorm = normalizeText(item.name);
      return normName.includes(itemNorm) || itemNorm.includes(normName);
    }
  );
  return partial || null;
}

/**
 * Gera orientações técnicas padrão com base no grupo muscular
 */
function getDefaultMuscleInstructions(muscleGroup?: string): { instructions: string; cautions: string } {
  const norm = normalizeText(muscleGroup || '');

  if (norm.includes('peito')) {
    return {
      instructions: 'Aduza as escápulas contra o banco, mantenha pés firmes e controle a descida da carga até a linha do peito.',
      cautions: 'Evite abrir excessivamente os cotovelos em 90° para proteger a articulação dos ombros.'
    };
  }
  if (norm.includes('costas')) {
    return {
      instructions: 'Inicie a tração retraindo as escápulas e puxando com os cotovelos direcionados ao tronco.',
      cautions: 'Mantenha a coluna lombar estabilizada; não utilize trancos excessivos para movimentar a carga.'
    };
  }
  if (norm.includes('ombro')) {
    return {
      instructions: 'Eleve os pesos com movimento fluido no plano escapular (levemente à frente do tronco) até a altura dos ombros.',
      cautions: 'Não encolha o pescoço e evite balançar a coluna para ganhar impulso.'
    };
  }
  if (norm.includes('biceps') || norm.includes('braço')) {
    return {
      instructions: 'Fixe os cotovelos na linha da cintura e realize a flexão completa dos antebraços com contração no topo.',
      cautions: 'Não projete os cotovelos para frente nem balance a coluna lombar.'
    };
  }
  if (norm.includes('triceps')) {
    return {
      instructions: 'Mantenha os cotovelos alinhados e estenda os antebraços completamente concentrando a tensão no tríceps.',
      cautions: 'Controle a fase excêntrica e evite abrir os cotovelos para fora.'
    };
  }
  if (norm.includes('quadriceps') || norm.includes('perna')) {
    return {
      instructions: 'Mantenha os pés firmes, joelhos alinhados com a ponta dos pés e desça mantendo o tronco estável.',
      cautions: 'Não deixe os joelhos colapsarem para dentro (valgo dinâmico) e mantenha os calcanhares apoiados.'
    };
  }
  if (norm.includes('posterior') || norm.includes('gluteo')) {
    return {
      instructions: 'Inicie empurrando o quadril para trás com joelhos semi-flexionados, sentindo o alongamento dos posteriores.',
      cautions: 'Mantenha a coluna neutra sem curvar as costas ao descer o peso.'
    };
  }
  if (norm.includes('panturrilha')) {
    return {
      instructions: 'Suba o máximo na ponta dos pés com pausa de 1s no topo e desça sentindo o alongamento da panturrilha.',
      cautions: 'Faça movimentos completos sem quicar na base.'
    };
  }
  if (norm.includes('abdomen') || norm.includes('core')) {
    return {
      instructions: 'Concentre a contração nas fibras abdominais, soltando o ar no momento de maior flexão do tronco.',
      cautions: 'Não puxe o pescoço com as mãos e evite tensionar a lombar.'
    };
  }

  return {
    instructions: 'Mantenha postura firme, abdômen contraído e execute o movimento em cadência controlada (2s descida, 1s subida).',
    cautions: 'Não use cargas que comprometam a técnica correta de execução.'
  };
}

/**
 * Encontra o exercício correspondente na Biblioteca Central de Exercícios
 */
function findCentralExerciseMatch(exercise: Exercise) {
  if (exercise.centralExerciseId) {
    const byId = getCentralExerciseById(exercise.centralExerciseId);
    if (byId) return byId;
  }
  const norm = normalizeText(exercise.name);
  return CENTRAL_EXERCISES.find(ce => {
    const ceNorm = normalizeText(ce.name);
    return ceNorm === norm || (ce.nameEn && normalizeText(ce.nameEn) === norm);
  });
}

/**
 * Resolve todos os detalhes de mídia (vídeo, miniatura 16:9, instruções e cuidados)
 */
export function resolveExerciseMedia(exercise: Exercise): ExerciseMediaDetails {
  const centralMatch = findCentralExerciseMatch(exercise);

  // Se o usuário/treinador marcou explicitamente que não quer vídeo
  if (exercise.hasNoVideo) {
    const fallbackGuidance = findCatalogGuidance(exercise.name) || getDefaultMuscleInstructions(exercise.muscleGroup);
    const fallbackTip = ('tip' in fallbackGuidance ? fallbackGuidance.tip : '') || (fallbackGuidance as any).instructions || '';
    const fallbackCautions = fallbackGuidance.cautions || '';
    return {
      hasVideo: false,
      isValidated: false,
      status: 'sem_video',
      videoId: null,
      videoUrl: null,
      embedUrl: null,
      thumbnailUrl: exercise.thumbnailUrl?.trim() || centralMatch?.thumbnailUrl || null,
      instructions: exercise.instructions?.trim() || centralMatch?.instructions || exercise.notes?.trim() || fallbackTip,
      cautions: exercise.cautions?.trim() || centralMatch?.cautions || fallbackCautions
    };
  }

  // 1. Determina o vídeo com correspondência exata
  const explicitUrlOrId = exercise.videoUrl || exercise.youtubeId || exercise.youtubeUrl || centralMatch?.youtubeId || centralMatch?.videoUrl;
  let videoId = extractYouTubeId(explicitUrlOrId);

  if (!videoId) {
    // Busca na biblioteca central ou mapa de correspondência técnica exata
    videoId = resolveExerciseYouTubeId(
      exercise.name,
      explicitUrlOrId,
      exercise.muscleGroup
    );
  }

  // 2. Determina o status de validação (Regra obrigatória: Validado, Pendente ou Sem Vídeo)
  let rawStatus: VideoValidationStatus = 
    exercise.videoValidationStatus || 
    centralMatch?.videoValidationStatus || 
    (videoId ? 'validado' : 'sem_video');

  let status: 'validado' | 'pendente' | 'sem_video' = 'sem_video';
  if (!videoId || rawStatus === 'sem_video') {
    status = 'sem_video';
  } else if (rawStatus === 'pendente_revisao' || (rawStatus as string) === 'pendente') {
    status = 'pendente';
  } else {
    status = 'validado';
  }

  const isValidated = status === 'validado' && !!videoId;
  const hasVideo = !!videoId;
  const embedUrl = videoId ? buildYouTubeEmbedUrl(videoId, true) : null;
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (exercise.videoUrl || null);

  // 3. Determina a miniatura oficial
  let thumbnailUrl: string | null = null;
  if (exercise.thumbnailUrl && exercise.thumbnailUrl.trim().length > 5) {
    thumbnailUrl = exercise.thumbnailUrl.trim();
  } else if (centralMatch?.thumbnailUrl) {
    thumbnailUrl = centralMatch.thumbnailUrl;
  } else if (videoId) {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  // 4. Determina orientações técnicas e cuidados
  const catalogMatch = findCatalogGuidance(exercise.name);
  const defaultGroup = getDefaultMuscleInstructions(exercise.muscleGroup);

  const instructions = (
    exercise.instructions?.trim() ||
    centralMatch?.instructions ||
    catalogMatch?.tip ||
    exercise.notes?.trim() ||
    defaultGroup.instructions
  );

  const cautions = (
    exercise.cautions?.trim() ||
    centralMatch?.cautions ||
    catalogMatch?.cautions ||
    defaultGroup.cautions
  );

  return {
    hasVideo,
    isValidated,
    status,
    videoId,
    videoUrl,
    embedUrl,
    thumbnailUrl,
    instructions,
    cautions
  };
}

/**
 * Retorna se o exercício possui vídeo válido para reprodução
 */
export function hasExerciseVideo(exercise: Exercise): boolean {
  if (exercise.hasNoVideo) return false;
  const details = resolveExerciseMedia(exercise);
  return details.hasVideo && details.isValidated;
}
