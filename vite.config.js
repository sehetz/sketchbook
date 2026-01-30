import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // ⭐ Lokal immer '/'
  server: {
    port: 5174,
    strictPort: false,
    open: false,
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
        },
        // Force .js extension for all chunks (fixes MIME type issues)
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Use esbuild for faster minification
    minify: 'esbuild',
    // Prevent inline code - always emit files
    assetsInlineLimit: 0,
    // Enable source map for production debugging (can be disabled for smaller builds)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
})
