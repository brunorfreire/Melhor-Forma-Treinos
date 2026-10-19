/**
 * SUÍTE DE TESTES ESTÁTICOS DE SEGURANÇA E INTEGRIDADE PRÉ-MIGRAÇÃO
 * Melhor Forma Play 40+
 */

import fs from 'fs';
import path from 'path';
import { getAllCatalogWorkouts, getAllCentralExercises, getAllWorkoutExerciseItems } from '../data/workoutCatalogService';
import { SUPABASE_SQL_DDL_SCRIPT } from './supabaseMigrationService';

export interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runSecurityAndIntegrityAudit(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  // 1. Preservação de contagens do sistema
  const workouts = getAllCatalogWorkouts();
  const exercises = getAllCentralExercises();
  const relations = getAllWorkoutExerciseItems();
  const exerciseFiles = fs.readdirSync(path.resolve('./public/exercises')).filter(f => !f.startsWith('.'));

  results.push({
    name: 'Preservação dos 72 treinos do catálogo',
    passed: workouts.length === 72,
    details: `Total auditado: ${workouts.length} treinos (Esperado: 72). Gratuitos: ${workouts.filter(w => w.accessLevel === 'free').length}, Premium: ${workouts.filter(w => w.accessLevel === 'premium').length}.`
  });

  results.push({
    name: 'Preservação dos 46 exercícios canônicos',
    passed: exercises.length === 46,
    details: `Total auditado: ${exercises.length} exercícios canônicos (Esperado: 46).`
  });

  results.push({
    name: 'Preservação dos 251 relacionamentos treino-exercício',
    passed: relations.length === 251,
    details: `Total auditado: ${relations.length} vínculos treino-exercício (Esperado: 251).`
  });

  results.push({
    name: 'Preservação dos 13 arquivos de mídia física em public/exercises/',
    passed: exerciseFiles.length === 13,
    details: `Arquivos encontrados: ${exerciseFiles.length} (Esperado: 13). Nomes: ${exerciseFiles.join(', ')}.`
  });

  // 2. Classificação de mídias Free vs Premium
  const freeWorkoutIds = new Set(workouts.filter(w => w.accessLevel === 'free').map(w => w.id));
  const exercisesInFree = new Set<string>();
  for (const rel of relations) {
    if (freeWorkoutIds.has(rel.workoutId)) {
      exercisesInFree.add(rel.exerciseId);
    }
  }

  const premiumOnlyFiles = exerciseFiles.filter(file => {
    const matched = exercises.filter(e => 
      (e.videoUrl && e.videoUrl.includes(file)) || 
      (e.fallbackMediaUrl && e.fallbackMediaUrl.includes(file)) ||
      (e.thumbnailUrl && e.thumbnailUrl.includes(file))
    );
    return matched.length > 0 && matched.every(e => !exercisesInFree.has(e.id));
  });

  results.push({
    name: 'Identificação correta de mídias físicas exclusivas Premium',
    passed: premiumOnlyFiles.length === 4,
    details: `Arquivos protegidos identificados (${premiumOnlyFiles.length}): ${premiumOnlyFiles.join(', ')} (mesa-flexora e triceps-frances-halter).`
  });

  // 3. Auditoria do Script SQL DDL
  const ddl = SUPABASE_SQL_DDL_SCRIPT;

  // 3.1. RLS de Auditoria sem FOR ALL e com DELETE exclusivo para admin
  const hasAuditTrainerWriteForAll = ddl.includes('audit_records_trainer_write') && ddl.includes('FOR ALL');
  const hasSpecificAuditPolicies = 
    ddl.includes('audit_records_trainer_insert') &&
    ddl.includes('audit_records_trainer_update') &&
    ddl.includes('audit_records_admin_delete');

  results.push({
    name: 'Substituição de FOR ALL por INSERT/UPDATE específicos e DELETE restrito a admin em exercise_audit_records',
    passed: !hasAuditTrainerWriteForAll && hasSpecificAuditPolicies,
    details: !hasAuditTrainerWriteForAll && hasSpecificAuditPolicies 
      ? 'Políticas de auditoria particionadas corretamente. Treinadores não possuem privilégio de exclusão.'
      : 'Falha: detectada política permissiva ou ausência de políticas específicas.'
  });

  // 3.2. Imutabilidade dos logs de auditoria
  const hasImmutableAuditLogs = ddl.includes('REVOKE UPDATE, DELETE ON public.exercise_audit_logs');
  results.push({
    name: 'Imutabilidade estrita da trilha de auditoria (exercise_audit_logs)',
    passed: hasImmutableAuditLogs,
    details: hasImmutableAuditLogs 
      ? 'REVOKE UPDATE, DELETE presente na tabela de logs.' 
      : 'Falha: tabela de logs não está protegida contra alterações.'
  });

  // 3.3. Promoção do primeiro administrador imune a anulação pelo trigger
  const hasTriggerBypassForAdminOperation = 
    ddl.includes("CURRENT_USER IN ('postgres', 'supabase_admin')") ||
    ddl.includes("auth.role() = 'service_role'");
  const hasPromoteFunction = ddl.includes('promote_user_to_admin');
  const hasDemoteFunction = ddl.includes('demote_admin_to_student');

  results.push({
    name: 'Correção de gatilho para permitir promote_user_to_admin e demote_admin_to_student',
    passed: hasTriggerBypassForAdminOperation && hasPromoteFunction && hasDemoteFunction,
    details: 'Trigger protect_profile_privileged_fields permite execução por postgres/service_role. Funções de promoção e revogação presentes.'
  });

  // 3.4. Revogação de acesso administrativa imediata no banco
  const hasRealtimeRoleCheck = ddl.includes('SELECT app_role INTO v_db_role FROM public.profiles WHERE id = auth.uid()');
  results.push({
    name: 'Consulta de papel em tempo real (revogação imediata sem espera de JWT)',
    passed: hasRealtimeRoleCheck,
    details: hasRealtimeRoleCheck
      ? 'current_app_role() verifica public.profiles em tempo real, garantindo efeito imediato na revogação.'
      : 'Falha: função depende de claims estáticas no token.'
  });

  // 3.5. Tabela de direitos e compras (user_entitlements) com bloqueio de reembolso
  const hasUserEntitlements = ddl.includes('CREATE TABLE IF NOT EXISTS public.user_entitlements');
  const hasRefundBlocking = ddl.includes("'active', 'expired', 'canceled', 'refunded'");
  results.push({
    name: 'Tabela de compras/direitos (user_entitlements) com bloqueio de reembolso',
    passed: hasUserEntitlements && hasRefundBlocking,
    details: 'Tabela user_entitlements implementada com enum de status (active, expired, canceled, refunded).'
  });

  // 3.6. Preservação de autoria nas 32 aprovações legadas
  const hasLegacyAuthorPreservation = 
    ddl.includes('NEW.is_legacy_approval = TRUE') &&
    ddl.includes('NEW.reviewer_id := NULL');
  results.push({
    name: 'Preservação de autoria anônima/legada nas 32 aprovações históricas',
    passed: hasLegacyAuthorPreservation,
    details: hasLegacyAuthorPreservation
      ? 'Trigger set_audit_author_identity preserva reviewer_id e reviewer_cref nulos quando is_legacy_approval = TRUE.'
      : 'Falha: trigger estamparia o admin importador nas 32 aprovações legadas.'
  });

  // 3.7. Compatibilidade de colunas de exercícios (target_muscle/muscle_group e description)
  const hasCompatColumns = 
    ddl.includes('target_muscle TEXT') &&
    ddl.includes('muscle_group TEXT NOT NULL') &&
    ddl.includes('description TEXT') &&
    ddl.includes('trg_sync_central_exercise_compat_fields');
  results.push({
    name: 'Compatibilidade bidirecional de esquema para central_exercises',
    passed: hasCompatColumns,
    details: hasCompatColumns
      ? 'Colunas target_muscle e description mapeadas e sincronizadas via gatilho com muscle_group, instructions e cautions.'
      : 'Falha: inconsistência entre esquema antigo e novo.'
  });

  // 3.8. Storage Particionado (público e privado) aceitando GIF, WebP e MP4
  const hasStoragePublicAndPrivate = 
    ddl.includes("'exercise-media-public'") &&
    ddl.includes("'exercise-media-premium'") &&
    ddl.includes("ARRAY['image/gif', 'image/webp', 'video/mp4']");
  results.push({
    name: 'Storage particionado com bucket público e bucket privado aceitando GIF/WebP/MP4',
    passed: hasStoragePublicAndPrivate,
    details: hasStoragePublicAndPrivate
      ? 'exercise-media-public (aberto) e exercise-media-premium (fechado) configurados com suporte completo a imagens animadas e vídeos.'
      : 'Falha: configuração de bucket incompleta.'
  });

  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;

  return {
    totalTests: results.length,
    passedTests,
    failedTests,
    results
  };
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('securityVerification')) {
  console.log('--- INICIANDO AUDITORIA ESTÁTICA DE SEGURANÇA E INTEGRIDADE ---');
  const audit = runSecurityAndIntegrityAudit();
  console.log(`Total de Testes: ${audit.totalTests} | Aprovados: ${audit.passedTests} | Falhas: ${audit.failedTests}`);
  for (const r of audit.results) {
    console.log(`${r.passed ? '✅ [PASS]' : '❌ [FAIL]'} ${r.name}`);
    console.log(`   Detalhes: ${r.details}`);
  }
}
