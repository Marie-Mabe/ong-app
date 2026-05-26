import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'node16',
        minify: false,
        rollupOptions: {
            external: [
                'electron',          // ← manquait
                'better-sqlite3',
                'path',              // modules natifs Node
                'fs',
                'os',
                'crypto',
            ],
            output: {
                format: 'cjs',       // ← obligatoire pour le main process Electron
                entryFileNames: '[name].js',
            },
        },
    },
});