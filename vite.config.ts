import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// Determine base path based on environment
const getBasePath = () => {
  // For GitHub Pages, use the repository name
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repoName}/`;
  }
  // For local development, use root
  return '/';
};

const SHEET_CSV = /^https:\/\/docs\.google\.com\/spreadsheets\/.*output=csv/;

export default defineConfig({
  plugins: [
    VitePWA({
      // Unit tests load this config and do not need a service worker.
      disable: process.env.VITEST === 'true',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Same script URL as the previous hand-written worker, so installed PWAs update in place.
      filename: 'sw.js',
      manifest: false,
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        // NavigationRoute matches pathname + search. `/^\//` keeps
        // `/ranking-footgolf/?search=…` on the app shell (same rule as
        // isAppShellNavigation in src/utils/searchHistory.ts).
        navigateFallbackAllowlist: [/^\//],
        // Precache lookup ignores `search` too, so a directory URL with that
        // query still matches index.html. utm_ and fbclid stay ignored.
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^search$/],
        importScripts: ['legacy-sw-cleanup.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        runtimeCaching: [
          {
            urlPattern: SHEET_CSV,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ranking-sheet',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  base: getBasePath(),
  resolve: {
    tsconfigPaths: true,
  },
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    target: 'esnext',
    rolldownOptions: {
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.at(-1) ?? '';
          if (name.endsWith('.css')) {
            return 'css/[name].[hash].css';
          }
          return 'assets/[ext]/[name].[hash].[ext]';
        },
      },
    },
  },
  publicDir: '../public',
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.ts'],
  },
});
