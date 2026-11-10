/**
 * TESTES UNITÁRIOS E DE INTEGRAÇÃO DO MF ASSIST & SUPORTE 40+
 * Executado via: npx tsx src/services/mfAssist.test.ts
 */

import { 
  findBestFAQMatches, 
  normalizeText, 
  MF_ASSIST_KNOWLEDGE_BASE 
} from './mfAssistKnowledgeBase';
import { 
  buildWhatsAppMessage 
} from './supportService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

function runTests() {
  console.log('🧪 Iniciando testes do MF Assist e Suporte 40+...\n');

  // Teste 1: Normalização de texto
  console.log('1. Testando normalização de texto:');
  assert(normalizeText('Olá, Treinador!') === 'ola, treinador!', 'Deveria remover acentos e minúsculas');
  assert(normalizeText('RECUPERAÇÃO ATIVA') === 'recuperacao ativa', 'Deveria normalizar recuperação ativa');
  console.log('  ✅ normalização de texto aprovada.');

  // Teste 2: Base de conhecimento possui todos os tópicos fundamentais
  console.log('\n2. Testando integridade da base de conhecimento:');
  assert(MF_ASSIST_KNOWLEDGE_BASE.length >= 10, 'A base curada deve conter pelo menos 10 artigos');
  
  const categories = new Set(MF_ASSIST_KNOWLEDGE_BASE.map(f => f.category));
  assert(categories.has('minha_semana'), 'Deve ter categoria minha_semana');
  assert(categories.has('catalogo'), 'Deve ter categoria catalogo');
  assert(categories.has('execucao_guiada'), 'Deve ter categoria execucao_guiada');
  assert(categories.has('cronometro'), 'Deve ter categoria cronometro');
  assert(categories.has('evolucao'), 'Deve ter categoria evolucao');
  assert(categories.has('acessibilidade'), 'Deve ter categoria acessibilidade');
  assert(categories.has('conta_acesso'), 'Deve ter categoria conta_acesso');
  assert(categories.has('suporte_treinador'), 'Deve ter categoria suporte_treinador');
  console.log('  ✅ Todas as categorias fundamentais estão presentes.');

  // Teste 3: Busca inteligente de perguntas frequentes
  console.log('\n3. Testando correspondência de dúvidas frequentes:');

  const q1 = findBestFAQMatches('Como funciona a Minha Semana em 3 passos?');
  assert(q1.length > 0, 'Deve encontrar resultado para Minha Semana');
  assert(q1[0].faq.category === 'minha_semana', 'Resultado deve ser da categoria minha_semana');
  console.log('  ✅ Dúvida sobre Minha Semana correspondida com sucesso.');

  const q2 = findBestFAQMatches('O que significa dia de recuperação ativa?');
  assert(q2.length > 0, 'Deve encontrar resultado para recuperação ativa');
  assert(q2[0].faq.id === 'faq-recuperacao-ativa', 'Resultado deve ser faq-recuperacao-ativa');
  console.log('  ✅ Dúvida sobre Recuperação Ativa correspondida com sucesso.');

  const q3 = findBestFAQMatches('Como trocar um treino planejado na minha semana?');
  assert(q3.length > 0, 'Deve encontrar resultado para trocar treino');
  assert(q3[0].faq.id === 'faq-trocar-treino-planejado', 'Resultado deve ser faq-trocar-treino-planejado');
  console.log('  ✅ Dúvida sobre trocar treino correspondida com sucesso.');

  const q4 = findBestFAQMatches('Quantos treinos tem no catalogo?');
  assert(q4.length > 0, 'Deve encontrar resultado para catálogo');
  assert(q4[0].faq.id === 'faq-catalogo-treinos', 'Resultado deve ser faq-catalogo-treinos');
  console.log('  ✅ Dúvida sobre catálogo de 72 treinos correspondida com sucesso.');

  const q5 = findBestFAQMatches('Como aumentar o tamanho das letras e fonte?');
  assert(q5.length > 0, 'Deve encontrar resultado para acessibilidade/fonte');
  assert(q5[0].faq.id === 'faq-acessibilidade-letras', 'Resultado deve ser faq-acessibilidade-letras');
  console.log('  ✅ Dúvida sobre acessibilidade de fonte correspondida com sucesso.');

  const q6 = findBestFAQMatches('Esqueci minha senha e nao consigo entrar na conta');
  assert(q6.length > 0, 'Deve encontrar resultado para login/senha');
  assert(q6[0].faq.id === 'faq-problemas-login-acesso', 'Resultado deve ser faq-problemas-login-acesso');
  console.log('  ✅ Dúvida sobre problemas de login/senha correspondida com sucesso.');

  const q7 = findBestFAQMatches('Posso falar direto com o treinador Bruno Freire no WhatsApp?');
  assert(q7.length > 0, 'Deve encontrar resultado para treinador Bruno Freire');
  assert(q7[0].faq.id === 'faq-suporte-bruno-freire', 'Resultado deve ser faq-suporte-bruno-freire');
  console.log('  ✅ Dúvida sobre contato com Bruno Freire correspondida com sucesso.');

  // Teste 4: Construtor de mensagem do WhatsApp
  console.log('\n4. Testando formatação de mensagem para o WhatsApp com Bruno Freire:');
  const waMsg = buildWhatsAppMessage({
    userName: 'Maria Aparecida',
    subject: 'Adaptação de agachamento',
    questionSummary: 'Sinto um leve desconforto no joelho ao agachar com carga.'
  });

  assert(waMsg.includes('Olá, treinador Bruno Freire!'), 'Deve conter saudação formal a Bruno Freire');
  assert(waMsg.includes('Maria Aparecida'), 'Deve conter o nome do aluno');
  assert(waMsg.includes('Assinante Premium'), 'Deve identificar status de assinante Premium');
  assert(waMsg.includes('Adaptação de agachamento'), 'Deve conter o assunto');
  assert(waMsg.includes('desconforto no joelho'), 'Deve conter os detalhes da dúvida');
  assert(waMsg.includes('horário de atendimento'), 'Deve mencionar respeito ao horário comercial');
  console.log('  ✅ Mensagem estruturada para o WhatsApp validada com sucesso.');

  console.log('\n🎉 Todos os testes do MF Assist foram aprovados com 100% de sucesso!');
}

runTests();
