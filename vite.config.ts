import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import qiankun from 'vite-plugin-qiankun';
import * as cheerio from 'cheerio';

// Plugin to remove React Refresh preamble
const removeReactRefreshScript = () => {
  return {
    name: 'remove-react-refresh',
    transformIndexHtml(html) {
      const $ = cheerio.load(html);
      $('script[src="/@react-refresh"]').remove();
      return $.html();
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: mode === 'production' ? 'https://dashboard.harx.ai/' : '/',
    plugins: [
      react({
        jsxRuntime: 'classic',
      }),
      qiankun('app7', {
        useDevMode: true,
        scopeCss: true,
      }),
      removeReactRefreshScript(),
    ],
    define: {
      'import.meta.env': env,
    },
    server: {
      port: 5180,
      cors: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5180,
      },
      fs: {
        strict: true,
        allow: ['..'],
      },
    },
    build: {
      target: 'esnext',
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: 'umd',
          name: 'app7',
          entryFileNames: 'index.js',
          chunkFileNames: 'chunk-[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) {
              return 'index.css';
            }
            return '[name].[ext]';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  };
});
