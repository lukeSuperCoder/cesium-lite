import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";
import { resolve } from "path";

export default defineConfig({
  plugins: [cesium()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'), // 你的主入口
      name: 'CesiumLite',
      fileName: (format) => `cesium-lite.${format}.js`
    },
    rollupOptions: {
      output: {
        globals: {
          cesium: 'Cesium'
        }
      }
    }
  }
});
