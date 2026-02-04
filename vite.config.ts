import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/components"),
      "~": path.resolve(__dirname, "./app"),
      // Prisma edge runtime alias for Cloudflare Workers
      ".prisma/client/default": path.resolve(
        __dirname,
        "node_modules/.prisma/client/wasm.js"
      ),
    },
  },
});
