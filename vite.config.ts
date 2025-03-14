import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import qiankun from 'vite-plugin-qiankun';
import * as cheerio from 'cheerio';

// Plugin to remove React Refresh preamble
const removeReactRefreshScript = () => {
  return {
    name: 'remove-react-refresh',
    transformIndexHtml(html: string) {
      const $ = cheerio.load(html);
      $('script[src="/@react-refresh"]').remove();
      return $.html();
    },
  };
};

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: 'http://localhost:5180',
    plugins: [
      react({
        jsxRuntime: 'classic',
      }),
      qiankun('app7', {
        useDevMode: true,
      }),
      removeReactRefreshScript(),
    ],
    define: {
      'import.meta.env': env,
    },
    server: {
      port: 5180,
      cors: true,
      hmr: false,
      fs: {
        strict: true,
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
            if (assetInfo.name?.endsWith('.css')) {
              return 'index.css';
            }
            return '[name].[ext]';
          },
        },
      },
      commonjsOptions: {
        include: [/@qalqul\/sdk-call/],
        transformMixedEsModules: true,
        defaultIsModuleExports: true
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@qalqul/sdk-call': path.resolve(__dirname, 'node_modules/@qalqul/sdk-call'),
        '@qalqul/sdk-call/dist/model/QalqulSDK': path.resolve(__dirname, 'node_modules/@qalqul/sdk-call/dist/model/QalqulSDK'),
      },
    },
    optimizeDeps: {
      include: ['@qalqul/sdk-call', '@qalqul/sdk-call/dist/model/QalqulSDK'],
      esbuildOptions: {
        target: 'esnext',
        format: 'esm'
      }
    },
  };
});
