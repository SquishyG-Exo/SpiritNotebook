import { useId } from 'react';

/** A stable, SVG-safe id per component instance (web SVG gradient ids are page-global). */
export function useSvgId(prefix: string): string {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, '');
}
