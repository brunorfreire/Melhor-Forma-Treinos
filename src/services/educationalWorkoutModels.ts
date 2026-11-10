/**
 * MODELOS EDUCATIVOS DE DISTRIBUIÇÃO SEMANAL 40+
 * Melhor Forma Play 40+
 *
 * Referências de organização pedagógica para diferentes frequências semanais (1 a 7 dias).
 * NÃO são prescrições automáticas nem impõem exercícios, séries ou cargas individuais.
 * Servem como orientação para ajudar o aluno a organizar seus dias de forma equilibrada.
 */

import { StudentWeeklySchedule, DayScheduleItem } from '../types';
import { getMondayISO, getWeekCalendarDays, updateScheduledDay, getWeeklySchedule } from './weeklyScheduleService';

export interface EducationalDayFocus {
  orderIndex: number; // 0..N-1 correspondente à ordem dos dias escolhidos pelo aluno
  focusId: string;
  focusLabel: string;
  shortLabel: string;
  category: string;
  description: string;
  isLightActivity?: boolean;
}

export interface EducationalWorkoutModel {
  id: string;
  frequency: number; // 1..7
  title: string;
  subtitle: string;
  description: string;
  consecutiveNotice?: string;
  principles: string[];
  distribution: EducationalDayFocus[];
}

export const EDUCATIONAL_MODELS: Record<number, EducationalWorkoutModel[]> = {
  // =========================================================================
  // 1 DIA POR SEMANA
  // =========================================================================
  1: [
    {
      id: 'mod-1d-fullbody',
      frequency: 1,
      title: 'Full Body Integrado (1x por semana)',
      subtitle: 'Estímulo global completo para quem tem pouco tempo',
      description: 'Ideal para manter a conexão neural e a saúde de grandes grupos musculares em uma única sessão bem planejada.',
      principles: [
        'Trabalha pernas, costas, peito e tronco em uma mesma sessão.',
        'Nos outros dias, mantenha-se ativo com caminhadas leves ou mobilidade suave.',
        'Não há risco de sobrecarga por dias seguidos.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'full_body',
          focusLabel: 'Full Body Integrado',
          shortLabel: 'Corpo Todo',
          category: 'full_body',
          description: 'Grandes cadeias musculares (pernas, costas, peito e core) em uma única sessão eficiente.'
        }
      ]
    }
  ],

  // =========================================================================
  // 2 DIAS POR SEMANA
  // =========================================================================
  2: [
    {
      id: 'mod-2d-ab',
      frequency: 2,
      title: 'Superior & Inferior Alternados (A/B)',
      subtitle: 'Divisão clássica e muito segura para articulações',
      description: 'Separa o corpo em parte superior e membros inferiores. Garante foco detalhado para cada região sem cansar o corpo todo no mesmo dia.',
      consecutiveNotice: 'Se os dois dias forem seguidos, esta divisão é perfeita, pois enquanto as pernas descansam, os braços e o tronco trabalham.',
      principles: [
        'Dia 1 focado em tronco, postura e braços.',
        'Dia 2 focado em pernas, glúteos e estabilidade de joelhos.',
        'Excelente recuperação articular entre as sessões.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'superiores',
          focusLabel: 'Membros Superiores',
          shortLabel: 'Superiores',
          category: 'superiores',
          description: 'Costas, peitoral, ombros e braços com foco em postura e alinhamento.'
        },
        {
          orderIndex: 1,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores',
          shortLabel: 'Inferiores',
          category: 'inferiores',
          description: 'Pernas, quadríceps, glúteos e proteção articular dos joelhos e quadris.'
        }
      ]
    },
    {
      id: 'mod-2d-fullbody-2x',
      frequency: 2,
      title: 'Corpo Todo Funcional (2x por semana)',
      subtitle: 'Dois estímulos globais com foco em autonomia e força 40+',
      description: 'Distribui movimentos essenciais do dia a dia (sentar, empurrar, puxar) em duas sessões ao longo da semana.',
      consecutiveNotice: 'Para este modelo, é recomendável pelo menos 1 dia de intervalo entre as sessões.',
      principles: [
        'Estimula o corpo inteiro duas vezes por semana.',
        'Ótimo para ganho de firmeza e densidade mineral óssea.',
        'Ideal para dias espaçados (ex: Segunda e Quinta ou Terça e Sexta).'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'forca_40_plus',
          focusLabel: 'Força para a Vida 40+',
          shortLabel: 'Força 40+',
          category: 'forca_40_plus',
          description: 'Movimentos fundamentais de força e equilíbrio funcional.'
        },
        {
          orderIndex: 1,
          focusId: 'full_body',
          focusLabel: 'Full Body Integrado',
          shortLabel: 'Full Body',
          category: 'full_body',
          description: 'Estímulo global dinâmico com sustentação postural.'
        }
      ]
    }
  ],

  // =========================================================================
  // 3 DIAS POR SEMANA (A FREQUÊNCIA DE OURO 40+)
  // =========================================================================
  3: [
    {
      id: 'mod-3d-superior-inferior-full',
      frequency: 3,
      title: 'Superior, Inferior & Full Body (Recomendado 40+)',
      subtitle: 'O equilíbrio ideal entre força, recuperação e vitalidade',
      description: 'Nos dois primeiros dias, trabalha o corpo em partes separadas (superior e inferior). No terceiro dia, integra tudo em uma sessão global.',
      consecutiveNotice: 'Se houver dias consecutivos, a alternância de grupamentos protege as articulações.',
      principles: [
        'Membros superiores no primeiro dia de treino.',
        'Membros inferiores no segundo dia, deixando os braços recuperarem.',
        'Fechamento com corpo todo integrado no terceiro dia.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'superiores',
          focusLabel: 'Membros Superiores',
          shortLabel: 'Superiores',
          category: 'superiores',
          description: 'Costas, peitoral, ombros e braços.'
        },
        {
          orderIndex: 1,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores',
          shortLabel: 'Inferiores',
          category: 'inferiores',
          description: 'Pernas, quadríceps, posteriores e glúteos com proteção articular.'
        },
        {
          orderIndex: 2,
          focusId: 'full_body',
          focusLabel: 'Full Body Integrado',
          shortLabel: 'Full Body',
          category: 'full_body',
          description: 'Corpo inteiro integrado conectando as capacidades da semana.'
        }
      ]
    },
    {
      id: 'mod-3d-ppl',
      frequency: 3,
      title: 'Empurrar, Puxar & Pernas (PPL)',
      subtitle: 'Organização biomecânica refinada por padrão de movimento',
      description: 'Separa os exercícios de acordo com a função motora: um dia para empurrar (peito/ombros/tríceps), um para puxar (costas/bíceps) e um para as pernas.',
      consecutiveNotice: 'Excelente para dias consecutivos, pois cada padrão utiliza musculaturas e articulações diferentes.',
      principles: [
        'Dia 1: Musculaturas de empurrar (peitoral, deltóides e tríceps).',
        'Dia 2: Musculaturas de puxar (costas, dorsais, trapézio e bíceps).',
        'Dia 3: Pernas e glúteos completos.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'peitoral-ombro-triceps',
          focusLabel: 'Peitoral, Ombro e Tríceps',
          shortLabel: 'Empurrar',
          category: 'peitoral-ombro-triceps',
          description: 'Movimentos de empurrar: peito, ombros e tríceps com alinhamento escapular.'
        },
        {
          orderIndex: 1,
          focusId: 'costas-biceps',
          focusLabel: 'Costas, Bíceps e Trapézio',
          shortLabel: 'Puxar',
          category: 'costas-biceps',
          description: 'Movimentos de puxar: costas, remadas e sustentação dorsal.'
        },
        {
          orderIndex: 2,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores',
          shortLabel: 'Pernas',
          category: 'inferiores',
          description: 'Agachamentos, glúteos e estabilidade de joelhos e quadris.'
        }
      ]
    }
  ],

  // =========================================================================
  // 4 DIAS POR SEMANA
  // =========================================================================
  4: [
    {
      id: 'mod-4d-ab2x',
      frequency: 4,
      title: 'Superior & Inferior 2x (AB 2x)',
      subtitle: 'Excelente frequência para evolução muscular sustentável',
      description: 'Dois treinos de membros superiores e dois de membros inferiores por semana, permitindo volume adequado com descanso entre os grupos.',
      consecutiveNotice: 'Alterne sempre Superior → Inferior → Superior → Inferior para permitir descanso articular de 48h.',
      principles: [
        'Dois estímulos semanais para cada região corporal.',
        'Descanso metabólico para os braços enquanto treina pernas.',
        'Adaptação segura para rotinas de 4 dias.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'superiores',
          focusLabel: 'Membros Superiores A',
          shortLabel: 'Superiores',
          category: 'superiores',
          description: 'Costas, peito e braços.'
        },
        {
          orderIndex: 1,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores A',
          shortLabel: 'Inferiores',
          category: 'inferiores',
          description: 'Pernas, quadríceps e glúteos.'
        },
        {
          orderIndex: 2,
          focusId: 'superiores',
          focusLabel: 'Membros Superiores B',
          shortLabel: 'Superiores',
          category: 'superiores',
          description: 'Foco em ombros, postura e braços.'
        },
        {
          orderIndex: 3,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores B',
          shortLabel: 'Inferiores',
          category: 'inferiores',
          description: 'Cadeia posterior, panturrilhas e estabilidade articular.'
        }
      ]
    },
    {
      id: 'mod-4d-forca-cardio',
      frequency: 4,
      title: 'Força & Condicionamento Integrado',
      subtitle: 'Combinação perfeita entre tônus muscular e saúde cardiovascular',
      description: 'Dedica dois dias para a musculação/força, um dia para condicionamento aeróbico sem impacto e um dia de mobilidade ativa.',
      principles: [
        'Força 40+ para massa magra e densidade óssea.',
        'Cardio ativo sem impacto para fôlego e saúde cardíaca.',
        'Mobilidade para alívio de dores nas articulações.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'superiores',
          focusLabel: 'Membros Superiores',
          shortLabel: 'Superiores',
          category: 'superiores',
          description: 'Tronco e braços fortes.'
        },
        {
          orderIndex: 1,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores',
          shortLabel: 'Inferiores',
          category: 'inferiores',
          description: 'Pernas firmes e joelhos protegidos.'
        },
        {
          orderIndex: 2,
          focusId: 'cardiorespiratorio',
          focusLabel: 'Condicionamento & Fôlego',
          shortLabel: 'Cardio',
          category: 'cardiorespiratorio',
          description: 'Caminhada ativa e ritmo aeróbico suave.'
        },
        {
          orderIndex: 3,
          focusId: 'mobilidade_equilibrio',
          focusLabel: 'Mobilidade & Equilíbrio',
          shortLabel: 'Mobilidade',
          category: 'mobilidade_equilibrio',
          description: 'Saúde da coluna, soltura articular e estabilidade.',
          isLightActivity: true
        }
      ]
    }
  ],

  // =========================================================================
  // 5 DIAS POR SEMANA
  // =========================================================================
  5: [
    {
      id: 'mod-5d-completo',
      frequency: 5,
      title: 'Semana Completa 40+ (Força, Fôlego e Mobilidade)',
      subtitle: 'Variedade diária com distribuição equilibrada de cargas',
      description: 'Organiza 5 dias úteis sem sobrecarregar nenhum grupo muscular específico, alternando empurrar, puxar, pernas, cardio e mobilidade.',
      consecutiveNotice: 'Em rotinas de 5 dias seguidos (como Segunda a Sexta), a alternância de estímulos é essencial para não acumular fadiga articular.',
      principles: [
        'Divisão anatômica inteligente dia a dia.',
        'Inclui dia dedicado ao coração e dia de soltura articular.',
        'Fins de semana livres para descanso ou lazer com a família.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'peitoral-ombro-triceps',
          focusLabel: 'Peitoral, Ombro e Tríceps',
          shortLabel: 'Empurrar',
          category: 'peitoral-ombro-triceps',
          description: 'Membros superiores anteriores: peito, ombros e tríceps.'
        },
        {
          orderIndex: 1,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores',
          shortLabel: 'Pernas',
          category: 'inferiores',
          description: 'Pernas completas e estabilidade de joelhos.'
        },
        {
          orderIndex: 2,
          focusId: 'costas-biceps',
          focusLabel: 'Costas, Bíceps e Trapézio',
          shortLabel: 'Puxar',
          category: 'costas-biceps',
          description: 'Dorsais, remadas e sustentação da coluna.'
        },
        {
          orderIndex: 3,
          focusId: 'cardiorespiratorio',
          focusLabel: 'Condicionamento & Fôlego',
          shortLabel: 'Cardio',
          category: 'cardiorespiratorio',
          description: 'Cardio aeróbico de baixo impacto para disposição.'
        },
        {
          orderIndex: 4,
          focusId: 'mobilidade_equilibrio',
          focusLabel: 'Mobilidade & Equilíbrio',
          shortLabel: 'Mobilidade',
          category: 'mobilidade_equilibrio',
          description: 'Soltura da coluna, quadril e recuperação ativa.',
          isLightActivity: true
        }
      ]
    }
  ],

  // =========================================================================
  // 6 DIAS POR SEMANA
  // =========================================================================
  6: [
    {
      id: 'mod-6d-ativo',
      frequency: 6,
      title: 'Rotina Ativa Sustentável (3 Força + 3 Movimento Leve)',
      subtitle: 'Constância diária respeitando a fisiologia 40+',
      description: 'Intercala 3 sessões de força com 3 sessões de movimento leve, cardio sem impacto e mobilidade. Mantém o hábito diário sem esgotamento.',
      consecutiveNotice: 'Atenção aos dias consecutivos: os dias de mobilidade e cardio funcionam como recuperação ativa, permitindo a regeneração das fibras musculares.',
      principles: [
        '3 dias de força para musculatura e ossos.',
        '3 dias de movimento leve para articulações e fôlego.',
        '1 dia garantido de descanso completo.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'superiores',
          focusLabel: 'Membros Superiores',
          shortLabel: 'Superiores',
          category: 'superiores',
          description: 'Costas, peito e braços.'
        },
        {
          orderIndex: 1,
          focusId: 'mobilidade_equilibrio',
          focusLabel: 'Mobilidade Articular',
          shortLabel: 'Mobilidade',
          category: 'mobilidade_equilibrio',
          description: 'Movimento leve e flexibilidade.',
          isLightActivity: true
        },
        {
          orderIndex: 2,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores',
          shortLabel: 'Inferiores',
          category: 'inferiores',
          description: 'Pernas e glúteos com proteção articular.'
        },
        {
          orderIndex: 3,
          focusId: 'cardiorespiratorio',
          focusLabel: 'Condicionamento Suave',
          shortLabel: 'Cardio',
          category: 'cardiorespiratorio',
          description: 'Caminhada ativa e ritmo aeróbico.'
        },
        {
          orderIndex: 4,
          focusId: 'full_body',
          focusLabel: 'Full Body Integrado',
          shortLabel: 'Full Body',
          category: 'full_body',
          description: 'Sessão global moderada.'
        },
        {
          orderIndex: 5,
          focusId: 'mobilidade_equilibrio',
          focusLabel: 'Mobilidade & Respiração',
          shortLabel: 'Soltura',
          category: 'mobilidade_equilibrio',
          description: 'Descompressão da coluna e relaxamento.',
          isLightActivity: true
        }
      ]
    }
  ],

  // =========================================================================
  // 7 DIAS POR SEMANA
  // =========================================================================
  7: [
    {
      id: 'mod-7d-longevidade',
      frequency: 7,
      title: 'Longevidade & Movimento Diário (Equilíbrio 40+)',
      subtitle: 'Para quem ama se movimentar todos os dias com segurança',
      description: 'Treinar 7 dias por semana NÃO significa fazer 7 treinos pesados. A chave da longevidade 40+ é alternar estímulos: 3 a 4 treinos de força moderada intercalados com sessões leves de mobilidade e caminhada ativa.',
      consecutiveNotice: 'Regra de ouro 40+: os dias de mobilidade e caminhada atuam como recuperação ativa, permitindo que seu corpo regenere sem sobrecarregar tendões e ligamentos.',
      principles: [
        'Intercalação rígida: nunca dois treinos intensos consecutivos.',
        'Sessões de mobilidade suave cuidam da coluna, quadris e ombros.',
        'Hábito diário com respeito total aos sinais de cansaço do corpo.'
      ],
      distribution: [
        {
          orderIndex: 0,
          focusId: 'superiores',
          focusLabel: 'Membros Superiores',
          shortLabel: 'Superiores',
          category: 'superiores',
          description: 'Costas, peito e postura.'
        },
        {
          orderIndex: 1,
          focusId: 'mobilidade_equilibrio',
          focusLabel: 'Mobilidade & Articulações',
          shortLabel: 'Mobilidade',
          category: 'mobilidade_equilibrio',
          description: 'Atividade leve respeitando seu ritmo.',
          isLightActivity: true
        },
        {
          orderIndex: 2,
          focusId: 'inferiores',
          focusLabel: 'Membros Inferiores',
          shortLabel: 'Inferiores',
          category: 'inferiores',
          description: 'Pernas e glúteos firmes.'
        },
        {
          orderIndex: 3,
          focusId: 'cardiorespiratorio',
          focusLabel: 'Condicionamento Suave',
          shortLabel: 'Caminhada',
          category: 'cardiorespiratorio',
          description: 'Caminhada ativa sem impacto articular.',
          isLightActivity: true
        },
        {
          orderIndex: 4,
          focusId: 'forca_40_plus',
          focusLabel: 'Força para a Vida 40+',
          shortLabel: 'Força 40+',
          category: 'forca_40_plus',
          description: 'Movimentos funcionais para autonomia.'
        },
        {
          orderIndex: 5,
          focusId: 'mobilidade_equilibrio',
          focusLabel: 'Alongamento & Equilíbrio',
          shortLabel: 'Equilíbrio',
          category: 'mobilidade_equilibrio',
          description: 'Prevenção de quedas e alívio lombar.',
          isLightActivity: true
        },
        {
          orderIndex: 6,
          focusId: 'full_body',
          focusLabel: 'Full Body Integrado',
          shortLabel: 'Full Body',
          category: 'full_body',
          description: 'Integração suave do corpo todo para encerrar a semana.'
        }
      ]
    }
  ]
};

/**
 * Retorna os modelos educativos apropriados para a frequência escolhida (1 a 7 dias)
 */
export function getEducationalModelsForFrequency(frequency: number): EducationalWorkoutModel[] {
  const clamped = Math.max(1, Math.min(7, Math.round(frequency)));
  return EDUCATIONAL_MODELS[clamped] || EDUCATIONAL_MODELS[3];
}

/**
 * Aplica um modelo educativo aos dias que o aluno escolheu treinar.
 * Preserva estritamente a escolha dos dias e atribui apenas o foco/objetivo pedagógico,
 * sem definir exercícios ou cargas individuais automaticamente.
 */
export function applyEducationalModelToSchedule(params: {
  weekStartISO: string;
  chosenDatesISO: string[]; // datas selecionadas pelo aluno, ordenadas cronologicamente
  model: EducationalWorkoutModel;
  isDemo?: boolean;
}): StudentWeeklySchedule | null {
  const { weekStartISO, chosenDatesISO, model, isDemo = false } = params;
  const normalizedWeek = getMondayISO(weekStartISO);
  const current = getWeeklySchedule(normalizedWeek, { isDemo });
  if (!current) return null;

  // Aplica o foco de cada item do modelo sequencialmente nos dias escolhidos
  let updatedSchedule: StudentWeeklySchedule = { ...current };

  chosenDatesISO.forEach((dateISO, idx) => {
    const focusItem = model.distribution[idx % model.distribution.length];
    const dayType = focusItem.isLightActivity ? 'active_recovery' : 'workout';

    const res = updateScheduledDay(
      normalizedWeek,
      dateISO,
      {
        dayType,
        plannedFocus: focusItem.focusId,
        workoutId: undefined // Aluno escolherá o treino específico posteriormente
      },
      { isDemo, confirmTrainerOverride: true }
    );

    if (res.success && res.schedule) {
      updatedSchedule = res.schedule;
    }
  });

  return updatedSchedule;
}
