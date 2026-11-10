/**
 * BASE DE CONHECIMENTO OFICIAL E CURADA - MF ASSIST 40+
 * Melhor Forma Play 40+
 * 
 * Fonte primária e revisada de respostas para dúvidas sobre o aplicativo,
 * funcionalidades (Minha Semana, Catálogo, Execução Guiada, Cronômetro, Evolução),
 * fisiologia básica para pessoas 40+, e regras de atendimento.
 */

export interface FAQItem {
  id: string;
  category: 'minha_semana' | 'catalogo' | 'execucao_guiada' | 'cronometro' | 'evolucao' | 'acessibilidade' | 'conta_acesso' | 'suporte_treinador' | 'geral';
  title: string;
  shortQuestion: string;
  keywords: string[];
  answer: string;
  practicalSteps?: string[];
  relatedTopics?: string[];
}

export const MF_ASSIST_KNOWLEDGE_BASE: FAQItem[] = [
  {
    id: 'faq-minha-semana-como-funciona',
    category: 'minha_semana',
    title: 'Como funciona a Minha Semana?',
    shortQuestion: 'Como organizar minha semana de treinos?',
    keywords: ['minha semana', 'semana', 'organizar', 'planejar', 'dias', 'rotina', 'agenda', 'frequencia', 'disponibilidade'],
    answer: 'A funcionalidade Minha Semana permite que você organize sua rotina de treinos de acordo com a sua disponibilidade real, sem rigidez e sem culpa. Você pode planejar quantos dias quer treinar (de 1 a 7 dias) e em quais dias da semana prefere se exercitar.',
    practicalSteps: [
      'Na página inicial, toque no botão "INICIE AQUI" ou selecione "Semana" na barra de navegação inferior.',
      'Se for sua primeira vez, o assistente "Minha Semana em 3 Passos" guiará você: 1) Quantos dias? 2) Quais dias? 3) Confirmação.',
      'Você pode escolher modelos educativos (como 2, 3 ou 4 dias balanceados) ou consultar a programação do treinador.',
      'Nos dias sem treino de força, você pode manter como "Descanso" ou "Recuperação Ativa".'
    ],
    relatedTopics: ['faq-recuperacao-ativa', 'faq-trocar-treino-planejado', 'faq-tres-passos-wizard']
  },
  {
    id: 'faq-tres-passos-wizard',
    category: 'minha_semana',
    title: 'O que é o Minha Semana em 3 Passos?',
    shortQuestion: 'Como funciona o assistente em 3 passos?',
    keywords: ['3 passos', 'tres passos', 'wizard', 'passo a passo', 'assistente', 'inicie aqui', 'iniciar'],
    answer: 'É um assistente visual simplificado feito especialmente para pessoas 40+, evitando termos técnicos complicados. Ele divide o planejamento em 3 etapas diretas: Passo 1 (Quantos dias por semana você pode treinar?), Passo 2 (Quais dias da semana?) e Passo 3 (Confirmação com resumo e modelos educativos sugeridos).',
    practicalSteps: [
      'Toque no botão principal "INICIE AQUI" na Home.',
      'Escolha a quantidade de dias que se encaixa na sua rotina.',
      'Marque os dias da semana desejados (ex: Segunda, Quarta e Sexta).',
      'Confirme para gerar seu calendário personalizado.'
    ],
    relatedTopics: ['faq-minha-semana-como-funciona', 'faq-recuperacao-ativa']
  },
  {
    id: 'faq-recuperacao-ativa',
    category: 'minha_semana',
    title: 'O que é Recuperação Ativa e por que o descanso é importante?',
    shortQuestion: 'O que é recuperação ativa e dia de descanso?',
    keywords: ['recuperacao', 'recuperacao ativa', 'descanso', 'regenerativo', 'caminhada', 'alongamento', 'dor', 'fadiga', 'articulacao'],
    answer: 'Para pessoas acima de 40 anos, a recuperação é tão importante quanto o treino. A Recuperação Ativa consiste em atividades leves que estimulam a circulação sanguínea sem sobrecarregar as articulações ou os músculos — como caminhada leve, alongamentos suaves ou mobilidade articular.',
    practicalSteps: [
      'Selecione um dia no calendário da "Minha Semana" e marque como "Recuperação Ativa".',
      'Pratique de 15 a 30 minutos de caminhada ao ar livre ou exercícios de mobilidade do catálogo.',
      'Respeite os sinais de fadiga: o descanso adequado reconstrói as fibras musculares e protege as articulações.'
    ],
    relatedTopics: ['faq-minha-semana-como-funciona', 'faq-catalogo-treinos']
  },
  {
    id: 'faq-trocar-treino-planejado',
    category: 'minha_semana',
    title: 'Como trocar um treino planejado para outro dia?',
    shortQuestion: 'Posso alterar o treino de um dia na semana?',
    keywords: ['trocar', 'trocar treino', 'mudar dia', 'mudar treino', 'substituir', 'alterar', 'trocar sessao', 'reagendar', 'imprevisto'],
    answer: 'Sim! Imprevistos acontecem e a flexibilidade é essencial na vida 40+. Você pode alterar o foco de qualquer dia ou substituir a sessão cadastrada por qualquer outro treino do catálogo a qualquer momento.',
    practicalSteps: [
      'Abra a tela "Minha Semana".',
      'Toque no card do dia que você deseja alterar.',
      'Toque em "Trocar Treino" ou escolha outro foco/sessão no seletor.',
      'Se preferir, toque em "Reorganizar com Assistente" para refazer a semana completa em 3 passos.'
    ],
    relatedTopics: ['faq-minha-semana-como-funciona', 'faq-catalogo-treinos']
  },
  {
    id: 'faq-catalogo-treinos',
    category: 'catalogo',
    title: 'Como funciona o catálogo de 72 treinos?',
    shortQuestion: 'Quais treinos estão disponíveis no catálogo?',
    keywords: ['catalogo', '72 treinos', 'colecoes', 'colecao', 'superiores', 'inferiores', 'full body', 'cardio', 'mobilidade', 'forca 40+'],
    answer: 'O catálogo do Melhor Forma Play conta com 72 sessões completas elaboradas para a longevidade e força após os 40 anos, distribuídas em 6 grandes coleções: Força 40+, Membros Superiores, Membros Inferiores, Full Body, Cardiorrespiratório e Mobilidade & Equilíbrio.',
    practicalSteps: [
      'Toque em "Treinos" na barra inferior ou em "Coleção 40+" no menu Mais.',
      'Use os filtros rápidos por duração (15, 20, 30 e 40+ minutos) e nível (iniciante, intermediário e avançado).',
      'Filtre por grupamento muscular para encontrar exatamente o treino do dia.',
      'Alunos Free têm acesso a sessões essenciais; o catálogo completo é liberado no Plano Premium.'
    ],
    relatedTopics: ['faq-execucao-guiada', 'faq-suporte-bruno-freire']
  },
  {
    id: 'faq-execucao-guiada',
    category: 'execucao_guiada',
    title: 'Como funciona a Execução Guiada dos exercícios?',
    shortQuestion: 'Como iniciar e usar a Execução Guiada?',
    keywords: ['execucao guiada', 'iniciar treino', 'guiada', 'video', 'postura', 'instrucoes', 'series', 'repeticoes', 'como fazer'],
    answer: 'A Execução Guiada orienta você exercício por exercício, mostrando a demonstração em vídeo validada, a contagem de séries e repetições recomendadas, e as orientações de segurança para a postura correta.',
    practicalSteps: [
      'Abra o card do treino escolhido no catálogo ou na Minha Semana.',
      'Toque no botão "Iniciar Treino Guiado" ou "Treinar Agora".',
      'Assista à demonstração do movimento com atenção à postura e aos pontos de segurança.',
      'Ao concluir cada série, toque em "Concluir Série" para acionar o cronômetro de descanso.'
    ],
    relatedTopics: ['faq-cronometro-descanso', 'faq-catalogo-treinos']
  },
  {
    id: 'faq-cronometro-descanso',
    category: 'cronometro',
    title: 'Como funciona o cronômetro de descanso?',
    shortQuestion: 'Como usar o cronômetro entre as séries?',
    keywords: ['cronometro', 'descanso', 'tempo', 'pausa', 'recuperar', 'segundos', 'intervalo'],
    answer: 'O cronômetro de descanso é ativado automaticamente ao concluir uma série ou pode ser iniciado manualmente. O tempo de intervalo prescrito permite que o músculo recupere suas reservas energéticas antes da próxima repetição, reduzindo o risco de lesões articulares.',
    practicalSteps: [
      'Durante o treino, o cronômetro inicia a contagem regressiva recomendada (ex: 45s a 90s).',
      'Você pode pausar, adicionar +15 segundos ou pular o descanso se já estiver pronto.',
      'Um sinal visual e sonoro discreto avisa quando for a hora da próxima série.'
    ],
    relatedTopics: ['faq-execucao-guiada']
  },
  {
    id: 'faq-minha-evolucao',
    category: 'evolucao',
    title: 'Como acompanhar Minha Evolução?',
    shortQuestion: 'Onde vejo meu histórico e progresso?',
    keywords: ['evolucao', 'historico', 'progresso', 'minutos', 'treinos concluidos', 'frequencia', 'consistencia'],
    answer: 'Na tela "Minha Evolução", você visualiza seus dados reais de assiduidade: total de treinos concluídos, minutos acumulados de movimento, frequência semanal e distribuição por grupamentos musculares — sem números fictícios ou calorias inventadas.',
    practicalSteps: [
      'Abra o menu "Mais" na barra inferior e selecione "Minha Evolução".',
      'Veja o resumo dos últimos 7 e 30 dias de treinos.',
      'Consulte quais áreas do corpo foram mais trabalhadas na semana.'
    ],
    relatedTopics: ['faq-minha-semana-como-funciona']
  },
  {
    id: 'faq-acessibilidade-letras',
    category: 'acessibilidade',
    title: 'Como aumentar o tamanho das letras do aplicativo?',
    shortQuestion: 'Como aumentar a fonte para facilitar a leitura?',
    keywords: ['letra', 'letras', 'fonte', 'tamanho', 'aumentar texto', 'enxergar', 'acessibilidade', 'aa', 'visibilidade'],
    answer: 'O Melhor Forma Play possui recurso exclusivo de acessibilidade para aumentar o tamanho dos textos em 3 níveis: Normal (100%), Grande (110%) e Extra Grande (120%), facilitando a leitura durante os treinos sem óculos.',
    practicalSteps: [
      'No topo da tela ou dentro do menu "Mais", localize o botão com o ícone "Aa".',
      'Toque no botão para alternar entre Normal, Grande (+10%) e Extra Grande (+20%).',
      'Sua preferência é salva automaticamente e mantida nas próximas vezes que você abrir o app.'
    ],
    relatedTopics: ['faq-minha-semana-como-funciona']
  },
  {
    id: 'faq-problemas-login-acesso',
    category: 'conta_acesso',
    title: 'Estou com problemas para entrar na minha conta ou esqueci a senha',
    shortQuestion: 'Como recuperar minha senha ou resolver erro de login?',
    keywords: ['login', 'senha', 'esqueci', 'entrar', 'recuperar', 'email', 'acesso', 'conta', 'bloqueado', 'nao consigo entrar'],
    answer: 'Se você esqueceu sua senha ou não está conseguindo acessar sua conta, você pode solicitar a redefinição de senha com segurança por e-mail, sem precisar assinar o plano Premium para resolver problemas de acesso.',
    practicalSteps: [
      'Na tela de identificação, toque em "Esqueci minha senha" ou acesse a rota de recuperação.',
      'Digite seu e-mail cadastrado e toque em "Enviar Instruções".',
      'Verifique sua caixa de entrada e também a pasta de Lixo Eletrônico / Spam.',
      'Clique no link seguro recebido para cadastrar uma nova senha e retorne ao aplicativo.',
      'Se o problema persistir, envie uma mensagem pelo formulário de suporte técnico aqui no MF Assist.'
    ],
    relatedTopics: ['faq-suporte-bruno-freire']
  },
  {
    id: 'faq-suporte-bruno-freire',
    category: 'suporte_treinador',
    title: 'Como falar com o treinador Bruno Freire?',
    shortQuestion: 'Posso tirar dúvidas com o treinador Bruno Freire?',
    keywords: ['bruno freire', 'treinador', 'professor', 'whatsapp', 'falar', 'contato', 'suporte', 'duvida', 'ajuda personalizada'],
    answer: 'O atendimento e orientação direta via WhatsApp com o treinador Bruno Freire é um benefício exclusivo para alunos com assinatura Premium ativa. Para alunos do plano Free, todas as dúvidas sobre o aplicativo, metodologia e treinos são respondidas aqui pelo MF Assist.',
    practicalSteps: [
      'Se você é aluno Premium e sua dúvida não foi resolvida aqui, toque em "Não" na pergunta de resolução abaixo para liberar o botão "Falar com Bruno Freire".',
      'O app preparará um resumo do seu assunto para você revisar antes de abrir o WhatsApp.',
      'O atendimento do treinador ocorre em horário comercial: de segunda a sexta, das 8h às 18h (não é atendimento 24/7).',
      'Se você é aluno Free e deseja ter acesso ao acompanhamento direto com Bruno Freire e ao catálogo de 72 treinos, conheça as condições do Plano Premium.'
    ],
    relatedTopics: ['faq-minha-semana-como-funciona', 'faq-catalogo-treinos']
  }
];

export interface MatchResult {
  faq: FAQItem;
  score: number;
  matchedKeywords: string[];
}

/**
 * Normaliza strings para busca sem acentos e em minúsculas
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Encontra as melhores respostas na base de conhecimento curada
 */
export function findBestFAQMatches(query: string, maxResults: number = 3): MatchResult[] {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return [];

  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return [];

  const results: MatchResult[] = [];

  for (const faq of MF_ASSIST_KNOWLEDGE_BASE) {
    let score = 0;
    const matchedKeywords: string[] = [];

    const normTitle = normalizeText(faq.title);
    const normQuestion = normalizeText(faq.shortQuestion);
    const normAnswer = normalizeText(faq.answer);

    // 1. Correspondência no título ou pergunta
    if (normTitle.includes(cleanQuery) || normQuestion.includes(cleanQuery)) {
      score += 70;
    }

    // Sobreposição de palavras do título
    for (const qw of queryWords) {
      if (normTitle.includes(qw)) {
        score += 20;
      }
      if (normQuestion.includes(qw)) {
        score += 15;
      }
    }

    // 2. Correspondência de palavras-chave
    for (const kw of faq.keywords) {
      const normKw = normalizeText(kw);
      if (cleanQuery.includes(normKw)) {
        score += 35;
        matchedKeywords.push(kw);
      } else {
        // Verifica se palavras individuais batem com a keyword exata
        for (const qw of queryWords) {
          if (normKw === qw) {
            score += 18;
            if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
          } else if (normKw.includes(qw) && qw.length >= 4) {
            score += 10;
            if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
          }
        }
      }
    }

    // 3. Correspondência no texto da resposta
    for (const qw of queryWords) {
      if (normAnswer.includes(qw)) {
        score += 5;
      }
    }

    if (score > 10) {
      results.push({ faq, score, matchedKeywords });
    }
  }

  // Ordena pelo maior score
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}
