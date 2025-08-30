import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
  build: {
    // Otimizações de bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas grandes em chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'chart-vendor': ['recharts'],
          'date-vendor': ['date-fns', 'react-day-picker'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Aumentar limite de chunk para evitar avisos
    chunkSizeWarningLimit: 1000,
    // Otimizar assets
    assetsInlineLimit: 4096,
  },
  // Otimizar carregamento de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'lucide-react',
      'recharts',
      'date-fns',
    ],
  },
}));