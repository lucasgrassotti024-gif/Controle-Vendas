import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite acesso via Wi-Fi pelo celular
    port: 3000,
    open: false,
  },
});
