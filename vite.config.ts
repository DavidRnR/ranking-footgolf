import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
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
