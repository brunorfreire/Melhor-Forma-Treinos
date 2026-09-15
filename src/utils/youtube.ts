/**
 * YouTube Utility & Video Resolution for Melhor Forma Treino
 * Embeds video directly inside the app without opening external browser tabs.
 */

// Comprehensive curated mapping of Brazilian / standard fitness tutorial videos
export const DEFAULT_EXERCISE_YOUTUBE_MAP: Record<string, string> = {
  // PEITO
  'supino reto com barra': 'rT7DgCr-3pg',
  'supino reto': 'rT7DgCr-3pg',
  'supino inclinado com halteres': '8iPEnn-ltC8',
  'supino inclinado': '8iPEnn-ltC8',
  'supino declinado': 'LfyQBUKR8SE',
  'crucifixo / crossover na polia': 'taI4XduLpOk',
  'crucifixo na polia': 'taI4XduLpOk',
  'crossover na polia': 'taI4XduLpOk',
  'crossover': 'taI4XduLpOk',
  'crucifixo com halteres': 'eozdVDA78K0',
  'peck deck / voador máquina': 'eGjt4lk6g34',
  'peck deck': 'eGjt4lk6g34',
  'voador máquina': 'eGjt4lk6g34',
  'voador': 'eGjt4lk6g34',
  'flexão de braço (push-ups)': 'IODxDxX7oi4',
  'flexão de braço': 'IODxDxX7oi4',
  'flexao de braco': 'IODxDxX7oi4',

  // COSTAS
  'puxada alta no pulley (lat pulldown)': 'CAwf7n6Luuc',
  'puxada alta no pulley': 'CAwf7n6Luuc',
  'puxada alta': 'CAwf7n6Luuc',
  'puxada frontal': 'CAwf7n6Luuc',
  'lat pulldown': 'CAwf7n6Luuc',
  'remada curvada com barra': '6TSP138827w',
  'remada curvada': '6TSP138827w',
  'remada unilateral com halter (serrote)': 'roCP6wCXPqo',
  'remada unilateral': 'roCP6wCXPqo',
  'serrote': 'roCP6wCXPqo',
  'remada baixa no triângulo': 'GZbfZ033f74',
  'remada baixa': 'GZbfZ033f74',
  'remada cavalo': '0Vb6N_s02E4',
  'barra fixa (pull-up)': 'eGo4IYlbE5g',
  'barra fixa': 'eGo4IYlbE5g',
  'pulldown na polia': '9ghf9G2eKzg',

  // OMBROS & TRAPÉZIO
  'desenvolvimento com halteres': 'qEwKCR5JCog',
  'desenvolvimento': 'qEwKCR5JCog',
  'desenvolvimento militar com barra': '2yjwXTZQDDI',
  'desenvolvimento com barra': '2yjwXTZQDDI',
  'elevação lateral com halteres': '3VcKaXpzqRo',
  'elevação lateral': '3VcKaXpzqRo',
  'elevacao lateral': '3VcKaXpzqRo',
  'elevação frontal': 'hRJ6tR5-if0',
  'crucifixo invertido': 'p-B2qK89lVw',
  'encolhimento de ombros / trapézio': 'g6qbkXwX1pE',
  'encolhimento de ombros': 'g6qbkXwX1pE',
  'encolhimento': 'g6qbkXwX1pE',

  // BRAÇOS - BÍCEPS
  'rosca direta com barra w': 'in7PaeYlhrM',
  'rosca direta com barra': 'in7PaeYlhrM',
  'rosca direta': 'in7PaeYlhrM',
  'rosca martelo com halteres': 'zC3nLlEvin4',
  'rosca martelo': 'zC3nLlEvin4',
  'rosca scott com barra w': 'RG4b_dY6K94',
  'rosca scott': 'RG4b_dY6K94',
  'rosca concentrada': 'Jvj2wV0vOYU',
  'rosca alternada com halteres': 'sAq_ocpRh_I',
  'rosca alternada': 'sAq_ocpRh_I',
  'rosca 21': 'RG4b_dY6K94',

  // BRAÇOS - TRÍCEPS
  'tríceps corda na polia alta': 'vB5OHsJ3EME',
  'tríceps corda': 'vB5OHsJ3EME',
  'triceps corda': 'vB5OHsJ3EME',
  'tríceps testa com barra w': 'd_KZxkY_0aw',
  'tríceps testa': 'd_KZxkY_0aw',
  'triceps testa': 'd_KZxkY_0aw',
  'tríceps pulley / barra reta': '2-LAMcpzODU',
  'tríceps pulley': '2-LAMcpzODU',
  'triceps pulley': '2-LAMcpzODU',
  'tríceps francês com halter': '_gsUokN_Abg',
  'tríceps francês': '_gsUokN_Abg',
  'triceps frances': '_gsUokN_Abg',
  'tríceps banco / mergulho': '0326dy_-CzM',
  'tríceps banco': '0326dy_-CzM',

  // QUADRÍCEPS & INFERIORES
  'agachamento livre com barra': 'aclHkVaku9U',
  'agachamento livre': 'aclHkVaku9U',
  'agachamento': 'aclHkVaku9U',
  'agachamento smith': 'aclHkVaku9U',
  'agachamento búlgaro': '2C-uNgKwPLE',
  'agachamento bulgaro': '2C-uNgKwPLE',
  'agachamento sumô': 'Wk28E4V57_Y',
  'leg press 45º': 'IZxyjW7MPJQ',
  'leg press 45': 'IZxyjW7MPJQ',
  'leg press': 'IZxyjW7MPJQ',
  'cadeira extensora': 'YyvSfVjQeL0',
  'extensora': 'YyvSfVjQeL0',
  'afundo / passada com halteres': 'D7KaRcUTQeE',
  'afundo': 'D7KaRcUTQeE',
  'passada': 'D7KaRcUTQeE',

  // POSTERIOR & GLÚTEOS
  'mesa flexora': '1Tq3QdYUuHs',
  'cadeira flexora': 'F488ye6P8TC',
  'stiff com halteres ou barra': '_oyxCn2iSjU',
  'stiff com halteres': '_oyxCn2iSjU',
  'stiff com barra': '_oyxCn2iSjU',
  'stiff': '_oyxCn2iSjU',
  'levantamento terra': 'ytGaGIn3SjE',
  'levantamento terra com barra': 'ytGaGIn3SjE',
  'elevação pélvica com barra': 'SEdqd1n0cvg',
  'elevação pélvica': 'SEdqd1n0cvg',
  'elevacao pelvica': 'SEdqd1n0cvg',
  'cadeira abdutora': '1xZc1Q0t9h8',
  'abdutora': '1xZc1Q0t9h8',
  'cadeira adutora': '8i6l3m-K0W4',
  'adutora': '8i6l3m-K0W4',
  'glúteo 4 apoios na polia': '1xZc1Q0t9h8',

  // PANTURRILHAS
  'elevação de panturrilha em pé': 'gwLzBJYoWlI',
  'panturrilha em pé': 'gwLzBJYoWlI',
  'panturrilha em pe': 'gwLzBJYoWlI',
  'panturrilha sentado (gêmeos)': 'JbyjNymZOt0',
  'panturrilha sentado': 'JbyjNymZOt0',
  'panturrilha no leg press': 'gwLzBJYoWlI',

  // ABDÔMEN & CORE
  'prancha isométrica': 'pSHjTRCQxIw',
  'prancha': 'pSHjTRCQxIw',
  'abdominal crunch no solo': 'Xyd_fa5zoEU',
  'abdominal crunch': 'Xyd_fa5zoEU',
  'abdominal supra': 'Xyd_fa5zoEU',
  'abdominal': 'Xyd_fa5zoEU',
  'abdominal infra / elevação de pernas': 'l4kQd9eWclE',
  'abdominal infra': 'l4kQd9eWclE',
  'elevação de pernas': 'l4kQd9eWclE',
  'abdominal na polia com corda': 'k4Z5n93H00U',
  'abdominal na polia': 'k4Z5n93H00U',
  'abdominal remador': 'f78Q2oZ1d6k',

  // CARDIO
  'esteira ergométrica': 'jT_qA2cE7Q8',
  'esteira': 'jT_qA2cE7Q8',
  'corrida na esteira': 'jT_qA2cE7Q8',
  'bicicleta ergométrica': 'o7a1CqL8z2E',
  'bicicleta': 'o7a1CqL8z2E',
  'polichinelo': 'IODxDxX7oi4'
};

/**
 * Extracts standard 11-char YouTube video ID from various URL formats or raw ID.
 */
export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Normalizes text to assist in dictionary matching (removes accents, lowercase, removes extra spaces).
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Resolves the YouTube Video ID for an exercise:
 * 1. Checks explicit `exercise.youtubeId` or `exercise.youtubeUrl`
 * 2. Checks exact exercise name in curated dictionary
 * 3. Checks fuzzy/substring matches in curated dictionary
 * 4. Checks muscle group defaults
 * 5. Returns a reliable default fitness exercise video ID
 */
export function resolveExerciseYouTubeId(
  exerciseName?: string,
  youtubeIdOrUrl?: string,
  muscleGroup?: string
): string {
  // 1. Explicit ID or URL from exercise object
  const extracted = extractYouTubeId(youtubeIdOrUrl);
  if (extracted) return extracted;

  if (!exerciseName) return 'rT7DgCr-3pg'; // Default Supino Reto tutorial

  const normName = normalizeText(exerciseName);

  // 2. Direct lookup in map
  if (DEFAULT_EXERCISE_YOUTUBE_MAP[normName]) {
    return DEFAULT_EXERCISE_YOUTUBE_MAP[normName];
  }

  // 3. Substring match in keys
  for (const [key, id] of Object.entries(DEFAULT_EXERCISE_YOUTUBE_MAP)) {
    const normKey = normalizeText(key);
    if (normName.includes(normKey) || normKey.includes(normName)) {
      return id;
    }
  }

  // Common keywords heuristics
  if (normName.includes('supino') || normName.includes('peitoral')) return 'rT7DgCr-3pg';
  if (normName.includes('agachamento') || normName.includes('squat')) return 'aclHkVaku9U';
  if (normName.includes('leg press')) return 'IZxyjW7MPJQ';
  if (normName.includes('extensora')) return 'YyvSfVjQeL0';
  if (normName.includes('flexora')) return '1Tq3QdYUuHs';
  if (normName.includes('stiff') || normName.includes('terra')) return '_oyxCn2iSjU';
  if (normName.includes('puxada') || normName.includes('pulley') || normName.includes('costas')) return 'CAwf7n6Luuc';
  if (normName.includes('remada')) return '6TSP138827w';
  if (normName.includes('rosca') || normName.includes('biceps')) return 'in7PaeYlhrM';
  if (normName.includes('triceps') || normName.includes('tríceps')) return 'vB5OHsJ3EME';
  if (normName.includes('elevacao lateral') || normName.includes('desenvolvimento') || normName.includes('ombro')) return '3VcKaXpzqRo';
  if (normName.includes('panturrilha') || normName.includes('gemeos')) return 'gwLzBJYoWlI';
  if (normName.includes('abdominal') || normName.includes('prancha') || normName.includes('core')) return 'Xyd_fa5zoEU';

  // 4. By Muscle Group
  if (muscleGroup) {
    const mg = normalizeText(muscleGroup);
    if (mg.includes('peito')) return 'rT7DgCr-3pg';
    if (mg.includes('costas')) return 'CAwf7n6Luuc';
    if (mg.includes('ombro')) return '3VcKaXpzqRo';
    if (mg.includes('biceps')) return 'in7PaeYlhrM';
    if (mg.includes('triceps')) return 'vB5OHsJ3EME';
    if (mg.includes('quadriceps') || mg.includes('perna')) return 'aclHkVaku9U';
    if (mg.includes('posterior') || mg.includes('gluteo')) return '1Tq3QdYUuHs';
    if (mg.includes('panturrilha')) return 'gwLzBJYoWlI';
    if (mg.includes('abdomen') || mg.includes('core')) return 'pSHjTRCQxIw';
  }

  // 5. General fallback
  return 'rT7DgCr-3pg';
}

/**
 * Builds the safe, privacy-enhanced YouTube embed URL.
 */
export function buildYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  const ap = autoplay ? 1 : 0;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${ap}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
}
