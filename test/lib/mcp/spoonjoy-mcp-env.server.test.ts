import { describe, expect, it } from "vitest";
import { getSpoonjoyMcpEnv } from "~/lib/mcp/spoonjoy-mcp-env.server";

describe("getSpoonjoyMcpEnv", () => {
  it("returns trimmed OpenAI env for local MCP imports", () => {
    expect(getSpoonjoyMcpEnv({
      OPENAI_API_KEY: "  sk-test  ",
      SPOONJOY_BASE_URL: " https://spoonjoy.app/path ",
    })).toEqual({
      OPENAI_API_KEY: "sk-test",
      SPOONJOY_BASE_URL: "https://spoonjoy.app/path",
    });
  });

  it("returns the base URL alone and null when MCP env is absent or blank", () => {
    expect(getSpoonjoyMcpEnv({ SPOONJOY_BASE_URL: " https://spoonjoy.app " })).toEqual({
      SPOONJOY_BASE_URL: "https://spoonjoy.app",
    });
    expect(getSpoonjoyMcpEnv({ OPENAI_API_KEY: " sk-only " })).toEqual({
      OPENAI_API_KEY: "sk-only",
    });
    expect(getSpoonjoyMcpEnv({})).toBeNull();
    expect(getSpoonjoyMcpEnv({ OPENAI_API_KEY: "   ", SPOONJOY_BASE_URL: "  " })).toBeNull();
  });
});
