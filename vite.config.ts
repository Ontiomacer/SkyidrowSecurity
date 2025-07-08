import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
          proxy.on('proxyReq', (proxyReq, req) => {
            // eslint-disable-next-line no-console
            console.log(`[vite-proxy] ${req.method} ${req.url} -> ${options.target}`);
          });
        },
      },
    },
    // Enable SPA fallback for client-side routing
    historyApiFallback: true,
    // Open browser automatically on dev start
    open: true,
    // Allow CORS for local development
    cors: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
