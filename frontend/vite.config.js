import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'         // <-- Pastikan ini ada
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),      // <-- Plugin React harus tetap ada
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})