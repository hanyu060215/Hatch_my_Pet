import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 这是关键行：用您的仓库名替换 'VirtualPets-Trivia'
  base: '/VirtualPets-Trivia/', 
});