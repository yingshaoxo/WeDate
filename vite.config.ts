import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import builtins from 'rollup-plugin-node-builtins'
import vueJsx from '@vitejs/plugin-vue-jsx'
import styleImport, { VantResolve } from 'vite-plugin-style-import';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '/@': path.resolve(__dirname, './src')
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    builtins(),
    styleImport({
      resolves: [VantResolve()],
    }),
  ],
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //     }
  //   }
  // },
})