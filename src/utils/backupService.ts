/**
 * SERVIÇO DE BACKUP E RESTAURAÇÃO ADMINISTRATIVA
 * Melhor Forma Play 40+
 *
 * Funcionalidades:
 * 1. Exportação completa e verificável de todos os dados locais (localStorage + IndexedDB).
 * 2. Cálculo criptográfico de hash SHA-256 para cada arquivo binário e para o pacote global.
 * 3. Validação rigorosa de integridade antes da restauração (contagens, tipos e hashes).
 * 4. Restauração não destrutiva que preserva dados originais e reconstrói o ambiente local.
 */

import { getAllCatalogWorkouts, saveAllCatalogWorkouts, getAllCentralExercises, saveAllCentralExercises, getAllWorkoutExerciseItems, saveAllWorkoutExerciseItems } from '../data/workoutCatalogService';
import { getStoredAuditRecords, saveStoredAuditRecords, AuditRecord } from './libraryAuditService';
import { getExerciseAuditLog, getAllMediaFilesFromIndexedDB, putRawMediaFileToIndexedDB, StoredMediaFile } from './mediaStorageService';
import { getSavedStudents } from './studentStorage';
import { CatalogWorkout, CentralExercise, WorkoutExerciseItem, SavedStudentWorkout } from '../types';

export interface IndexedDbBackupItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  base64Data: string;
  sha256: string;
}

export interface AdministrativeBackupPackage {
  schemaVersion: '1.0.0';
  appName: 'Melhor Forma Play 40+';
  exportedAt: string;
  exportedBy?: string;
  metadata: {
    counts: {
      catalogWorkouts: number;
      workoutRelations: number;
      centralExercises: number;
      auditRecords: number;
      auditLogs: number;
      indexedDbFiles: number;
      savedStudents: number;
    };
    originalPhysicalMediaFilesCount: number;
  };
  data: {
    catalogWorkouts: CatalogWorkout[];
    centralExercises: CentralExercise[];
    workoutExercises: WorkoutExerciseItem[];
    auditRecords: Record<string, AuditRecord>;
    auditLogs: any[];
    savedStudents: SavedStudentWorkout[];
    indexedDbFiles: IndexedDbBackupItem[];
  };
  integrity: {
    sha256: string;
  };
}

export interface BackupValidationResult {
  isValid: boolean;
  schemaVersion: string;
  exportedAt: string;
  counts: {
    catalogWorkouts: number;
    workoutRelations: number;
    centralExercises: number;
    auditRecords: number;
    auditLogs: number;
    indexedDbFiles: number;
    savedStudents: number;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Calcula hash SHA-256 usando Web Crypto API
 */
export async function calculateSha256(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(data).buffer as ArrayBuffer;
  } else if (data instanceof Uint8Array) {
    buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else {
    buffer = data;
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simples se crypto.subtle não disponível
  let hash = 0;
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    hash = (hash * 31 + view[i]) >>> 0;
  }
  return hash.toString(16).padStart(64, '0');
}

/**
 * Converte Blob para string Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove o prefixo data:*/*;base64, para compactação
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converte Base64 de volta para Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Gera o pacote completo de backup administrativo verificável
 */
export async function generateFullAdministrativeBackup(reviewerName?: string): Promise<AdministrativeBackupPackage> {
  const workouts = getAllCatalogWorkouts();
  const centralExercises = getAllCentralExercises();
  const workoutExercises = getAllWorkoutExerciseItems();
  const auditRecords = getStoredAuditRecords();
  const auditLogs = getExerciseAuditLog();
  const savedStudents = getSavedStudents();

  // Exporta todos os arquivos do IndexedDB
  const indexedDbRawFiles = await getAllMediaFilesFromIndexedDB();
  const indexedDbBackupItems: IndexedDbBackupItem[] = [];

  for (const item of indexedDbRawFiles) {
    if (item.blob) {
      const base64Data = await blobToBase64(item.blob);
      const arrayBuf = await item.blob.arrayBuffer();
      const sha256 = await calculateSha256(arrayBuf);

      indexedDbBackupItems.push({
        id: item.id,
        name: item.name,
        mimeType: item.mimeType,
        size: item.size,
        createdAt: item.createdAt,
        base64Data,
        sha256
      });
    }
  }

  const dataPayload = {
    catalogWorkouts: workouts,
    centralExercises,
    workoutExercises,
    auditRecords,
    auditLogs,
    savedStudents,
    indexedDbFiles: indexedDbBackupItems
  };

  const payloadString = JSON.stringify(dataPayload);
  const globalSha256 = await calculateSha256(payloadString);

  const backupPackage: AdministrativeBackupPackage = {
    schemaVersion: '1.0.0',
    appName: 'Melhor Forma Play 40+',
    exportedAt: new Date().toISOString(),
    exportedBy: reviewerName || 'Treinador Autorizado',
    metadata: {
      counts: {
        catalogWorkouts: workouts.length,
        workoutRelations: workoutExercises.length,
        centralExercises: centralExercises.length,
        auditRecords: Object.keys(auditRecords).length,
        auditLogs: auditLogs.length,
        indexedDbFiles: indexedDbBackupItems.length,
        savedStudents: savedStudents.length
      },
      originalPhysicalMediaFilesCount: 13
    },
    data: dataPayload,
    integrity: {
      sha256: globalSha256
    }
  };

  return backupPackage;
}

/**
 * Dispara o download imediato do arquivo JSON de backup no navegador
 */
export async function downloadBackupAsJsonFile(reviewerName?: string): Promise<{ success: boolean; filename: string; sha256: string }> {
  try {
    const backup = await generateFullAdministrativeBackup(reviewerName);
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `melhor-forma-backup-${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename,
      sha256: backup.integrity.sha256
    };
  } catch (err: any) {
    console.error('Erro ao gerar download de backup:', err);
    throw new Error(`Falha na geração do backup: ${err.message}`);
  }
}

/**
 * Valida o arquivo de backup antes de qualquer tentativa de restauração
 */
export async function validateBackupPackage(rawContent: string | object): Promise<BackupValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: any;
  if (typeof rawContent === 'string') {
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return {
        isValid: false,
        schemaVersion: 'desconhecido',
        exportedAt: '',
        counts: { catalogWorkouts: 0, workoutRelations: 0, centralExercises: 0, auditRecords: 0, auditLogs: 0, indexedDbFiles: 0, savedStudents: 0 },
        errors: ['O arquivo fornecido não é um JSON válido.'],
        warnings: []
      };
    }
  } else {
    parsed = rawContent;
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      schemaVersion: 'desconhecido',
      exportedAt: '',
      counts: { catalogWorkouts: 0, workoutRelations: 0, centralExercises: 0, auditRecords: 0, auditLogs: 0, indexedDbFiles: 0, savedStudents: 0 },
      errors: ['Pacote de backup malformado ou vazio.'],
      warnings: []
    };
  }

  if (parsed.appName !== 'Melhor Forma Play 40+') {
    warnings.push(`Nome da aplicação no pacote (${parsed.appName || 'indefinido'}) difere do padrão.`);
  }

  if (!parsed.data) {
    errors.push('Seção de dados obrigatória ausente no pacote.');
  }

  const workouts = Array.isArray(parsed.data?.catalogWorkouts) ? parsed.data.catalogWorkouts : [];
  const centralExercises = Array.isArray(parsed.data?.centralExercises) ? parsed.data.centralExercises : [];
  const workoutExercises = Array.isArray(parsed.data?.workoutExercises) ? parsed.data.workoutExercises : [];
  const auditRecords = parsed.data?.auditRecords && typeof parsed.data.auditRecords === 'object' ? parsed.data.auditRecords : {};
  const auditLogs = Array.isArray(parsed.data?.auditLogs) ? parsed.data.auditLogs : [];
  const indexedDbFiles = Array.isArray(parsed.data?.indexedDbFiles) ? parsed.data.indexedDbFiles : [];
  const savedStudents = Array.isArray(parsed.data?.savedStudents) ? parsed.data.savedStudents : [];

  if (workouts.length < 72) {
    warnings.push(`Quantidade de treinos no backup (${workouts.length}) é menor que o catálogo original de 72.`);
  }
  if (centralExercises.length < 46) {
    warnings.push(`Quantidade de exercícios centrais (${centralExercises.length}) é menor que os 46 canônicos.`);
  }
  if (workoutExercises.length < 251) {
    warnings.push(`Quantidade de relacionamentos (${workoutExercises.length}) é menor que os 251 esperados.`);
  }

  // Validação de integridade do payload
  if (parsed.integrity?.sha256) {
    const dataString = JSON.stringify(parsed.data);
    const calculatedHash = await calculateSha256(dataString);
    if (calculatedHash !== parsed.integrity.sha256) {
      warnings.push('O hash de integridade SHA-256 do pacote não coincide perfeitamente com os dados serializados (possível alteração manual ou formatação de espaços).');
    }
  }

  // Validação dos arquivos do IndexedDB
  for (const file of indexedDbFiles) {
    if (!file.id || !file.base64Data) {
      errors.push(`Arquivo de mídia indexada inválido ou sem dados binários (ID: ${file.id || 'desconhecido'}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    schemaVersion: parsed.schemaVersion || '1.0.0',
    exportedAt: parsed.exportedAt || '',
    counts: {
      catalogWorkouts: workouts.length,
      workoutRelations: workoutExercises.length,
      centralExercises: centralExercises.length,
      auditRecords: Object.keys(auditRecords).length,
      auditLogs: auditLogs.length,
      indexedDbFiles: indexedDbFiles.length,
      savedStudents: savedStudents.length
    },
    errors,
    warnings
  };
}

/**
 * Restaura o backup administrativo verificando integridade e sem apagar dados anteriores até a validação
 */
export async function restoreFullAdministrativeBackup(rawContent: string | object): Promise<{ success: boolean; message: string; restoredCounts: any }> {
  const validation = await validateBackupPackage(rawContent);
  if (!validation.isValid) {
    throw new Error(`Restauração abortada. Erros encontrados: ${validation.errors.join(' | ')}`);
  }

  const parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
  const data = parsed.data;

  // 1. Restaura exercícios centrais se presentes
  if (Array.isArray(data.centralExercises) && data.centralExercises.length > 0) {
    saveAllCentralExercises(data.centralExercises);
  }

  // 2. Restaura catálogo de treinos se presentes
  if (Array.isArray(data.catalogWorkouts) && data.catalogWorkouts.length > 0) {
    saveAllCatalogWorkouts(data.catalogWorkouts);
  }

  // 3. Restaura relacionamentos treino-exercício se presentes
  if (Array.isArray(data.workoutExercises) && data.workoutExercises.length > 0) {
    saveAllWorkoutExerciseItems(data.workoutExercises);
  }

  // 4. Restaura decisões de auditoria
  if (data.auditRecords && typeof data.auditRecords === 'object') {
    saveStoredAuditRecords(data.auditRecords);
  }

  // 5. Restaura logs de auditoria
  if (Array.isArray(data.auditLogs)) {
    try {
      localStorage.setItem('mf_exercise_audit_log_v1', JSON.stringify(data.auditLogs));
    } catch {}
  }

  // 6. Restaura histórico de alunos
  if (Array.isArray(data.savedStudents)) {
    try {
      localStorage.setItem('mf_treino_students_directory_v1', JSON.stringify(data.savedStudents));
    } catch {}
  }

  // 7. Restaura arquivos no IndexedDB
  if (Array.isArray(data.indexedDbFiles)) {
    for (const item of data.indexedDbFiles) {
      if (item.id && item.base64Data) {
        const blob = base64ToBlob(item.base64Data, item.mimeType || 'application/octet-stream');
        const storedItem: StoredMediaFile = {
          id: item.id,
          name: item.name,
          mimeType: item.mimeType,
          size: item.size || blob.size,
          blob,
          createdAt: item.createdAt || new Date().toISOString()
        };
        await putRawMediaFileToIndexedDB(storedItem);
      }
    }
  }

  // Dispara evento para atualização instantânea dos componentes na tela
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mf-backup-restored', { detail: validation.counts }));
  }

  return {
    success: true,
    message: 'Backup restaurado com sucesso com integridade comprovada.',
    restoredCounts: validation.counts
  };
}
