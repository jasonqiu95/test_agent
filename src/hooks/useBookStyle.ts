import { useEffect } from 'react';
import { useProjectStore } from '../stores/project-store';
import { StyleEngine } from '../services/style-engine/StyleEngine';

/**
 * Hook to apply book styles to the DOM
 */
export function useBookStyle() {
  const { project } = useProjectStore();

  useEffect(() => {
    if (!project) return;

    const css = StyleEngine.generateCSS(project.styleConfig);

    // Create or update the style element
    let styleEl = document.getElementById('book-style-dynamic') as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'book-style-dynamic';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = css;

    // Cleanup
    return () => {
      // Don't remove on unmount, just update
    };
  }, [project?.styleConfig]);
}
