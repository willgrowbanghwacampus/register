import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 상대경로 base를 사용하면 GitHub Pages(프로젝트/사용자 사이트 모두)에서
// 별도 설정 없이 정적 파일 경로가 올바르게 잡힙니다.
export default defineConfig({
  plugins: [react()],
  base: './',
})
