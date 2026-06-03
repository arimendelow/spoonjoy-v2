import type { Route } from "./+types/oauth.revoke";
import { applyOAuthCorsHeaders, oauthCorsPreflightResponse } from "~/lib/oauth-cors.server";
import { getRequestDb } from "~/lib/route-platform.server";
import { handleOAuthRevoke } from "~/lib/oauth-routes.server";
import { enforceRateLimit, rateLimitedResponse } from "~/lib/rate-limit.server";

export async function action({ request, context }: Route.ActionArgs) {
  const preflight = oauthCorsPreflightResponse(request);
  if (preflight) return preflight;

  const cfEnv = context.cloudflare?.env;
  const rateLimit = await enforceRateLimit({
    ip: request.headers.get("CF-Connecting-IP"),
    ipLimiter: cfEnv?.API_IP_RATE_LIMITER,
  });
  if (!rateLimit.allowed) {
    const response = rateLimitedResponse(rateLimit.retryAfterSeconds);
    return applyOAuthCorsHeaders(response);
  }

  const db = await getRequestDb(context);
  const response = await handleOAuthRevoke(request, db);
  return applyOAuthCorsHeaders(response);
}
