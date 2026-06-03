import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// BASE_URL is set by the GitHub Actions workflow for GitHub Pages deploys.
// For Cloudflare Pages / Netlify / Vercel leave it unset (defaults to '/').
export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  plugins: [react(), tailwindcss()],
})
