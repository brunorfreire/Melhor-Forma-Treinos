/**
 * Utilitários para resolução e embed seguro de vídeos do Vimeo
 * Melhor Forma Play 40+
 */

/**
 * Extrai o ID numérico do Vimeo a partir de links em diversos formatos:
 * - https://vimeo.com/123456789
 * - https://vimeo.com/channels/staffpicks/123456789
 * - https://player.vimeo.com/video/123456789
 * - 123456789 (ID puro)
 */
export function extractVimeoId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Se já for apenas dígitos numéricos
  if (/^\d{6,12}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex abrangente para URLs do Vimeo
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/i;
  const match = trimmed.match(vimeoRegex);
  if (match && match[3]) {
    return match[3];
  }

  // Formato player.vimeo.com/video/123456789
  const playerMatch = trimmed.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (playerMatch && playerMatch[1]) {
    return playerMatch[1];
  }

  return null;
}

/**
 * Constrói a URL do player embed do Vimeo com parâmetros seguros
 */
export function buildVimeoEmbedUrl(vimeoId: string, autoplay = true): string {
  const cleanId = vimeoId.trim();
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    loop: '1',
    muted: '1',
    title: '0',
    byline: '0',
    portrait: '0',
    dnt: '1' // Do Not Track
  });
  return `https://player.vimeo.com/video/${cleanId}?${params.toString()}`;
}
