import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { ConfigEnv, loadEnv, UserConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { createVitePlugins } from './build/vite'

export default ({ mode, command }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_APP_ENV, VITE_APP_PUBLIC_PATH } = env
  console.log(VITE_APP_ENV)
  return {
    base: VITE_APP_PUBLIC_PATH,
    plugins: [
      vue(),
      tailwindcss(),
      ...createVitePlugins(env, command === 'build'),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'l2d_holo_interactive',
          short_name: 'L2D Holo',
          description: 'Live2D + Holo3D 手势交互演示',
          theme_color: '#121212',
          background_color: '#121212',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icon_transparent.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon_transparent.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      })
    ],
    // esbuild: {
    //   pure: VITE_APP_ENV === 'test' ? [] : ['console.log']
    // },
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          // target: 'http://localhost:3089',
          target: 'https://api.team-tool.top',
          ws: false,
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~': path.join(__dirname, './src/assets')
      }
    }
  }
}
