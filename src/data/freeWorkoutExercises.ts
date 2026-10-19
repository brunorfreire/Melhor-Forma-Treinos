import { WorkoutExerciseItem } from "../types";

/**
 * RELAÇÕES PÚBLICAS DE TREINOS GRATUITOS (12 Treinos Livres - 47 Prescrições)
 * Destinadas à vitrine pública e execução gratuita sem exigência de credenciais.
 * Prescrições dos 60 treinos Premium NÃO são expostas neste módulo.
 */
export const FREE_WORKOUT_EXERCISES: WorkoutExerciseItem[] = [
  {
    "workoutId": "w-40p-01",
    "exerciseId": "ex-sentar-levantar-banco",
    "order": 1,
    "sets": "3",
    "reps": "10 a 12",
    "rest": "60s",
    "load": "Peso corporal",
    "notes": "Toque suave no banco, sem despencar. Suba com firmeza empurrando os calcanhares.",
    "alternativeExerciseId": "ex-agachamento-livre",
    "alternativeNotes": "Se tiver boa estabilidade, faça sem o banco."
  },
  {
    "workoutId": "w-40p-01",
    "exerciseId": "ex-remada-unilateral-serrote",
    "order": 2,
    "sets": "3",
    "reps": "10 a 12 cada lado",
    "rest": "60s",
    "load": "Halter de 3kg a 5kg",
    "notes": "Cotovelo rente ao corpo, puxe em direção ao quadril com controle."
  },
  {
    "workoutId": "w-40p-01",
    "exerciseId": "ex-flexao-braco-inclinada",
    "order": 3,
    "sets": "3",
    "reps": "8 a 10",
    "rest": "60s",
    "load": "Peso corporal",
    "notes": "Mãos na borda do banco ou parede. Corpo alinhado em prancha."
  },
  {
    "workoutId": "w-40p-01",
    "exerciseId": "ex-elevacao-pelvica-solo",
    "order": 4,
    "sets": "3",
    "reps": "12 a 15",
    "rest": "45s",
    "load": "Peso corporal",
    "notes": "Segure 2 segundos no topo contraindo bem os glúteos."
  },
  {
    "workoutId": "w-40p-01",
    "exerciseId": "ex-perdigueiro-bird-dog",
    "order": 5,
    "sets": "3",
    "reps": "8 a 10 cada lado",
    "rest": "45s",
    "load": "Peso corporal",
    "notes": "Mantenha a pelve imóvel. Foco no equilíbrio e na coluna alinhada."
  },
  {
    "workoutId": "w-40p-05",
    "exerciseId": "ex-agachamento-goblet",
    "order": 1,
    "sets": "4",
    "reps": "10 a 12",
    "rest": "60s",
    "load": "Halter de 6kg a 10kg",
    "notes": "Desça até a linha de 90° e suba acelerando com controle."
  },
  {
    "workoutId": "w-40p-05",
    "exerciseId": "ex-supino-inclinado-halteres",
    "order": 2,
    "sets": "3",
    "reps": "10 a 12",
    "rest": "60s",
    "load": "Halteres de 4kg a 7kg",
    "notes": "Banco a 30°. Foque na parte superior do peito."
  },
  {
    "workoutId": "w-40p-05",
    "exerciseId": "ex-stiff-halteres",
    "order": 3,
    "sets": "3",
    "reps": "10 a 12",
    "rest": "60s",
    "load": "Halteres de 6kg a 8kg",
    "notes": "Mantenha os halteres colados nas canelas."
  },
  {
    "workoutId": "w-40p-05",
    "exerciseId": "ex-remada-curvada-halteres",
    "order": 4,
    "sets": "3",
    "reps": "10 a 12",
    "rest": "60s",
    "load": "Halteres de 5kg a 7kg",
    "notes": "Pausa de 1s na contração máxima."
  },
  {
    "workoutId": "w-40p-05",
    "exerciseId": "ex-prancha-isometrica",
    "order": 5,
    "sets": "3",
    "reps": "30 a 45 seg",
    "rest": "45s",
    "load": "Isometria",
    "notes": "Glúteos e abdômen firmemente acionados."
  },
  {
    "workoutId": "w-sup-01",
    "exerciseId": "ex-supino-reto-halteres",
    "order": 1,
    "sets": "3",
    "reps": "10 a 12",
    "rest": "60s",
    "load": "Halteres de 3kg a 5kg",
    "notes": "Abertura confortável dos cotovelos, sem forçar ombros."
  },
  {
    "workoutId": "w-sup-01",
    "exerciseId": "ex-crucifixo-halteres",
    "order": 2,
    "sets": "3",
    "reps": "12",
    "rest": "60s",
    "load": "Halteres leves",
    "notes": "Braços semiflexionados, sinta o peitoral abrir."
  },
  {
    "workoutId": "w-sup-01",
    "exerciseId": "ex-flexao-braco-inclinada",
    "order": 3,
    "sets": "3",
    "reps": "8 a 10",
    "rest": "60s",
    "load": "Peso corporal",
    "notes": "Apoio no banco elevado."
  },
  {
    "workoutId": "w-sup-01",
    "exerciseId": "ex-triceps-banco-mergulho",
    "order": 4,
    "sets": "3",
    "reps": "10",
    "rest": "45s",
    "load": "Peso corporal",
    "notes": "Joelhos dobrados para reduzir a alavanca."
  },
  {
    "workoutId": "w-sup-05",
    "exerciseId": "ex-supino-inclinado-halteres",
    "order": 1,
    "sets": "3",
    "reps": "10",
    "rest": "60s",
    "load": "Halteres médios"
  },
  {
    "workoutId": "w-sup-05",
    "exerciseId": "ex-remada-unilateral-serrote",
    "order": 2,
    "sets": "3",
    "reps": "10 cada lado",
    "rest": "60s",
    "load": "Halter firme"
  },
  {
    "workoutId": "w-sup-05",
    "exerciseId": "ex-desenvolvimento-halteres-sentado",
    "order": 3,
    "sets": "3",
    "reps": "10",
    "rest": "60s",
    "load": "Halteres médios"
  },
  {
    "workoutId": "w-sup-05",
    "exerciseId": "ex-remada-baixa-triangulo",
    "order": 4,
    "sets": "3",
    "reps": "12",
    "rest": "60s",
    "load": "Polia média"
  },
  {
    "workoutId": "w-inf-01",
    "exerciseId": "ex-sentar-levantar-banco",
    "order": 1,
    "sets": "3",
    "reps": "10 a 12",
    "rest": "60s",
    "load": "Peso corporal",
    "notes": "Subida firme sem tranco nos joelhos."
  },
  {
    "workoutId": "w-inf-01",
    "exerciseId": "ex-elevacao-pelvica-solo",
    "order": 2,
    "sets": "3",
    "reps": "12 a 15",
    "rest": "45s",
    "load": "Peso corporal",
    "notes": "Pausa de 2 segundos contraindo glúteos."
  },
  {
    "workoutId": "w-inf-01",
    "exerciseId": "ex-panturrilha-em-pe-degrau",
    "order": 3,
    "sets": "3",
    "reps": "15",
    "rest": "45s",
    "load": "Peso corporal"
  },
  {
    "workoutId": "w-inf-01",
    "exerciseId": "ex-perdigueiro-bird-dog",
    "order": 4,
    "sets": "3",
    "reps": "8 cada lado",
    "rest": "45s",
    "load": "Peso corporal"
  },
  {
    "workoutId": "w-inf-05",
    "exerciseId": "ex-agachamento-goblet",
    "order": 1,
    "sets": "4",
    "reps": "10",
    "rest": "60s",
    "load": "Halter de 6kg a 10kg"
  },
  {
    "workoutId": "w-inf-05",
    "exerciseId": "ex-afundo-estatico",
    "order": 2,
    "sets": "3",
    "reps": "10 cada lado",
    "rest": "60s",
    "load": "Halteres leves de 3kg a 4kg"
  },
  {
    "workoutId": "w-inf-05",
    "exerciseId": "ex-cadeira-extensora",
    "order": 3,
    "sets": "3",
    "reps": "12",
    "rest": "45s",
    "load": "Carga moderada"
  },
  {
    "workoutId": "w-inf-05",
    "exerciseId": "ex-panturrilha-em-pe-degrau",
    "order": 4,
    "sets": "3",
    "reps": "15",
    "rest": "45s",
    "load": "Com halter"
  },
  {
    "workoutId": "w-fb-01",
    "exerciseId": "ex-sentar-levantar-banco",
    "order": 1,
    "sets": "3",
    "reps": "10",
    "rest": "60s",
    "load": "Peso corporal"
  },
  {
    "workoutId": "w-fb-01",
    "exerciseId": "ex-remada-unilateral-serrote",
    "order": 2,
    "sets": "3",
    "reps": "10 cada lado",
    "rest": "60s",
    "load": "Halter leve"
  },
  {
    "workoutId": "w-fb-01",
    "exerciseId": "ex-flexao-braco-inclinada",
    "order": 3,
    "sets": "3",
    "reps": "8 a 10",
    "rest": "60s",
    "load": "Peso corporal"
  },
  {
    "workoutId": "w-fb-01",
    "exerciseId": "ex-prancha-elevada-banco",
    "order": 4,
    "sets": "3",
    "reps": "30 seg",
    "rest": "45s",
    "load": "Isometria"
  },
  {
    "workoutId": "w-fb-05",
    "exerciseId": "ex-agachamento-goblet",
    "order": 1,
    "sets": "4",
    "reps": "10",
    "rest": "60s",
    "load": "Halter médio"
  },
  {
    "workoutId": "w-fb-05",
    "exerciseId": "ex-supino-inclinado-halteres",
    "order": 2,
    "sets": "3",
    "reps": "10",
    "rest": "60s",
    "load": "Halteres"
  },
  {
    "workoutId": "w-fb-05",
    "exerciseId": "ex-remada-unilateral-serrote",
    "order": 3,
    "sets": "3",
    "reps": "10 cada lado",
    "rest": "60s",
    "load": "Halter firme"
  },
  {
    "workoutId": "w-fb-05",
    "exerciseId": "ex-stiff-halteres",
    "order": 4,
    "sets": "3",
    "reps": "10",
    "rest": "60s",
    "load": "Halteres"
  },
  {
    "workoutId": "w-fb-05",
    "exerciseId": "ex-prancha-isometrica",
    "order": 5,
    "sets": "3",
    "reps": "35 seg",
    "rest": "45s",
    "load": "Isometria"
  },
  {
    "workoutId": "w-cardio-01",
    "exerciseId": "ex-marcha-estacionaria",
    "order": 1,
    "sets": "4",
    "reps": "45 seg",
    "rest": "30s",
    "load": "Ritmo suave"
  },
  {
    "workoutId": "w-cardio-01",
    "exerciseId": "ex-step-jack-sem-salto",
    "order": 2,
    "sets": "4",
    "reps": "45 seg",
    "rest": "30s",
    "load": "Sem impacto"
  },
  {
    "workoutId": "w-cardio-01",
    "exerciseId": "ex-circulo-bracos-escapulas",
    "order": 3,
    "sets": "3",
    "reps": "12 ciclos",
    "rest": "20s",
    "load": "Recuperação ativa"
  },
  {
    "workoutId": "w-cardio-05",
    "exerciseId": "ex-step-jack-sem-salto",
    "order": 1,
    "sets": "5",
    "reps": "45 seg ativo / 30 seg pausa",
    "rest": "30s",
    "load": "AIT moderado"
  },
  {
    "workoutId": "w-cardio-05",
    "exerciseId": "ex-subida-step-degrau",
    "order": 2,
    "sets": "4",
    "reps": "12 cada perna",
    "rest": "30s",
    "load": "Subida firme"
  },
  {
    "workoutId": "w-cardio-05",
    "exerciseId": "ex-boxe-sombra-suave",
    "order": 3,
    "sets": "4",
    "reps": "45 seg",
    "rest": "30s",
    "load": "Cadência moderada"
  },
  {
    "workoutId": "w-mob-01",
    "exerciseId": "ex-gato-vaca-cat-cow",
    "order": 1,
    "sets": "3",
    "reps": "10 a 12 ciclos",
    "rest": "30s",
    "load": "Mobilidade articular"
  },
  {
    "workoutId": "w-mob-01",
    "exerciseId": "ex-circulo-bracos-escapulas",
    "order": 2,
    "sets": "3",
    "reps": "12 ciclos cada sentido",
    "rest": "30s",
    "load": "Peso corporal"
  },
  {
    "workoutId": "w-mob-01",
    "exerciseId": "ex-perdigueiro-bird-dog",
    "order": 3,
    "sets": "3",
    "reps": "8 cada lado",
    "rest": "30s",
    "load": "Controle"
  },
  {
    "workoutId": "w-mob-05",
    "exerciseId": "ex-mobilidade-quadril-90-90",
    "order": 1,
    "sets": "4",
    "reps": "8 a 10 cada lado",
    "rest": "45s",
    "load": "Quadril no solo"
  },
  {
    "workoutId": "w-mob-05",
    "exerciseId": "ex-elevacao-pelvica-unilateral",
    "order": 2,
    "sets": "3",
    "reps": "8 cada perna",
    "rest": "30s",
    "load": "Glúteo médio"
  },
  {
    "workoutId": "w-mob-05",
    "exerciseId": "ex-agachamento-sumo-halter",
    "order": 3,
    "sets": "3",
    "reps": "10 suaves",
    "rest": "45s",
    "load": "Abertura adutora"
  }
];
