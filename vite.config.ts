import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/components"),
    },
  },
  ssr: {
    external: ["@prisma/client", "@prisma/adapter-d1"],
    noExternal: false,
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Externalize all .server modules
        return id.includes(".server");
      },
    },
  },
});
