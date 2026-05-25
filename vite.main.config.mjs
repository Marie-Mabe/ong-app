import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'node16',  // adapte à la version de Node d'Electron
        minify: false,     // plus sûr pour les modules natifs
        rollupOptions: {
            external: ['better-sqlite3'], // <-- ça dit à Vite de ne pas inclure le module natif
        },
    },
});