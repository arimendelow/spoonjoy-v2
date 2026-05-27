export interface SpoonjoyMcpEnvSource {
  OPENAI_API_KEY?: string;
  SPOONJOY_BASE_URL?: string;
}

export interface SpoonjoyMcpEnv {
  OPENAI_API_KEY?: string;
  SPOONJOY_BASE_URL?: string;
}

export function getSpoonjoyMcpEnv(source: SpoonjoyMcpEnvSource): SpoonjoyMcpEnv | null {
  const openAiApiKey = source.OPENAI_API_KEY?.trim();
  const spoonjoyBaseUrl = source.SPOONJOY_BASE_URL?.trim();
  if (!openAiApiKey && !spoonjoyBaseUrl) return null;
  return {
    ...(openAiApiKey ? { OPENAI_API_KEY: openAiApiKey } : {}),
    ...(spoonjoyBaseUrl ? { SPOONJOY_BASE_URL: spoonjoyBaseUrl } : {}),
  };
}
