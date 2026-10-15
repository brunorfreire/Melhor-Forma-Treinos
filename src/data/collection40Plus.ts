import { WorkoutPlan, WorkoutSession, Exercise } from '../types';

export interface CollectionPillar {
  id: 'forca' | 'equilibrio' | 'mobilidade' | 'condicionamento';
  name: string;
  shortDesc: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export interface CollectionLevel {
  id: 'nivel-1' | 'nivel-2' | 'nivel-3';
  title: string;
  subtitle: string;
  badge: string;
  targetAudience: string;
  durationRange: string;
  characteristics: string[];
  color: string;
}

export interface CollectionWorkoutSession {
  id: string;
  title: string;
  levelId: 'nivel-1' | 'nivel-2' | 'nivel-3';
  pillarId: 'forca' | 'equilibrio' | 'mobilidade' | 'condicionamento';
  duration: string;
  focus: string;
  objective: string;
  targetAudience: string;
  coverImage: string;
  exercises: Exercise[];
  accessLevel?: 'free' | 'premium';
  photoAlt?: string;
}

export const PILLARS_40_PLUS: CollectionPillar[] = [
  {
    id: 'forca',
    name: 'FORÇA',
    shortDesc: 'Capacidade funcional e massa magra',
    iconName: 'Dumbbell',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Treinamentos resistidos progressivos para desenvolver força muscular, proteger articulações e preservar a densidade óssea com autonomia duradoura.'
  },
  {
    id: 'equilibrio',
    name: 'EQUILÍBRIO',
    shortDesc: 'Estabilidade, postura e segurança',
    iconName: 'Scale',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    description: 'Exercícios específicos de controle postural, estabilidade do tornozelo e quadril, foco no core e prevenção ativa de quedas e desequilíbrios.'
  },
  {
    id: 'mobilidade',
    name: 'MOBILIDADE',
    shortDesc: 'Amplitude articular sem dor',
    iconName: 'Sparkles',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Movimentos funcionais e mobilidade articular para soltar coluna, ombros e quadris, devolvendo leveza e liberdade aos movimentos do cotidiano.'
  },
  {
    id: 'condicionamento',
    name: 'CONDICIONAMENTO',
    shortDesc: 'Disposição, fôlego e vitalidade',
    iconName: 'HeartPulse',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Treinamentos aeróbios e intervalados adaptados com intensidade consciente, estimulando o sistema cardiovascular sem sobrecarga desnecessária.'
  }
];

export const LEVELS_40_PLUS: CollectionLevel[] = [
  {
    id: 'nivel-1',
    title: 'NÍVEL 1 | COMEÇAR BEM',
    subtitle: 'Adaptação, técnica e confiança para começar',
    badge: 'Iniciante & Retorno',
    targetAudience: 'Pessoas iniciantes, sedentárias ou retornando à prática de exercícios.',
    durationRange: '15 a 30 minutos',
    color: 'from-teal-500/20 to-emerald-500/10',
    characteristics: [
      'Exercícios de baixa complexidade técnica',
      'Cargas leves, progressivas ou peso corporal',
      'Movimentos funcionais básicos do dia a dia',
      'Intervalos confortáveis de recuperação',
      'Ênfase total em postura e adaptação',
      'Alternativas seguras para cada movimento'
    ]
  },
  {
    id: 'nivel-2',
    title: 'NÍVEL 2 | EVOLUIR COM SEGURANÇA',
    subtitle: 'Estrutura, força e variedade de estímulos',
    badge: 'Intermediário Consciente',
    targetAudience: 'Pessoas que já praticam exercícios regularmente e possuem experiência básica.',
    durationRange: '25 a 45 minutos',
    color: 'from-emerald-500/20 to-teal-500/10',
    characteristics: [
      'Treinamento resistido estruturado e contínuo',
      'Exercícios multiarticulares e funcionais',
      'Progressão planejada de cargas e repetições',
      'Maior variedade de estímulos neuromusculares',
      'Condicionamento aeróbio moderado',
      'Desenvolvimento de força, estabilidade e tônus'
    ]
  },
  {
    id: 'nivel-3',
    title: 'NÍVEL 3 | LONGEVIDADE EM MOVIMENTO',
    subtitle: 'Preservação de massa magra, vigor e autonomia máxima',
    badge: 'Avançado & Vitalidade',
    targetAudience: 'Pessoas com experiência consistente e capacidade para sessões mais exigentes.',
    durationRange: '35 a 50 minutos',
    color: 'from-cyan-500/20 to-emerald-500/10',
    characteristics: [
      'Exercícios resistidos de maior complexidade e amplitude',
      'Progressões consistentes de força e potência funcional',
      'Sessões combinadas e circuitos funcionais',
      'Estímulos avançados de coordenação motora e agilidade',
      'Treinos intervalados de intensidade controlada',
      'Foco em preservar massa magra, densidade óssea e vitalidade'
    ]
  }
];

// Imagens com representatividade 40+ realista, mulheres e homens maduros, luz natural
export const SESSIONS_40_PLUS: CollectionWorkoutSession[] = [
  // ==================== NÍVEL 1: COMEÇAR BEM ====================
  {
    id: 'n1-s1',
    title: '1. Primeiros Passos na Força',
    levelId: 'nivel-1',
    pillarId: 'forca',
    duration: '20 min',
    focus: 'Força Funcional Básica & Adaptação',
    objective: 'Fortalecer os principais grupos musculares com movimentos seguros, ativando pernas, costas e core para o dia a dia.',
    targetAudience: 'Iniciantes ou pessoas voltando a treinar após período de pausa.',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n1-s1-ex1',
        name: 'Sentar e Levantar da Cadeira (Box Squat)',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Peso corporal',
        notes: 'Mantenha os pés firmes no chão, peito aberto e desça com controle sem despencar na cadeira.',
        youtubeId: 'IZxyjW7MPJQ',
        instructions: 'Posicione os pés na largura dos ombros. Flexione quadris e joelhos empurrando o quadril para trás até tocar o assento. Suba estendendo os joelhos.'
      },
      {
        id: 'n1-s1-ex2',
        name: 'Remada Sentada com Elástico ou Polia Baixa',
        muscleGroup: 'Costas',
        sets: '3',
        reps: '12',
        rest: '60s',
        weight: 'Elástico leve / Placa 2',
        notes: 'Puxe aproximando os cotovelos das costelas e una as escápulas atrás das costas.',
        youtubeId: 'GZbfZ033fBQ',
        instructions: 'Mantenha a coluna ereta e os ombros relaxados. Puxe trazendo as mãos na direção do umbigo, sinta a contração no meio das costas.'
      },
      {
        id: 'n1-s1-ex3',
        name: 'Elevação Pélvica no Solo (Ponte de Glúteos)',
        muscleGroup: 'Posterior & Glúteos',
        sets: '3',
        reps: '12 a 15',
        rest: '45s',
        weight: 'Peso corporal',
        notes: 'Aperte os glúteos no topo por 1 segundo antes de descer com controle.',
        youtubeId: '8bbE64NuDTU',
        instructions: 'Deite de costas com os joelhos flexionados e pés firmes. Eleve o quadril até alinhar joelhos, quadris e ombros.'
      },
      {
        id: 'n1-s1-ex4',
        name: 'Flexão de Braço na Parede ou Barra Alta',
        muscleGroup: 'Peito',
        sets: '3',
        reps: '8 a 10',
        rest: '60s',
        weight: 'Peso corporal',
        notes: 'Corpo em linha reta do calcanhar à cabeça. Não deixe a lombar arquear.',
        youtubeId: 'rT7DgCr-3pg',
        instructions: 'Apoie as mãos um pouco mais abertas que os ombros. Aproxime o peito da superfície com cotovelos a 45 graus do tronco e empurre firme.'
      },
      {
        id: 'n1-s1-ex5',
        name: 'Prancha com Joelhos no Solo',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '20 a 30 seg',
        rest: '45s',
        notes: 'Ative o abdômen puxando o umbigo para dentro sem prender a respiração.',
        youtubeId: 'pSHjTRCQxIw',
        instructions: 'Apoie os antebraços e os joelhos no colchonete. Mantenha a cabeça alinhada com a coluna e respire com calma e ritmo constante.'
      }
    ]
  },
  {
    id: 'n1-s2',
    title: '2. Corpo Ativo 40+',
    levelId: 'nivel-1',
    pillarId: 'forca',
    duration: '22 min',
    focus: 'Tônus Muscular & Vitalidade Global',
    objective: 'Estimular os grandes grupos musculares de maneira integrada para mais energia e firmeza postural.',
    targetAudience: 'Quem busca sair do sedentarismo com treino agradável e eficiente.',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n1-s2-ex1',
        name: 'Agachamento com Apoio de Mãos (TRX ou Barra)',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '10',
        rest: '60s',
        weight: 'Peso corporal',
        notes: 'O apoio nas mãos dá confiança total na descida mantendo os joelhos alinhados.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n1-s2-ex2',
        name: 'Puxada Alta Neutra no Pulley',
        muscleGroup: 'Costas',
        sets: '3',
        reps: '12',
        rest: '60s',
        weight: 'Carga moderada',
        notes: 'Puxe trazendo a barra na altura do queixo, abrindo o peitoral.',
        youtubeId: 'CAwf7n6Luuc'
      },
      {
        id: 'n1-s2-ex3',
        name: 'Desenvolvimento Sentado com Halteres Leves',
        muscleGroup: 'Ombros',
        sets: '3',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Halter 2 a 4 kg',
        notes: 'Coluna bem apoiada no encosto, suba sem bater os halteres em cima.',
        youtubeId: 'qEwKCR5JCog'
      },
      {
        id: 'n1-s2-ex4',
        name: 'Elevação de Panturrilha em Pé com Apoio',
        muscleGroup: 'Panturrilhas',
        sets: '3',
        reps: '15',
        rest: '45s',
        notes: 'Fundamental para circulação e retorno venoso nas pernas.',
        youtubeId: 'gwLzBJYoWlI'
      },
      {
        id: 'n1-s2-ex5',
        name: 'Abdominal Supra Curto com Apoio de Pés',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '12 a 15',
        rest: '45s',
        notes: 'Suba soltando o ar, sem puxar o pescoço com as mãos.',
        youtubeId: 'Xyd_fa5zoEU'
      }
    ]
  },
  {
    id: 'n1-s3',
    title: '3. Equilíbrio e Confiança',
    levelId: 'nivel-1',
    pillarId: 'equilibrio',
    duration: '18 min',
    focus: 'Estabilidade Postural & Controle Neuromotor',
    objective: 'Desenvolver a firmeza nos pés, tornozelos e quadris, trazendo segurança para caminhar, subir degraus e descer rampas.',
    targetAudience: 'Pessoas que sentem insegurança no caminhar ou buscam prevenir tropeços e quedas.',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n1-s3-ex1',
        name: 'Apoio Unipodal com Suporte Próximo',
        muscleGroup: 'Panturrilhas',
        sets: '3',
        reps: '20 a 30 seg cada perna',
        rest: '45s',
        notes: 'Fique sobre um pé só perto de uma parede ou cadeira para apoio caso precise.',
        youtubeId: 'gwLzBJYoWlI',
        instructions: 'Fixe o olhar em um ponto à frente. Mantenha o joelho da perna de apoio levemente destravado e sinta a musculatura do pé trabalhando.'
      },
      {
        id: 'n1-s3-ex2',
        name: 'Caminhada Calcanhar com Ponta (Tandem Walk)',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '10 passos ida e volta',
        rest: '45s',
        notes: 'Caminhe em linha reta colocando o calcanhar do pé da frente encostado na ponta do pé de trás.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n1-s3-ex3',
        name: 'Subida em Degrau Baixo (Step Up Suave)',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '8 a 10 cada perna',
        rest: '60s',
        weight: 'Peso corporal',
        notes: 'Suba pisando com o pé inteiro no degrau, focando na força da coxa e glúteo.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n1-s3-ex4',
        name: 'Passada Lateral com Apoio de Mão',
        muscleGroup: 'Posterior & Glúteos',
        sets: '3',
        reps: '10 passos para cada lado',
        rest: '45s',
        notes: 'Mantenha os joelhos semiflexionados para ativar o glúteo médio.',
        youtubeId: '1Tq3QdYUuHs'
      },
      {
        id: 'n1-s3-ex5',
        name: 'Perdigueiro com Apoio no Solo (Bird-Dog)',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '8 cada lado alternado',
        rest: '45s',
        notes: 'Em 4 apoios, estenda o braço direito e a perna esquerda ao mesmo tempo mantendo o tronco firme.',
        youtubeId: 'pSHjTRCQxIw'
      }
    ]
  },
  {
    id: 'n1-s4',
    title: '4. Mobilidade para o Dia a Dia',
    levelId: 'nivel-1',
    pillarId: 'mobilidade',
    duration: '20 min',
    focus: 'Saúde Articular & Alívio de Tensões',
    objective: 'Soltar a musculatura das costas, ombros e quadris, devolvendo mobilidade fluida sem impacto.',
    targetAudience: 'Quem passa muito tempo sentada ou sente rigidez matinal nas articulações.',
    coverImage: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n1-s4-ex1',
        name: 'Mobilidade Gato e Vaca no Solo (Cat-Cow)',
        muscleGroup: 'Costas',
        sets: '3',
        reps: '10 respirações completas',
        rest: '30s',
        notes: 'Arredonde as costas puxando o ar e arqueie suavemente soltando o ar.',
        youtubeId: 'GZbfZ033fBQ'
      },
      {
        id: 'n1-s4-ex2',
        name: 'Mobilidade de Tornozelo na Parede',
        muscleGroup: 'Panturrilhas',
        sets: '3',
        reps: '10 cada perna',
        rest: '30s',
        notes: 'Aproxime o joelho da parede sem tirar o calcanhar do chão.',
        youtubeId: 'gwLzBJYoWlI'
      },
      {
        id: 'n1-s4-ex3',
        name: 'Abertura de Peitoral com Bastão ou Toalha',
        muscleGroup: 'Peito',
        sets: '3',
        reps: '12 movimentos suaves',
        rest: '30s',
        notes: 'Segure nas pontas e eleve os braços abrindo o peito sem forçar os ombros.',
        youtubeId: 'eGjt4lk6g34'
      },
      {
        id: 'n1-s4-ex4',
        name: 'Rotação Torácica em 4 Apoios',
        muscleGroup: 'Costas',
        sets: '3',
        reps: '8 cada lado',
        rest: '30s',
        notes: 'Mão na nuca, gire o cotovelo para cima acompanhando com o olhar.',
        youtubeId: '6TSP138827w'
      },
      {
        id: 'n1-s4-ex5',
        name: 'Alongamento Suave de Posterior e Glúteo',
        muscleGroup: 'Posterior & Glúteos',
        sets: '3',
        reps: '30 seg cada perna',
        rest: '30s',
        notes: 'Deite e puxe a coxa em direção ao abdômen respeitando seu limite de conforto.',
        youtubeId: '1Tq3QdYUuHs'
      }
    ]
  },
  {
    id: 'n1-s5',
    title: '5. Cardio Leve e Progressivo',
    levelId: 'nivel-1',
    pillarId: 'condicionamento',
    duration: '22 min',
    focus: 'Capacidade Cardiorrespiratória & Queima Ativa',
    objective: 'Estimular o coração, circulação e respiração em ritmo adaptado, sem impacto nocivo nas articulações.',
    targetAudience: 'Iniciantes que desejam melhorar o fôlego e disposição para as atividades cotidianas.',
    coverImage: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n1-s5-ex1',
        name: 'Caminhada Rítmica com Elevação Suave de Joelhos',
        muscleGroup: 'Cardio & Aquecimento',
        sets: '3',
        reps: '2 minutos contínuos',
        rest: '60s',
        notes: 'Mantenha um ritmo onde ainda consiga falar sem ficar sem ar.',
        youtubeId: 'pSHjTRCQxIw'
      },
      {
        id: 'n1-s5-ex2',
        name: 'Passo Lateral com Toque de Calcanhar (Step Touch)',
        muscleGroup: 'Cardio & Aquecimento',
        sets: '3',
        reps: '90 segundos',
        rest: '45s',
        notes: 'Coordene braços e pernas de forma suave e relaxada.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n1-s5-ex3',
        name: 'Polichinelo Adaptado (Sem Salto)',
        muscleGroup: 'Cardio & Aquecimento',
        sets: '3',
        reps: '45 segundos',
        rest: '45s',
        notes: 'Abra um pé de cada vez para a lateral enquanto ergue os braços.',
        youtubeId: 'Xyd_fa5zoEU'
      },
      {
        id: 'n1-s5-ex4',
        name: 'Golpes de Boxe no Ar (Jabs e Diretos Leves)',
        muscleGroup: 'Ombros',
        sets: '3',
        reps: '1 minuto',
        rest: '45s',
        notes: 'Trabalha ombros, core e ritmo cardíaco sem impacto nas pernas.',
        youtubeId: 'qEwKCR5JCog'
      },
      {
        id: 'n1-s5-ex5',
        name: 'Caminhada Lenta com Respiração Profunda',
        muscleGroup: 'Cardio & Aquecimento',
        sets: '1',
        reps: '3 minutos',
        rest: '0s',
        notes: 'Retorno gradual da frequência cardíaca à calma.',
        youtubeId: 'pSHjTRCQxIw'
      }
    ]
  },

  // ==================== NÍVEL 2: EVOLUIR COM SEGURANÇA ====================
  {
    id: 'n2-s1',
    title: '1. Força Total 40+',
    levelId: 'nivel-2',
    pillarId: 'forca',
    duration: '35 min',
    focus: 'Grandes Cadeias Musculares & Densidade Óssea',
    objective: 'Treinamento resistido integrado para pernas, costas, peito e core com progressão consciente.',
    targetAudience: 'Praticantes regulares que desejam consolidar força e autonomia funcional.',
    coverImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n2-s1-ex1',
        name: 'Agachamento Goblet com Halter ou Kettlebell',
        muscleGroup: 'Quadríceps',
        sets: '4',
        reps: '10 a 12',
        rest: '75s',
        weight: 'Halter 6 a 12 kg',
        notes: 'Segure o peso junto ao peito com cotovelos apontados para baixo. Desça com quadril para trás.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n2-s1-ex2',
        name: 'Supino Reto com Halteres',
        muscleGroup: 'Peito',
        sets: '3',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Halter 6 a 10 kg / lado',
        notes: 'Mantenha as escápulas aduzidas no banco. Controle a descida sentindo o peitoral alongar.',
        youtubeId: '8iPEnn-ltC8'
      },
      {
        id: 'n2-s1-ex3',
        name: 'Remada Curvada com Halteres (Pegada Neutra)',
        muscleGroup: 'Costas',
        sets: '4',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Halter 7 a 10 kg / lado',
        notes: 'Coluna alinhada a 45 graus, puxe os cotovelos para trás apertando as costas.',
        youtubeId: '6TSP138827w'
      },
      {
        id: 'n2-s1-ex4',
        name: 'Levantamento Terra Romeno (RDL) com Halteres',
        muscleGroup: 'Posterior & Glúteos',
        sets: '3',
        reps: '10 a 12',
        rest: '75s',
        weight: 'Halter 8 a 12 kg / lado',
        notes: 'Joelhos levemente destravados, empurre o bumbum para a parede até sentir o posterior.',
        youtubeId: '_oyxCn2iSjU'
      },
      {
        id: 'n2-s1-ex5',
        name: 'Prancha Isométrica Tradicional',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '35 a 45 seg',
        rest: '45s',
        notes: 'Contraia glúteos e abdômen, alinhando cabeça, tronco e quadril.',
        youtubeId: 'pSHjTRCQxIw'
      }
    ]
  },
  {
    id: 'n2-s2',
    title: '2. Superiores com Qualidade',
    levelId: 'nivel-2',
    pillarId: 'forca',
    duration: '32 min',
    focus: 'Postura, Coluna Saudável e Braços Firmes',
    objective: 'Equilibrar a musculatura dos ombros e costas para melhorar a postura e dar firmeza aos braços.',
    targetAudience: 'Quem busca postura elegante e força nos membros superiores.',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n2-s2-ex1',
        name: 'Puxada Alta no Pulley (Lat Pulldown)',
        muscleGroup: 'Costas',
        sets: '4',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Placa 5 a 7',
        notes: 'Puxe com as costas e não com os braços, mantendo peito estufado.',
        youtubeId: 'CAwf7n6Luuc'
      },
      {
        id: 'n2-s2-ex2',
        name: 'Supino Inclinado com Halteres',
        muscleGroup: 'Peito',
        sets: '3',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Halter 6 a 10 kg',
        notes: 'Banco a 30 graus para focar na porção superior do peitoral.',
        youtubeId: '8iPEnn-ltC8'
      },
      {
        id: 'n2-s2-ex3',
        name: 'Remada Unilateral com Apoio no Banco (Serrote)',
        muscleGroup: 'Costas',
        sets: '3',
        reps: '10 a 12 cada lado',
        rest: '60s',
        weight: 'Halter 8 a 14 kg',
        notes: 'Puxe o cotovelo rente às costelas sem girar o tronco.',
        youtubeId: 'roCP6wCXPqo'
      },
      {
        id: 'n2-s2-ex4',
        name: 'Elevação Lateral com Halteres Controlada',
        muscleGroup: 'Ombros',
        sets: '3',
        reps: '12 a 15',
        rest: '45s',
        weight: 'Halter 3 a 5 kg',
        notes: 'Suba até a linha do ombro com controle na descida.',
        youtubeId: '3VcKaXpzqRo'
      },
      {
        id: 'n2-s2-ex5',
        name: 'Tríceps Corda no Pulley + Rosca Martelo (Bi-set)',
        muscleGroup: 'Tríceps',
        sets: '3',
        reps: '10 a 12 cada',
        rest: '60s',
        notes: 'Firmeza e definição funcional para tríceps e bíceps.',
        youtubeId: 'vB5OHsJ3EME'
      }
    ]
  },
  {
    id: 'n2-s3',
    title: '3. Inferiores Fortes',
    levelId: 'nivel-2',
    pillarId: 'forca',
    duration: '38 min',
    focus: 'Coxas, Glúteos e Estabilidade de Joelho',
    objective: 'Fortalecer pernas e quadris para subir escadas, carregar compras e caminhar com agilidade e zero dores articulares.',
    targetAudience: 'Quem busca pernas firmes e sustentação articular para o dia a dia.',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n2-s3-ex1',
        name: 'Leg Press 45º com Amplitude Segura',
        muscleGroup: 'Quadríceps',
        sets: '4',
        reps: '12',
        rest: '75s',
        weight: 'Carga moderada',
        notes: 'Pés na largura dos ombros, não estale os joelhos no final do movimento.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n2-s3-ex2',
        name: 'Afundo Estático ou Búlgaro Adaptado',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '10 cada perna',
        rest: '60s',
        weight: 'Halteres 4 a 8 kg',
        notes: 'Tronco levemente inclinado à frente para focar no glúteo da perna da frente.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n2-s3-ex3',
        name: 'Mesa ou Cadeira Flexora',
        muscleGroup: 'Posterior & Glúteos',
        sets: '4',
        reps: '12',
        rest: '60s',
        weight: 'Placa 4 a 6',
        notes: 'Controle na volta para proteger ligamentos do joelho.',
        youtubeId: '1Tq3QdYUuHs'
      },
      {
        id: 'n2-s3-ex4',
        name: 'Elevação Pélvica com Barra ou Halter',
        muscleGroup: 'Posterior & Glúteos',
        sets: '3',
        reps: '12 a 15',
        rest: '60s',
        weight: 'Halter 10 a 15 kg',
        notes: 'Segure 2 segundos no topo espremendo os glúteos.',
        youtubeId: '8bbE64NuDTU'
      },
      {
        id: 'n2-s3-ex5',
        name: 'Panturrilha em Pé na Máquina ou Degrau',
        muscleGroup: 'Panturrilhas',
        sets: '4',
        reps: '15',
        rest: '45s',
        notes: 'Amplitude total: alongue embaixo e suba no topo da ponta do pé.',
        youtubeId: 'gwLzBJYoWlI'
      }
    ]
  },
  {
    id: 'n2-s4',
    title: '4. Equilíbrio em Movimento',
    levelId: 'nivel-2',
    pillarId: 'equilibrio',
    duration: '28 min',
    focus: 'Coordenação Dinâmica, Agilidade e Core',
    objective: 'Desafiar a estabilidade corporal em movimento dinâmico, treinando reflexos neuromotores rápidos e seguros.',
    targetAudience: 'Praticantes que querem melhorar a resposta reflexa e a segurança em terrenos irregulares.',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n2-s4-ex1',
        name: 'Aviãozinho / Stiff Unipodal com Apoio Leve',
        muscleGroup: 'Posterior & Glúteos',
        sets: '3',
        reps: '8 cada perna',
        rest: '45s',
        notes: 'Equilibre-se em uma perna inclinando o tronco e elevando a outra para trás.',
        youtubeId: '_oyxCn2iSjU'
      },
      {
        id: 'n2-s4-ex2',
        name: 'Deslocamento Lateral com Toque de Solo',
        muscleGroup: 'Cardio & Aquecimento',
        sets: '3',
        reps: '40 segundos',
        rest: '45s',
        notes: 'Passos laterais ágeis sem cruzar os pés, flexionando os joelhos.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n2-s4-ex3',
        name: 'Prancha Lateral com Apoio de Antebraço',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '25 a 30 seg cada lado',
        rest: '45s',
        notes: 'Fortalece oblíquos e protege a coluna lombar contra dores.',
        youtubeId: 'pSHjTRCQxIw'
      },
      {
        id: 'n2-s4-ex4',
        name: 'Agachamento com Elevação na Ponta dos Pés',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '12',
        rest: '45s',
        notes: 'Agache e ao subir finalize ficando na ponta dos pés com equilíbrio.',
        youtubeId: 'gwLzBJYoWlI'
      },
      {
        id: 'n2-s4-ex5',
        name: 'Rotação de Tronco com Elástico (Pallof Press Adaptado)',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '10 cada lado',
        rest: '45s',
        notes: 'Segure a tensão do elástico à frente do peito sem deixar girar.',
        youtubeId: 'taI4XduLpOk'
      }
    ]
  },
  {
    id: 'n2-s5',
    title: '5. Cardio e Resistência',
    levelId: 'nivel-2',
    pillarId: 'condicionamento',
    duration: '30 min',
    focus: 'Capacidade Aeróbia Intervalada & Fôlego',
    objective: 'Aumentar a resistência cardiovascular com intervalos controlados que potencializam o gasto calórico e a oxigenação celular.',
    targetAudience: 'Quem deseja emagrecimento sustentável e fôlego renovado.',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n2-s5-ex1',
        name: 'Intervalado na Esteira / Bike (1 min firme / 1 min leve)',
        muscleGroup: 'Cardio & Aquecimento',
        sets: '5 ciclos',
        reps: '10 minutos no total',
        rest: '0s',
        notes: 'Alterne entre velocidade moderada alta e caminhada de recuperação.',
        youtubeId: 'pSHjTRCQxIw'
      },
      {
        id: 'n2-s5-ex2',
        name: 'Kettlebell Swing Técnico com Quadril Ativo',
        muscleGroup: 'Posterior & Glúteos',
        sets: '3',
        reps: '15',
        rest: '60s',
        weight: 'Kettlebell 6 a 10 kg',
        notes: 'O movimento vem da explosão do quadril e glúteos, não dos ombros.',
        youtubeId: '_oyxCn2iSjU'
      },
      {
        id: 'n2-s5-ex3',
        name: 'Escalador na Caixa ou Banco (Mountain Climbers)',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '30 segundos',
        rest: '45s',
        notes: 'Apoio inclinado reduz impacto nos punhos e na coluna.',
        youtubeId: 'pSHjTRCQxIw'
      },
      {
        id: 'n2-s5-ex4',
        name: 'Pular Corda Imaginária com Ritmo Ágil',
        muscleGroup: 'Panturrilhas',
        sets: '3',
        reps: '45 segundos',
        rest: '45s',
        notes: 'Saltos baixos e amortecidos com a ponta dos pés.',
        youtubeId: 'gwLzBJYoWlI'
      },
      {
        id: 'n2-s5-ex5',
        name: 'Desaquecimento e Alongamento de Peitoral e Pernas',
        muscleGroup: 'Mobilidade',
        sets: '1',
        reps: '3 minutos',
        rest: '0s',
        notes: 'Respire profundamente e relaxe a musculatura.',
        youtubeId: 'eGjt4lk6g34'
      }
    ]
  },

  // ==================== NÍVEL 3: LONGEVIDADE EM MOVIMENTO ====================
  {
    id: 'n3-s1',
    title: '1. Força e Potência Funcional',
    levelId: 'nivel-3',
    pillarId: 'forca',
    duration: '42 min',
    focus: 'Recrutamento Neuromuscular & Vigor Físico',
    objective: 'Preservar fibras musculares rápidas (tipo II), densidade mineral óssea e capacidade de produzir força com controle absoluto.',
    targetAudience: 'Alunas(os) maduras(os) com condicionamento intermediário a avançado.',
    coverImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n3-s1-ex1',
        name: 'Agachamento Livre com Barra ou Halteres',
        muscleGroup: 'Quadríceps',
        sets: '4',
        reps: '8 a 10',
        rest: '90s',
        weight: 'Carga planejada',
        notes: 'Profundidade paralela respeitando a mobilidade de tornozelo e quadril.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n3-s1-ex2',
        name: 'Supino Reto com Halteres Pesados',
        muscleGroup: 'Peito',
        sets: '4',
        reps: '8 a 10',
        rest: '90s',
        weight: 'Halter 10 a 16 kg / lado',
        notes: 'Base firme com pés plantados no chão e arco torácico natural.',
        youtubeId: 'rT7DgCr-3pg'
      },
      {
        id: 'n3-s1-ex3',
        name: 'Remada Curvada com Barra W ou Halteres',
        muscleGroup: 'Costas',
        sets: '4',
        reps: '8 a 10',
        rest: '75s',
        weight: 'Carga moderada a alta',
        notes: 'Puxe firme na altura do umbigo mantendo a coluna travada.',
        youtubeId: '6TSP138827w'
      },
      {
        id: 'n3-s1-ex4',
        name: 'Hip Thrust no Banco com Barra ou Halter',
        muscleGroup: 'Posterior & Glúteos',
        sets: '4',
        reps: '10 a 12',
        rest: '75s',
        weight: 'Carga progressiva',
        notes: 'Glúteos são os maiores estabilizadores da coluna lombar.',
        youtubeId: '8bbE64NuDTU'
      },
      {
        id: 'n3-s1-ex5',
        name: 'Pallof Press na Polia (Anti-rotação de Core)',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '12 cada lado',
        rest: '45s',
        notes: 'Estenda os braços à frente contra a força do cabo sem mover o quadril.',
        youtubeId: 'taI4XduLpOk'
      }
    ]
  },
  {
    id: 'n3-s2',
    title: '2. Desafio de Estabilidade e Mobilidade',
    levelId: 'nivel-3',
    pillarId: 'equilibrio',
    duration: '38 min',
    focus: 'Amplitude Articular Avançada & Força Isométrica',
    objective: 'Integrar mobilidade tridimensional e estabilidade dinâmica em padrões motores desafiadores.',
    targetAudience: 'Pessoas com boa mobilidade que querem desafiar o controle motor fino.',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n3-s2-ex1',
        name: 'Agachamento Cossaco Lateral Controlado',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '8 cada lado',
        rest: '60s',
        weight: 'Peso corporal ou halter leve',
        notes: 'Desça para um lado flexionando o joelho enquanto a outra perna estende com calcanhar no solo.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n3-s2-ex2',
        name: 'Afundo com Rotação Torácica',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '10 cada perna',
        rest: '60s',
        notes: 'Afunde e gire o tronco em direção à perna que está na frente com braços abertos.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n3-s2-ex3',
        name: 'Kettlebell Halo (Círculo em volta da cabeça)',
        muscleGroup: 'Ombros',
        sets: '3',
        reps: '8 voltas cada sentido',
        rest: '45s',
        weight: 'Kettlebell ou halter 4 a 8 kg',
        notes: 'Mobilidade e estabilização ativa do manguito rotador.',
        youtubeId: 'qEwKCR5JCog'
      },
      {
        id: 'n3-s2-ex4',
        name: 'Prancha Dinâmica com Toque no Ombro',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '14 toques alternados',
        rest: '45s',
        notes: 'Toque o ombro oposto com a mão sem deixar o quadril oscilar de um lado para o outro.',
        youtubeId: 'pSHjTRCQxIw'
      },
      {
        id: 'n3-s2-ex5',
        name: 'Alongamento Escorpião e Abertura de Peitoral',
        muscleGroup: 'Mobilidade',
        sets: '3',
        reps: '40 segundos cada lado',
        rest: '30s',
        notes: 'Descompressão total da coluna e flexores de quadril.',
        youtubeId: 'eGjt4lk6g34'
      }
    ]
  },
  {
    id: 'n3-s3',
    title: '3. Treino Metabólico 40+',
    levelId: 'nivel-3',
    pillarId: 'condicionamento',
    duration: '38 min',
    focus: 'Eficiência Mitocondrial & Queima Sustentável',
    objective: 'Combinação de exercícios de força e estímulos cardiovasculares para máxima vitalidade e saúde celular.',
    targetAudience: 'Quem busca treino dinâmico com ritmo e gasto calórico elevado.',
    coverImage: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n3-s3-ex1',
        name: 'Thruster com Halteres (Agachar e Desenvolver)',
        muscleGroup: 'Quadríceps',
        sets: '4',
        reps: '10 a 12',
        rest: '75s',
        weight: 'Halter 4 a 8 kg / lado',
        notes: 'Use a impulsão das pernas ao subir do agachamento para empurrar os halteres acima da cabeça.',
        youtubeId: 'qEwKCR5JCog'
      },
      {
        id: 'n3-s3-ex2',
        name: 'Remada no Pulley + Flexão de Braço (Combo)',
        muscleGroup: 'Costas',
        sets: '3',
        reps: '10 cada',
        rest: '60s',
        notes: 'Transição ágil entre puxar e empurrar mantendo a frequência cardíaca elevada.',
        youtubeId: 'CAwf7n6Luuc'
      },
      {
        id: 'n3-s3-ex3',
        name: 'Kettlebell Clean & Press Unilateral',
        muscleGroup: 'Ombros',
        sets: '3',
        reps: '8 cada lado',
        rest: '60s',
        weight: 'Kettlebell 6 a 10 kg',
        notes: 'Puxe até o ombro e estenda o braço com controle.',
        youtubeId: 'qEwKCR5JCog'
      },
      {
        id: 'n3-s3-ex4',
        name: 'Sprints Intervalados no Remo ou Bike',
        muscleGroup: 'Cardio & Aquecimento',
        sets: '6 tiros',
        reps: '30s forte / 30s leve',
        rest: '0s',
        notes: 'Estímulo anaeróbio controlado que eleva a taxa metabólica basal.',
        youtubeId: 'pSHjTRCQxIw'
      },
      {
        id: 'n3-s3-ex5',
        name: 'Prancha com Elevação Alternada de Pernas',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '12 elevações',
        rest: '45s',
        notes: 'Mantenha a bacia fixa e contraia o glúteo a cada subida.',
        youtubeId: 'pSHjTRCQxIw'
      }
    ]
  },
  {
    id: 'n3-s4',
    title: '4. Pernas e Glúteos Fortes para a Vida',
    levelId: 'nivel-3',
    pillarId: 'forca',
    duration: '45 min',
    focus: 'Anti-Sarcopenia & Potência de Membros Inferiores',
    objective: 'Construir pernas sólidas e glúteos fortes para sustentar a coluna lombar e garantir independência física por décadas.',
    targetAudience: 'Praticantes focadas em firmeza muscular e longevidade articular.',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n3-s4-ex1',
        name: 'Levantamento Terra Sumô com Barra ou Halter',
        muscleGroup: 'Posterior & Glúteos',
        sets: '4',
        reps: '10',
        rest: '90s',
        weight: 'Carga progressiva',
        notes: 'Pés afastados e pontas voltadas para fora. Empurre o chão com os calcanhares.',
        youtubeId: '_oyxCn2iSjU'
      },
      {
        id: 'n3-s4-ex2',
        name: 'Agachamento Búlgaro com Halteres',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '10 cada perna',
        rest: '75s',
        weight: 'Halter 5 a 10 kg / lado',
        notes: 'Pé de trás apoiado no banco, desça até o joelho quase tocar o chão.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n3-s4-ex3',
        name: 'Cadeira Abdutora com Tronco Inclinado à Frente',
        muscleGroup: 'Posterior & Glúteos',
        sets: '4',
        reps: '15',
        rest: '45s',
        weight: 'Placa média',
        notes: 'Inclinar o tronco à frente ativa as fibras superiores do glúteo máximo e médio.',
        youtubeId: '8bbE64NuDTU'
      },
      {
        id: 'n3-s4-ex4',
        name: 'Mesa Flexora com Isometria de 1s no Topo',
        muscleGroup: 'Posterior & Glúteos',
        sets: '4',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Placa 5 a 7',
        notes: 'Equilíbrio essencial entre quadríceps e posteriores.',
        youtubeId: '1Tq3QdYUuHs'
      },
      {
        id: 'n3-s4-ex5',
        name: 'Panturrilha Unilateral no Degrau',
        muscleGroup: 'Panturrilhas',
        sets: '4',
        reps: '15 cada perna',
        rest: '45s',
        notes: 'Segure um halter com uma mão e apoie na parede com a outra para estabilidade.',
        youtubeId: 'gwLzBJYoWlI'
      }
    ]
  },
  {
    id: 'n3-s5',
    title: '5. Circuito Vitalidade Plena',
    levelId: 'nivel-3',
    pillarId: 'forca',
    duration: '45 min',
    focus: 'Força Funcional Global & Autonomia Integral',
    objective: 'Uma sessão completa e revigorante que integra empurrar, puxar, agachar e estabilizar o core.',
    targetAudience: 'Quem deseja o melhor treino geral de corpo inteiro para vitalidade e saúde aos 40+.',
    coverImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&crop=faces,center&w=800&h=1067&q=80',
    exercises: [
      {
        id: 'n3-s5-ex1',
        name: 'Deadlift com Trap Bar ou Halteres Pesados',
        muscleGroup: 'Posterior & Glúteos',
        sets: '4',
        reps: '8 a 10',
        rest: '90s',
        weight: 'Carga desafiadora e segura',
        notes: 'O padrão motor mais completo da vida humana: tirar peso do chão com postura firme.',
        youtubeId: '_oyxCn2iSjU'
      },
      {
        id: 'n3-s5-ex2',
        name: 'Puxada no Pulley com Pegada Supinada',
        muscleGroup: 'Costas',
        sets: '4',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Placa 6 a 8',
        notes: 'Palmas voltadas para você, recrutando costas e bíceps.',
        youtubeId: 'CAwf7n6Luuc'
      },
      {
        id: 'n3-s5-ex3',
        name: 'Desenvolvimento Militar em Pé com Halteres',
        muscleGroup: 'Ombros',
        sets: '3',
        reps: '10 a 12',
        rest: '60s',
        weight: 'Halter 6 a 10 kg',
        notes: 'Em pé, ative o abdômen e os glúteos para blindar a lombar.',
        youtubeId: 'qEwKCR5JCog'
      },
      {
        id: 'n3-s5-ex4',
        name: 'Passada com Halteres (Walking Lunge)',
        muscleGroup: 'Quadríceps',
        sets: '3',
        reps: '12 passos no total',
        rest: '75s',
        weight: 'Halteres 6 a 10 kg',
        notes: 'Passos firmes e estáveis com peito aberto.',
        youtubeId: 'IZxyjW7MPJQ'
      },
      {
        id: 'n3-s5-ex5',
        name: 'Prancha Hollow Body (Canoa) ou Roda Abdominal',
        muscleGroup: 'Abdômen & Core',
        sets: '3',
        reps: '30 a 40 segundos',
        rest: '45s',
        notes: 'Fechamento de ouro para a estabilidade do core e lombar.',
        youtubeId: 'pSHjTRCQxIw'
      }
    ]
  }
];

// Transforma uma sessão da coleção em um WorkoutPlan compatível com o app
export function convertSessionToWorkoutPlan(session: CollectionWorkoutSession, studentName = 'Aluna 40+'): WorkoutPlan {
  const level = LEVELS_40_PLUS.find(l => l.id === session.levelId);
  const pillar = PILLARS_40_PLUS.find(p => p.id === session.pillarId);

  return {
    id: `mf-40plus-${session.id}`,
    studentName: studentName,
    trainerName: 'Equipe Melhor Forma 40+',
    trainerPhone: '5511999999999',
    goal: `${session.title} (${pillar?.name || 'Saúde'})`,
    frequency: level?.title || 'Força para a Vida 40+',
    generalNotes: `🌿 Coleção Força para a Vida 40+: ${session.objective} Respeite seu ritmo e execute com técnica e respiração consciente.`,
    createdAt: new Date().toISOString(),
    sessions: [
      {
        id: session.id,
        name: session.title,
        focus: `${session.focus} • ${session.duration}`,
        exercises: session.exercises
      }
    ]
  };
}
