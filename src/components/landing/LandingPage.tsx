import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Dumbbell, 
  ChevronRight, 
  Flame, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  Lock,
  HeartPulse,
  Award,
  Zap,
  Users,
  Info,
  X
} from 'lucide-react';
import { MelhorFormaLogo } from '../MelhorFormaLogo';
import { CATALOG_COLLECTIONS } from '../../data/catalogWorkouts';
import { getAllCatalogWorkouts } from '../../data/workoutCatalogService';
import { HeroFitnessMosaic } from './HeroFitnessMosaic';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate,
  isAuthenticated = false 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Amostra de treinos para a vitrine comercial (apenas títulos, capas e metadados públicos)
  const sampleWorkouts = React.useMemo(() => {
    const all = getAllCatalogWorkouts();
    // 6 treinos selecionados para a vitrine comercial
    return all.filter(w => ['w-40p-01', 'w-40p-02', 'w-sup-01', 'w-inf-01', 'w-fb-01', 'w-mob-01'].includes(w.id));
  }, []);

  const faqs = [
    {
      q: 'Preciso de equipamentos de academia para treinar?',
      a: 'Não. Os treinos do Melhor Forma Play 40+ utilizam predominantemente o peso corporal e objetos domésticos comuns (como uma cadeira firme ou garrafas de água). Se você possuir halteres leves ou faixas elásticas, há orientações específicas para incluí-los conforme sua evolução.'
    },
    {
      q: 'Tenho dores nos joelhos ou na coluna, posso fazer os treinos?',
      a: 'Sim. Todo o planejamento técnico é orientado para a saúde articular e postural de pessoas acima de 40 anos, sem saltos agressivos ou cargas desproporcionais. Os exercícios fortalecem a musculatura de sustentação (glúteos, paravertebrais e core), auxiliando no alívio de sobrecargas. Recomendamos sempre liberação médica prévia para casos de lesões diagnosticadas.'
    },
    {
      q: 'Os 12 treinos gratuitos têm prazo de validade?',
      a: 'Não. Ao criar sua conta gratuita e confirmar seu e-mail, os 12 treinos do catálogo Free ficam permanentemente liberados para você praticar quantas vezes desejar, com prescrições completas, orientações técnicas e cronômetro integrado.'
    },
    {
      q: 'Como funciona a confirmação de cadastro?',
      a: 'Após preencher seu nome, e-mail e senha, você receberá um e-mail de validação com um código de 6 dígitos. Basta digitá-lo no aplicativo para ativar sua conta. Esse processo previne cadastros falsos e assegura um ambiente exclusivo e seguro.'
    },
    {
      q: 'Qual é a frequência semanal recomendada?',
      a: 'Para quem está retomando ou iniciando, sugerimos de 2 a 3 sessões por semana, com dias de descanso intercalados. Cada sessão dura entre 15 e 30 minutos, facilitando a consistência na sua rotina.'
    },
    {
      q: 'Como posso acessar os 60 treinos Premium?',
      a: 'O plano Premium é opcional e oferece acesso a mais 60 sessões especializadas (divididas por grupos musculares específicos, objetivos intensivos e programas completos de condicionamento), além da biblioteca com variações de exercícios.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HEADER ESCURO E MINIMALISTA (ESTILO STREAMING) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-900/90 px-4 sm:px-8 py-3.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onNavigate('/'); }}
            aria-label="Melhor Forma Play 40+ Início"
          >
            <MelhorFormaLogo size={36} className="sm:w-10 sm:h-10 shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition leading-none">
                  Melhor Forma Play
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  40+
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium tracking-tight mt-0.5 hidden sm:block">
                Longevidade e Força para a Vida Toda
              </span>
            </div>
          </div>

          {/* Navigation Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigate('/app')}
                className="min-h-[44px] px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
              >
                <span>Acessar Meu App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('/cadastro')}
                  className="hidden sm:inline-flex min-h-[44px] px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition items-center"
                >
                  Criar conta grátis
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/entrar')}
                  className="min-h-[44px] px-4 sm:px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/40 text-xs sm:text-sm font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Entrar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO CINEMATOGRÁFICO INSPIRADO NA NETFLIX */}
      {/* ========================================================================= */}
      <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-slate-900 px-4 sm:px-6 py-20 sm:py-28">
        {/* Background Fotográfico Cinematográfico 40+ (Camadas 1, 2 e 3: Mosaico Real, Overlay e Gradientes) */}
        <HeroFitnessMosaic />

        {/* CAMADA 4: CONTEÚDO INTERATIVO (Z-INDEX: 10) */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fadeIn">
          {/* Badge de Destaque Estilo Streaming */}
          <div className="inline-flex items-center gap-2.5 bg-slate-950/85 hover:bg-slate-900 border border-emerald-500/40 px-4 py-2 rounded-full text-xs font-bold text-emerald-300 shadow-2xl shadow-black/80 backdrop-blur-md transition">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide">Plataforma de Força & Longevidade para a Vida 40+</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black text-white tracking-tight leading-[1.06] text-balance drop-shadow-[0_6px_28px_rgba(0,0,0,0.95)]">
            Sua melhor fase começa <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              com movimento.
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-xl text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed text-balance drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Treinos de força, mobilidade e condicionamento para viver com mais autonomia e qualidade de vida depois dos 40.
          </p>

          {/* Ações do Hero / Conversão */}
          <div className="pt-2 sm:pt-4 max-w-md mx-auto space-y-3">
            <button
              type="button"
              onClick={() => onNavigate('/cadastro')}
              className="w-full min-h-[56px] py-4 px-8 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white text-base sm:text-lg font-black rounded-2xl transition duration-200 shadow-2xl shadow-emerald-950/90 flex items-center justify-center gap-3 cursor-pointer group border border-emerald-400/30"
            >
              <span>Começar grátis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
            </button>

            {/* Texto de Apoio Obrigatório */}
            <p className="text-xs sm:text-sm text-emerald-300 font-semibold tracking-wide">
              Crie sua conta e tenha acesso a 12 treinos gratuitos.
            </p>
          </div>

          {/* Pilares de Confiança e Acessibilidade */}
          <div className="pt-4 sm:pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sem exigência de cartão</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>12 treinos gratuitos liberados</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Celular, tablet e computador</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SEÇÃO A: "TREINE PARA CONTINUAR CAPAZ" */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full border-b border-slate-900">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Objetivos Reais para o Dia a Dia
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Treine para continuar capaz
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Depois dos 40 anos, a força muscular não é questão de vaidade: é o principal pilar para manter sua independência, subir escadas com firmeza, carregar compras e viver sem limitações.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl hover:border-emerald-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Força Funcional</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Músculos fortes para realizar tarefas cotidianas com facilidade, manter a postura ereta e combater a perda de massa magra.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl hover:border-teal-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Proteção Articular</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fortalecimento estratégico dos glúteos e do core para amortecer o impacto sobre joelhos, quadris e coluna vertebral.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl hover:border-amber-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Equilíbrio e Firmeza</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Treino de propriocepção e estabilidade de tornozelos para caminhar com confiança e prevenir quedas ou tropeços.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl hover:border-rose-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Fôlego sem Impacto</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estímulo cardiovascular inteligente que ativa a circulação e aumenta sua disposição diária sem sobrecarregar tendões.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SEÇÃO B: "ESCOLHA COMO QUER EVOLUIR" */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full border-b border-slate-900">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-400 uppercase bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            Pilares do Método
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Escolha como quer evoluir
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Seja qual for seu ponto de partida, o Melhor Forma Play organiza os treinos em 4 caminhos complementares e progressivos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Força */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-emerald-500/40 transition shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Pilar Fundamental
                </span>
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Força para a Vida 40+</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Movimentos poliarticulares que constroem a base necessária para levantar da cadeira, carregar objetos e sustentar o corpo com firmeza e vitalidade.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between border-t border-slate-800/80 mt-6">
              <span className="text-xs text-slate-400">12 treinos inclusos na conta gratuita</span>
              <button 
                type="button"
                onClick={() => onNavigate('/cadastro')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Conhecer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Mobilidade */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-teal-500/40 transition shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                  Amplitude & Flexibilidade
                </span>
                <Activity className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Mobilidade Articular</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sessões focadas em destravar quadris, ombros e coluna. Alívio de tensões matinais e recuperação do arco natural de movimento sem esforço violento.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between border-t border-slate-800/80 mt-6">
              <span className="text-xs text-slate-400">Sessões leves de 10 a 20 minutos</span>
              <button 
                type="button"
                onClick={() => onNavigate('/cadastro')}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Conhecer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Equilíbrio */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-amber-500/40 transition shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Estabilidade & Postura
                </span>
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Equilíbrio & Coordenação</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Exercícios unilaterais e proprioceptivos que estimulam os reflexos e a estabilidade dos tornozelos, fortalecendo a conexão mente-músculo.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between border-t border-slate-800/80 mt-6">
              <span className="text-xs text-slate-400">Prevenção ativa de tropeços</span>
              <button 
                type="button"
                onClick={() => onNavigate('/cadastro')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Conhecer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Condicionamento */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-rose-500/40 transition shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  Saúde Cardiovascular
                </span>
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Condicionamento & Fôlego</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Estímulos aeróbicos ritmados com pausas planejadas para aumentar sua resistência geral sem impacto articular e sem cansaço excessivo.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between border-t border-slate-800/80 mt-6">
              <span className="text-xs text-slate-400">Mais disposição para o dia inteiro</span>
              <button 
                type="button"
                onClick={() => onNavigate('/cadastro')}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Conhecer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SEÇÃO C: "CONTEÚDO PENSADO PARA VOCÊ" (VITRINE ESTILO STREAMING) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full border-b border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Vitrine de Treinos
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Conteúdo pensado para você
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Catálogo com 72 sessões sob demanda organizadas por objetivos, duração e nível.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/cadastro')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver todos os 72 treinos após cadastro</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grade de Posters Comerciais (Apenas metadados públicos - Sem prescrições) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {sampleWorkouts.map((workout) => (
            <div
              key={workout.id}
              onClick={() => onNavigate('/cadastro')}
              className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition shadow-lg flex flex-col"
            >
              {/* Capa com Proporção de Poster */}
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                <img
                  src={workout.coverImage}
                  alt={workout.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Badge de Nível / Acesso */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {workout.accessLevel === 'free' ? (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/90 text-white px-2 py-0.5 rounded shadow">
                      GRÁTIS
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded shadow">
                      PREMIUM
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-300">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{workout.duration}</span>
                  </div>
                </div>
              </div>

              {/* Informações Básicas Públicas */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-emerald-300 transition leading-snug">
                  {workout.title}
                </h4>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="capitalize">{workout.level}</span>
                  <Play className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>As prescrições completas (séries, repetições e orientações técnicas) são liberadas após o login verificado.</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/cadastro')}
            className="text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap underline"
          >
            Começar gratuitamente agora
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SEÇÃO D: "COMECE GRATUITAMENTE. EVOLUA NO SEU RITMO." */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full border-b border-slate-900">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Transparência & Acesso
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Comece gratuitamente. <br />
            Evolua no seu ritmo.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Acreditamos que todo mundo deve ter acesso à força de qualidade. Por isso, 12 treinos são 100% livres para sempre na sua conta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Conta Gratuita */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Conta Gratuita Verificada
                </span>
                <span className="text-lg font-black text-white">R$ 0</span>
              </div>
              <h3 className="text-2xl font-black text-white">Acesso Free para Sempre</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tudo o que você precisa para começar a treinar hoje mesmo com segurança, orientação e consistência.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>12 treinos completos</strong> com séries, repetições e descansos liberados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Acesso ao <strong>Catálogo Geral</strong> e modo de execução guiada</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Rastreador de evolução e histórico pessoal de treinos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sem prazo de expiração e sem cartão de crédito</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/cadastro')}
              className="mt-8 w-full min-h-[48px] py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs sm:text-sm font-black rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Criar conta gratuita agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card Acesso Premium */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                  Opção Avançada
                </span>
                <span className="text-xs font-bold text-slate-400">Planos e Compras Avulsas</span>
              </div>
              <h3 className="text-2xl font-black text-white">Acesso Premium</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Para quem deseja aprofundar em divisões musculares específicas, periodização avançada e programas intensivos.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>60 treinos adicionais</strong> divididos em 6 coleções completas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Programas para grupos musculares específicos e mobilidade profunda</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Biblioteca com alternativas e variações de exercícios</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Disponível por assinatura contínua ou compra avulsa por treino</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-500 block mb-2">
                Comece gratuitamente primeiro. Você pode decidir evoluir quando quiser.
              </span>
              <button
                type="button"
                onClick={() => onNavigate('/cadastro')}
                className="w-full min-h-[48px] py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Começar pelo plano Free</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SEÇÃO E: PERGUNTAS FREQUENTES (FAQ ACORDEÃO ACESSÍVEL) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-4xl mx-auto w-full border-b border-slate-900">
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Dúvidas Comuns
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Respostas claras sobre os treinos, cadastro e funcionamento da plataforma.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full min-h-[52px] p-5 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-white hover:text-emerald-300 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-fadeIn">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SEÇÃO F: CTA FINAL DE CONVERSÃO */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-5xl mx-auto w-full text-center space-y-6 sm:space-y-8">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/60">
          <Flame className="w-8 h-8" />
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Pronto para começar a sua melhor fase?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Junte-se ao Melhor Forma Play 40+ e descubra como o treinamento inteligente pode transformar sua disposição e autonomia.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          <button
            type="button"
            onClick={() => onNavigate('/cadastro')}
            className="w-full min-h-[52px] py-4 px-8 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base sm:text-lg font-black rounded-2xl transition shadow-2xl shadow-emerald-950/80 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Criar minha conta gratuita</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-xs text-slate-400 block">
            Acesso imediato aos 12 treinos gratuitos com cadastro verificado.
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SEÇÃO G: RODAPÉ INSTITUCIONAL */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-8 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo e Descrição */}
          <div className="flex items-center gap-2.5">
            <MelhorFormaLogo size={32} />
            <div>
              <span className="font-black text-white text-sm">Melhor Forma Play 40+</span>
              <p className="text-[11px] text-slate-500">Longevidade, força e saúde articular para a vida toda.</p>
            </div>
          </div>

          {/* Links Institucionais */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-emerald-300 transition underline underline-offset-4"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-emerald-300 transition underline underline-offset-4"
            >
              Política de Privacidade
            </button>
            <a
              href="mailto:contato@melhorformaplay.com"
              className="hover:text-emerald-300 transition underline underline-offset-4"
            >
              Contato & Suporte
            </a>
            <button
              type="button"
              onClick={() => onNavigate('/entrar')}
              className="hover:text-white transition font-bold"
            >
              Área do Aluno
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Melhor Forma Play 40+. Todos os direitos reservados.</p>
          <p className="text-[10px]">Autenticação segura via Supabase Auth e proteção RLS de dados.</p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: TERMOS DE USO */}
      {/* ========================================================================= */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Termos de Uso</h3>
              <button
                onClick={() => setIsTermsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Aceitação dos Termos:</strong> Ao criar sua conta ou acessar o aplicativo Melhor Forma Play 40+, você concorda com os presentes termos de uso e com as diretrizes de conduta técnica.
              </p>
              <p>
                <strong>2. Finalidade Educativa e de Orientação Física:</strong> Os programas e treinos disponibilizados destinam-se ao condicionamento físico e manutenção da longevidade ativa. Eles não substituem diagnósticos, orientações fisioterapêuticas ou tratamentos médicos individuais.
              </p>
              <p>
                <strong>3. Conta e Confirmação de E-mail:</strong> Cada usuário é responsável por manter a confidencialidade de suas credenciais. O acesso exige a validação real do e-mail cadastrado.
              </p>
              <p>
                <strong>4. Propriedade Intelectual:</strong> Todos os 72 treinos, descrições, vídeos, marcas e materiais gráficos são protegidos por direitos autorais e pertencem exclusivamente ao Melhor Forma Play 40+.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsTermsOpen(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Entendi e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POLÍTICA DE PRIVACIDADE (LGPD) */}
      {/* ========================================================================= */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Política de Privacidade (LGPD)</h3>
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Coleta Mínima de Dados:</strong> O Melhor Forma Play 40+ adota o princípio de minimização da LGPD. Coletamos apenas Nome Completo e E-mail para identificação do perfil e envio do código de confirmação.
              </p>
              <p>
                <strong>2. Segurança e Armazenamento:</strong> As senhas são criptografadas com hash irreversível e gerenciadas pelo Supabase Auth. Suas informações nunca são vendidas a terceiros.
              </p>
              <p>
                <strong>3. Direitos do Titular:</strong> Você tem o direito de solicitar a exclusão de seus dados, retificação ou exportação de seu histórico de treinos a qualquer momento através de contato com a equipe técnica.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Entendi e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
