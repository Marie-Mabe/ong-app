const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require('fs-extra'); // Souvent inclus, ou utilisez fs classique
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: '**/node_modules/better-sqlite3/**/*'
    },
    name: 'CDEJ LA MOISSON',
    executableName: 'cdej-la-moisson',
  },
  hooks: {
    // Un hook simple pour juste s'assurer que le dossier est copié avant le build
    packageAfterPrune: async (forgeConfig, buildPath) => {
      const fs = require('fs-extra');
      const path = require('path');
      const source = path.join(__dirname, 'node_modules', 'better-sqlite3');
      const destination = path.join(buildPath, 'node_modules', 'better-sqlite3');
      await fs.ensureDir(path.join(buildPath, 'node_modules'));
      await fs.copy(source, destination);
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: 'cde_app',
        authors: 'Marie-Mabe',
        setupIcon: './src/renderer/assets/icons/cde_1.ico',
        iconUrl: 'https://raw.githubusercontent.com/Marie-Mabe/ong-app/main/src/renderer/assets/icons/cde_1.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          { entry: 'src/main.js', config: 'vite.main.config.mjs', target: 'main' },
          { entry: 'src/preload.js', config: 'vite.preload.config.mjs', target: 'preload' },
        ],
        renderer: [
          { name: 'main_window', config: 'vite.renderer.config.mjs' },
        ],
      },
    },
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
};