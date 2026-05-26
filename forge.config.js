const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: '**/node_modules/better-sqlite3/**', // better-sqlite3 hors de l'asar
    },
    name: 'CDEJ LA MOISSON',
    executableName: 'cdej-la-moisson',
    author: 'Marie-Mabe',
    icon: './src/renderer/assets/icons/cde',
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
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          name: 'ong-app',
          maintainer: 'Marie-Mabe <topmabe@gmail.com>',
          description: 'Gestion des bénéficiaires sortants - CDEJ LA MOISSON',
          categories: ['Utility'],
          icon: './src/renderer/assets/icons/cde.png',
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives', // gère les modules natifs .node
      config: {},
    },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
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