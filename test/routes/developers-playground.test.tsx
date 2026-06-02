import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import routes from "~/routes";
import DeveloperPlayground, {
  curlFor,
  loader,
  meta,
  playgroundFetchOptions,
  playgroundNetworkError,
  playgroundOperationGroups,
  playgroundPath,
  playgroundResponseFromFetchResult,
  playgroundRequestId,
  PLAYGROUND_OPERATIONS,
} from "~/routes/developers.playground";
import { API_V1_SCOPE_REQUIREMENTS } from "~/lib/api-v1-contract.server";
import { API_V1_PLAYGROUND_MANIFEST } from "~/lib/generated/api-v1-playground";
import { createTestRoutesStub } from "../utils";

function renderPlayground() {
  const data = loader();
  const Stub = createTestRoutesStub([
    { path: "/developers/playground", Component: DeveloperPlayground, loader: () => data },
  ]);
  render(<Stub initialEntries={["/developers/playground"]} />);
}

function mockApiResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    statusText: "OK",
    headers: { "Content-Type": "application/json", "X-Request-Id": "req_playground" },
    ...init,
  });
}

describe("/developers/playground", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("is registered with API aliases before the legacy /api/* catch-all", () => {
    const routeConfig = JSON.stringify(routes);

    expect(routeConfig).toContain("developers/playground");
    expect(routeConfig).toContain("routes/developers.playground.tsx");
    expect(routeConfig.indexOf("api/playground")).toBeLessThan(routeConfig.indexOf("api/*"));
    expect(routeConfig.indexOf("api/try")).toBeLessThan(routeConfig.indexOf("api/*"));
  });

  it("publishes every generated API v1 operation from the OpenAPI playground manifest", () => {
    const data = loader();

    expect(data.manifest).toEqual(API_V1_PLAYGROUND_MANIFEST);
    expect(data.manifest.operations).toEqual(PLAYGROUND_OPERATIONS);
    expect(data.manifest.operations.map((operation) => ({
      method: operation.method,
      path: operation.path,
      auth: operation.auth,
      scopes: [...operation.scopes],
    }))).toEqual(API_V1_SCOPE_REQUIREMENTS.map((requirement) => ({
      method: requirement.method,
      path: requirement.path,
      auth: requirement.auth === "bearer" ? "authenticated" : "optional",
      scopes: [...requirement.scopes],
    })));
    expect(data.manifest.operations.map((operation) => operation.id)).toContain("POST /api/v1/tokens");
    expect(data.manifest.operations.map((operation) => operation.id)).toContain("PATCH /api/v1/shopping-list/items/{itemId}");
    expect(data.manifest.operations.length).toBe(15);
  });

  it("groups generated operations by OpenAPI tag", () => {
    expect(playgroundOperationGroups().map((group) => group.tag)).toEqual([
      "Discovery",
      "Recipes",
      "Cookbooks",
      "Shopping List",
      "Tokens",
    ]);
  });

  it("declares playground metadata", () => {
    expect(meta()).toEqual([
      { title: "Spoonjoy API Playground | Spoonjoy" },
      {
        name: "description",
        content: "Try Spoonjoy API v1 requests from the generated developer playground.",
      },
    ]);
  });

  it("builds request paths from path and query parameters", () => {
    const recipeSearch = PLAYGROUND_OPERATIONS.find((operation) => operation.id === "GET /api/v1/recipes")!;
    const recipeDetail = PLAYGROUND_OPERATIONS.find((operation) => operation.id === "GET /api/v1/recipes/{id}")!;

    expect(playgroundPath(recipeSearch, { query: "pasta", q: "", limit: "10" })).toBe("/api/v1/recipes?query=pasta&limit=10");
    expect(playgroundPath(recipeSearch, { query: "", q: "", limit: "" })).toBe("/api/v1/recipes");
    expect(playgroundPath(recipeDetail, { id: "recipe/with/slash" })).toBe("/api/v1/recipes/recipe%2Fwith%2Fslash");
    expect(playgroundPath(recipeDetail, { id: "" })).toBe("/api/v1/recipes/{id}");
  });

  it("builds timestamp request IDs when crypto UUIDs are unavailable", () => {
    expect(playgroundRequestId(null, 12345)).toBe("pg_12345");
    expect(playgroundRequestId({ randomUUID: () => "uuid-1" })).toBe("pg_uuid-1");
  });

  it("builds fetch options for session, anonymous, bearer, and JSON-body requests", () => {
    const root = PLAYGROUND_OPERATIONS.find((operation) => operation.id === "GET /api/v1")!;
    const createToken = PLAYGROUND_OPERATIONS.find((operation) => operation.id === "POST /api/v1/tokens")!;

    expect(playgroundFetchOptions(root, "session", "", "", "pg_session")).toEqual({
      method: "GET",
      credentials: "same-origin",
      headers: { "X-Request-Id": "pg_session" },
    });
    expect(playgroundFetchOptions(root, "anonymous", "", "", "pg_anon")).toEqual({
      method: "GET",
      credentials: "omit",
      headers: { "X-Request-Id": "pg_anon" },
    });
    expect(playgroundFetchOptions(root, "bearer", " sj_test_token ", "", "pg_bearer")).toEqual({
      method: "GET",
      credentials: "omit",
      headers: { Authorization: "Bearer sj_test_token", "X-Request-Id": "pg_bearer" },
    });
    expect(playgroundFetchOptions(root, "bearer", " ", "{\"ignored\":true}", "pg_bearer_blank")).toEqual({
      method: "GET",
      credentials: "omit",
      headers: { "X-Request-Id": "pg_bearer_blank" },
    });
    expect(playgroundFetchOptions(createToken, "session", "", "{\"name\":\"Client\"}", "pg_post")).toEqual({
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Request-Id": "pg_post" },
      body: "{\"name\":\"Client\"}",
    });
  });

  it("renders all operations and sends the default request with the signed-in session", async () => {
    const fetchMock = vi.fn(async () => mockApiResponse({
      ok: true,
      requestId: "req_playground",
      data: { app: "spoonjoy" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    renderPlayground();
    expect(await screen.findByRole("heading", { name: "Spoonjoy API Playground" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create a bearer credential/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Remove a shopping-list item/i })).toBeInTheDocument();
    expect(screen.getByText("Uses your current Spoonjoy login for same-origin API calls.")).toBeInTheDocument();
    expect(screen.getByText(/signed-in Spoonjoy session cookie/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/v1", {
      method: "GET",
      credentials: "same-origin",
      headers: expect.objectContaining({ "X-Request-Id": expect.stringMatching(/^pg_/) }),
    });
    expect((fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers.Authorization).toBeUndefined();
    expect(await screen.findByText("200 OK")).toBeInTheDocument();
    expect(screen.getByText("Request ID: req_playground")).toBeInTheDocument();
    expect(screen.getByText(/"app": "spoonjoy"/)).toBeInTheDocument();

    fetchMock.mockRejectedValueOnce(new Error("offline"));
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));
    expect(await screen.findByText("0 NETWORK ERROR")).toBeInTheDocument();
    expect(screen.getByText("offline")).toBeInTheDocument();
  });

  it("uses query params and bearer auth only after the user enables it", async () => {
    const fetchMock = vi.fn(async () => mockApiResponse({
      ok: true,
      requestId: "req_playground",
      data: { recipes: [] },
    }));
    vi.stubGlobal("fetch", fetchMock);

    renderPlayground();
    fireEvent.click(await screen.findByRole("button", { name: /Search public recipes/i }));
    fireEvent.change(screen.getByLabelText(/Query/), { target: { value: "pasta" } });
    fireEvent.change(screen.getByLabelText(/Limit/), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Bearer" }));
    fireEvent.change(screen.getByLabelText("Bearer token"), { target: { value: "sj_test_token" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/recipes?query=pasta&limit=5", {
      method: "GET",
      credentials: "omit",
      headers: expect.objectContaining({
        Authorization: "Bearer sj_test_token",
        "X-Request-Id": expect.stringMatching(/^pg_/),
      }),
    });
  });

  it("sends generated JSON-body operations with session auth by default", async () => {
    const fetchMock = vi.fn(async () => mockApiResponse({
      ok: true,
      requestId: "req_playground",
      data: { token: "sj_secret" },
    }, { status: 201, statusText: "Created" }));
    vi.stubGlobal("fetch", fetchMock);

    renderPlayground();
    fireEvent.click(await screen.findByRole("button", { name: /Create a bearer credential/i }));
    expect(screen.getByText("Authenticated chef")).toBeInTheDocument();
    expect(screen.getByText("tokens:write")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("JSON body"), {
      target: { value: "{\"name\":\"External client\",\"scopes\":[\"recipes:read\"]}" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/tokens", {
      method: "POST",
      credentials: "same-origin",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        "X-Request-Id": expect.stringMatching(/^pg_/),
      }),
      body: "{\"name\":\"External client\",\"scopes\":[\"recipes:read\"]}",
    });
    expect(await screen.findByText("201 Created")).toBeInTheDocument();
  });

  it("renders required path parameters for generated detail operations", async () => {
    renderPlayground();

    fireEvent.click(await screen.findByRole("button", { name: /Read one public recipe/i }));

    expect(await screen.findByText("path required")).toBeInTheDocument();
    expect(screen.getByLabelText(/Id/)).toHaveAttribute("placeholder", "recipe_1");
  });

  it("can intentionally omit auth for public requests", async () => {
    const fetchMock = vi.fn(async () => mockApiResponse({ ok: true, data: { ok: true } }));
    vi.stubGlobal("fetch", fetchMock);

    renderPlayground();
    fireEvent.click(await screen.findByRole("button", { name: "Anonymous" }));
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/v1", {
      method: "GET",
      credentials: "omit",
      headers: expect.objectContaining({ "X-Request-Id": expect.stringMatching(/^pg_/) }),
    });
  });

  it("renders portable curl for bearer mode and body requests", () => {
    const root = PLAYGROUND_OPERATIONS.find((operation) => operation.id === "GET /api/v1")!;
    const createToken = PLAYGROUND_OPERATIONS.find((operation) => operation.id === "POST /api/v1/tokens")!;

    expect(curlFor("/api/v1", root, "session", "")).toContain("this curl runs anonymously");
    expect(curlFor("/api/v1", root, "anonymous", "")).toBe(
      "curl 'https://spoonjoy.app/api/v1' \\\n  -H 'X-Request-Id: pg_example'",
    );
    expect(curlFor("/api/v1/tokens", createToken, "session", "{\"name\":\"Client\"}")).toBe(
      "# Session mode is browser-only: the playground sends your signed-in Spoonjoy cookie.\n# Press Send Request here, or switch to Bearer mode for a terminal curl after copying a token.",
    );
    expect(curlFor("/api/v1/tokens", createToken, "bearer", "{\"name\":\"Client\"}")).toContain(
      "-H 'Authorization: Bearer sj_token'",
    );
    expect(curlFor("/api/v1/tokens", createToken, "bearer", "{\"name\":\"Client\"}")).toContain(
      "--data '{\"name\":\"Client\"}'",
    );
  });

  it("formats empty non-JSON responses", async () => {
    const response = await playgroundResponseFromFetchResult(new Response(null, {
      status: 204,
      headers: { "Content-Type": "text/plain" },
    }));

    expect(response).toEqual({
      status: 204,
      statusText: "OK",
      requestId: null,
      body: "(empty response)",
    });
  });

  it("formats non-OK text responses without a status text", async () => {
    const response = await playgroundResponseFromFetchResult(new Response("Too many requests", {
      status: 429,
    }));

    expect(response).toEqual({
      status: 429,
      statusText: "ERROR",
      requestId: null,
      body: "Too many requests",
    });
  });

  it("formats Error network failures", () => {
    expect(playgroundNetworkError(new Error("offline"))).toEqual({
      status: 0,
      statusText: "NETWORK ERROR",
      requestId: null,
      body: "offline",
    });
  });

  it("formats non-Error network failures", () => {
    expect(playgroundNetworkError("offline")).toEqual({
      status: 0,
      statusText: "NETWORK ERROR",
      requestId: null,
      body: "Request failed",
    });
  });
});
