import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // ⭐ Lokal immer '/'
  server: {
    historyApiFallback: true, // ✅ Bei Refresh alle Routes zu index.html fallback
  },
})
