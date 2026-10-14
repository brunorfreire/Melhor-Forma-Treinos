import React from 'react';

interface MelhorFormaLogoProps {
  className?: string;
  size?: number; // Size in pixels for icon (e.g. 32, 36, 40)
  showText?: boolean;
  textClassName?: string;
  badgeText?: string;
  subtext?: string;
  onClick?: () => void;
}

/**
 * Ícone e Logotipo Oficial do Melhor Forma Play
 * Características:
 * - Fundo azul-marinho profundo com iluminação radial
 * - Contorno triangular de Play com gradiente azul-turquesa (#00F2FE) e coral (#FF6B6B)
 * - Efeito luminoso neon com aura ambiente
 * - Monograma central branco "MF" com tipografia atlética
 */
export const MelhorFormaLogo: React.FC<MelhorFormaLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
  textClassName = '',
  badgeText = '40+',
  subtext,
  onClick,
}) => {
  const iconContent = (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md rounded-xl overflow-hidden transition-transform duration-200 group-hover:scale-105"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="mfLogoBg" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#0F2448"/>
            <stop offset="55%" stopColor="#0A182F"/>
            <stop offset="100%" stopColor="#050E1C"/>
          </radialGradient>

          <linearGradient id="mfLogoStroke" x1="10%" y1="90%" x2="92%" y2="22%">
            <stop offset="0%" stopColor="#00F2FE"/>
            <stop offset="30%" stopColor="#00D2FF"/>
            <stop offset="65%" stopColor="#FF6B6B"/>
            <stop offset="100%" stopColor="#FF8E53"/>
          </linearGradient>

          <linearGradient id="mfInteriorGlass" x1="15%" y1="85%" x2="85%" y2="25%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.08"/>
          </linearGradient>

          <filter id="mfNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Fundo Azul-Marinho */}
        <rect width="512" height="512" rx="112" fill="url(#mfLogoBg)"/>

        {/* Aura Luminosa de Contorno */}
        <path
          d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
          fill="none"
          stroke="url(#mfLogoStroke)"
          strokeWidth="24"
          opacity="0.38"
          filter="url(#mfNeonGlow)"
          strokeLinejoin="round"
        />

        {/* Vidro Interno */}
        <path
          d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
          fill="url(#mfInteriorGlass)"
          stroke="none"
        />

        {/* Triângulo de Play com Gradiente Azul-Turquesa e Coral */}
        <path
          d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
          fill="none"
          stroke="url(#mfLogoStroke)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Linha Fina Interna */}
        <path
          d="M 180,146 C 170,140 162,146 162,158 L 162,354 C 162,366 170,372 180,366 L 350,268 C 360,262 360,250 350,244 Z"
          fill="none"
          stroke="url(#mfLogoStroke)"
          strokeWidth="2.5"
          opacity="0.5"
        />

        {/* Monograma Central Branco "MF" */}
        <g fill="#FFFFFF">
          <path d="M 170,214 L 187,214 L 204,260 L 221,214 L 238,214 L 238,298 L 223,298 L 223,242 L 209,282 L 199,282 L 185,242 L 185,298 L 170,298 Z"/>
          <path d="M 248,214 L 292,214 L 292,229 L 264,229 L 264,250 L 286,250 L 286,264 L 264,264 L 264,298 L 248,298 Z"/>
        </g>
      </svg>
    </div>
  );

  if (!showText) {
    return iconContent;
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 group shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {iconContent}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-black tracking-tight text-white group-hover:text-emerald-300 transition leading-none truncate ${textClassName || 'text-sm sm:text-base'}`}>
            Melhor Forma Play
          </span>
          {badgeText && (
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0 leading-none">
              {badgeText}
            </span>
          )}
        </div>
        {subtext && (
          <span className="text-[10px] text-emerald-400/90 font-medium tracking-tight mt-0.5 truncate hidden xs:block">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
