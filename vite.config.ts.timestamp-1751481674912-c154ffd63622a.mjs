// vite.config.ts
import { defineConfig } from "file:///C:/Users/Anil/Desktop/New%20folder/skyidrow-threat-nexus-main/skyidrow-threat-nexus-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Anil/Desktop/New%20folder/skyidrow-threat-nexus-main/skyidrow-threat-nexus-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Anil/Desktop/New%20folder/skyidrow-threat-nexus-main/skyidrow-threat-nexus-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Anil\\Desktop\\New folder\\skyidrow-threat-nexus-main\\skyidrow-threat-nexus-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to Express backend
      "/api": {
        target: "https://skyidrowsecurity.onrender.com",
        changeOrigin: true,
        secure: false,
        // Add WebSocket support for future real-time features
        ws: true,
        // Add logging for proxy requests (for easier debugging)
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(`[vite-proxy] ${req.method} ${req.url} -> ${options.target}`);
          });
        }
      }
    },
    // Enable SPA fallback for client-side routing
    historyApiFallback: true,
    // Open browser automatically on dev start
    open: true,
    // Allow CORS for local development
    cors: true
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBbmlsXFxcXERlc2t0b3BcXFxcTmV3IGZvbGRlclxcXFxza3lpZHJvdy10aHJlYXQtbmV4dXMtbWFpblxcXFxza3lpZHJvdy10aHJlYXQtbmV4dXMtbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQW5pbFxcXFxEZXNrdG9wXFxcXE5ldyBmb2xkZXJcXFxcc2t5aWRyb3ctdGhyZWF0LW5leHVzLW1haW5cXFxcc2t5aWRyb3ctdGhyZWF0LW5leHVzLW1haW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FuaWwvRGVza3RvcC9OZXclMjBmb2xkZXIvc2t5aWRyb3ctdGhyZWF0LW5leHVzLW1haW4vc2t5aWRyb3ctdGhyZWF0LW5leHVzLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIHByb3h5OiB7XG4gICAgICAvLyBQcm94eSBBUEkgcmVxdWVzdHMgdG8gRXhwcmVzcyBiYWNrZW5kXG4gICAgICBcIi9hcGlcIjoge1xuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAxXCIsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgLy8gQWRkIFdlYlNvY2tldCBzdXBwb3J0IGZvciBmdXR1cmUgcmVhbC10aW1lIGZlYXR1cmVzXG4gICAgICAgIHdzOiB0cnVlLFxuICAgICAgICAvLyBBZGQgbG9nZ2luZyBmb3IgcHJveHkgcmVxdWVzdHMgKGZvciBlYXNpZXIgZGVidWdnaW5nKVxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxKSA9PiB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgY29uc29sZS5sb2coYFt2aXRlLXByb3h5XSAke3JlcS5tZXRob2R9ICR7cmVxLnVybH0gLT4gJHtvcHRpb25zLnRhcmdldH1gKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBFbmFibGUgU1BBIGZhbGxiYWNrIGZvciBjbGllbnQtc2lkZSByb3V0aW5nXG4gICAgaGlzdG9yeUFwaUZhbGxiYWNrOiB0cnVlLFxuICAgIC8vIE9wZW4gYnJvd3NlciBhdXRvbWF0aWNhbGx5IG9uIGRldiBzdGFydFxuICAgIG9wZW46IHRydWUsXG4gICAgLy8gQWxsb3cgQ09SUyBmb3IgbG9jYWwgZGV2ZWxvcG1lbnRcbiAgICBjb3JzOiB0cnVlLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9jLFNBQVMsb0JBQW9CO0FBQ2plLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxNQUVMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQTtBQUFBLFFBRVIsSUFBSTtBQUFBO0FBQUEsUUFFSixXQUFXLENBQUMsT0FBTyxZQUFZO0FBQzdCLGdCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsUUFBUTtBQUV0QyxvQkFBUSxJQUFJLGdCQUFnQixJQUFJLE1BQU0sSUFBSSxJQUFJLEdBQUcsT0FBTyxRQUFRLE1BQU0sRUFBRTtBQUFBLFVBQzFFLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsb0JBQW9CO0FBQUE7QUFBQSxJQUVwQixNQUFNO0FBQUE7QUFBQSxJQUVOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
