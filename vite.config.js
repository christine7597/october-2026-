import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import { briefApiPlugin } from './server/briefApi.js';

// 클라우드 컨테이너에서만: neatlogs 기록이 프록시를 거치도록 (일반 PC에서는 아무 일도 안 함)
if (process.env.NODE_USE_ENV_PROXY) {
  createRequire(import.meta.url)('./scripts/cloud-proxy-preload.cjs');
}

export default defineConfig(({ mode }) => {
  // '' = VITE_ 접두사 없는 값도 읽기. 이 값들은 서버에서만 쓰이고 브라우저로 안 나간다.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), briefApiPlugin(env)],
  };
});
