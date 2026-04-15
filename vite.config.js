import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gasUrl = env.VITE_APPS_SCRIPT_URL

  let proxy = {}
  if (gasUrl) {
    try {
      const parsed = new URL(gasUrl)
      // Proxy /dev-api → GAS URL so local dev avoids CORS preflight rejections.
      // Query params are preserved automatically; only the path is rewritten.
      proxy = {
        '/dev-api': {
          target: parsed.origin,
          changeOrigin: true,
          rewrite: (path) => path.replace('/dev-api', parsed.pathname),
        },
      }
    } catch {
      console.warn('[vite] VITE_APPS_SCRIPT_URL is not a valid URL — dev proxy disabled.')
    }
  } else {
    console.warn('[vite] VITE_APPS_SCRIPT_URL is not set — dev proxy disabled. Create .env.local from .env.example.')
  }

  return {
    plugins: [vue()],
    base: '/helping-hand/',
    server: { proxy },
  }
})
