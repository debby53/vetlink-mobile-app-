import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";
import { createServer } from "./server";

dotenv.config();

const backendOrigin = process.env.VITE_BACKEND_ORIGIN?.trim() || "http://localhost:8088";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 5173,
    proxy: {
      "/api": {
        target: backendOrigin,
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: backendOrigin,
        changeOrigin: true,
        secure: false,
      },
      "/ws-call": {
        target: backendOrigin,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/ws-call-sockjs": {
        target: backendOrigin,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/ws-market": {
        target: backendOrigin,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
