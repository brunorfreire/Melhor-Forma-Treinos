import React from 'react';

export interface MosaicPhoto {
  id: string;
  src: string;
  alt: string;
  title: string;
  tag: string;
  aspect?: 'portrait' | 'landscape' | 'square';
}

export const HERO_FITNESS_PHOTOS: MosaicPhoto[] = [
  {
    id: 'photo-01',
    src: '/images/landing/hero/01-mulher-50-forca-halteres.jpg',
    alt: 'Mulher de 50 anos com halteres leves e sorriso acolhedor praticando força funcional',
    title: 'Halteres Leves 50+',
    tag: 'Força Acessível',
    aspect: 'portrait'
  },
  {
    id: 'photo-02',
    src: '/images/landing/hero/02-mulher-60-equilibrio.jpg',
    alt: 'Mulher de 55 a 60 anos em postura serena de equilíbrio e postura harmoniosa',
    title: 'Equilíbrio & Firmeza 55+',
    tag: 'Equilíbrio & Postura',
    aspect: 'portrait'
  },
  {
    id: 'photo-03',
    src: '/images/landing/hero/03-mulher-45-mobilidade-quadril.jpg',
    alt: 'Mulher de 50 anos em despertar articular suave e mobilidade matinal no tapete',
    title: 'Mobilidade no Solo 50+',
    tag: 'Articulações Livres',
    aspect: 'landscape'
  },
  {
    id: 'photo-04',
    src: '/images/landing/hero/04-homem-55-membros-superiores.jpg',
    alt: 'Homem de 55 anos com cabelos grisalhos, sorriso acolhedor e vitalidade no treino',
    title: 'Saúde & Disposição 55+',
    tag: 'Vitalidade Ativa',
    aspect: 'portrait'
  },
  {
    id: 'photo-05',
    src: '/images/landing/hero/05-mulher-52-funcional.jpg',
    alt: 'Mulher de 52 anos em circuito funcional leve focando em saúde e postura ereta',
    title: 'Funcional Suave 50+',
    tag: 'Postura & Autonomia',
    aspect: 'portrait'
  },
  {
    id: 'photo-06',
    src: '/images/landing/hero/06-mulher-65-forca-academia.jpg',
    alt: 'Mulher madura de 55 a 60 anos celebrando vigor, autonomia e envelhecimento ativo',
    title: 'Longevidade Ativa 55+',
    tag: 'Envelhecimento Ativo',
    aspect: 'portrait'
  },
  {
    id: 'photo-07',
    src: '/images/landing/hero/07-casal-maduro-caminhada.jpg',
    alt: 'Mulher de 50 anos em caminhada ativa ao ar livre com respiração livre e constância',
    title: 'Caminhada & Ritmo 50+',
    tag: 'Caminhada Ativa',
    aspect: 'landscape'
  },
  {
    id: 'photo-08',
    src: '/images/landing/hero/08-mulher-48-alongamento.jpg',
    alt: 'Mulher de 50 anos em alongamento relaxante e respiração consciente no tapete',
    title: 'Alongamento & Fôlego',
    tag: 'Alívio de Tensões',
    aspect: 'portrait'
  },
  {
    id: 'photo-09',
    src: '/images/landing/hero/09-homem-60-postura-estabilidade.jpg',
    alt: 'Homem de 60 anos ativo com postura ereta, natural e expressão acolhedora',
    title: 'Estabilidade de Tronco 60+',
    tag: 'Coluna Protegida',
    aspect: 'portrait'
  },
  {
    id: 'photo-10',
    src: '/images/landing/hero/10-grupo-45-65-atividade.jpg',
    alt: 'Mulher de 50 anos com sorriso radiante exercitando disposição e saúde diária',
    title: 'Autoestima & Bem-Estar',
    tag: 'Saúde & Sorriso',
    aspect: 'landscape'
  },
  {
    id: 'photo-11',
    src: '/images/landing/hero/11-mulher-55-agachamento-orientado.jpg',
    alt: 'Mulher de 50 anos em movimento articular cuidadoso preservando os joelhos',
    title: 'Movimento Seguro 50+',
    tag: 'Joelhos Protegidos',
    aspect: 'portrait'
  },
  {
    id: 'photo-12',
    src: '/images/landing/hero/12-mulher-madura-sorrindo-treino.jpg',
    alt: 'Mulher de 50 anos sorrindo com vitalidade em treino integrado suave',
    title: 'Energia Diária 50+',
    tag: 'Vitalidade Plena',
    aspect: 'portrait'
  },
  {
    id: 'photo-13',
    src: '/images/landing/hero/13-homem-55-autonomia-pesos.jpg',
    alt: 'Homem de 52 anos em passos leves, respiração compassada e saúde sustentável',
    title: 'Movimento Consciente 50+',
    tag: 'Estilo de Vida Ativo',
    aspect: 'portrait'
  },
  {
    id: 'photo-14',
    src: '/images/landing/hero/14-mulher-50-bracos-firmes.jpg',
    alt: 'Mulher de 50 anos praticando rosca suave para braços firmes e articulações seguras',
    title: 'Braços Firmes 50+',
    tag: 'Articulações Seguras',
    aspect: 'portrait'
  },
  {
    id: 'photo-15',
    src: '/images/landing/hero/15-mulher-45-treino-casa.jpg',
    alt: 'Mulher de 50 anos em alívio de lombar e pelve em casa no tapete',
    title: 'Prática em Casa 50+',
    tag: 'Treino no Tapete',
    aspect: 'landscape'
  }
];

export const HeroFitnessMosaic: React.FC = () => {
  // Distribuição equilibrada dos 15 cards em 5 colunas verticais (Desktop/Tablet)
  // Coluna 1: 01 (Mulher 50 Halteres), 06 (Mulher 65 Academia), 11 (Mulher 55 Agachamento)
  // Coluna 2: 02 (Mulher 60 Equilíbrio), 07 (Casal Caminhada), 12 (Mulher Sorrindo)
  // Coluna 3: 03 (Mulher 45 Mobilidade), 08 (Mulher 48 Alongamento), 13 (Homem 55 Pesos)
  // Coluna 4: 04 (Homem 55 Superiores), 09 (Homem 60 Postura), 14 (Mulher 50 Braços)
  // Coluna 5: 05 (Mulher 52 Funcional), 10 (Grupo Atividade), 15 (Mulher 45 Casa)
  const columns = [
    [HERO_FITNESS_PHOTOS[0], HERO_FITNESS_PHOTOS[5], HERO_FITNESS_PHOTOS[10]],
    [HERO_FITNESS_PHOTOS[1], HERO_FITNESS_PHOTOS[6], HERO_FITNESS_PHOTOS[11]],
    [HERO_FITNESS_PHOTOS[2], HERO_FITNESS_PHOTOS[7], HERO_FITNESS_PHOTOS[12]],
    [HERO_FITNESS_PHOTOS[3], HERO_FITNESS_PHOTOS[8], HERO_FITNESS_PHOTOS[13]],
    [HERO_FITNESS_PHOTOS[4], HERO_FITNESS_PHOTOS[9], HERO_FITNESS_PHOTOS[14]],
  ];

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ========================================================================= */}
      {/* CAMADA 1: MOSAICO FOTOGRÁFICO REAL (Z-INDEX: 0)                          */}
      {/* Grade com leve inclinação tridimensional e fotografias claramente visíveis*/}
      {/* ========================================================================= */}
      <div 
        className="absolute -top-[10%] -left-[6%] -right-[6%] -bottom-[10%] z-0 flex items-center justify-center opacity-95 transition-opacity duration-700"
        style={{
          transform: 'perspective(1100px) rotateX(7deg) rotateY(-3deg) rotateZ(-2deg) scale(1.05)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4 w-full max-w-[2100px] px-2 sm:px-4">
          {columns.map((columnCards, colIdx) => {
            // Deslocamento vertical alternado entre colunas para criar ritmo dinâmico de catálogo
            const staggerClasses = [
              '-translate-y-6 sm:-translate-y-10',
              'translate-y-4 sm:translate-y-6',
              '-translate-y-2 sm:-translate-y-4',
              'translate-y-6 sm:translate-y-8',
              '-translate-y-8 sm:-translate-y-12'
            ][colIdx % 5];

            // Responsividade das colunas: 3 no mobile, 4 em tablets, 5 em desktops
            const colVisibility =
              colIdx === 4 ? 'hidden lg:flex' :
              colIdx === 3 ? 'hidden sm:flex' : 'flex';

            return (
              <div 
                key={`col-${colIdx}`} 
                className={`${colVisibility} flex-col gap-2.5 sm:gap-3.5 md:gap-4 ${staggerClasses}`}
              >
                {columnCards.map((item) => (
                  <div
                    key={item.id}
                    className="relative w-full aspect-[3/4] sm:aspect-[3/4.2] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl shadow-black/90 flex flex-col justify-end p-2 sm:p-3 transition-transform duration-300"
                  >
                    {/* Fotografia Real com object-fit cover e renderização nítida */}
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.05] saturate-[1.08]"
                    />

                    {/* Scrim Suave individual no card: preserva a foto e dá contraste ao badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10" />

                    {/* Badge informativo de treino (estilo catálogo streaming fitness) */}
                    <div className="relative z-10 flex items-center justify-between gap-1">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-950/85 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md shadow">
                        {item.tag}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-200 drop-shadow">
                        40+
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CAMADA 2: OVERLAY CINEMATOGRÁFICO CONTROLADO (Z-INDEX: 1)                */}
      {/* Opacidade equilibrada (50%), preservando as fotos com nitidez e cores reais */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 z-[1] bg-slate-950/50"
      />

      {/* ========================================================================= */}
      {/* CAMADA 3: GRADIENTES DE PROFUNDIDADE & TRANSIÇÃO (Z-INDEX: 2)             */}
      {/* Radial suave no centro para a headline + fusão sutil nas 4 bordas        */}
      {/* ========================================================================= */}
      {/* Radial no centro: escurece sutilmente apenas a área de leitura */}
      <div 
        className="absolute inset-0 z-[2]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(2, 6, 23, 0.65) 0%, rgba(2, 6, 23, 0.40) 55%, rgba(2, 6, 23, 0.55) 90%, #020617 100%)'
        }}
      />

      {/* Gradiente superior: fusão com a navbar escura */}
      <div className="absolute top-0 left-0 right-0 h-28 z-[2] bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent" />

      {/* Gradiente inferior: fusão contínua com a próxima seção */}
      <div className="absolute bottom-0 left-0 right-0 h-36 z-[2] bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />

      {/* Halo de atmosfera esmeralda sutil no centro */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] z-[2] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
    </div>
  );
};
