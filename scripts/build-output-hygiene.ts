export function shouldLogRollupBuildMessage(level: "warn" | "info" | "debug", log: { code?: string }) {
  return !(level === "warn" && log.code === "EMPTY_BUNDLE");
}
