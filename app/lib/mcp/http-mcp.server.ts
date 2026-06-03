/**
 * HTTP MCP transport for the Spoonjoy Claude connector.
 *
 * A stateless remote Streamable-HTTP MCP endpoint: each POST carries one
 * JSON-RPC message, which we route through the shared transport-agnostic
 * core (`handleJsonRpcMessage`) against a `JsonRpcToolRouter` backed by the
 * same operation layer the REST API and stdio bridge use. Responses are
 * `application/json` (no SSE); notifications get a 202 with no body.
 *
 * The endpoint is an OAuth-protected resource: EVERY request (including
 * `initialize`) must carry a valid bearer token, and an unauthenticated request
 * gets a 401 + `WWW-Authenticate` pointing at the protected-resource metadata —
 * the cue an OAuth-capable client (claude.ai) uses to run login + consent before
 * connecting. Claude Code authenticates the same way via its bearer header.
 * Requests are rate-limited before any auth work.
 */

import type { PrismaClient as PrismaClientType } from "@prisma/client";
import {
  handleJsonRpcLine,
  type JsonRpcToolRouter,
} from "~/lib/mcp/json-rpc.server";
import {
  callSpoonjoyMcpTool,
  listSpoonjoyMcpTools,
} from "~/lib/mcp/spoonjoy-tools.server";
import {
  buildSpoonjoyApiContext,
} from "~/lib/spoonjoy-api-request.server";
import {
  authenticateApiToken,
  extractBearerToken,
} from "~/lib/api-auth.server";
import { mcpResourceUrl, protectedResourceMetadataUrl, resolveIssuerOrigin } from "~/lib/oauth-metadata.server";
import {
  enforceRateLimit,
  rateLimitedResponse,
  type RateLimiterBinding,
} from "~/lib/rate-limit.server";
import { captureException, resolvePostHogServerConfig } from "~/lib/analytics-server";

interface CloudflareEnvLike {
  SESSION_SECRET?: string;
  OPENAI_API_KEY?: string;
  SPOONJOY_BASE_URL?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  PHOTOS?: R2Bucket;
  POSTHOG_KEY?: string;
  POSTHOG_HOST?: string;
  POSTHOG_DISABLED?: string;
}

export interface HandleMcpHttpRequestParams {
  request: Request;
  db: PrismaClientType;
  cloudflareEnv?: CloudflareEnvLike | null;
  waitUntil?: (promise: Promise<unknown>) => void;
  tokenLimiter?: RateLimiterBinding;
  ipLimiter?: RateLimiterBinding;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Build the 401 that tells an MCP client to authenticate. The
 * `WWW-Authenticate` header points at the protected-resource metadata, which is
 * how an OAuth-capable client (claude.ai) discovers the authorization server
 * and starts the login + consent flow.
 */
function authChallengeResponse(
  request: Request,
  cloudflareEnv: CloudflareEnvLike | null | undefined,
): Response {
  const origin = resolveIssuerOrigin(request.url, cloudflareEnv?.SPOONJOY_BASE_URL);
  return new Response(
    JSON.stringify({ error: "unauthorized", message: "Authentication required." }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": `Bearer resource_metadata="${protectedResourceMetadataUrl(origin)}"`,
      },
    },
  );
}

export async function handleMcpHttpRequest(params: HandleMcpHttpRequestParams): Promise<Response> {
  const { request, db, cloudflareEnv, waitUntil, tokenLimiter, ipLimiter } = params;

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "method_not_allowed", message: "The MCP endpoint accepts POST." },
      405,
    );
  }

  const rateLimit = await enforceRateLimit({
    authorization: request.headers.get("Authorization"),
    ip: request.headers.get("CF-Connecting-IP"),
    tokenLimiter,
    ipLimiter,
  });
  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  let principal;
  try {
    const bearerToken = extractBearerToken(request);
    if (!bearerToken) return authChallengeResponse(request, cloudflareEnv);
    principal = await authenticateApiToken(db, bearerToken);
  } catch {
    return authChallengeResponse(request, cloudflareEnv);
  }
  const expectedResource = mcpResourceUrl(resolveIssuerOrigin(request.url, cloudflareEnv?.SPOONJOY_BASE_URL));
  if (principal.oauthClientId && principal.oauthResource !== expectedResource) {
    return jsonResponse(
      { error: "invalid_token", message: "OAuth access token is not audience-bound to this MCP resource." },
      403,
    );
  }

  const router: JsonRpcToolRouter = {
    listTools() {
      return { tools: listSpoonjoyMcpTools() };
    },
    async callTool(name, args) {
      const context = buildSpoonjoyApiContext({ db, principal, cloudflareEnv, waitUntil });
      const text = await callSpoonjoyMcpTool(name, args, context);
      return { content: [{ type: "text", text }] };
    },
  };

  // Surface unexpected exceptions inside tool dispatch to PostHog. Without this
  // an exception during a tools/call is collapsed to a JSON-RPC -32603 with the
  // message on the wire and no record of the original stack in observability.
  const onError = (error: unknown) => {
    if (!waitUntil || !cloudflareEnv) return;
    const phConfig = resolvePostHogServerConfig(cloudflareEnv);
    if (!phConfig.enabled) return;
    waitUntil(
      captureException(phConfig, {
        error,
        distinctId: principal.id,
        route: new URL(request.url).pathname,
        method: request.method,
      }),
    );
  };

  const body = await request.text();
  const response = await handleJsonRpcLine(body, router, { onError });

  // Notifications (no id) produce no JSON-RPC response — ack with 202.
  if (response === null) {
    return new Response(null, { status: 202 });
  }

  return jsonResponse(response);
}
