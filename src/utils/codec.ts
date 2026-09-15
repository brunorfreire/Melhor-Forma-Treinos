import LZString from 'lz-string';
import { WorkoutPlan } from '../types';

/**
 * Encodes a WorkoutPlan into a highly compact, URL-safe string.
 * Uses lz-string compression to keep WhatsApp link lengths short and reliable.
 */
export function encodeWorkoutPlan(plan: WorkoutPlan): string {
  try {
    const jsonStr = JSON.stringify(plan);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    return compressed;
  } catch (err) {
    console.error('Failed to compress plan', err);
    // Fallback to encodeURIComponent base64
    return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(plan)))));
  }
}

/**
 * Decodes a WorkoutPlan from URL hash or query string.
 */
export function decodeWorkoutPlan(encodedStr: string): WorkoutPlan | null {
  if (!encodedStr) return null;
  try {
    // First try lz-string decompression
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedStr);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      if (parsed && Array.isArray(parsed.sessions)) {
        return parsed as WorkoutPlan;
      }
    }
  } catch (e) {
    // Ignore and try fallback
  }

  try {
    // Fallback 1: Direct JSON decode
    const decodedUri = decodeURIComponent(encodedStr);
    if (decodedUri.startsWith('{')) {
      const parsed = JSON.parse(decodedUri);
      if (parsed && Array.isArray(parsed.sessions)) {
        return parsed as WorkoutPlan;
      }
    }
    // Fallback 2: Base64 decode
    const decodedB64 = decodeURIComponent(escape(atob(decodedUri)));
    const parsed = JSON.parse(decodedB64);
    if (parsed && Array.isArray(parsed.sessions)) {
      return parsed as WorkoutPlan;
    }
  } catch (err) {
    console.warn('Could not decode workout plan from string:', err);
  }

  return null;
}

/**
 * Generates the full shareable link.
 * If APP_URL is available, it uses it, otherwise falls back to current origin + pathname.
 */
export function buildShareUrl(plan: WorkoutPlan): string {
  const encoded = encodeWorkoutPlan(plan);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#plan=${encoded}`;
}
