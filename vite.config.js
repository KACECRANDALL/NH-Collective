import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // use '/<REPO_NAME>/' if NOT using a custom domain
})
