import { WorkoutExerciseItem } from '../types';

/**
 * 3. WORKOUT_EXERCISES: Relacionamentos entre Sessões e Exercícios
 * Cada registro associa um treino (workoutId) a um exercício central (exerciseId),
 * definindo ordem de execução, séries, repetições, descanso, carga orientativa e notas.
 *
 * Não há duplicação de vídeos: todos os treinos referenciam a biblioteca central.
 */
export const INITIAL_WORKOUT_EXERCISES: WorkoutExerciseItem[] = [
  // =========================================================================
  // COLEÇÃO 1: FORÇA PARA A VIDA 40+ (w-40p-01 a w-40p-12)
  // =========================================================================
  // w-40p-01: Primeiros Passos na Força 40+
  {
    workoutId: 'w-40p-01',
    exerciseId: 'ex-sentar-levantar-banco',
    order: 1,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Peso corporal',
    notes: 'Toque suave no banco, sem despencar. Suba com firmeza empurrando os calcanhares.',
    alternativeExerciseId: 'ex-agachamento-livre',
    alternativeNotes: 'Se tiver boa estabilidade, faça sem o banco.'
  },
  {
    workoutId: 'w-40p-01',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 2,
    sets: '3',
    reps: '10 a 12 cada lado',
    rest: '60s',
    load: 'Halter de 3kg a 5kg',
    notes: 'Cotovelo rente ao corpo, puxe em direção ao quadril com controle.'
  },
  {
    workoutId: 'w-40p-01',
    exerciseId: 'ex-flexao-braco-inclinada',
    order: 3,
    sets: '3',
    reps: '8 a 10',
    rest: '60s',
    load: 'Peso corporal',
    notes: 'Mãos na borda do banco ou parede. Corpo alinhado em prancha.'
  },
  {
    workoutId: 'w-40p-01',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 4,
    sets: '3',
    reps: '12 a 15',
    rest: '45s',
    load: 'Peso corporal',
    notes: 'Segure 2 segundos no topo contraindo bem os glúteos.'
  },
  {
    workoutId: 'w-40p-01',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 5,
    sets: '3',
    reps: '8 a 10 cada lado',
    rest: '45s',
    load: 'Peso corporal',
    notes: 'Mantenha a pelve imóvel. Foco no equilíbrio e na coluna alinhada.'
  },

  // w-40p-02: Força & Postura Diária
  {
    workoutId: 'w-40p-02',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halter de 4kg a 6kg',
    notes: 'Segure o peso verticalmente rente ao peito.'
  },
  {
    workoutId: 'w-40p-02',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halteres de 3kg a 5kg',
    notes: 'Coluna neutra a 45°, aduza as escápulas na subida.'
  },
  {
    workoutId: 'w-40p-02',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres de 2kg a 4kg',
    notes: 'Costas bem apoiadas no encosto, empurre no plano escapular.'
  },
  {
    workoutId: 'w-40p-02',
    exerciseId: 'ex-prancha-elevada-banco',
    order: 4,
    sets: '3',
    reps: '25 a 35 seg',
    rest: '45s',
    load: 'Isometria',
    notes: 'Mantenha abdômen ativado e respiração fluida.'
  },

  // w-40p-03: Estabilidade & Força Básica
  {
    workoutId: 'w-40p-03',
    exerciseId: 'ex-afundo-estatico',
    order: 1,
    sets: '3',
    reps: '8 a 10 cada perna',
    rest: '60s',
    load: 'Peso corporal',
    notes: 'Desça na vertical mantendo o tronco ereto e o joelho dianteiro estável.'
  },
  {
    workoutId: 'w-40p-03',
    exerciseId: 'ex-supino-reto-halteres',
    order: 2,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halteres de 4kg a 6kg',
    notes: 'Desça com os cotovelos a 60° do tronco para preservar os ombros.'
  },
  {
    workoutId: 'w-40p-03',
    exerciseId: 'ex-stiff-halteres',
    order: 3,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halteres de 4kg a 6kg',
    notes: 'Recue os quadris sentindo alongar a parte de trás das coxas.'
  },
  {
    workoutId: 'w-40p-03',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 4,
    sets: '3',
    reps: '15',
    rest: '45s',
    load: 'Peso corporal',
    notes: 'Pausa de 1 segundo no topo da contração.'
  },

  // w-40p-04: Despertar Muscular 40+
  {
    workoutId: 'w-40p-04',
    exerciseId: 'ex-sentar-levantar-banco',
    order: 1,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Peso corporal',
    notes: 'Cadência controlada e respiração rítmica.'
  },
  {
    workoutId: 'w-40p-04',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '45s',
    load: 'Halter leve',
    notes: 'Puxe firme com as costas.'
  },
  {
    workoutId: 'w-40p-04',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 3,
    sets: '3',
    reps: '12 cada sentido',
    rest: '30s',
    load: 'Peso corporal',
    notes: 'Liberação de tensão escapular e cervical.'
  },
  {
    workoutId: 'w-40p-04',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 4,
    sets: '3',
    reps: '10 ciclos',
    rest: '30s',
    load: 'Peso corporal',
    notes: 'Ajuste fluido da coluna torácica e lombar.'
  },

  // w-40p-05: Força Funcional & Tônus (Intermediário)
  {
    workoutId: 'w-40p-05',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halter de 6kg a 10kg',
    notes: 'Desça até a linha de 90° e suba acelerando com controle.'
  },
  {
    workoutId: 'w-40p-05',
    exerciseId: 'ex-supino-inclinado-halteres',
    order: 2,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halteres de 4kg a 7kg',
    notes: 'Banco a 30°. Foque na parte superior do peito.'
  },
  {
    workoutId: 'w-40p-05',
    exerciseId: 'ex-stiff-halteres',
    order: 3,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halteres de 6kg a 8kg',
    notes: 'Mantenha os halteres colados nas canelas.'
  },
  {
    workoutId: 'w-40p-05',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 4,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halteres de 5kg a 7kg',
    notes: 'Pausa de 1s na contração máxima.'
  },
  {
    workoutId: 'w-40p-05',
    exerciseId: 'ex-prancha-isometrica',
    order: 5,
    sets: '3',
    reps: '30 a 45 seg',
    rest: '45s',
    load: 'Isometria',
    notes: 'Glúteos e abdômen firmemente acionados.'
  },

  // w-40p-06: Autonomia & Cargas Moderadas
  {
    workoutId: 'w-40p-06',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 1,
    sets: '4',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halter de 8kg a 12kg',
    notes: 'Ativação intensa de glúteos e parte interna das coxas.'
  },
  {
    workoutId: 'w-40p-06',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres de 4kg a 6kg',
    notes: 'Postura ereta e subida controlada.'
  },
  {
    workoutId: 'w-40p-06',
    exerciseId: 'ex-elevacao-pelvica-unilateral',
    order: 3,
    sets: '3',
    reps: '10 cada perna',
    rest: '45s',
    load: 'Peso corporal',
    notes: 'Mantenha a pelve estável sem girar para os lados.'
  },
  {
    workoutId: 'w-40p-06',
    exerciseId: 'ex-rosca-martelo-halteres',
    order: 4,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres de 4kg a 5kg',
    notes: 'Cotovelos firmes e movimento limpo.'
  },

  // w-40p-07 a w-40p-12 (Força 40+ avançados e rascunhos)
  {
    workoutId: 'w-40p-07',
    exerciseId: 'ex-supino-reto-halteres',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres moderados'
  },
  {
    workoutId: 'w-40p-07',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-40p-07',
    exerciseId: 'ex-elevacao-lateral-halteres',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres leves'
  },
  {
    workoutId: 'w-40p-07',
    exerciseId: 'ex-triceps-banco-mergulho',
    order: 4,
    sets: '3',
    reps: '10 a 12',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-40p-08',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halter moderado'
  },
  {
    workoutId: 'w-40p-08',
    exerciseId: 'ex-afundo-estatico',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-40p-08',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 3,
    sets: '3',
    reps: '45 seg',
    rest: '30s',
    load: 'Cardio ativo'
  },
  {
    workoutId: 'w-40p-08',
    exerciseId: 'ex-prancha-isometrica',
    order: 4,
    sets: '3',
    reps: '30 seg',
    rest: '45s',
    load: 'Isometria'
  },

  {
    workoutId: 'w-40p-09',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Halter firme (estímulo ósseo)'
  },
  {
    workoutId: 'w-40p-09',
    exerciseId: 'ex-terra-halteres',
    order: 2,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Halteres firmes'
  },
  {
    workoutId: 'w-40p-09',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 3,
    sets: '3',
    reps: '8 a 10',
    rest: '60s',
    load: 'Halteres firmes'
  },
  {
    workoutId: 'w-40p-09',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 4,
    sets: '4',
    reps: '12 a 15',
    rest: '45s',
    load: 'Com halter na mão'
  },

  {
    workoutId: 'w-40p-10',
    exerciseId: 'ex-agachamento-bulgaro',
    order: 1,
    sets: '3',
    reps: '8 cada perna',
    rest: '60s',
    load: 'Peso corporal ou halteres leves'
  },
  {
    workoutId: 'w-40p-10',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres firmes'
  },
  {
    workoutId: 'w-40p-10',
    exerciseId: 'ex-supino-inclinado-halteres',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres firmes'
  },
  {
    workoutId: 'w-40p-10',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 4,
    sets: '3',
    reps: '10 cada lado',
    rest: '45s',
    load: 'Com pausa de 2s'
  },

  {
    workoutId: 'w-40p-11',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-40p-11',
    exerciseId: 'ex-supino-reto-halteres',
    order: 2,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halteres firmes'
  },
  {
    workoutId: 'w-40p-11',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 3,
    sets: '4',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-40p-11',
    exerciseId: 'ex-prancha-isometrica',
    order: 4,
    sets: '3',
    reps: '45 seg',
    rest: '45s',
    load: 'Isometria'
  },

  {
    workoutId: 'w-40p-12',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Carga alvo consolidada'
  },
  {
    workoutId: 'w-40p-12',
    exerciseId: 'ex-stiff-halteres',
    order: 2,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halteres firmes'
  },
  {
    workoutId: 'w-40p-12',
    exerciseId: 'ex-puxada-alta-pulley',
    order: 3,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Carga moderada'
  },
  {
    workoutId: 'w-40p-12',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },

  // =========================================================================
  // COLEÇÃO 2: MEMBROS SUPERIORES (w-sup-01 a w-sup-12)
  // =========================================================================
  {
    workoutId: 'w-sup-01',
    exerciseId: 'ex-supino-reto-halteres',
    order: 1,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halteres de 3kg a 5kg',
    notes: 'Abertura confortável dos cotovelos, sem forçar ombros.'
  },
  {
    workoutId: 'w-sup-01',
    exerciseId: 'ex-crucifixo-halteres',
    order: 2,
    sets: '3',
    reps: '12',
    rest: '60s',
    load: 'Halteres leves',
    notes: 'Braços semiflexionados, sinta o peitoral abrir.'
  },
  {
    workoutId: 'w-sup-01',
    exerciseId: 'ex-flexao-braco-inclinada',
    order: 3,
    sets: '3',
    reps: '8 a 10',
    rest: '60s',
    load: 'Peso corporal',
    notes: 'Apoio no banco elevado.'
  },
  {
    workoutId: 'w-sup-01',
    exerciseId: 'ex-triceps-banco-mergulho',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Peso corporal',
    notes: 'Joelhos dobrados para reduzir a alavanca.'
  },

  {
    workoutId: 'w-sup-02',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 1,
    sets: '3',
    reps: '10 a 12 cada lado',
    rest: '60s',
    load: 'Halter de 4kg a 6kg'
  },
  {
    workoutId: 'w-sup-02',
    exerciseId: 'ex-crucifixo-invertido-halteres',
    order: 2,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres leves de 2kg a 3kg',
    notes: 'Fortalecimento de romboides e deltoide posterior.'
  },
  {
    workoutId: 'w-sup-02',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres médios'
  },
  {
    workoutId: 'w-sup-02',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 4,
    sets: '3',
    reps: '8 cada lado',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-sup-03',
    exerciseId: 'ex-rosca-direta-halteres',
    order: 1,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres de 3kg a 5kg'
  },
  {
    workoutId: 'w-sup-03',
    exerciseId: 'ex-rosca-martelo-halteres',
    order: 2,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres de 3kg a 5kg'
  },
  {
    workoutId: 'w-sup-03',
    exerciseId: 'ex-triceps-corda-polia',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Polia moderada'
  },
  {
    workoutId: 'w-sup-03',
    exerciseId: 'ex-triceps-banco-mergulho',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-sup-04',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 1,
    sets: '3',
    reps: '15 ciclos',
    rest: '30s',
    load: 'Mobilidade'
  },
  {
    workoutId: 'w-sup-04',
    exerciseId: 'ex-elevacao-lateral-halteres',
    order: 2,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres leves de 2kg'
  },
  {
    workoutId: 'w-sup-04',
    exerciseId: 'ex-rosca-martelo-halteres',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres leves'
  },
  {
    workoutId: 'w-sup-04',
    exerciseId: 'ex-prancha-elevada-banco',
    order: 4,
    sets: '3',
    reps: '30 seg',
    rest: '45s',
    load: 'Isometria'
  },

  {
    workoutId: 'w-sup-05',
    exerciseId: 'ex-supino-inclinado-halteres',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres médios'
  },
  {
    workoutId: 'w-sup-05',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-sup-05',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres médios'
  },
  {
    workoutId: 'w-sup-05',
    exerciseId: 'ex-remada-baixa-triangulo',
    order: 4,
    sets: '3',
    reps: '12',
    rest: '60s',
    load: 'Polia média'
  },

  {
    workoutId: 'w-sup-06',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-06',
    exerciseId: 'ex-elevacao-lateral-halteres',
    order: 2,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres leves'
  },
  {
    workoutId: 'w-sup-06',
    exerciseId: 'ex-triceps-corda-polia',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Polia'
  },
  {
    workoutId: 'w-sup-06',
    exerciseId: 'ex-triceps-frances-halter',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halter médio'
  },

  {
    workoutId: 'w-sup-07',
    exerciseId: 'ex-puxada-alta-pulley',
    order: 1,
    sets: '4',
    reps: '10 a 12',
    rest: '60s',
    load: 'Polia média'
  },
  {
    workoutId: 'w-sup-07',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-07',
    exerciseId: 'ex-crucifixo-invertido-halteres',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres leves'
  },
  {
    workoutId: 'w-sup-07',
    exerciseId: 'ex-rosca-direta-halteres',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },

  {
    workoutId: 'w-sup-08',
    exerciseId: 'ex-supino-reto-halteres',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-08',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-sup-08',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-08',
    exerciseId: 'ex-rosca-martelo-halteres',
    order: 4,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres'
  },

  // Sessões em revisão/rascunho w-sup-09 a w-sup-12
  {
    workoutId: 'w-sup-09',
    exerciseId: 'ex-supino-reto-halteres',
    order: 1,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Carga pesada'
  },
  {
    workoutId: 'w-sup-09',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Carga pesada'
  },
  {
    workoutId: 'w-sup-09',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 3,
    sets: '3',
    reps: '8 a 10',
    rest: '60s',
    load: 'Carga firme'
  },
  {
    workoutId: 'w-sup-09',
    exerciseId: 'ex-triceps-corda-polia',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Carga moderada'
  },

  {
    workoutId: 'w-sup-10',
    exerciseId: 'ex-puxada-alta-pulley',
    order: 1,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Polia pesada'
  },
  {
    workoutId: 'w-sup-10',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 2,
    sets: '4',
    reps: '8 cada lado',
    rest: '60s',
    load: 'Halter pesado'
  },
  {
    workoutId: 'w-sup-10',
    exerciseId: 'ex-crucifixo-invertido-halteres',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-10',
    exerciseId: 'ex-rosca-direta-halteres',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },

  {
    workoutId: 'w-sup-11',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 1,
    sets: '4',
    reps: '8 a 10',
    rest: '60s',
    load: 'Halteres firmes'
  },
  {
    workoutId: 'w-sup-11',
    exerciseId: 'ex-elevacao-lateral-halteres',
    order: 2,
    sets: '4',
    reps: '12',
    rest: '45s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-11',
    exerciseId: 'ex-elevacao-frontal-halteres',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-11',
    exerciseId: 'ex-crucifixo-invertido-halteres',
    order: 4,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Halteres'
  },

  {
    workoutId: 'w-sup-12',
    exerciseId: 'ex-supino-inclinado-halteres',
    order: 1,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-12',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-12',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-sup-12',
    exerciseId: 'ex-rosca-martelo-halteres',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },

  // =========================================================================
  // COLEÇÃO 3: MEMBROS INFERIORES (w-inf-01 a w-inf-12)
  // =========================================================================
  {
    workoutId: 'w-inf-01',
    exerciseId: 'ex-sentar-levantar-banco',
    order: 1,
    sets: '3',
    reps: '10 a 12',
    rest: '60s',
    load: 'Peso corporal',
    notes: 'Subida firme sem tranco nos joelhos.'
  },
  {
    workoutId: 'w-inf-01',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 2,
    sets: '3',
    reps: '12 a 15',
    rest: '45s',
    load: 'Peso corporal',
    notes: 'Pausa de 2 segundos contraindo glúteos.'
  },
  {
    workoutId: 'w-inf-01',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 3,
    sets: '3',
    reps: '15',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-inf-01',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 4,
    sets: '3',
    reps: '8 cada lado',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-inf-02',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 1,
    sets: '4',
    reps: '15',
    rest: '45s',
    load: 'Peso corporal ou halter leve no quadril'
  },
  {
    workoutId: 'w-inf-02',
    exerciseId: 'ex-stiff-halteres',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres leves de 3kg a 5kg'
  },
  {
    workoutId: 'w-inf-02',
    exerciseId: 'ex-elevacao-pelvica-unilateral',
    order: 3,
    sets: '3',
    reps: '8 cada perna',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-inf-02',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 4,
    sets: '3',
    reps: '8 cada lado',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-inf-03',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 1,
    sets: '4',
    reps: '15',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-inf-03',
    exerciseId: 'ex-equilibrio-unipodal',
    order: 2,
    sets: '3',
    reps: '30 seg cada perna',
    rest: '30s',
    load: 'Propriocepção'
  },
  {
    workoutId: 'w-inf-03',
    exerciseId: 'ex-sentar-levantar-banco',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-inf-04',
    exerciseId: 'ex-agachamento-livre',
    order: 1,
    sets: '3',
    reps: '12',
    rest: '60s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-inf-04',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 2,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-inf-04',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 3,
    sets: '3',
    reps: '15',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-inf-05',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halter de 6kg a 10kg'
  },
  {
    workoutId: 'w-inf-05',
    exerciseId: 'ex-afundo-estatico',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halteres leves de 3kg a 4kg'
  },
  {
    workoutId: 'w-inf-05',
    exerciseId: 'ex-cadeira-extensora',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Carga moderada'
  },
  {
    workoutId: 'w-inf-05',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 4,
    sets: '3',
    reps: '15',
    rest: '45s',
    load: 'Com halter'
  },

  {
    workoutId: 'w-inf-06',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 1,
    sets: '4',
    reps: '10 a 12',
    rest: '60s',
    load: 'Halter de 8kg a 12kg'
  },
  {
    workoutId: 'w-inf-06',
    exerciseId: 'ex-elevacao-pelvica-unilateral',
    order: 2,
    sets: '3',
    reps: '10 cada perna',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-inf-06',
    exerciseId: 'ex-stiff-halteres',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres médios'
  },

  {
    workoutId: 'w-inf-07',
    exerciseId: 'ex-agachamento-bulgaro',
    order: 1,
    sets: '3',
    reps: '8 a 10 cada perna',
    rest: '60s',
    load: 'Peso corporal ou halteres leves'
  },
  {
    workoutId: 'w-inf-07',
    exerciseId: 'ex-afundo-estatico',
    order: 2,
    sets: '3',
    reps: '10 cada perna',
    rest: '60s',
    load: 'Halteres leves'
  },
  {
    workoutId: 'w-inf-07',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 3,
    sets: '3',
    reps: '15',
    rest: '45s',
    load: 'Com halter'
  },

  {
    workoutId: 'w-inf-08',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-inf-08',
    exerciseId: 'ex-stiff-halteres',
    order: 2,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-inf-08',
    exerciseId: 'ex-cadeira-flexora',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Máquina'
  },
  {
    workoutId: 'w-inf-08',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 4,
    sets: '3',
    reps: '15',
    rest: '45s',
    load: 'Com peso'
  },

  // Sessões em revisão/rascunho w-inf-09 a w-inf-12
  {
    workoutId: 'w-inf-09',
    exerciseId: 'ex-leg-press-45',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '75s',
    load: 'Carga pesada segura'
  },
  {
    workoutId: 'w-inf-09',
    exerciseId: 'ex-agachamento-goblet',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halter pesado'
  },
  {
    workoutId: 'w-inf-09',
    exerciseId: 'ex-cadeira-extensora',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Máquina'
  },

  {
    workoutId: 'w-inf-10',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Com pausa de 2s'
  },
  {
    workoutId: 'w-inf-10',
    exerciseId: 'ex-stiff-halteres',
    order: 2,
    sets: '4',
    reps: '8 a 10',
    rest: '75s',
    load: 'Halteres pesados'
  },
  {
    workoutId: 'w-inf-10',
    exerciseId: 'ex-agachamento-bulgaro',
    order: 3,
    sets: '3',
    reps: '8 cada perna',
    rest: '60s',
    load: 'Halteres'
  },

  {
    workoutId: 'w-inf-11',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 1,
    sets: '4',
    reps: '12',
    rest: '60s',
    load: 'Com halter pesado no quadril'
  },
  {
    workoutId: 'w-inf-11',
    exerciseId: 'ex-agachamento-bulgaro',
    order: 2,
    sets: '3',
    reps: '8 cada perna',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-inf-11',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halter pesado'
  },

  {
    workoutId: 'w-inf-12',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-inf-12',
    exerciseId: 'ex-stiff-halteres',
    order: 2,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-inf-12',
    exerciseId: 'ex-afundo-estatico',
    order: 3,
    sets: '3',
    reps: '10 cada perna',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-inf-12',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 4,
    sets: '4',
    reps: '15',
    rest: '45s',
    load: 'Com peso'
  },

  // =========================================================================
  // COLEÇÃO 4: FULL BODY INTEGRADO (w-fb-01 a w-fb-12)
  // =========================================================================
  {
    workoutId: 'w-fb-01',
    exerciseId: 'ex-sentar-levantar-banco',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-fb-01',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halter leve'
  },
  {
    workoutId: 'w-fb-01',
    exerciseId: 'ex-flexao-braco-inclinada',
    order: 3,
    sets: '3',
    reps: '8 a 10',
    rest: '60s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-fb-01',
    exerciseId: 'ex-prancha-elevada-banco',
    order: 4,
    sets: '3',
    reps: '30 seg',
    rest: '45s',
    load: 'Isometria'
  },

  {
    workoutId: 'w-fb-02',
    exerciseId: 'ex-agachamento-livre',
    order: 1,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-fb-02',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres leves'
  },
  {
    workoutId: 'w-fb-02',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-fb-02',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 4,
    sets: '3',
    reps: '8 cada lado',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-fb-03',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 1,
    sets: '3',
    reps: '10 ciclos',
    rest: '30s',
    load: 'Mobilidade'
  },
  {
    workoutId: 'w-fb-03',
    exerciseId: 'ex-sentar-levantar-banco',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-fb-03',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 3,
    sets: '3',
    reps: '10 cada lado',
    rest: '45s',
    load: 'Halter leve'
  },
  {
    workoutId: 'w-fb-03',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 4,
    sets: '3',
    reps: '12',
    rest: '30s',
    load: 'Mobilidade'
  },

  {
    workoutId: 'w-fb-04',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halter moderado'
  },
  {
    workoutId: 'w-fb-04',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-04',
    exerciseId: 'ex-supino-reto-halteres',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-04',
    exerciseId: 'ex-prancha-isometrica',
    order: 4,
    sets: '3',
    reps: '30 seg',
    rest: '30s',
    load: 'Isometria'
  },

  {
    workoutId: 'w-fb-05',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halter médio'
  },
  {
    workoutId: 'w-fb-05',
    exerciseId: 'ex-supino-inclinado-halteres',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-05',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 3,
    sets: '3',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halter firme'
  },
  {
    workoutId: 'w-fb-05',
    exerciseId: 'ex-stiff-halteres',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-05',
    exerciseId: 'ex-prancha-isometrica',
    order: 5,
    sets: '3',
    reps: '35 seg',
    rest: '45s',
    load: 'Isometria'
  },

  {
    workoutId: 'w-fb-06',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halter'
  },
  {
    workoutId: 'w-fb-06',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-06',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 3,
    sets: '3',
    reps: '12',
    rest: '45s',
    load: 'Com halter'
  },
  {
    workoutId: 'w-fb-06',
    exerciseId: 'ex-rosca-martelo-halteres',
    order: 4,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },

  {
    workoutId: 'w-fb-07',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halter médio'
  },
  {
    workoutId: 'w-fb-07',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-07',
    exerciseId: 'ex-afundo-estatico',
    order: 3,
    sets: '3',
    reps: '8 cada perna',
    rest: '45s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-fb-07',
    exerciseId: 'ex-abdominal-supra-controlado',
    order: 4,
    sets: '3',
    reps: '15',
    rest: '45s',
    load: 'Peso corporal'
  },

  {
    workoutId: 'w-fb-08',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halter'
  },
  {
    workoutId: 'w-fb-08',
    exerciseId: 'ex-supino-reto-halteres',
    order: 2,
    sets: '3',
    reps: '10',
    rest: '45s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-08',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 3,
    sets: '3',
    reps: '10 cada lado',
    rest: '45s',
    load: 'Halter'
  },
  {
    workoutId: 'w-fb-08',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 4,
    sets: '3',
    reps: '40 seg',
    rest: '30s',
    load: 'Cardio ativo'
  },

  // Sessões em revisão/rascunho w-fb-09 a w-fb-12
  {
    workoutId: 'w-fb-09',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Carga pesada'
  },
  {
    workoutId: 'w-fb-09',
    exerciseId: 'ex-terra-halteres',
    order: 2,
    sets: '4',
    reps: '8 a 10',
    rest: '60s',
    load: 'Halteres pesados'
  },
  {
    workoutId: 'w-fb-09',
    exerciseId: 'ex-supino-inclinado-halteres',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-09',
    exerciseId: 'ex-prancha-isometrica',
    order: 4,
    sets: '3',
    reps: '45 seg',
    rest: '45s',
    load: 'Isometria'
  },

  {
    workoutId: 'w-fb-10',
    exerciseId: 'ex-agachamento-bulgaro',
    order: 1,
    sets: '3',
    reps: '8 cada lado',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-10',
    exerciseId: 'ex-puxada-alta-pulley',
    order: 2,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Polia'
  },
  {
    workoutId: 'w-fb-10',
    exerciseId: 'ex-desenvolvimento-halteres-sentado',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },

  {
    workoutId: 'w-fb-11',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halter pesado'
  },
  {
    workoutId: 'w-fb-11',
    exerciseId: 'ex-remada-curvada-halteres',
    order: 2,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-11',
    exerciseId: 'ex-supino-reto-halteres',
    order: 3,
    sets: '3',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },

  {
    workoutId: 'w-fb-12',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Carga alvo'
  },
  {
    workoutId: 'w-fb-12',
    exerciseId: 'ex-stiff-halteres',
    order: 2,
    sets: '4',
    reps: '10',
    rest: '60s',
    load: 'Halteres'
  },
  {
    workoutId: 'w-fb-12',
    exerciseId: 'ex-remada-unilateral-serrote',
    order: 3,
    sets: '4',
    reps: '10 cada lado',
    rest: '60s',
    load: 'Halter firme'
  },

  // =========================================================================
  // COLEÇÃO 5: CONDICIONAMENTO & FÔLEGO (w-cardio-01 a w-cardio-12)
  // =========================================================================
  {
    workoutId: 'w-cardio-01',
    exerciseId: 'ex-marcha-estacionaria',
    order: 1,
    sets: '4',
    reps: '45 seg',
    rest: '30s',
    load: 'Ritmo suave'
  },
  {
    workoutId: 'w-cardio-01',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 2,
    sets: '4',
    reps: '45 seg',
    rest: '30s',
    load: 'Sem impacto'
  },
  {
    workoutId: 'w-cardio-01',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 3,
    sets: '3',
    reps: '12 ciclos',
    rest: '20s',
    load: 'Recuperação ativa'
  },

  {
    workoutId: 'w-cardio-02',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 1,
    sets: '4',
    reps: '50 seg',
    rest: '25s',
    load: 'Aeróbio'
  },
  {
    workoutId: 'w-cardio-02',
    exerciseId: 'ex-marcha-estacionaria',
    order: 2,
    sets: '4',
    reps: '50 seg',
    rest: '25s',
    load: 'Joelhos médios'
  },
  {
    workoutId: 'w-cardio-02',
    exerciseId: 'ex-boxe-sombra-suave',
    order: 3,
    sets: '3',
    reps: '45 seg',
    rest: '30s',
    load: 'Coordenação'
  },

  {
    workoutId: 'w-cardio-03',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 1,
    sets: '4',
    reps: '20',
    rest: '30s',
    load: 'Circulação ativa'
  },
  {
    workoutId: 'w-cardio-03',
    exerciseId: 'ex-subida-step-degrau',
    order: 2,
    sets: '4',
    reps: '10 cada perna',
    rest: '30s',
    load: 'Ritmo contínuo'
  },
  {
    workoutId: 'w-cardio-03',
    exerciseId: 'ex-marcha-estacionaria',
    order: 3,
    sets: '3',
    reps: '40 seg',
    rest: '20s',
    load: 'Soltura'
  },

  {
    workoutId: 'w-cardio-04',
    exerciseId: 'ex-marcha-estacionaria',
    order: 1,
    sets: '3',
    reps: '60 seg',
    rest: '30s',
    load: 'Ritmo respiratório'
  },
  {
    workoutId: 'w-cardio-04',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 2,
    sets: '3',
    reps: '15 ciclos',
    rest: '20s',
    load: 'Abertura de caixa torácica'
  },
  {
    workoutId: 'w-cardio-04',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 3,
    sets: '3',
    reps: '10 ciclos',
    rest: '20s',
    load: 'Respiração profunda'
  },

  {
    workoutId: 'w-cardio-05',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 1,
    sets: '5',
    reps: '45 seg ativo / 30 seg pausa',
    rest: '30s',
    load: 'AIT moderado'
  },
  {
    workoutId: 'w-cardio-05',
    exerciseId: 'ex-subida-step-degrau',
    order: 2,
    sets: '4',
    reps: '12 cada perna',
    rest: '30s',
    load: 'Subida firme'
  },
  {
    workoutId: 'w-cardio-05',
    exerciseId: 'ex-boxe-sombra-suave',
    order: 3,
    sets: '4',
    reps: '45 seg',
    rest: '30s',
    load: 'Cadência moderada'
  },

  {
    workoutId: 'w-cardio-06',
    exerciseId: 'ex-boxe-sombra-suave',
    order: 1,
    sets: '4',
    reps: '50 seg',
    rest: '25s',
    load: 'Socos contínuos e esquiva'
  },
  {
    workoutId: 'w-cardio-06',
    exerciseId: 'ex-agachamento-livre',
    order: 2,
    sets: '4',
    reps: '15 ritmados',
    rest: '30s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-cardio-06',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 3,
    sets: '4',
    reps: '50 seg',
    rest: '25s',
    load: 'Aeróbio contínuo'
  },

  {
    workoutId: 'w-cardio-07',
    exerciseId: 'ex-subida-step-degrau',
    order: 1,
    sets: '4',
    reps: '15 cada perna',
    rest: '45s',
    load: 'Step firme'
  },
  {
    workoutId: 'w-cardio-07',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 2,
    sets: '4',
    reps: '15',
    rest: '30s',
    load: 'Propulsão'
  },
  {
    workoutId: 'w-cardio-07',
    exerciseId: 'ex-marcha-estacionaria',
    order: 3,
    sets: '3',
    reps: '45 seg',
    rest: '30s',
    load: 'Soltura'
  },

  {
    workoutId: 'w-cardio-08',
    exerciseId: 'ex-marcha-estacionaria',
    order: 1,
    sets: '5',
    reps: '60 seg',
    rest: '30s',
    load: 'Ritmo contínuo'
  },
  {
    workoutId: 'w-cardio-08',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 2,
    sets: '5',
    reps: '60 seg',
    rest: '30s',
    load: 'Braços amplos'
  },

  // Sessões em revisão/rascunho w-cardio-09 a w-cardio-12
  {
    workoutId: 'w-cardio-09',
    exerciseId: 'ex-boxe-sombra-suave',
    order: 1,
    sets: '6',
    reps: '30 seg rápido / 30 seg lento',
    rest: '30s',
    load: 'HIIT articular'
  },
  {
    workoutId: 'w-cardio-09',
    exerciseId: 'ex-subida-step-degrau',
    order: 2,
    sets: '4',
    reps: '12 cada perna rápida',
    rest: '30s',
    load: 'Potência'
  },

  {
    workoutId: 'w-cardio-10',
    exerciseId: 'ex-agachamento-goblet',
    order: 1,
    sets: '4',
    reps: '15 cadenciados',
    rest: '30s',
    load: 'Halter leve'
  },
  {
    workoutId: 'w-cardio-10',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 2,
    sets: '4',
    reps: '45 seg',
    rest: '30s',
    load: 'Metabólico'
  },

  {
    workoutId: 'w-cardio-11',
    exerciseId: 'ex-boxe-sombra-suave',
    order: 1,
    sets: '5',
    reps: '60 seg',
    rest: '30s',
    load: 'Pirâmide'
  },
  {
    workoutId: 'w-cardio-11',
    exerciseId: 'ex-marcha-estacionaria',
    order: 2,
    sets: '5',
    reps: '60 seg',
    rest: '30s',
    load: 'Fôlego'
  },

  {
    workoutId: 'w-cardio-12',
    exerciseId: 'ex-subida-step-degrau',
    order: 1,
    sets: '6',
    reps: '15 cada perna',
    rest: '30s',
    load: 'Resistência plena'
  },
  {
    workoutId: 'w-cardio-12',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 2,
    sets: '6',
    reps: '60 seg',
    rest: '30s',
    load: 'Aeróbio'
  },

  // =========================================================================
  // COLEÇÃO 6: MOBILIDADE E EQUILÍBRIO (w-mob-01 a w-mob-12)
  // =========================================================================
  {
    workoutId: 'w-mob-01',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 1,
    sets: '3',
    reps: '10 a 12 ciclos',
    rest: '30s',
    load: 'Mobilidade articular'
  },
  {
    workoutId: 'w-mob-01',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 2,
    sets: '3',
    reps: '12 ciclos cada sentido',
    rest: '30s',
    load: 'Peso corporal'
  },
  {
    workoutId: 'w-mob-01',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 3,
    sets: '3',
    reps: '8 cada lado',
    rest: '30s',
    load: 'Controle'
  },

  {
    workoutId: 'w-mob-02',
    exerciseId: 'ex-equilibrio-unipodal',
    order: 1,
    sets: '4',
    reps: '30 a 45 seg cada perna',
    rest: '30s',
    load: 'Com apoio leve da parede'
  },
  {
    workoutId: 'w-mob-02',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 2,
    sets: '3',
    reps: '12 lentas',
    rest: '30s',
    load: 'Dorsiflexão'
  },
  {
    workoutId: 'w-mob-02',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 3,
    sets: '3',
    reps: '8 cada lado',
    rest: '30s',
    load: 'Equilíbrio cruzado'
  },

  {
    workoutId: 'w-mob-03',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 1,
    sets: '3',
    reps: '12 ciclos lentos',
    rest: '30s',
    load: 'Descompressão'
  },
  {
    workoutId: 'w-mob-03',
    exerciseId: 'ex-elevacao-pelvica-solo',
    order: 2,
    sets: '3',
    reps: '10 suaves',
    rest: '30s',
    load: 'Pelve neutra'
  },
  {
    workoutId: 'w-mob-03',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 3,
    sets: '3',
    reps: '8 cada lado com pausa',
    rest: '30s',
    load: 'Estabilidade'
  },

  {
    workoutId: 'w-mob-04',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 1,
    sets: '4',
    reps: '15 ciclos',
    rest: '30s',
    load: 'Ombros e cervical'
  },
  {
    workoutId: 'w-mob-04',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 2,
    sets: '3',
    reps: '10 ciclos',
    rest: '30s',
    load: 'Coluna torácica'
  },
  {
    workoutId: 'w-mob-04',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 3,
    sets: '3',
    reps: '8 cada lado',
    rest: '30s',
    load: 'Cadeia escapular'
  },

  {
    workoutId: 'w-mob-05',
    exerciseId: 'ex-mobilidade-quadril-90-90',
    order: 1,
    sets: '4',
    reps: '8 a 10 cada lado',
    rest: '45s',
    load: 'Quadril no solo'
  },
  {
    workoutId: 'w-mob-05',
    exerciseId: 'ex-elevacao-pelvica-unilateral',
    order: 2,
    sets: '3',
    reps: '8 cada perna',
    rest: '30s',
    load: 'Glúteo médio'
  },
  {
    workoutId: 'w-mob-05',
    exerciseId: 'ex-agachamento-sumo-halter',
    order: 3,
    sets: '3',
    reps: '10 suaves',
    rest: '45s',
    load: 'Abertura adutora'
  },

  {
    workoutId: 'w-mob-06',
    exerciseId: 'ex-prancha-isometrica',
    order: 1,
    sets: '3',
    reps: '30 a 40 seg',
    rest: '45s',
    load: 'Isometria'
  },
  {
    workoutId: 'w-mob-06',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '30s',
    load: 'Propriocepção'
  },
  {
    workoutId: 'w-mob-06',
    exerciseId: 'ex-equilibrio-unipodal',
    order: 3,
    sets: '3',
    reps: '35 seg cada perna',
    rest: '30s',
    load: 'Equilíbrio'
  },

  {
    workoutId: 'w-mob-07',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 1,
    sets: '4',
    reps: '12 lentas com alongamento',
    rest: '30s',
    load: 'Tornozelo resiliente'
  },
  {
    workoutId: 'w-mob-07',
    exerciseId: 'ex-equilibrio-unipodal',
    order: 2,
    sets: '3',
    reps: '30 seg cada perna',
    rest: '30s',
    load: 'Pé descalço recomendado'
  },
  {
    workoutId: 'w-mob-07',
    exerciseId: 'ex-sentar-levantar-banco',
    order: 3,
    sets: '3',
    reps: '10 com descida de 3s',
    rest: '45s',
    load: 'Controle excêntrico de joelho'
  },

  {
    workoutId: 'w-mob-08',
    exerciseId: 'ex-mobilidade-quadril-90-90',
    order: 1,
    sets: '3',
    reps: '10 cada lado',
    rest: '30s',
    load: 'Mobilidade ativa'
  },
  {
    workoutId: 'w-mob-08',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 2,
    sets: '3',
    reps: '12 ciclos',
    rest: '30s',
    load: 'Flexibilidade ativa'
  },
  {
    workoutId: 'w-mob-08',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 3,
    sets: '3',
    reps: '15 ciclos',
    rest: '30s',
    load: 'Amplitude total'
  },

  // Sessões em revisão/rascunho w-mob-09 a w-mob-12
  {
    workoutId: 'w-mob-09',
    exerciseId: 'ex-stiff-halteres',
    order: 1,
    sets: '3',
    reps: '10 lentas focando alongamento',
    rest: '45s',
    load: 'Halteres leves'
  },
  {
    workoutId: 'w-mob-09',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 2,
    sets: '3',
    reps: '12 ciclos',
    rest: '30s',
    load: 'Fáscia toracolombar'
  },
  {
    workoutId: 'w-mob-09',
    exerciseId: 'ex-panturrilha-em-pe-degrau',
    order: 3,
    sets: '3',
    reps: '15 com pausa baixa',
    rest: '30s',
    load: 'Alongamento ativo'
  },

  {
    workoutId: 'w-mob-10',
    exerciseId: 'ex-equilibrio-unipodal',
    order: 1,
    sets: '4',
    reps: '45 seg com movimentos de braço',
    rest: '30s',
    load: 'Equilíbrio dinâmico'
  },
  {
    workoutId: 'w-mob-10',
    exerciseId: 'ex-step-jack-sem-salto',
    order: 2,
    sets: '3',
    reps: '40 seg com mudança de direção',
    rest: '30s',
    load: 'Agilidade 40+'
  },

  {
    workoutId: 'w-mob-11',
    exerciseId: 'ex-mobilidade-quadril-90-90',
    order: 1,
    sets: '4',
    reps: '10 cada lado',
    rest: '30s',
    load: 'Mobilidade profunda'
  },
  {
    workoutId: 'w-mob-11',
    exerciseId: 'ex-gato-vaca-cat-cow',
    order: 2,
    sets: '3',
    reps: '12 ciclos',
    rest: '30s',
    load: 'Coluna integral'
  },
  {
    workoutId: 'w-mob-11',
    exerciseId: 'ex-circulo-bracos-escapulas',
    order: 3,
    sets: '3',
    reps: '15',
    rest: '30s',
    load: 'Ombros'
  },

  {
    workoutId: 'w-mob-12',
    exerciseId: 'ex-equilibrio-unipodal',
    order: 1,
    sets: '4',
    reps: '45 seg',
    rest: '30s',
    load: 'Postura máxima'
  },
  {
    workoutId: 'w-mob-12',
    exerciseId: 'ex-mobilidade-quadril-90-90',
    order: 2,
    sets: '3',
    reps: '10 cada lado',
    rest: '30s',
    load: 'Controle'
  },
  {
    workoutId: 'w-mob-12',
    exerciseId: 'ex-perdigueiro-bird-dog',
    order: 3,
    sets: '4',
    reps: '10 cada lado com pausa',
    rest: '30s',
    load: 'Maestria corporal'
  }
];
