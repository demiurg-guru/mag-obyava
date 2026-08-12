import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/mag-obyava/',
  plugins: [react()],
  server: {
    port: 5173
  }
});
