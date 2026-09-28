/**
 * Returns a token color (#RGB or #RRGGBB) with an alpha channel, so scenery
 * and glass surfaces can stay on brand tokens instead of hard-coded rgba().
 * Candidate for src/theme once other features need it.
 */
export function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.replace(/(.)/g, '$1$1') : raw.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
