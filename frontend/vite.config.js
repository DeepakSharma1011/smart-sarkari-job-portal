import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: '', // Output directly into the dist directory
    rollupOptions: {
      output: {
        // Remove random hash from output filenames
        entryFileNames: 'index.js',
        assetFileNames: 'index.[ext]',
        chunkFileNames: '[name].js'
      }
    }
  }
})
