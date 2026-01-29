import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  ssr: true,
  serverBuildFile: "_worker.js",
  serverConditions: ["workerd", "worker"],
  serverDependenciesToBundle: "all",
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
