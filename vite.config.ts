import { resolve } from 'path';
import { defineConfig } from 'vite';

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

export default defineConfig({
  base: getBasePath(),
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve('src/index.html'),
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names && assetInfo.names[assetInfo.names.length - 1].endsWith('.css')) {
            return `css/[name].[hash].css`;
          }
          return `assets/[ext]/[name].[hash].[ext]`;
        },
      },
    },
  },
  publicDir: '../public',
});
