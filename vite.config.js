import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { briefApiPlugin } from './server/briefApi.js';

export default defineConfig(({ mode }) => {
  // '' = VITE_ 접두사 없는 값도 읽기. 이 값들은 서버에서만 쓰이고 브라우저로 안 나간다.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), briefApiPlugin(env)],
  };
});
