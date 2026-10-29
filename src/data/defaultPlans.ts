import { WorkoutPlan } from '../types';

export const SAMPLE_WORKOUT_PLAN: WorkoutPlan = {
  id: 'mf-treino-sample',
  studentName: 'Patrícia Silveira',
  trainerName: 'Bruno Freire',
  trainerPhone: '5511999999999',
  goal: 'Força Funcional & Qualidade de Vida 40+',
  frequency: '3x a 4x por semana (Saúde e Longevidade)',
  generalNotes: '🌿 Treine para viver mais e melhor: priorize postura correta, respiração consciente e hidratação. Respeite os intervalos de descanso entre as séries.',
  createdAt: new Date().toISOString(),
  sessions: [
    {
      id: 'sess-a',
      name: 'Treino A - Peito, Ombros e Tríceps',
      focus: 'Membros Superiores (Empurrar)',
      exercises: [
        {
          id: 'ex-a1',
          name: 'Supino Reto com Barra',
          muscleGroup: 'Peito',
          sets: '4',
          reps: '8 a 10',
          rest: '90s',
          weight: '15-20 kg / lado',
          notes: 'Manter escápulas travadas no banco. Descer até tocar de leve no peito.',
          youtubeId: 'rT7DgCr-3pg'
        },
        {
          id: 'ex-a2',
          name: 'Supino Inclinado com Halteres',
          muscleGroup: 'Peito',
          sets: '3',
          reps: '10 a 12',
          rest: '60s',
          weight: 'Halter 14-16 kg',
          notes: 'Banco a 30°. Descer abrindo bem o peitoral superior.',
          youtubeId: '8iPEnn-ltC8'
        },
        {
          id: 'ex-a3',
          name: 'Crucifixo / Crossover na Polia',
          muscleGroup: 'Peito',
          sets: '3',
          reps: '12 a 15',
          rest: '45s',
          weight: 'Placa 3 ou 4',
          notes: 'Aperte o peito no meio por 1 segundo.',
          youtubeId: 'taI4XduLpOk'
        },
        {
          id: 'ex-a4',
          name: 'Desenvolvimento com Halteres',
          muscleGroup: 'Ombros',
          sets: '3',
          reps: '10 a 12',
          rest: '60s',
          weight: 'Halter 10-12 kg',
          notes: 'Cotovelos alinhados, sem bater os halteres no topo.',
          youtubeId: 'qEwKCR5JCog'
        },
        {
          id: 'ex-a5',
          name: 'Elevação Lateral com Halteres',
          muscleGroup: 'Ombros',
          sets: '4',
          reps: '12 a 15',
          rest: '45s',
          weight: 'Halter 6-8 kg',
          notes: 'Subir até a altura dos ombros com controle na descida.',
          youtubeId: '3VcKaXpzqRo'
        },
        {
          id: 'ex-a6',
          name: 'Tríceps Corda na Polia Alta',
          muscleGroup: 'Tríceps',
          sets: '4',
          reps: '12 a 15',
          rest: '45s',
          weight: 'Placa 5',
          notes: 'Abrir a corda no final estendendo todo o cotovelo.',
          youtubeId: 'vB5OHsJ3EME'
        }
      ]
    },
    {
      id: 'sess-b',
      name: 'Treino B - Costas e Bíceps',
      focus: 'Membros Superiores (Puxar)',
      exercises: [
        {
          id: 'ex-b1',
          name: 'Puxada Alta no Pulley (Lat Pulldown)',
          muscleGroup: 'Costas',
          sets: '4',
          reps: '10 a 12',
          rest: '60s',
          weight: 'Placa 7 ou 8',
          notes: 'Puxar com as costas e não com os braços. Peito estufado.',
          youtubeId: 'CAwf7n6Luuc'
        },
        {
          id: 'ex-b2',
          name: 'Remada Curvada com Barra',
          muscleGroup: 'Costas',
          sets: '4',
          reps: '8 a 10',
          rest: '90s',
          weight: '10-15 kg / lado',
          notes: 'Tronco a 45°, coluna 100% reta, puxar na altura da cintura.',
          youtubeId: '6TSP138827w'
        },
        {
          id: 'ex-b3',
          name: 'Remada Unilateral com Halter (Serrote)',
          muscleGroup: 'Costas',
          sets: '3',
          reps: '10 a 12 cada',
          rest: '60s',
          weight: 'Halter 16-20 kg',
          notes: 'Apoio firme no banco, puxar o cotovelo rente à costela.',
          youtubeId: 'roCP6wCXPqo'
        },
        {
          id: 'ex-b4',
          name: 'Rosca Direta com Barra W',
          muscleGroup: 'Bíceps',
          sets: '3',
          reps: '10 a 12',
          rest: '60s',
          weight: '7-10 kg / lado',
          notes: 'Cotovelos parados ao lado das costelas, sem balançar o corpo.',
          youtubeId: 'in7PaeYlhrM'
        },
        {
          id: 'ex-b5',
          name: 'Rosca Martelo com Halteres',
          muscleGroup: 'Bíceps',
          sets: '3',
          reps: '12',
          rest: '45s',
          weight: 'Halter 10-12 kg',
          notes: 'Pegada neutra para trabalhar braquial e antebraço.',
          youtubeId: 'zC3nLlEvin4'
        },
        {
          id: 'ex-b6',
          name: 'Prancha Isométrica',
          muscleGroup: 'Abdômen & Core',
          sets: '3',
          reps: '40 segundos',
          rest: '45s',
          notes: 'Manter glúteos e abdômen contraídos.',
          youtubeId: 'pSHjTRCQxIw'
        }
      ]
    },
    {
      id: 'sess-c',
      name: 'Treino C - Pernas Completo e Glúteos',
      focus: 'Membros Inferiores & Panturrilhas',
      exercises: [
        {
          id: 'ex-c1',
          name: 'Agachamento Livre com Barra',
          muscleGroup: 'Quadríceps',
          sets: '4',
          reps: '8 a 10',
          rest: '90s',
          weight: '15-25 kg / lado',
          notes: 'Descer até 90° ou mais se a flexibilidade permitir. Manter joelhos alinhados.',
          youtubeId: 'aclHkVaku9U'
        },
        {
          id: 'ex-c2',
          name: 'Leg Press 45º',
          muscleGroup: 'Quadríceps',
          sets: '4',
          reps: '10 a 12',
          rest: '90s',
          weight: 'Ajustar carga',
          notes: 'Pés paralelos no meio da plataforma. Não travar os joelhos no final.',
          youtubeId: 'IZxyjW7MPJQ'
        },
        {
          id: 'ex-c3',
          name: 'Cadeira Extensora',
          muscleGroup: 'Quadríceps',
          sets: '3',
          reps: '12 a 15',
          rest: '60s',
          weight: 'Placa média',
          notes: 'Pausa de 1 segundo no pico de contração.',
          youtubeId: 'YyvSfVjQeL0'
        },
        {
          id: 'ex-c4',
          name: 'Mesa Flexora',
          muscleGroup: 'Posterior & Glúteos',
          sets: '4',
          reps: '10 a 12',
          rest: '60s',
          weight: 'Placa média',
          notes: 'Movimento contínuo e controlado.',
          youtubeId: '1Tq3QdYUuHs'
        },
        {
          id: 'ex-c5',
          name: 'Stiff com Halteres ou Barra',
          muscleGroup: 'Posterior & Glúteos',
          sets: '3',
          reps: '10 a 12',
          rest: '60s',
          weight: 'Halteres 12-14 kg',
          notes: 'Jogar o quadril bem para trás até sentir o posterior alongar.',
          youtubeId: '_oyxCn2iSjU'
        },
        {
          id: 'ex-c6',
          name: 'Elevação de Panturrilha em Pé',
          muscleGroup: 'Panturrilhas',
          sets: '4',
          reps: '15 a 20',
          rest: '45s',
          weight: 'Carga corporal / Máquina',
          notes: 'Alongar ao máximo embaixo e subir bem na ponta dos pés.',
          youtubeId: 'gwLzBJYoWlI'
        }
      ]
    }
  ]
};

export const PRESET_TEMPLATES: { name: string; description: string; plan: WorkoutPlan }[] = [
  {
    name: 'Hipertrofia ABC (Padrão)',
    description: '3 Treinos divididos em Empurrar (Peito/Ombro/Tríceps), Puxar (Costas/Bíceps) e Pernas.',
    plan: SAMPLE_WORKOUT_PLAN
  },
  {
    name: 'Adaptação Iniciante (AB)',
    description: 'Treino A (Superiores) e Treino B (Inferiores + Core) para quem está começando.',
    plan: {
      id: 'mf-adaptacao-ab',
      studentName: 'Novo Aluno(a)',
      trainerName: 'Melhor Forma Treino',
      goal: 'Adaptação Anatômica & Condicionamento',
      frequency: '3x por semana (Seg / Qua / Sex)',
      generalNotes: 'Executar os movimentos com calma priorizando a postura correta antes de aumentar peso.',
      createdAt: new Date().toISOString(),
      sessions: [
        {
          id: 'iniciante-a',
          name: 'Treino A - Membros Superiores',
          focus: 'Costas, Peito, Ombros e Braços',
          exercises: [
            {
              id: 'ia-1',
              name: 'Peck Deck / Voador Máquina',
              muscleGroup: 'Peito',
              sets: '3',
              reps: '12 a 15',
              rest: '60s',
              notes: 'Focar na respiração e postura ereta.',
              youtubeId: 'eGjt4lk6g34'
            },
            {
              id: 'ia-2',
              name: 'Puxada Alta no Pulley (Lat Pulldown)',
              muscleGroup: 'Costas',
              sets: '3',
              reps: '12 a 15',
              rest: '60s',
              notes: 'Puxar na frente do queixo.',
              youtubeId: 'CAwf7n6Luuc'
            },
            {
              id: 'ia-3',
              name: 'Desenvolvimento com Halteres',
              muscleGroup: 'Ombros',
              sets: '3',
              reps: '12',
              rest: '60s',
              notes: 'Movimento suave sem trancos.',
              youtubeId: 'qEwKCR5JCog'
            },
            {
              id: 'ia-4',
              name: 'Rosca Direta com Barra W',
              muscleGroup: 'Bíceps',
              sets: '3',
              reps: '12',
              rest: '45s',
              notes: 'Controle na descida.',
              youtubeId: 'in7PaeYlhrM'
            },
            {
              id: 'ia-5',
              name: 'Tríceps Corda na Polia Alta',
              muscleGroup: 'Tríceps',
              sets: '3',
              reps: '12 a 15',
              rest: '45s',
              notes: 'Esticar todo o braço para baixo.',
              youtubeId: 'vB5OHsJ3EME'
            }
          ]
        },
        {
          id: 'iniciante-b',
          name: 'Treino B - Pernas e Abdômen',
          focus: 'Quadríceps, Posterior, Glúteos e Core',
          exercises: [
            {
              id: 'ib-1',
              name: 'Leg Press 45º',
              muscleGroup: 'Quadríceps',
              sets: '3',
              reps: '12 a 15',
              rest: '60s',
              notes: 'Apoiar bem a lombar no banco.',
              youtubeId: 'IZxyjW7MPJQ'
            },
            {
              id: 'ib-2',
              name: 'Cadeira Extensora',
              muscleGroup: 'Quadríceps',
              sets: '3',
              reps: '12 a 15',
              rest: '45s',
              notes: 'Movimento sem pressa.',
              youtubeId: 'YyvSfVjQeL0'
            },
            {
              id: 'ib-3',
              name: 'Mesa Flexora',
              muscleGroup: 'Posterior & Glúteos',
              sets: '3',
              reps: '12 a 15',
              rest: '45s',
              notes: 'Evitar levantar o quadril da mesa.',
              youtubeId: '1Tq3QdYUuHs'
            },
            {
              id: 'ib-4',
              name: 'Panturrilha Sentado (Gêmeos)',
              muscleGroup: 'Panturrilhas',
              sets: '3',
              reps: '15',
              rest: '45s',
              notes: 'Descer bem os calcanhares.',
              youtubeId: 'JbyjNymZOt0'
            },
            {
              id: 'ib-5',
              name: 'Abdominal Crunch no Solo',
              muscleGroup: 'Abdômen & Core',
              sets: '3',
              reps: '15 a 20',
              rest: '45s',
              notes: 'Olhar para o teto, soltar o ar ao subir.',
              youtubeId: 'Xyd_fa5zoEU'
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Força para a Vida 40+ | Nível 1 (Começar Bem)',
    description: 'Adaptação funcional 40+: Primeiros Passos, Corpo Ativo, Equilíbrio, Mobilidade e Cardio Leve.',
    plan: {
      id: 'mf-40plus-n1',
      studentName: 'Aluna(o) 40+',
      trainerName: 'Equipe Melhor Forma',
      goal: 'Saúde, Força Funcional & Autonomia 40+',
      frequency: '3x por semana (Nível 1)',
      generalNotes: '🌿 Treine para viver mais e melhor. Respeite os limites articulares e priorize a qualidade técnica da execução.',
      createdAt: new Date().toISOString(),
      sessions: [
        {
          id: 'sess-40-n1-a',
          name: 'Treino A - Primeiros Passos na Força',
          focus: 'Força Funcional Básica (20 min)',
          exercises: [
            {
              id: '40n1-1',
              name: 'Sentar e Levantar da Cadeira (Box Squat)',
              muscleGroup: 'Quadríceps',
              sets: '3',
              reps: '10 a 12',
              rest: '60s',
              weight: 'Peso corporal',
              notes: 'Descer com controle sentindo os pés firmes.',
              youtubeId: 'IZxyjW7MPJQ'
            },
            {
              id: '40n1-2',
              name: 'Remada Sentada com Elástico / Polia Baixa',
              muscleGroup: 'Costas',
              sets: '3',
              reps: '12',
              rest: '60s',
              weight: 'Leve a moderado',
              notes: 'Aproximar os cotovelos das costelas e abrir o peito.',
              youtubeId: 'GZbfZ033fBQ'
            },
            {
              id: '40n1-3',
              name: 'Elevação Pélvica no Solo (Ponte de Glúteos)',
              muscleGroup: 'Posterior & Glúteos',
              sets: '3',
              reps: '12 a 15',
              rest: '45s',
              weight: 'Peso corporal',
              notes: 'Aperte os glúteos no topo por 1 segundo.',
              youtubeId: '8bbE64NuDTU'
            },
            {
              id: '40n1-4',
              name: 'Flexão de Braço na Parede ou Barra Alta',
              muscleGroup: 'Peito',
              sets: '3',
              reps: '8 a 10',
              rest: '60s',
              weight: 'Peso corporal',
              notes: 'Corpo reto em prancha alinhada.',
              youtubeId: 'rT7DgCr-3pg'
            },
            {
              id: '40n1-5',
              name: 'Prancha com Joelhos no Solo',
              muscleGroup: 'Abdômen & Core',
              sets: '3',
              reps: '20 a 30s',
              rest: '45s',
              notes: 'Respirar ritmado mantendo abdômen ativo.',
              youtubeId: 'pSHjTRCQxIw'
            }
          ]
        },
        {
          id: 'sess-40-n1-b',
          name: 'Treino B - Equilíbrio & Mobilidade Ativa',
          focus: 'Estabilidade e Articulações (20 min)',
          exercises: [
            {
              id: '40n1-b1',
              name: 'Apoio Unipodal com Suporte Próximo',
              muscleGroup: 'Panturrilhas',
              sets: '3',
              reps: '20 a 30s cada',
              rest: '45s',
              notes: 'Fixar olhar à frente mantendo joelho destravado.',
              youtubeId: 'gwLzBJYoWlI'
            },
            {
              id: '40n1-b2',
              name: 'Subida em Degrau Baixo (Step Up Suave)',
              muscleGroup: 'Quadríceps',
              sets: '3',
              reps: '8 a 10 cada',
              rest: '60s',
              notes: 'Pisar com o pé inteiro e subir com firmeza.',
              youtubeId: 'IZxyjW7MPJQ'
            },
            {
              id: '40n1-b3',
              name: 'Mobilidade Gato e Vaca no Solo',
              muscleGroup: 'Costas',
              sets: '3',
              reps: '10 respirações',
              rest: '30s',
              notes: 'Soltar a coluna e abrir o peito.',
              youtubeId: 'GZbfZ033fBQ'
            },
            {
              id: '40n1-b4',
              name: 'Perdigueiro no Solo (Bird-Dog)',
              muscleGroup: 'Abdômen & Core',
              sets: '3',
              reps: '8 cada lado',
              rest: '45s',
              notes: 'Braço e perna opostos estendidos em linha reta.',
              youtubeId: 'pSHjTRCQxIw'
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Força para a Vida 40+ | Nível 2 (Evoluir com Segurança)',
    description: 'Força estruturada 40+: Goblet Squat, Puxada Alta, RDL, Ombros e Core.',
    plan: {
      id: 'mf-40plus-n2',
      studentName: 'Aluna(o) 40+',
      trainerName: 'Equipe Melhor Forma',
      goal: 'Força Resistida, Tônus & Vitalidade 40+',
      frequency: '3x a 4x por semana (Nível 2)',
      generalNotes: '🌿 Progressão sustentável com cargas adequadas e técnica limpa para proteger as articulações.',
      createdAt: new Date().toISOString(),
      sessions: [
        {
          id: 'sess-40-n2-a',
          name: 'Treino A - Força e Membros Superiores',
          focus: 'Costas, Peito e Braços (30 min)',
          exercises: [
            {
              id: '40n2-a1',
              name: 'Puxada Alta no Pulley (Lat Pulldown)',
              muscleGroup: 'Costas',
              sets: '4',
              reps: '10 a 12',
              rest: '60s',
              weight: 'Carga moderada',
              notes: 'Puxar com as costas mantendo peito aberto.',
              youtubeId: 'CAwf7n6Luuc'
            },
            {
              id: '40n2-a2',
              name: 'Supino Inclinado com Halteres',
              muscleGroup: 'Peito',
              sets: '3',
              reps: '10 a 12',
              rest: '60s',
              weight: 'Halter 6 a 10 kg',
              notes: 'Banco a 30 graus, descida controlada.',
              youtubeId: '8iPEnn-ltC8'
            },
            {
              id: '40n2-a3',
              name: 'Remada Unilateral com Apoio (Serrote)',
              muscleGroup: 'Costas',
              sets: '3',
              reps: '10 a 12 cada',
              rest: '60s',
              weight: 'Halter 8 a 12 kg',
              notes: 'Cotovelo rente às costelas.',
              youtubeId: 'roCP6wCXPqo'
            },
            {
              id: '40n2-a4',
              name: 'Elevação Lateral com Halteres Controlada',
              muscleGroup: 'Ombros',
              sets: '3',
              reps: '12 a 15',
              rest: '45s',
              weight: 'Halter 3 a 5 kg',
              notes: 'Controle na descida.',
              youtubeId: '3VcKaXpzqRo'
            },
            {
              id: '40n2-a5',
              name: 'Prancha Isométrica Tradicional',
              muscleGroup: 'Abdômen & Core',
              sets: '3',
              reps: '35 a 45s',
              rest: '45s',
              notes: 'Alinhamento completo.',
              youtubeId: 'pSHjTRCQxIw'
            }
          ]
        },
        {
          id: 'sess-40-n2-b',
          name: 'Treino B - Força e Membros Inferiores',
          focus: 'Pernas, Glúteos e Estabilidade (35 min)',
          exercises: [
            {
              id: '40n2-b1',
              name: 'Agachamento Goblet com Halter / Kettlebell',
              muscleGroup: 'Quadríceps',
              sets: '4',
              reps: '10 a 12',
              rest: '75s',
              weight: 'Halter 6 a 12 kg',
              notes: 'Segurar junto ao peito e descer com quadril para trás.',
              youtubeId: 'IZxyjW7MPJQ'
            },
            {
              id: '40n2-b2',
              name: 'Levantamento Terra Romeno (RDL) com Halteres',
              muscleGroup: 'Posterior & Glúteos',
              sets: '3',
              reps: '10 a 12',
              rest: '75s',
              weight: 'Halter 8 a 12 kg / lado',
              notes: 'Empurrar o quadril para trás sentindo alongar os posteriores.',
              youtubeId: '_oyxCn2iSjU'
            },
            {
              id: '40n2-b3',
              name: 'Cadeira Extensora ou Afundo Adaptado',
              muscleGroup: 'Quadríceps',
              sets: '3',
              reps: '12',
              rest: '60s',
              weight: 'Moderada',
              notes: 'Movimento sem pressa com joelhos alinhados.',
              youtubeId: 'YyvSfVjQeL0'
            },
            {
              id: '40n2-b4',
              name: 'Elevação Pélvica com Carga',
              muscleGroup: 'Posterior & Glúteos',
              sets: '3',
              reps: '12 a 15',
              rest: '60s',
              weight: 'Halter 10 a 15 kg',
              notes: 'Segurar 2 segundos no topo espremendo os glúteos.',
              youtubeId: '8bbE64NuDTU'
            },
            {
              id: '40n2-b5',
              name: 'Panturrilha em Pé na Máquina ou Degrau',
              muscleGroup: 'Panturrilhas',
              sets: '4',
              reps: '15',
              rest: '45s',
              notes: 'Alongar bem embaixo e subir firme.',
              youtubeId: 'gwLzBJYoWlI'
            }
          ]
        }
      ]
    }
  }
];

