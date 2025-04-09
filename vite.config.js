import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";
export default defineConfig({
  plugins: [cesium()],
  server: {
    port: 8020,
  }
});
