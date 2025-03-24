// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/houssam/Documents/harx/apps/v25_dashboard_frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/houssam/Documents/harx/apps/v25_dashboard_frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import qiankun from "file:///C:/Users/houssam/Documents/harx/apps/v25_dashboard_frontend/node_modules/vite-plugin-qiankun/dist/index.js";
import * as cheerio from "file:///C:/Users/houssam/Documents/harx/apps/v25_dashboard_frontend/node_modules/cheerio/dist/esm/index.js";
var __vite_injected_original_dirname = "C:\\Users\\houssam\\Documents\\harx\\apps\\v25_dashboard_frontend";
var removeReactRefreshScript = () => {
  return {
    name: "remove-react-refresh",
    transformIndexHtml(html) {
      const $ = cheerio.load(html);
      $('script[src="/@react-refresh"]').remove();
      return $.html();
    }
  };
};
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "https://dashboard.harx.ai/",
    plugins: [
      react({
        jsxRuntime: "classic"
      }),
      qiankun("app7", {
        useDevMode: true,
        scopeCss: true
      }),
      removeReactRefreshScript()
      // Add the script removal plugin
    ],
    define: {
      "import.meta.env": env
    },
    server: {
      port: 5180,
      cors: "*",
      hmr: false,
      fs: {
        strict: true
        // Ensure static assets are correctly resolved
      }
    },
    build: {
      target: "esnext",
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: "umd",
          name: "app7",
          entryFileNames: "index.js",
          // Fixed name for the JS entry file
          chunkFileNames: "chunk-[name].js",
          // Fixed name for chunks
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith(".css")) {
              return "index.css";
            }
            return "[name].[ext]";
          }
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxob3Vzc2FtXFxcXERvY3VtZW50c1xcXFxoYXJ4XFxcXGFwcHNcXFxcdjI1X2Rhc2hib2FyZF9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcaG91c3NhbVxcXFxEb2N1bWVudHNcXFxcaGFyeFxcXFxhcHBzXFxcXHYyNV9kYXNoYm9hcmRfZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2hvdXNzYW0vRG9jdW1lbnRzL2hhcngvYXBwcy92MjVfZGFzaGJvYXJkX2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgcWlhbmt1biBmcm9tICd2aXRlLXBsdWdpbi1xaWFua3VuJztcclxuaW1wb3J0ICogYXMgY2hlZXJpbyBmcm9tICdjaGVlcmlvJztcclxuXHJcbi8vIFBsdWdpbiB0byByZW1vdmUgUmVhY3QgUmVmcmVzaCBwcmVhbWJsZVxyXG5jb25zdCByZW1vdmVSZWFjdFJlZnJlc2hTY3JpcHQgPSAoKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdyZW1vdmUtcmVhY3QtcmVmcmVzaCcsXHJcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xyXG4gICAgICBjb25zdCAkID0gY2hlZXJpby5sb2FkKGh0bWwpO1xyXG4gICAgICAkKCdzY3JpcHRbc3JjPVwiL0ByZWFjdC1yZWZyZXNoXCJdJykucmVtb3ZlKCk7XHJcbiAgICAgIHJldHVybiAkLmh0bWwoKTtcclxuICAgIH0sXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGJhc2U6ICdodHRwczovL2Rhc2hib2FyZC5oYXJ4LmFpLycsXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KHtcclxuICAgICAgICBqc3hSdW50aW1lOiAnY2xhc3NpYycsXHJcbiAgICAgIH0pLFxyXG4gICAgICBxaWFua3VuKCdhcHA3Jywge1xyXG4gICAgICAgIHVzZURldk1vZGU6IHRydWUsXHJcbiAgICAgICAgc2NvcGVDc3M6IHRydWUsXHJcbiAgICAgIH0pLFxyXG4gICAgICByZW1vdmVSZWFjdFJlZnJlc2hTY3JpcHQoKSwgLy8gQWRkIHRoZSBzY3JpcHQgcmVtb3ZhbCBwbHVnaW5cclxuICAgIF0sXHJcblxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYnOiBlbnYsXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDUxODAsXHJcbiAgICAgIGNvcnM6IFwiKlwiLFxyXG4gICAgICBobXI6IGZhbHNlLFxyXG4gICAgICBmczoge1xyXG4gICAgICAgIHN0cmljdDogdHJ1ZSwgLy8gRW5zdXJlIHN0YXRpYyBhc3NldHMgYXJlIGNvcnJlY3RseSByZXNvbHZlZFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIGZvcm1hdDogJ3VtZCcsXHJcbiAgICAgICAgICBuYW1lOiAnYXBwNycsXHJcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2luZGV4LmpzJywgLy8gRml4ZWQgbmFtZSBmb3IgdGhlIEpTIGVudHJ5IGZpbGVcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnY2h1bmstW25hbWVdLmpzJywgLy8gRml4ZWQgbmFtZSBmb3IgY2h1bmtzXHJcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xyXG4gICAgICAgICAgICAvLyBFbnN1cmUgQ1NTIGZpbGVzIGFyZSBjb25zaXN0ZW50bHkgbmFtZWRcclxuICAgICAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lLmVuZHNXaXRoKCcuY3NzJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2luZGV4LmNzcyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICdbbmFtZV0uW2V4dF0nOyAvLyBEZWZhdWx0IGZvciBvdGhlciBhc3NldCB0eXBlc1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVgsU0FBUyxjQUFjLGVBQWU7QUFDdlosT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGFBQWE7QUFDcEIsWUFBWSxhQUFhO0FBSnpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU0sMkJBQTJCLE1BQU07QUFDckMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sbUJBQW1CLE1BQU07QUFDdkIsWUFBTSxJQUFZLGFBQUssSUFBSTtBQUMzQixRQUFFLCtCQUErQixFQUFFLE9BQU87QUFDMUMsYUFBTyxFQUFFLEtBQUs7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsUUFDSixZQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsTUFDRCxRQUFRLFFBQVE7QUFBQSxRQUNkLFlBQVk7QUFBQSxRQUNaLFVBQVU7QUFBQSxNQUNaLENBQUM7QUFBQSxNQUNELHlCQUF5QjtBQUFBO0FBQUEsSUFDM0I7QUFBQSxJQUVBLFFBQVE7QUFBQSxNQUNOLG1CQUFtQjtBQUFBLElBQ3JCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsTUFDTCxJQUFJO0FBQUEsUUFDRixRQUFRO0FBQUE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsY0FBYztBQUFBLE1BQ2QsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsTUFBTTtBQUFBLFVBQ04sZ0JBQWdCO0FBQUE7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQTtBQUFBLFVBQ2hCLGdCQUFnQixDQUFDLGNBQWM7QUFFN0IsZ0JBQUksVUFBVSxLQUFLLFNBQVMsTUFBTSxHQUFHO0FBQ25DLHFCQUFPO0FBQUEsWUFDVDtBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQ3BDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
