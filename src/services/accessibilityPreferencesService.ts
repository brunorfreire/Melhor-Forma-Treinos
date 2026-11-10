/**
 * SERVIÇO DE PREFERÊNCIAS DE ACESSIBILIDADE | MELHOR FORMA PLAY 40+
 *
 * Gerencia a escala de leitura e o tamanho da fonte em toda a aplicação.
 * Projetado especialmente para o público 40+, com persistência em localStorage
 * e aplicação imediata no elemento raiz do DOM via atributo data-font-scale.
 */

export type FontScaleLevel = 'normal' | 'large' | 'xlarge';

const FONT_SCALE_STORAGE_KEY = 'mf_font_scale_preference_v1';

export interface FontScaleInfo {
  level: FontScaleLevel;
  percentage: number;
  label: string;
  shortBadge: string;
  description: string;
  toastMessage: string;
}

export const FONT_SCALE_METADATA: Record<FontScaleLevel, FontScaleInfo> = {
  normal: {
    level: 'normal',
    percentage: 100,
    label: 'Padrão (100%)',
    shortBadge: 'Aa',
    description: 'Tamanho original de leitura',
    toastMessage: 'Tamanho de leitura: Padrão (100%)'
  },
  large: {
    level: 'large',
    percentage: 110,
    label: 'Maior (110%)',
    shortBadge: 'Aa+',
    description: 'Letras 10% maiores para leitura confortável',
    toastMessage: 'Tamanho de leitura: Maior (+10%)'
  },
  xlarge: {
    level: 'xlarge',
    percentage: 120,
    label: 'Muito maior (120%)',
    shortBadge: 'Aa++',
    description: 'Letras 20% maiores para máxima visibilidade',
    toastMessage: 'Tamanho de leitura: Muito maior (+20%)'
  }
};

/**
 * Lê o nível de fonte armazenado no localStorage (ou retorna 'normal' como padrão)
 */
export function getStoredFontScale(): FontScaleLevel {
  if (typeof window === 'undefined') return 'normal';
  try {
    const stored = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    if (stored === 'normal' || stored === 'large' || stored === 'xlarge') {
      return stored;
    }
  } catch (err) {
    console.warn('Erro ao ler preferência de acessibilidade:', err);
  }
  return 'normal';
}

/**
 * Aplica o atributo data-font-scale no elemento raiz <html>
 */
export function applyFontScaleToDOM(scale: FontScaleLevel): void {
  if (typeof document === 'undefined') return;
  try {
    document.documentElement.setAttribute('data-font-scale', scale);
  } catch (err) {
    console.warn('Erro ao aplicar escala de fonte no DOM:', err);
  }
}

/**
 * Salva a preferência de escala no localStorage, atualiza o DOM e dispara evento global
 */
export function setFontScalePreference(scale: FontScaleLevel): void {
  applyFontScaleToDOM(scale);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FONT_SCALE_STORAGE_KEY, scale);
      window.dispatchEvent(
        new CustomEvent('mf:font-scale-changed', {
          detail: { scale, info: FONT_SCALE_METADATA[scale] }
        })
      );
    } catch (err) {
      console.warn('Erro ao persistir preferência de acessibilidade:', err);
    }
  }
}

/**
 * Cicla entre os 3 níveis: normal (100%) -> large (110%) -> xlarge (120%) -> normal (100%)
 */
export function cycleFontScale(current: FontScaleLevel): FontScaleLevel {
  switch (current) {
    case 'normal':
      return 'large';
    case 'large':
      return 'xlarge';
    case 'xlarge':
    default:
      return 'normal';
  }
}

/**
 * Inicializa a escala salva logo no carregamento inicial da página
 */
export function initFontScaleFromStorage(): FontScaleLevel {
  const current = getStoredFontScale();
  applyFontScaleToDOM(current);
  return current;
}
