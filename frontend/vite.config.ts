import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  build: {
    rollupOptions: {
      input: {
        webapp: 'index.html',
        connect: 'connect.html',
      },
      output: [
        {
          name: 'webapp',
          dir: 'build',
        }
      ]
    }
  },
  server: {
    port: 3000,
  }
});
