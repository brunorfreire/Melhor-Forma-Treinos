import { WorkoutPlan, SavedStudentWorkout } from '../types';

export const STUDENTS_STORAGE_KEY = 'mf_treino_students_directory_v1';

/**
 * Retorna todos os alunos/fichas salvos localmente
 */
export function getSavedStudents(): SavedStudentWorkout[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Erro ao carregar histórico de alunos:', err);
    return [];
  }
}

/**
 * Salva ou atualiza a ficha de um aluno no histórico
 */
export function saveStudentWorkout(plan: WorkoutPlan): SavedStudentWorkout[] {
  const currentList = getSavedStudents();
  const studentName = (plan.studentName || 'Aluno Sem Nome').trim();
  
  // Total de exercícios em todas as sessões
  const totalExercises = (plan.sessions || []).reduce(
    (acc, sess) => acc + (sess.exercises?.length || 0),
    0
  );
  const totalSessions = plan.sessions?.length || 0;
  const now = new Date().toISOString();

  // Procura se já existe por plan.id ou por nome exato
  const existingIndex = currentList.findIndex(
    (item) => item.id === plan.id || (item.studentName.toLowerCase() === studentName.toLowerCase() && studentName !== 'Aluno Sem Nome')
  );

  const updatedEntry: SavedStudentWorkout = {
    id: existingIndex >= 0 ? currentList[existingIndex].id : (plan.id || `student-${Date.now()}`),
    studentName,
    trainerName: plan.trainerName || '',
    trainerPhone: plan.trainerPhone || '',
    goal: plan.goal || 'Geral',
    frequency: plan.frequency || '3x a 4x por semana',
    sessionsCount: totalSessions,
    exercisesCount: totalExercises,
    createdAt: existingIndex >= 0 ? currentList[existingIndex].createdAt : (plan.createdAt || now),
    updatedAt: now,
    plan: {
      ...plan,
      id: existingIndex >= 0 ? currentList[existingIndex].id : (plan.id || `student-${Date.now()}`),
      studentName,
      updatedAt: now
    }
  };

  let newList: SavedStudentWorkout[];
  if (existingIndex >= 0) {
    newList = [...currentList];
    newList[existingIndex] = updatedEntry;
  } else {
    newList = [updatedEntry, ...currentList];
  }

  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(newList));
  } catch (err) {
    console.error('Erro ao salvar aluno no LocalStorage:', err);
  }

  return newList;
}

/**
 * Remove um aluno do histórico
 */
export function deleteSavedStudent(id: string): SavedStudentWorkout[] {
  const currentList = getSavedStudents();
  const newList = currentList.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(newList));
  } catch (err) {
    console.error('Erro ao deletar aluno do LocalStorage:', err);
  }
  return newList;
}

/**
 * Duplica uma ficha para criar uma nova fase/treino
 */
export function duplicateSavedStudent(id: string): WorkoutPlan | null {
  const currentList = getSavedStudents();
  const target = currentList.find((item) => item.id === id);
  if (!target) return null;

  const now = new Date().toISOString();
  const newId = `mf-treino-${Date.now()}`;
  const duplicatedPlan: WorkoutPlan = {
    ...JSON.parse(JSON.stringify(target.plan)),
    id: newId,
    studentName: `${target.studentName} (Nova Fase)`,
    createdAt: now,
    updatedAt: now
  };

  saveStudentWorkout(duplicatedPlan);
  return duplicatedPlan;
}

/**
 * Exporta todos os alunos salvos como arquivo JSON para download (Backup 100% seguro)
 */
export function exportStudentsBackupJSON(): void {
  const students = getSavedStudents();
  const payload = {
    app: 'Melhor Forma Treino V1 Lite',
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalStudents: students.length,
    students
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `backup-alunos-melhor-forma-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa um arquivo JSON de backup e mescla com os alunos atuais
 */
export function importStudentsBackupJSON(jsonContent: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonContent);
    let importedStudents: SavedStudentWorkout[] = [];

    if (Array.isArray(data)) {
      importedStudents = data;
    } else if (data && Array.isArray(data.students)) {
      importedStudents = data.students;
    } else {
      return { success: false, count: 0, error: 'Formato de arquivo inválido.' };
    }

    if (importedStudents.length === 0) {
      return { success: false, count: 0, error: 'Nenhum aluno encontrado no arquivo.' };
    }

    const currentList = getSavedStudents();
    const existingIds = new Set(currentList.map((s) => s.id));
    const mergedList = [...currentList];

    let newCount = 0;
    for (const item of importedStudents) {
      if (!item.studentName || !item.plan) continue;

      if (existingIds.has(item.id)) {
        // Atualiza
        const idx = mergedList.findIndex((s) => s.id === item.id);
        if (idx >= 0) mergedList[idx] = item;
      } else {
        // Adiciona
        mergedList.push(item);
        existingIds.add(item.id);
        newCount++;
      }
    }

    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(mergedList));
    return { success: true, count: mergedList.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Erro ao processar JSON.' };
  }
}
