import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
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
