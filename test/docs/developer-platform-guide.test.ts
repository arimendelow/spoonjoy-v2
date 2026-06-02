import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Developers, { loader } from "~/routes/developers";
import {
  API_V1_DISCOVERY_DATA,
  API_V1_SCOPE_REQUIREMENTS,
} from "~/lib/api-v1-contract.server";
import { createTestRoutesStub } from "../utils";

function readProjectFile(path: string) {
  return readFileSync(resolve(__dirname, "..", "..", path), "utf8");
}

function scopesFor(method: string, path: string) {
  return API_V1_SCOPE_REQUIREMENTS.find((requirement) => requirement.method === method && requirement.path === path)
    ?.scopes ?? [];
}

const CLIENT_PROFILES = [
  "Tiny-device clients",
  "Mobile apps",
  "CLI/script clients",
  "Browser clients",
  "Agent clients",
] as const;

const GUIDE_MARKERS = [
  "External Client Guide",
  "Read the public Chef graph",
  "Create a scoped client token",
  "Sync a private shopping list",
  "Perform an idempotent shopping-list mutation",
  "Authorization: Bearer",
  "clientMutationId",
  "cursor",
  API_V1_DISCOVERY_DATA.openapiUrl,
] as const;

describe("external client guide", () => {
  it("publishes a complete guide in docs/api.md", () => {
    const apiDocs = readProjectFile("docs/api.md");

    for (const marker of GUIDE_MARKERS) {
      expect(apiDocs).toContain(marker);
    }
    for (const profile of CLIENT_PROFILES) {
      expect(apiDocs).toContain(profile);
    }

    expect(apiDocs).toContain("curl 'https://spoonjoy.app/api/v1/recipes");
    expect(apiDocs).toContain("curl 'https://spoonjoy.app/api/v1/cookbooks");
    expect(apiDocs).toContain("curl -X POST https://spoonjoy.app/api/v1/tokens");
    expect(apiDocs).toContain("curl 'https://spoonjoy.app/api/v1/shopping-list/sync?cursor=");
    expect(apiDocs).toContain("curl -X POST https://spoonjoy.app/api/v1/shopping-list/items");
    expect(apiDocs).toContain(scopesFor("POST", "/api/v1/tokens")[0]);
    expect(apiDocs).toContain(scopesFor("GET", "/api/v1/shopping-list/sync")[0]);
    expect(apiDocs).toContain(scopesFor("POST", "/api/v1/shopping-list/items")[0]);
    expect(apiDocs).not.toMatch(/pebble/i);
  });

  it("renders the same guide on /developers", async () => {
    const data = loader({} as any);
    const Stub = createTestRoutesStub([
      { path: "/developers", Component: Developers, loader: () => data },
    ]);

    render(createElement(Stub, { initialEntries: ["/developers"] }));
    await screen.findByRole("heading", { name: "Spoonjoy Developer Platform" });
    const renderedText = document.body.textContent ?? "";

    for (const marker of GUIDE_MARKERS) {
      expect(renderedText).toContain(marker);
    }
    for (const profile of CLIENT_PROFILES) {
      expect(renderedText).toContain(profile);
    }

    expect(renderedText).toContain("GET /api/v1/recipes");
    expect(renderedText).toContain("GET /api/v1/cookbooks");
    expect(renderedText).toContain("POST /api/v1/tokens");
    expect(renderedText).toContain("GET /api/v1/shopping-list/sync");
    expect(renderedText).toContain("POST /api/v1/shopping-list/items");
    expect(renderedText).toContain(scopesFor("POST", "/api/v1/tokens")[0]);
    expect(renderedText).toContain(scopesFor("GET", "/api/v1/shopping-list/sync")[0]);
    expect(renderedText).toContain(scopesFor("POST", "/api/v1/shopping-list/items")[0]);
    expect(document.body).not.toHaveTextContent(/pebble/i);
  });
});
