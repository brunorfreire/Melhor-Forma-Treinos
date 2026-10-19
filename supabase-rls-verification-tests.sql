-- =====================================================================
-- MELHOR FORMA PLAY 40+ | SUÍTE DE TESTES REAIS DE RLS E POLÍTICAS DE ACESSO
-- Arquivo: supabase-rls-verification-tests.sql
--
-- ATENÇÃO OBRIGATÓRIA:
-- Estes testes foram PREPARADOS para execução direta no SQL Editor do Supabase
-- após a configuração e aplicação do DDL de migração.
-- NÃO DECLARAR TESTES APROVADOS EM PRODUÇÃO ANTES DE EXECUTÁ-LOS NO SUPABASE REAL.
--
-- Cenários Testados:
-- 1. Visitante Anônimo (sem sessão / anon)
-- 2. Aluno Free Cadastrado (com e-mail confirmado, status 'free')
-- 3. Aluno com Compra Avulsa (single_workout de um treino específico)
-- 4. Assinante Premium Ativo (subscription_status = 'active')
-- 5. Administrador Autenticado (app_role = 'admin')
-- 6. Tentativa Maliciosa de Auto-Promoção (Trigger de Segurança)
-- =====================================================================

DO $$
DECLARE
  v_test_free_workout TEXT := 'w-40p-01';        -- Treino Free
  v_test_premium_workout TEXT := 'w-sup-06';     -- Treino Premium (contém ex-triceps-frances-halter)
  v_test_free_exercise TEXT := 'ex-flexao-braco-inclinada'; -- Exercício de treino free
  v_test_premium_exercise TEXT := 'ex-triceps-frances-halter'; -- Exercício exclusivo de treino premium
  v_test_orphan_exercise TEXT := 'ex-mesa-flexora'; -- Exercício sem vínculo a treino
  v_test_invalid_exercise TEXT := 'ex-inexistente-12345';
  
  v_fake_free_user UUID := '11111111-1111-1111-1111-111111111111';
  v_fake_single_user UUID := '22222222-2222-2222-2222-222222222222';
  v_fake_subscriber UUID := '33333333-3333-3333-3333-333333333333';
  v_fake_admin UUID := '44444444-4444-4444-4444-444444444444';

  v_res BOOLEAN;
  v_count INT;
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'INICIANDO BATERIA DE TESTES DE SEGURANÇA E RLS NO SUPABASE';
  RAISE NOTICE '=======================================================';

  -- -------------------------------------------------------------------
  -- TESTE 1: VALIDAÇÃO DE "DENY BY DEFAULT" NAS FUNÇÕES DE AUTORIZAÇÃO
  -- -------------------------------------------------------------------
  RAISE NOTICE '--- TESTE 1: Deny by Default com Parâmetros Inválidos / Inexistentes ---';
  
  -- 1.1 Identificador NULO deve retornar FALSE
  v_res := public.can_user_access_exercise(NULL);
  ASSERT v_res = FALSE, 'FALHA 1.1: can_user_access_exercise(NULL) deveria retornar FALSE';
  RAISE NOTICE 'PASS 1.1: can_user_access_exercise(NULL) = FALSE';

  -- 1.2 Identificador vazio deve retornar FALSE
  v_res := public.can_user_access_exercise('   ');
  ASSERT v_res = FALSE, 'FALHA 1.2: can_user_access_exercise com string vazia deveria retornar FALSE';
  RAISE NOTICE 'PASS 1.2: can_user_access_exercise("") = FALSE';

  -- 1.3 Exercício inexistente deve retornar FALSE
  v_res := public.can_user_access_exercise(v_test_invalid_exercise);
  ASSERT v_res = FALSE, 'FALHA 1.3: Exercício inexistente deveria retornar FALSE';
  RAISE NOTICE 'PASS 1.3: can_user_access_exercise(inexistente) = FALSE';

  -- 1.4 Storage com bucket ou path nulos deve retornar FALSE
  v_res := public.can_user_access_storage_object(NULL, 'arquivo.webp');
  ASSERT v_res = FALSE, 'FALHA 1.4: Storage com bucket nulo deveria retornar FALSE';
  v_res := public.can_user_access_storage_object('exercise-media-premium', NULL);
  ASSERT v_res = FALSE, 'FALHA 1.4b: Storage com nome nulo deveria retornar FALSE';
  RAISE NOTICE 'PASS 1.4: can_user_access_storage_object com nulos = FALSE';

  -- 1.5 Arquivo não cadastrado na tabela de vínculos deve retornar FALSE
  v_res := public.can_user_access_storage_object('exercise-media-premium', 'arquivo_fantasma.mp4');
  ASSERT v_res = FALSE, 'FALHA 1.5: Arquivo sem vínculo relacional cadastrado deveria retornar FALSE';
  RAISE NOTICE 'PASS 1.5: can_user_access_storage_object(arquivo_sem_vinculo) = FALSE';

  -- 1.6 Arquivo com is_approved = false (ex: mesa-flexora) deve retornar FALSE para não-admin
  v_res := public.can_user_access_storage_object('exercise-media-premium', 'mesa-flexora.webp');
  ASSERT v_res = FALSE, 'FALHA 1.6: Arquivo pendente (is_approved=false) deveria retornar FALSE';
  RAISE NOTICE 'PASS 1.6: can_user_access_storage_object(is_approved=false) = FALSE';

  -- -------------------------------------------------------------------
  -- TESTE 2: VISITANTE ANÔNIMO (SEM AUTENTICAÇÃO)
  -- -------------------------------------------------------------------
  RAISE NOTICE '--- TESTE 2: Visitante Anônimo ---';
  
  -- Simula contexto anônimo
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claim.role', 'anon', true);

  -- 2.1 Anônimo acessa treino Free?
  v_res := public.can_user_access_workout(v_test_free_workout);
  ASSERT v_res = TRUE, 'FALHA 2.1: Treino Free deve ser acessível por anônimo';
  RAISE NOTICE 'PASS 2.1: Anônimo acessa treino Free = TRUE';

  -- 2.2 Anônimo acessa treino Premium? DEVE RETORNAR FALSE
  v_res := public.can_user_access_workout(v_test_premium_workout);
  ASSERT v_res = FALSE, 'FALHA 2.2: Treino Premium NÃO pode ser acessado por anônimo';
  RAISE NOTICE 'PASS 2.2: Anônimo acessa treino Premium = FALSE (Bloqueado com sucesso)';

  -- 2.3 Anônimo acessa mídia de exercício exclusivo Premium? DEVE RETORNAR FALSE
  v_res := public.can_user_access_storage_object('exercise-media-premium', 'triceps-frances-halter.webp');
  ASSERT v_res = FALSE, 'FALHA 2.3: Mídia Premium não pode ser acessada por anônimo';
  RAISE NOTICE 'PASS 2.3: Anônimo acessa mídia Premium = FALSE (Bloqueado com sucesso)';

  -- 2.4 Anônimo acessa mídia pública de exercício de treino Free? DEVE RETORNAR TRUE
  v_res := public.can_user_access_storage_object('exercise-media-public', 'agachamento-sumo-halter.webp');
  ASSERT v_res = TRUE, 'FALHA 2.4: Mídia pública de treino free deve ser liberada';
  RAISE NOTICE 'PASS 2.4: Anônimo acessa mídia pública aprovada = TRUE';

  -- -------------------------------------------------------------------
  -- TESTE 3: ALUNO FREE AUTENTICADO
  -- -------------------------------------------------------------------
  RAISE NOTICE '--- TESTE 3: Aluno Free Autenticado ---';
  
  -- Simula contexto de aluno free
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_fake_free_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- 3.1 Aluno Free não deve ter acesso global
  v_res := public.has_global_premium_access();
  ASSERT v_res = FALSE, 'FALHA 3.1: Aluno Free não pode ter acesso global';
  RAISE NOTICE 'PASS 3.1: Aluno Free has_global_premium_access() = FALSE';

  -- 3.2 Aluno Free acessa exercício de treino Free?
  v_res := public.can_user_access_exercise(v_test_free_exercise);
  ASSERT v_res = TRUE, 'FALHA 3.2: Exercício Free deve ser liberado para Aluno Free';
  RAISE NOTICE 'PASS 3.2: Aluno Free can_user_access_exercise(free) = TRUE';

  -- 3.3 Aluno Free acessa exercício exclusivo Premium? DEVE RETORNAR FALSE
  v_res := public.can_user_access_exercise(v_test_premium_exercise);
  ASSERT v_res = FALSE, 'FALHA 3.3: Aluno Free NÃO pode acessar exercício exclusivo Premium';
  RAISE NOTICE 'PASS 3.3: Aluno Free can_user_access_exercise(premium) = FALSE (Bloqueado com sucesso)';

  -- 3.4 Aluno Free acessa mídia premium no storage? DEVE RETORNAR FALSE
  v_res := public.can_user_access_storage_object('exercise-media-premium', 'triceps-frances-halter.webp');
  ASSERT v_res = FALSE, 'FALHA 3.4: Aluno Free NÃO pode acessar mídia no bucket premium';
  RAISE NOTICE 'PASS 3.4: Aluno Free can_user_access_storage_object(premium) = FALSE';

  -- -------------------------------------------------------------------
  -- TESTE 4: COMPRADOR AVULSO (SINGLE WORKOUT)
  -- -------------------------------------------------------------------
  RAISE NOTICE '--- TESTE 4: Comprador Avulso (Single Workout) ---';
  
  -- Insere temporariamente direito avulso para o usuário fake v_fake_single_user
  INSERT INTO public.user_entitlements (user_id, entitlement_type, resource_id, status, granted_by)
  VALUES (v_fake_single_user, 'single_workout', v_test_premium_workout, 'active', 'system_test')
  ON CONFLICT DO NOTHING;

  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_fake_single_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- 4.1 Comprador acessa o treino comprado?
  v_res := public.can_user_access_workout(v_test_premium_workout);
  ASSERT v_res = TRUE, 'FALHA 4.1: Comprador deve acessar o treino comprado';
  RAISE NOTICE 'PASS 4.1: Comprador acessa treino comprado = TRUE';

  -- 4.2 Comprador acessa o exercício que faz parte do treino comprado?
  v_res := public.can_user_access_exercise(v_test_premium_exercise);
  ASSERT v_res = TRUE, 'FALHA 4.2: Comprador deve acessar exercício vinculado ao treino comprado';
  RAISE NOTICE 'PASS 4.2: Comprador acessa exercício vinculado = TRUE';

  -- 4.3 Comprador acessa a mídia do exercício do treino comprado no bucket premium?
  v_res := public.can_user_access_storage_object('exercise-media-premium', 'triceps-frances-halter.webp');
  ASSERT v_res = TRUE, 'FALHA 4.3: Comprador deve acessar a mídia do exercício do treino comprado';
  RAISE NOTICE 'PASS 4.3: Comprador acessa mídia autorizada no storage = TRUE';

  -- 4.4 Comprador acessa OUTRO treino Premium não comprado (ex: w-sup-07)? DEVE RETORNAR FALSE
  v_res := public.can_user_access_workout('w-sup-07');
  ASSERT v_res = FALSE, 'FALHA 4.4: Comprador NÃO pode acessar outros treinos Premium não comprados';
  RAISE NOTICE 'PASS 4.4: Comprador acessa outro treino Premium = FALSE (Bloqueado com sucesso)';

  -- Remove o registro temporário de teste
  DELETE FROM public.user_entitlements WHERE user_id = v_fake_single_user AND resource_id = v_test_premium_workout;

  -- -------------------------------------------------------------------
  -- TESTE 5: ASSINANTE PREMIUM ATIVO
  -- -------------------------------------------------------------------
  RAISE NOTICE '--- TESTE 5: Assinante Premium Ativo ---';

  INSERT INTO public.user_entitlements (user_id, entitlement_type, resource_id, status, granted_by)
  VALUES (v_fake_subscriber, 'subscription', 'all_premium_workouts', 'active', 'system_test')
  ON CONFLICT DO NOTHING;

  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_fake_subscriber::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- 5.1 Assinante tem acesso global?
  v_res := public.has_global_premium_access();
  ASSERT v_res = TRUE, 'FALHA 5.1: Assinante ativo deve possuir has_global_premium_access() = TRUE';
  RAISE NOTICE 'PASS 5.1: Assinante has_global_premium_access() = TRUE';

  -- 5.2 Assinante acessa qualquer treino Premium?
  v_res := public.can_user_access_workout(v_test_premium_workout);
  ASSERT v_res = TRUE, 'FALHA 5.2: Assinante deve acessar treinos Premium';
  RAISE NOTICE 'PASS 5.2: Assinante acessa treino Premium = TRUE';

  -- 5.3 Assinante acessa qualquer mídia aprovada no bucket Premium?
  v_res := public.can_user_access_storage_object('exercise-media-premium', 'triceps-frances-halter.webp');
  ASSERT v_res = TRUE, 'FALHA 5.3: Assinante deve acessar mídia aprovada no storage premium';
  RAISE NOTICE 'PASS 5.3: Assinante acessa mídia Storage Premium = TRUE';

  -- Limpa registro de teste
  DELETE FROM public.user_entitlements WHERE user_id = v_fake_subscriber;

  -- -------------------------------------------------------------------
  -- TESTE 6: GATILHO DE PROTEÇÃO CONTRA AUTO-ELEVAÇÃO DE PRIVILÉGIOS
  -- -------------------------------------------------------------------
  RAISE NOTICE '--- TESTE 6: Proteção contra Auto-Promoção (Trigger trg_protect_profile_privileged_fields) ---';
  
  -- Cria perfil de aluno fake
  INSERT INTO public.profiles (id, email, nome, app_role, subscription_status)
  VALUES (v_fake_free_user, 'aluno_teste@example.com', 'Aluno Teste', 'student', 'free')
  ON CONFLICT (id) DO UPDATE SET app_role = 'student', subscription_status = 'free';

  -- Simula sessão do próprio aluno tentando alterar seu próprio app_role para admin via UPDATE
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_fake_free_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- O aluno tenta atualizar seu app_role para 'admin'
  UPDATE public.profiles
  SET app_role = 'admin', subscription_status = 'active'
  WHERE id = v_fake_free_user;

  -- Verifica se a alteração foi estritamente ignorada pelo trigger
  SELECT COUNT(*) INTO v_count
  FROM public.profiles
  WHERE id = v_fake_free_user AND app_role = 'admin';

  ASSERT v_count = 0, 'FALHA CRÍTICA 6: Usuário comum conseguiu alterar app_role para admin!';
  RAISE NOTICE 'PASS 6: Tentativa de auto-promoção bloqueada pelo trigger! Perfil continua como student.';

  -- Limpa perfil de teste
  DELETE FROM public.profiles WHERE id = v_fake_free_user;

  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'TODOS OS TESTES DE SEGURANÇA FORAM CONCLUÍDOS COM SUCESSO!';
  RAISE NOTICE '=======================================================';
END;
$$;
