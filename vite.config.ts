import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project sites live at /<repo>/
  base: process.env.GITHUB_ACTIONS ? '/mind-organizer/' : '/',
  plugins: [react(), tailwindcss()],
})
