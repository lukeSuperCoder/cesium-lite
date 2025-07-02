import { defineConfig, loadEnv } from "vite";
import cesium from "vite-plugin-cesium";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  // 读取环境变量
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_BASE || '/',
    plugins: [cesium()],
    build: {
      assetsDir: '',
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          basicMap: resolve(__dirname, 'examples/basicMap.html'),
          camera: resolve(__dirname, 'examples/camera.html'),
          draw: resolve(__dirname, 'examples/draw.html'),
          entity: resolve(__dirname, 'examples/entity.html'),
          marker: resolve(__dirname, 'examples/marker.html'),
          tileLayer: resolve(__dirname, 'examples/tileLayer.html'),
        }
      }
    },
    server: {
      port: 8020,
    }
  }
});
