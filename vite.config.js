import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // ⭐ Lokal immer '/'
  server: {
    historyApiFallback: true, // ✅ Bei Refresh alle Routes zu index.html fallback
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
    // Use esbuild (default, faster and no extra dependency needed)
    minify: 'esbuild',
    // Prevent inline code - always emit files
    assetsInlineLimit: 0,
  },
})
