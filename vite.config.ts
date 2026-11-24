import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FUN-ZONE/', // أو '/fun-zone/' حسب اسم المستودع على GitHub بالضبط
})