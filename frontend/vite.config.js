import { defineConfig } from 'vite'
import path from "path" // <-- Add this line
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this 'resolve' section
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})