export interface CatalogExercise {
  id?: string;
  name: string;
  muscleGroup: string;
  youtubeId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  muscleWikiUrl?: string;
  defaultSets: string;
  defaultReps: string;
  defaultRest: string;
  tip?: string;
  instructions?: string;
  cautions?: string;
}

export const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Quadríceps',
  'Posterior & Glúteos',
  'Panturrilhas',
  'Abdômen & Core',
  'Cardio & Aquecimento'
] as const;

export const MUSCLEWIKI_BASE_URL = 'https://musclewiki.com/pt-br';

export const MUSCLEWIKI_CATALOG: CatalogExercise[] = [
  // PEITO
  {
    name: 'Supino Reto com Barra',
    muscleGroup: 'Peito',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/bench-press',
    defaultSets: '4',
    defaultReps: '8 a 10',
    defaultRest: '90s',
    tip: 'Mantenha escápulas aduzidas e pés firmes no chão.'
  },
  {
    name: 'Supino Inclinado com Halteres',
    muscleGroup: 'Peito',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/incline-bench-press',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Banco inclinado a 30°-45°. Foco na porção clavicular (superior).'
  },
  {
    name: 'Crucifixo / Crossover na Polia',
    muscleGroup: 'Peito',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/cables/standing-cable-fly',
    defaultSets: '3',
    defaultReps: '12 a 15',
    defaultRest: '60s',
    tip: 'Cotovelos levemente flexionados, esprema o peitoral no pico de contração.'
  },
  {
    name: 'Peck Deck / Voador Máquina',
    muscleGroup: 'Peito',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/machine/machine-fly',
    defaultSets: '3',
    defaultReps: '12 a 15',
    defaultRest: '60s',
    tip: 'Não projete os ombros para frente durante o fechamento.'
  },
  {
    name: 'Flexão de Braço (Push-ups)',
    muscleGroup: 'Peito',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/bodyweight/push-up',
    defaultSets: '3',
    defaultReps: '10 a 15',
    defaultRest: '60s',
    tip: 'Corpo alinhado em prancha sem deixar o quadril cair.'
  },

  // COSTAS
  {
    name: 'Puxada Alta no Pulley (Lat Pulldown)',
    muscleGroup: 'Costas',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/cables/lat-pulldown',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Puxe a barra em direção à parte superior do peito, ativando as dorsais.'
  },
  {
    name: 'Remada Curvada com Barra',
    muscleGroup: 'Costas',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/bent-over-row',
    defaultSets: '4',
    defaultReps: '8 a 10',
    defaultRest: '90s',
    tip: 'Coluna neutra, tronco inclinado a 45°, puxe em direção ao umbigo.'
  },
  {
    name: 'Remada Baixa no Triângulo',
    muscleGroup: 'Costas',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/cables/seated-cable-row',
    defaultSets: '3',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Não use impulso com a lombar. Mantenha o peito aberto.'
  },
  {
    name: 'Remada Unilateral com Halter (Serrote)',
    muscleGroup: 'Costas',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/single-arm-dumbbell-row',
    defaultSets: '3',
    defaultReps: '10 a 12 cada lado',
    defaultRest: '60s',
    tip: 'Puxe o halter rente ao corpo levando o cotovelo para trás.'
  },
  {
    name: 'Barra Fixa (Pull-up)',
    muscleGroup: 'Costas',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/bodyweight/pull-up',
    defaultSets: '3',
    defaultReps: '6 a 10',
    defaultRest: '90s',
    tip: 'Subida controlada passando o queixo da barra.'
  },

  // OMBROS
  {
    name: 'Desenvolvimento com Halteres',
    muscleGroup: 'Ombros',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/overhead-press',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Empurre acima da cabeça sem bater os halteres no topo.'
  },
  {
    name: 'Elevação Lateral com Halteres',
    muscleGroup: 'Ombros',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/lateral-raise',
    defaultSets: '4',
    defaultReps: '12 a 15',
    defaultRest: '45s',
    tip: 'Eleve até a linha dos ombros, cotovelos ligeiramente à frente do tronco.'
  },
  {
    name: 'Crucifixo Invertido / Face Pull',
    muscleGroup: 'Ombros',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/cables/face-pull',
    defaultSets: '3',
    defaultReps: '12 a 15',
    defaultRest: '45s',
    tip: 'Foco no deltóide posterior e trapézio médio/inferior.'
  },
  {
    name: 'Elevação Frontal na Polia / Halter',
    muscleGroup: 'Ombros',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/front-raise',
    defaultSets: '3',
    defaultReps: '12',
    defaultRest: '45s',
    tip: 'Suba com controle até a altura dos olhos sem balançar o corpo.'
  },

  // BÍCEPS
  {
    name: 'Rosca Direta com Barra W',
    muscleGroup: 'Bíceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/bicep-curl',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Mantenha os cotovelos fixos ao lado do tronco durante toda a execução.'
  },
  {
    name: 'Rosca Martelo com Halteres',
    muscleGroup: 'Bíceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/hammer-curl',
    defaultSets: '3',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Pegada neutra (palmas viradas uma para a outra), fortalece o braquial e antebraço.'
  },
  {
    name: 'Rosca Scott na Máquina / Barra',
    muscleGroup: 'Bíceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/preacher-curl',
    defaultSets: '3',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Isole o bíceps mantendo as axilas bem encaixadas no apoio.'
  },

  // TRÍCEPS
  {
    name: 'Tríceps Corda na Polia Alta',
    muscleGroup: 'Tríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/cables/triceps-rope-pushdown',
    defaultSets: '4',
    defaultReps: '12 a 15',
    defaultRest: '60s',
    tip: 'Abra a corda no final da extensão com cotovelos colados ao corpo.'
  },
  {
    name: 'Tríceps Testa com Barra / Halteres',
    muscleGroup: 'Tríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/skull-crushers',
    defaultSets: '3',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Desça a barra em direção ao topo da cabeça com controle.'
  },
  {
    name: 'Tríceps Francês Unilateral',
    muscleGroup: 'Tríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/seated-overhead-tricep-extension',
    defaultSets: '3',
    defaultReps: '12',
    defaultRest: '45s',
    tip: 'Alongue bem a cabeça longa do tríceps atrás da nuca.'
  },
  {
    name: 'Mergulho no Banco / Paralelas',
    muscleGroup: 'Tríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/bodyweight/bench-dip',
    defaultSets: '3',
    defaultReps: '10 a 15',
    defaultRest: '60s',
    tip: 'Costas próximas ao banco, desça até 90° nos cotovelos.'
  },

  // QUADRÍCEPS
  {
    name: 'Agachamento Livre com Barra',
    muscleGroup: 'Quadríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/squat',
    defaultSets: '4',
    defaultReps: '8 a 10',
    defaultRest: '90s',
    tip: 'Pés na largura dos ombros, joelhos apontando na direção das pontas dos pés.'
  },
  {
    name: 'Leg Press 45º',
    muscleGroup: 'Quadríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/machine/leg-press',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '90s',
    tip: 'Não estenda completamente os joelhos no topo (evite hiperextensão).'
  },
  {
    name: 'Cadeira Extensora',
    muscleGroup: 'Quadríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/machine/leg-extension',
    defaultSets: '3',
    defaultReps: '12 a 15',
    defaultRest: '60s',
    tip: 'Segure 1 segundo no topo da contração e desça controlando.'
  },
  {
    name: 'Agachamento Búlgaro com Halteres',
    muscleGroup: 'Quadríceps',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/dumbbells/bulgarian-split-squat',
    defaultSets: '3',
    defaultReps: '10 cada perna',
    defaultRest: '60s',
    tip: 'Excelente para estabilidade, correção de assimetrias e glúteos.'
  },

  // POSTERIOR & GLÚTEOS
  {
    name: 'Mesa Flexora',
    muscleGroup: 'Posterior & Glúteos',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/machine/lying-leg-curl',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '60s',
    tip: 'Mantenha o quadril pressionado contra o banco durante a flexão.'
  },
  {
    name: 'Stiff com Halteres ou Barra',
    muscleGroup: 'Posterior & Glúteos',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/romanian-deadlift',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '90s',
    tip: 'Quadril para trás, coluna ereta e joelhos com microflexão.'
  },
  {
    name: 'Elevação Pélvica com Barra (Hip Thrust)',
    muscleGroup: 'Posterior & Glúteos',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/barbell/hip-thrust',
    defaultSets: '4',
    defaultReps: '10 a 12',
    defaultRest: '90s',
    tip: 'Apoio na altura das escápulas, contraia os glúteos com força no topo.'
  },
  {
    name: 'Cadeira Abdutora',
    muscleGroup: 'Posterior & Glúteos',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/machine/seated-hip-abduction',
    defaultSets: '3',
    defaultReps: '15',
    defaultRest: '45s',
    tip: 'Foco no glúteo médio e estabilização do quadril.'
  },

  // PANTURRILHAS
  {
    name: 'Elevação de Panturrilha em Pé',
    muscleGroup: 'Panturrilhas',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/machine/standing-calf-raise',
    defaultSets: '4',
    defaultReps: '15 a 20',
    defaultRest: '45s',
    tip: 'Amplitude máxima: desça até o calcanhar alongar e suba na ponta dos pés.'
  },
  {
    name: 'Panturrilha Sentado (Gêmeos)',
    muscleGroup: 'Panturrilhas',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/machine/seated-calf-raise',
    defaultSets: '3',
    defaultReps: '15',
    defaultRest: '45s',
    tip: 'Foco no músculo sóleo. Faça pausa de 1 segundo embaixo e em cima.'
  },

  // ABDÔMEN & CORE
  {
    name: 'Abdominal Crunch no Solo',
    muscleGroup: 'Abdômen & Core',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/bodyweight/crunch',
    defaultSets: '3',
    defaultReps: '15 a 20',
    defaultRest: '45s',
    tip: 'Enrole o tronco sem puxar o pescoço com as mãos.'
  },
  {
    name: 'Prancha Isométrica',
    muscleGroup: 'Abdômen & Core',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/bodyweight/plank',
    defaultSets: '3',
    defaultReps: '30s a 45s',
    defaultRest: '45s',
    tip: 'Abdômen e glúteos travados, sem deixar a lombar arquear.'
  },
  {
    name: 'Elevação de Pernas na Barra / Solo (Infra)',
    muscleGroup: 'Abdômen & Core',
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercises/male/bodyweight/hanging-leg-raise',
    defaultSets: '3',
    defaultReps: '12 a 15',
    defaultRest: '45s',
    tip: 'Evite balanço. Eleve os joelhos enrolando a bacia.'
  },

  // CARDIO & AQUECIMENTO
  {
    name: 'Aquecimento na Esteira / Caminhada',
    muscleGroup: 'Cardio & Aquecimento',
    muscleWikiUrl: 'https://musclewiki.com/pt-br',
    defaultSets: '1',
    defaultReps: '10 min',
    defaultRest: '-',
    tip: 'Ritmo moderado para elevar temperatura corporal e lubrificar articulações.'
  }
];

export function buildMuscleWikiUrl(exerciseName: string, muscleGroup?: string): string {
  const match = MUSCLEWIKI_CATALOG.find(
    e => e.name.toLowerCase() === exerciseName.trim().toLowerCase()
  );
  if (match) {
    return match.muscleWikiUrl;
  }

  // Fallback to PT-BR MuscleWiki
  return `${MUSCLEWIKI_BASE_URL}`;
}
