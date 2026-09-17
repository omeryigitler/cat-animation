import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function syncBerfinCatRuntime(): Plugin {
  const replaceRequired = (source: string, search: string, replacement: string, label: string) => {
    const patched = source.replace(search, replacement);
    if (patched === source) {
      throw new Error(`${label} could not be applied.`);
    }
    return patched;
  };

  return {
    name: 'sync-berfin-cat-runtime',
    enforce: 'pre',
    transform(source, id) {
      const cleanId = id.split('?')[0].replaceAll('\\', '/');
      if (!cleanId.endsWith('/src/components/CatWidget.tsx')) return null;

      const catLayoutSource = `      const currentScale = propsRef.current.scale;
      const canvasSize = Math.max(120, Math.floor(180 * (currentScale / 1.3)));
      const halfSize = canvasSize / 2;

      if (containerRef.current) {
        const constrainedX = Math.max(halfSize, Math.min(window.innerWidth - halfSize, s.x));`;
      const catLayoutTarget = `      const currentScale = propsRef.current.scale;
      const canvasSize = Math.max(120, Math.floor(180 * (currentScale / 1.3)));
      const halfSize = canvasSize / 2;
      const sidePadding = Math.max(24, Math.round(canvasSize * 0.14));
      const baseCatCenterY = canvasSize - 1 - 37 * currentScale;
      const floorShift = baseCatCenterY - halfSize;

      if (containerRef.current) {
        const minX = halfSize + sidePadding;
        const maxX = Math.max(minX, window.innerWidth - halfSize - sidePadding);
        const constrainedX = Math.max(minX, Math.min(maxX, s.x));`;

      let patched = replaceRequired(source, catLayoutSource, catLayoutTarget, 'Kedi floor layout');
      patched = replaceRequired(
        patched,
        '          const bubbleBottom = Math.floor(140 * (currentScale / 1.3));',
        '          const bubbleBottom = Math.max(72, Math.floor(140 * (currentScale / 1.3) - floorShift));',
        'Kedi speech bubble floor offset',
      );
      patched = replaceRequired(
        patched,
        '            if (leftEdge < 10) shift = 10 - leftEdge;\n            else if (rightEdge > window.innerWidth - 10) shift = (window.innerWidth - 10) - rightEdge;',
        '            if (leftEdge < sidePadding) shift = sidePadding - leftEdge;\n            else if (rightEdge > window.innerWidth - sidePadding) shift = (window.innerWidth - sidePadding) - rightEdge;',
        'Kedi speech bubble side margins',
      );
      patched = replaceRequired(
        patched,
        "          drawCat(ctx, halfSize, halfSize, walkCycle, pose, elapsed, s.direction, currentScale, propsRef.current.isDarkMode, propsRef.current.colorTheme, propsRef.current.accessory, propsRef.current.catType);",
        "          const walkFloorAdjustment = pose === 'WALK' ? Math.max(0, Math.sin(walkCycle) * 5) : 0;\n          const catCenterY = baseCatCenterY - walkFloorAdjustment * currentScale;\n          drawCat(ctx, halfSize, catCenterY, walkCycle, pose, elapsed, s.direction, currentScale, propsRef.current.isDarkMode, propsRef.current.colorTheme, propsRef.current.accessory, propsRef.current.catType);",
        'Kedi canvas floor baseline',
      );

      return { code: patched, map: null };
    },
  };
}

export default defineConfig(() => ({
  plugins: [syncBerfinCatRuntime(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
