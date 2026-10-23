# Curadoria de Movimentos | Melhor Forma Play 40+

## Objetivo
Permitir que o administrador revise individualmente os exercícios e treinos antes de decidir alterações técnicas.

## Linha editorial
- Priorizar movimentos naturais, padrões de agachar, puxar, empurrar, dobradiça, locomoção, equilíbrio, mobilidade e estabilidade.
- Preferir peso corporal, halteres, barras, kettlebell, bancos, cadeiras firmes, step/degrau, elásticos e TRX.
- Máquinas ou polias não são automaticamente inadequadas. Julgar a modalidade pelo objetivo, capacidade, segurança, equipamento acessível e necessidades do aluno.
- Evitar descrições que prometam cura, previnam universalmente lesões ou imponham amplitude única para todos.

## Itens já levantados na biblioteca original
Foram identificados 9 exercícios de máquina/polia entre os 46 exercícios centrais, e 12 ocorrências desses IDs nas relações do arquivo original.

| Exercício atual | Caminho editorial de revisão | Atenção |
| --- | --- | --- |
| Leg press 45° | Agachamento goblet; sentar e levantar; afundo com apoio | Avaliar equilíbrio e progressão |
| Cadeira extensora | Step-up; afundo estático; sentar e levantar | Multiarticulares não isolam quadríceps da mesma forma |
| Mesa flexora | Cadastrar flexão de joelho com elástico ou deslize no chão | Não substituir por stiff como se fosse o mesmo movimento |
| Cadeira flexora | Flexão de joelho com elástico ou deslize no chão | Criar mídia e instruções antes de usar |
| Peck deck | Crucifixo com halteres, quando tolerado | Avaliar ombro e amplitude |
| Remada baixa triângulo | Remada unilateral/curvada com halteres | Conferir apoio e controle da coluna |
| Puxada alta pulley | Puxada vertical com elástico fixado em âncora segura | Remada horizontal não equivale a puxada vertical |
| Puxada fechada triângulo | Puxada vertical com elástico e pegada neutra | Precisa de mídia e verificação técnica |
| Tríceps corda polia | Tríceps francês com halter ou extensão com elástico | A posição do ombro muda |

**São sugestões para a revisão do profissional, não alterações automáticas das prescrições.**
Nenhum exercício foi excluído ou renomeado.

## Arquitetura da versão proposta
- Aba administrativa "Curadoria de Movimentos" vinculada aos editores existentes.
- Fila de 46 exercícios e 72 treinos; filtro de máquinas/polias, pesquisa e estado editorial.
- Pareceres: pendente, aprovado, ajustar, rejeitado. Aprovação requer confirmação de revisão real; ajustes/rejeições exigem justificativa.
- Edições dos exercícios e treinos continuam nos gerenciadores originais, acessados por ID.
- Dados editoriais isolados em \`mf_curadoria_editorial_v1\`; exportação JSON manual, sem sobrescrever auditorias existentes.
- Nenhuma alteração em autenticação, Supabase, RLS, catálogo padrão ou associação de exercícios.
- **Cuidado:** o serviço \`getAllWorkoutExerciseItems\` retorna apenas a lista Free embutida quando não há relações locais salvas. A lista completa Premium não pode ser considerada carregada ou editada globalmente nesse estado. A revisão completa das relações Premium exige um backend autorizado e um processo de migração validado.
- Decisões e edições locais **não** alteram automaticamente a versão que outros alunos veem. A sincronização remota e a publicação editorial controlada são uma fase futura que exige permissões administrativas no banco, logs e fluxo de aprovação.

## Plano de validação antes de publicar
1. Executar \`npm run build\` em ambiente próprio e inspecionar warnings.
2. Logar como admin e abrir a aba Curadoria; confirmar 46/72 e 9 equipamentos em revisão no catálogo de referência.
3. Registrar um parecer sem alterar exercício; testar persistência no mesmo navegador e exportar JSON.
4. Abrir exercício e treino específicos; revisar, cancelar edição e confirmar que nenhuma prescrição foi modificada.
5. Verificar que uma conta Free/Premium não-admin não vê a aba.
6. Confirmar que login e-mail/Google, conteúdos Premium e vídeo dos exercícios continuam funcionando.
7. Fazer backup completo e verificar a sincronização de dados antes de qualquer publicação global.
