/**
 * SERVIÇO DE ARMAZENAMENTO E UPLOAD DE MÍDIAS (GIF, WEBP, MP4)
 * Melhor Forma Play 40+
 *
 * Arquitetura Híbrida e Resiliente:
 * 1. Suporte nativo a IndexedDB para armazenamento persistente de mídias no navegador (sem limite de 5MB do localStorage).
 * 2. Suporte automático a Supabase Storage (bucket 'exercise-media') caso as credenciais estejam configuradas no .env.
 * 3. Validação estrita de tipo de arquivo (image/gif, image/webp, video/mp4).
 * 4. Validação de tamanho máximo (GIF/WebP até 20MB, MP4 até 50MB).
 * 5. Registro de auditoria de alterações (histórico de modificações do treinador).
 */

import { getSupabaseConfigStatus } from './supabaseClient';

export interface StoredMediaFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string; // Cache de data URL para compatibilidade imediata
  blob?: Blob;
  createdAt: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  mediaType?: 'image' | 'video';
  mimeType?: string;
  fileSize?: number;
  storageTarget: 'supabase_storage' | 'indexeddb_local';
  error?: string;
}

export interface ExerciseAuditLogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  action: 'criado' | 'editado' | 'midia_substituida' | 'status_alterado';
  details: string;
  timestamp: string;
  author: string;
}

const DB_NAME = 'mf_play_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';
const AUDIT_LOG_KEY = 'mf_exercise_audit_log_v1';

// Cache em memória de blob URLs para renderização síncrona instantânea
const memoryUrlCache = new Map<string, string>();

/**
 * Abre ou inicializa o banco de dados IndexedDB
 */
function openMediaDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB.'));
  });
}

/**
 * Salva um arquivo no IndexedDB
 */
export async function saveMediaToIndexedDB(file: File | Blob, customId?: string, originalName?: string): Promise<{ id: string; url: string }> {
  const db = await openMediaDatabase();
  const id = customId || `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const mimeType = file.type || 'application/octet-stream';
  const name = originalName || (file instanceof File ? file.name : `${id}`);

  // Gera Data URL e Object URL para cache imediato
  const objectUrl = URL.createObjectURL(file);
  memoryUrlCache.set(id, objectUrl);

  const storedItem: StoredMediaFile = {
    id,
    name,
    mimeType,
    size: file.size,
    blob: file,
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(storedItem);

    req.onsuccess = () => {
      // Retorna URI com protocolo virtual indexado
      resolve({ id, url: `indexeddb://${id}` });
    };

    req.onerror = () => reject(req.error || new Error('Falha ao gravar arquivo no IndexedDB.'));
  });
}

/**
 * Recupera um arquivo do IndexedDB pelo ID
 */
export async function getMediaFromIndexedDB(id: string): Promise<StoredMediaFile | null> {
  try {
    const db = await openMediaDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error('Falha ao ler arquivo do IndexedDB.'));
    });
  } catch (err) {
    console.warn('Erro ao consultar IndexedDB:', err);
    return null;
  }
}

/**
 * Obtém todos os arquivos de mídia armazenados no IndexedDB
 */
export async function getAllMediaFilesFromIndexedDB(): Promise<StoredMediaFile[]> {
  try {
    const db = await openMediaDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error('Falha ao listar arquivos do IndexedDB.'));
    });
  } catch (err) {
    console.warn('Erro ao ler todos os arquivos do IndexedDB:', err);
    return [];
  }
}

/**
 * Insere ou restaura um arquivo de mídia no IndexedDB preservando integridade
 */
export async function putRawMediaFileToIndexedDB(item: StoredMediaFile): Promise<void> {
  const db = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error('Falha ao gravar item no IndexedDB.'));
  });
}

/**
 * Resolve uma URL customizada (indexeddb://id) para um Blob URL utilizável em tags <img> ou <video>
 */
export async function resolveIndexedDbMediaUrl(rawUrl: string): Promise<string> {
  if (!rawUrl.startsWith('indexeddb://')) {
    return rawUrl;
  }

  const id = rawUrl.replace('indexeddb://', '').trim();

  // Se já tiver em cache na memória, reutiliza
  if (memoryUrlCache.has(id)) {
    return memoryUrlCache.get(id)!;
  }

  const stored = await getMediaFromIndexedDB(id);
  if (stored && stored.blob) {
    const blobUrl = URL.createObjectURL(stored.blob);
    memoryUrlCache.set(id, blobUrl);
    return blobUrl;
  }

  return rawUrl;
}

/**
 * Validação rigorosa de arquivo
 */
export function validateMediaFile(file: File): { valid: boolean; error?: string; mediaType?: 'image' | 'video' } {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  const isGif = type === 'image/gif' || name.endsWith('.gif');
  const isWebp = type === 'image/webp' || name.endsWith('.webp');
  const isMp4 = type === 'video/mp4' || name.endsWith('.mp4');

  if (!isGif && !isWebp && !isMp4) {
    return {
      valid: false,
      error: 'Formato não suportado. Envie exclusivamente arquivos .gif animado, .webp animado ou vídeo .mp4.'
    };
  }

  // Limite de tamanho: 20MB para imagens animadas, 50MB para vídeos MP4
  const maxImageBytes = 20 * 1024 * 1024;
  const maxVideoBytes = 50 * 1024 * 1024;

  if ((isGif || isWebp) && file.size > maxImageBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Arquivo muito grande (${sizeMb} MB). Para GIFs e WebPs animados, o tamanho máximo é de 20 MB.`
    };
  }

  if (isMp4 && file.size > maxVideoBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Arquivo muito grande (${sizeMb} MB). Para vídeos MP4, o tamanho máximo permitido é de 50 MB.`
    };
  }

  return {
    valid: true,
    mediaType: isMp4 ? 'video' : 'image'
  };
}

/**
 * Realiza o upload de mídia:
 * - Se Supabase Storage estiver conectado com credenciais válidas, envia para o bucket 'exercise-media'.
 * - Caso contrário (desacoplado / offline), persiste com total fidelidade no IndexedDB do navegador.
 */
export async function uploadExerciseMedia(file: File, options?: { isPremium?: boolean }): Promise<UploadResult> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    return {
      success: false,
      storageTarget: 'indexeddb_local',
      error: validation.error
    };
  }

  const supabaseStatus = getSupabaseConfigStatus();

  // Tentativa de envio para Supabase Storage se credenciais estiverem ativas
  if (supabaseStatus.isConfigured && supabaseStatus.url) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `exercises/${Date.now()}_${sanitizedName}`;
      const SUPABASE_URL = supabaseStatus.url;
      const SUPABASE_KEY = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || '') : '';

      const isMp4 = validation.mediaType === 'video' || file.name.endsWith('.mp4');
      const targetBucket = options?.isPremium || isMp4 ? 'exercise-media-premium' : 'exercise-media-public';

      // 1. Tenta bucket particionado
      let uploadEndpoint = `${SUPABASE_URL}/storage/v1/object/${targetBucket}/${fileName}`;
      let res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      // 2. Se falhar, tenta bucket legado 'exercise-media'
      let usedBucket = targetBucket;
      if (!res.ok) {
        uploadEndpoint = `${SUPABASE_URL}/storage/v1/object/exercise-media/${fileName}`;
        const fallbackRes = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': file.type || 'application/octet-stream'
          },
          body: file
        });
        if (fallbackRes.ok) {
          res = fallbackRes;
          usedBucket = 'exercise-media';
        }
      }

      if (res.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${usedBucket}/${fileName}`;
        return {
          success: true,
          url: publicUrl,
          mediaType: validation.mediaType,
          mimeType: file.type,
          fileSize: file.size,
          storageTarget: 'supabase_storage'
        };
      } else {
        console.warn('Falha no upload do Supabase Storage. Recorrendo ao IndexedDB local seguro.');
      }
    } catch (err: any) {
      console.warn('Erro de rede no Supabase Storage. Salvando localmente:', err.message);
    }
  }

  // Fallback seguro em IndexedDB local
  try {
    const { id, url } = await saveMediaToIndexedDB(file);
    return {
      success: true,
      url,
      mediaType: validation.mediaType,
      mimeType: file.type,
      fileSize: file.size,
      storageTarget: 'indexeddb_local'
    };
  } catch (err: any) {
    return {
      success: false,
      storageTarget: 'indexeddb_local',
      error: `Não foi possível armazenar a mídia: ${err.message}`
    };
  }
}

/**
 * Registro de histórico de alterações de exercícios (Audit Log)
 */
export function getExerciseAuditLog(): ExerciseAuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logExerciseChange(entry: Omit<ExerciseAuditLogEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getExerciseAuditLog();
    const newEntry: ExerciseAuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...current].slice(0, 100); // Mantém os 100 registros mais recentes
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar log de alteração:', e);
  }
}
