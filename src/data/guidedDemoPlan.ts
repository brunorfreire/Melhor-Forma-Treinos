import { WorkoutPlan } from '../types';

/**
 * Sessão isolada de demonstração dos 4 Métodos de Execução Guiada.
 * - Contém exemplos reais e validados de:
 *   1. SIMPLES (descanso 30s)
 *   2. COMBINADO (grupamentos diferentes: Peito + Costas, descanso 0s entre exercícios, 60s entre rodadas)
 *   3. CONJUGADO (mesmo grupamento: Peito + Peito, descanso 0s entre exercícios, 60s entre rodadas)
 *   4. CIRCUITADO (3 exercícios em sequência, descanso 30s entre exercícios, 90s entre rodadas)
 * - Inclui também uma segunda aba "Ficha Clássica (Sem Blocos)" para demonstrar
 *   compatibilidade total com fichas antigas.
 * - IMPORTANTE: Esta ficha é estritamente isolada em memória (isDemoSession: true)
 *   e nunca sobrescreve mf_treino_v1_lite_plan nem grava no histórico oficial do aluno.
 */
export const DEMO_GUIDED_WORKOUT_PLAN: WorkoutPlan = {
  id: 'mf-demo-guided-execution-v1',
  studentName: 'Aluno Demonstração 40+',
  trainerName: 'Bruno Freire',
  goal: 'Força Funcional, Postura e Longevidade 40+',
  frequency: '3x a 4x por semana',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDemoSession: true,
  generalNotes:
    'SESSÃO DE DEMONSTRAÇÃO ISOLADA: Explore os modos "Visão Geral" e "Execução Guiada" com os 4 métodos (Simples, Combinado, Conjugado e Circuitado) e intervalos de 0s, 30s, 60s e 90s. Seus dados reais e histórico permanecem 100% intactos.',
  sessions: [
    {
      id: 'sess-demo-4-metodos',
      name: 'Demo: 4 Métodos Guiados',
      focus: 'Simples (30s) • Combinado (0s/60s) • Conjugado (0s/60s) • Circuito (30s/90s)',
      executionBlocks: [
        {
          id: 'blk-demo-simples',
          name: 'Bloco 1 • Método Simples (Ativação Base)',
          method: 'simples',
          exerciseIds: ['ex-demo-1'],
          rounds: 2,
          restBetweenExercisesSeconds: 30,
          restBetweenRoundsSeconds: 30,
        },
        {
          id: 'blk-demo-combinado',
          name: 'Bloco 2 • Bi-Set Combinado (Antagonistas: Peito + Costas)',
          method: 'combinado',
          exerciseIds: ['ex-demo-2', 'ex-demo-3'],
          rounds: 2,
          restBetweenExercisesSeconds: 0,
          restBetweenRoundsSeconds: 60,
        },
        {
          id: 'blk-demo-conjugado',
          name: 'Bloco 3 • Bi-Set Conjugado (Mesmo Grupo: Peitoral)',
          method: 'conjugado',
          exerciseIds: ['ex-demo-4', 'ex-demo-5'],
          rounds: 2,
          restBetweenExercisesSeconds: 0,
          restBetweenRoundsSeconds: 60,
        },
        {
          id: 'blk-demo-circuitado',
          name: 'Bloco 4 • Circuito Metabólico Longevidade 40+',
          method: 'circuitado',
          exerciseIds: ['ex-demo-6', 'ex-demo-7', 'ex-demo-8'],
          rounds: 2,
          restBetweenExercisesSeconds: 30,
          restBetweenRoundsSeconds: 90,
        },
      ],
      exercises: [
        // 1. SIMPLES (30s rest)
        {
          id: 'ex-demo-1',
          centralExerciseId: 'ex-agachamento-goblet',
          name: 'Agachamento Goblet com Halter',
          muscleGroup: 'Quadríceps',
          sets: '2',
          reps: '10 reps',
          rest: '30s',
          weight: '10 kg',
          youtubeId: 'MeIiIdhvXT4',
          instructions:
            'Segure o halter próximo ao peito com os cotovelos apontando para baixo. Desça controlando o movimento mantendo o tronco firme e suba empurrando o chão com os calcanhares.',
          cautions: 'Mantenha os joelhos alinhados com a ponta dos pés e evite arredondar a lombar.',
          notes: 'Método SIMPLES: execute a Série 1, descanse 30s e conclua a Série 2 antes de avançar.',
        },
        // 2 & 3. COMBINADO (Peito + Costas | 0s entre exercícios | 60s entre rodadas)
        {
          id: 'ex-demo-2',
          centralExerciseId: 'ex-supino-reto-halteres',
          name: 'Supino Reto com Halteres',
          muscleGroup: 'Peito',
          sets: '2',
          reps: '10 reps',
          rest: '0s',
          weight: '8 kg (cada)',
          youtubeId: 'VmB1G1K7v94',
          instructions:
            'Deitado no banco, mantenha as escápulas apoiadas e desça os halteres na linha média do peito com controle. Empurre até estender os braços sem travar os cotovelos.',
          cautions: 'Não deixe os cotovelos abrirem a 90° em relação ao tronco; mantenha cerca de 45° a 60°.',
          notes: 'Método COMBINADO (1/2 - Peito): ao terminar, passe direto (0s) para a Remada Serrote (Costas).',
        },
        {
          id: 'ex-demo-3',
          centralExerciseId: 'ex-remada-unilateral-serrote',
          name: 'Remada Unilateral com Halter (Serrote)',
          muscleGroup: 'Costas',
          sets: '2',
          reps: '10 reps / lado',
          rest: '60s',
          weight: '10 kg',
          youtubeId: 'pYcpY20QaE8',
          instructions:
            'Apoie uma mão e o joelho no banco mantendo a coluna neutra. Puxe o halter em direção ao quadril, contraindo a escápula no topo, e desça devagar.',
          cautions: 'Evite girar o tronco para roubar no movimento.',
          notes: 'Método COMBINADO (2/2 - Costas): após concluir ambos os lados, descanse 60s antes da próxima rodada.',
        },
        // 4 & 5. CONJUGADO (Peito + Peito | 0s entre exercícios | 60s entre rodadas)
        {
          id: 'ex-demo-4',
          centralExerciseId: 'ex-supino-inclinado-halteres',
          name: 'Supino Inclinado com Halteres',
          muscleGroup: 'Peito',
          sets: '2',
          reps: '10 reps',
          rest: '0s',
          weight: '7 kg (cada)',
          youtubeId: '8iPEnn-ltC8',
          instructions:
            'No banco inclinado a 30°–45°, desça os halteres de forma controlada até a linha superior do peitoral e empurre mantendo estabilidade escapular.',
          cautions: 'Mantenha os pés firmes no chão e a lombar neutra.',
          notes: 'Método CONJUGADO (1/2 - Peito): mesmo grupamento muscular. Sem pausa (0s), siga para o Crucifixo.',
        },
        {
          id: 'ex-demo-5',
          centralExerciseId: 'ex-crucifixo-halteres',
          name: 'Crucifixo Reto com Halteres',
          muscleGroup: 'Peito',
          sets: '2',
          reps: '12 reps',
          rest: '60s',
          weight: '5 kg (cada)',
          youtubeId: 'eozdVDA78K0',
          instructions:
            'Com os cotovelos levemente flexionados, abra os braços em arco até sentir um alongamento confortável no peitoral e retorne unindo os halteres no alto.',
          cautions: 'Não desça além da linha dos ombros para proteger a cápsula articular.',
          notes: 'Método CONJUGADO (2/2 - Peito): descanse 60s para recuperar o peitoral antes da próxima rodada.',
        },
        // 6, 7 & 8. CIRCUITADO (3 exercícios | 30s entre exercícios | 90s entre rodadas)
        {
          id: 'ex-demo-6',
          centralExerciseId: 'ex-agachamento-sumo-halter',
          name: 'Agachamento Sumô com Halter',
          muscleGroup: 'Glúteos',
          sets: '2',
          reps: '12 reps',
          rest: '30s',
          weight: '12 kg',
          mediaType: 'image',
          videoUrl: '/exercises/agachamento-sumo-halter.webp',
          thumbnailUrl: '/exercises/agachamento-sumo-halter.webp',
          youtubeId: 'sqDGkIBYPAk',
          instructions:
            'Afaste os pés além da largura dos ombros com as pontas voltadas levemente para fora. Segure o halter ao centro e agache mantendo o tronco vertical.',
          cautions: 'Empurre os joelhos para fora acompanhando a direção dos pés.',
          notes: 'CIRCUITO (Estação 1/3): transição rápida de 30s para a próxima estação.',
        },
        {
          id: 'ex-demo-7',
          centralExerciseId: 'ex-remada-curvada-halteres',
          name: 'Remada Curvada com Halteres',
          muscleGroup: 'Costas',
          sets: '2',
          reps: '12 reps',
          rest: '30s',
          weight: '8 kg (cada)',
          mediaType: 'image',
          videoUrl: '/exercises/remada-curvada-halteres.webp',
          thumbnailUrl: '/exercises/remada-curvada-halteres.webp',
          youtubeId: 'roCP6wCXPqo',
          instructions:
            'Incline o tronco à frente mantendo a coluna neutra e o abdômen ativo. Puxe os dois halteres simultaneamente em direção à linha da cintura.',
          cautions: 'Mantenha o pescoço alinhado à coluna sem olhar para frente.',
          notes: 'CIRCUITO (Estação 2/3): respire por 30s e prepare-se para a estação final da rodada.',
        },
        {
          id: 'ex-demo-8',
          centralExerciseId: 'ex-flexao-braco-inclinada',
          name: 'Flexão de Braço Inclinada no Banco',
          muscleGroup: 'Peito',
          sets: '2',
          reps: '10 reps',
          rest: '90s',
          weight: 'Peso corporal',
          mediaType: 'image',
          videoUrl: '/exercises/flexao-braco-inclinada.webp',
          thumbnailUrl: '/exercises/flexao-braco-inclinada.webp',
          youtubeId: '4dF1DOWzf20',
          instructions:
            'Apoie as mãos na borda firme de um banco, mantendo o corpo em prancha reta dos tornozelos aos ombros. Desça o peito em direção ao banco e empurre.',
          cautions: 'Não deixe o quadril cair; contraia glúteos e abdômen durante toda a série.',
          notes: 'CIRCUITO (Estação 3/3): fim da rodada! Aproveite os 90s de recuperação completa.',
        },
      ],
    },
    {
      id: 'sess-demo-compatibilidade',
      name: 'Ficha Clássica (Sem Blocos)',
      focus: 'Compatibilidade retroativa com fichas tradicionais (Séries Simples)',
      // Sem executionBlocks: prova que fichas existentes funcionam normalmente como séries simples
      exercises: [
        {
          id: 'ex-classic-1',
          centralExerciseId: 'ex-agachamento-sumo-halter',
          name: 'Agachamento Sumô com Halter',
          muscleGroup: 'Quadríceps & Glúteos',
          sets: '3',
          reps: '12 reps',
          rest: '60s',
          weight: '10 kg',
          mediaType: 'image',
          videoUrl: '/exercises/agachamento-sumo-halter.webp',
          thumbnailUrl: '/exercises/agachamento-sumo-halter.webp',
          youtubeId: 'sqDGkIBYPAk',
          instructions: 'Desça com controle até onde mantiver a coluna neutra e suba contraindo quadríceps e glúteos.',
          cautions: 'Joelho alinhado com a ponta do pé.',
          notes: 'Ficha clássica sem blocos configurados: funciona automaticamente no método Simples.',
        },
        {
          id: 'ex-classic-2',
          centralExerciseId: 'ex-remada-curvada-halteres',
          name: 'Remada Curvada com Halteres',
          muscleGroup: 'Costas',
          sets: '3',
          reps: '10 reps',
          rest: '60s',
          weight: '8 kg (cada)',
          mediaType: 'image',
          videoUrl: '/exercises/remada-curvada-halteres.webp',
          thumbnailUrl: '/exercises/remada-curvada-halteres.webp',
          youtubeId: 'roCP6wCXPqo',
          instructions: 'Puxe os halteres levando os cotovelos próximos ao corpo e controle a descida.',
          cautions: 'Mantenha a coluna alinhada.',
        },
      ],
    },
  ],
};
