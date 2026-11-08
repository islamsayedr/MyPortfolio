import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
export default defineConfig({
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
})
