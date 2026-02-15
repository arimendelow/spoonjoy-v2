# Ingredient Parsing LLM Provider Research (Phase 0 / Unit 0a)

Date: 2026-02-15
Scope: OpenAI, Anthropic, Gemini for ingredient parsing in Cloudflare Workers.

## Comparison

| Provider | Speed (official positioning) | Reliability (structured extraction) | Cloudflare Worker compatibility | JSON structured output support | Rough cost notes (text) |
|---|---|---|---|---|---|
| OpenAI (recommended model: `gpt-4o-mini`) | `gpt-4o-mini` is positioned as a fast small model for focused tasks. | Strong for schema-constrained extraction: Structured Outputs are documented to ensure schema adherence (vs JSON mode). | Good. Standard HTTPS API calls from Workers via `fetch()` are straightforward; OpenAI exposes standard REST endpoints. | Native support. `gpt-4o-mini` supports Structured Outputs, and OpenAI docs note schema adherence with Structured Outputs. | `gpt-4o-mini`: ~$0.15 / 1M input, ~$0.60 / 1M output. |
| Anthropic (recommended model: `claude-haiku-4-5`) | Claude Haiku 4.5 is explicitly Anthropic’s fastest model. | Good with tool-based schemas. Anthropic documents strict tool use (`strict: true`) to enforce schema validation/tool input shape. | Good. Claude API is REST (`https://api.anthropic.com`, `POST /v1/messages`) with JSON headers; Workers `fetch()` integration is direct. | Supported via tools + JSON Schema; strict tool use can guarantee schema-valid tool inputs. | Claude Haiku 4.5: ~$1 / MTok input, ~$5 / MTok output. |
| Gemini (recommended model: `gemini-2.5-flash`) | Gemini 2.5 Flash is positioned for large-scale, low-latency, high-volume tasks. | Good when using Structured Outputs with schema; docs state predictable/parsable output and syntactic JSON validity. | Good. Gemini docs explicitly state REST APIs can be used in any HTTP-capable environment; Workers are HTTP-capable via `fetch()`. | Native structured output mode (`response_mime_type: application/json` + `response_json_schema`). | Gemini 2.5 Flash: ~$0.30 / 1M input (text/image/video), ~$2.50 / 1M output. |

## Recommendation (speed + reliability for Workers)

1. Primary: **OpenAI `gpt-4o-mini`**.
- Best balance here of speed + low cost + strong schema reliability.
- Structured Outputs has clear schema-adherence guidance, which is ideal for deterministic ingredient parsing.
- Worker integration is minimal complexity (single REST call via `fetch()`).

2. Secondary fallback: **Anthropic `claude-haiku-4-5`**.
- Use as backup provider if you want cross-vendor resilience.
- Reliable with strict tool use, but materially more expensive per token for this workload.

3. Not first choice for this unit: **Gemini `gemini-2.5-flash`**.
- Strong option and Worker-compatible, but cost for this specific extraction profile is generally above `gpt-4o-mini`.
- Avoid planning around `gemini-2.0-flash-lite`; Gemini docs mark it deprecated and scheduled for shutdown on **March 31, 2026**.

## Sources

- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI model page (`gpt-4o-mini`): https://developers.openai.com/api/docs/models/gpt-4o-mini
- Anthropic models overview: https://docs.anthropic.com/en/docs/models-overview
- Anthropic tool use (JSON output + strict tool use): https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use
- Anthropic pricing: https://docs.anthropic.com/en/docs/about-claude/pricing
- Gemini models: https://ai.google.dev/gemini-api/docs/models
- Gemini structured outputs: https://ai.google.dev/gemini-api/docs/structured-output
- Gemini pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini API reference (REST in any HTTP environment): https://ai.google.dev/api
- Cloudflare Workers `fetch()`: https://developers.cloudflare.com/workers/runtime-apis/fetch/
