import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages configuration
// If deployed to a repository's gh-pages branch, set base to '/repo-name/'
// If deployed to a user/org site, set base to '/'
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
    base,
    plugins: [react()],
})
