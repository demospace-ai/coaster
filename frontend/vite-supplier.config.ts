import react from "@vitejs/plugin-react-swc";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(), react(), viteTsconfigPaths(), splitVendorChunkPlugin()],
  root: "src/supplier",
  publicDir: "../../public",
  build: {
    outDir: "../../build",
  },
  server: {
    port: 3030,
  },
});
