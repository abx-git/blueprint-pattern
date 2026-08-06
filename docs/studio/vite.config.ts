import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so GitHub Pages and local static servers work without a fixed path.
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    // Bake wall-clock of this build into the SPA (shown in the site footer).
    __AGM_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
