import { WorkoutPlan, WorkoutSession } from '../types';

export function formatWhatsAppRoutineMessage(plan: WorkoutPlan, shareUrl: string): string {
  const sessionsSummary = plan.sessions
    .map(s => `• *${s.name}*: ${s.exercises.length} exercícios`)
    .join('\n');

  const trainerHeader = plan.trainerName ? `👨‍🏫 *Treinador:* ${plan.trainerName}\n` : '';
  const goalHeader = plan.goal ? `🎯 *Objetivo:* ${plan.goal}\n` : '';
  const freqHeader = plan.frequency ? `📅 *Frequência:* ${plan.frequency}\n` : '';

  return `🏋️‍♂️ *FICHA DE TREINO - MELHOR FORMA* 🏋️‍♂️

👤 *Aluno(a):* ${plan.studentName || 'Atleta'}
${trainerHeader}${goalHeader}${freqHeader}
📋 *Divisão do Treino:*
${sessionsSummary}

📲 *ACESSE SEU TREINO COMPLETO PELO CELULAR:*
${shareUrl}

✨ *Vantagens na sua ficha:*
✅ Sem necessidade de cadastro ou senha
🎥 Vídeos demonstrativos de cada exercício direto no app (YouTube)
⏱️ Cronômetro de descanso integrado
📝 Anotações e cargas salvas direto no seu aparelho!

Bons treinos! Foco na execução! 💪🔥`;
}

export function formatStudentFinishedMessage(plan: WorkoutPlan, session: WorkoutSession): string {
  return `Fala ${plan.trainerName || 'Treinador'}! 🔥 
Acabei de finalizar o *${session.name}* (${session.exercises.length} exercícios concluídos) na minha ficha *Melhor Forma*! 💪🏋️‍♂️`;
}

export function createWhatsAppShareLink(phone: string | undefined, message: string): string {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const encodedMsg = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedMsg}`;
}
