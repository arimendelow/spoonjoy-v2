# LLM Provider Research for Ingredient Parsing

**Task**: Unit 0a - LLM Provider Evaluation
**Date**: 2026-01-30
**Objective**: Research and compare LLM providers for ingredient parsing on Cloudflare Workers

---

## Requirements Summary

- **Task**: Parse natural language ingredient text (e.g., "2 cups flour") into structured data (qty, unit, ingredient name)
- **Platform**: Cloudflare Workers (edge runtime, no Node.js-only APIs)
- **Priority**: Speed + reliability for structured output
- **Output format**: JSON with schema: `{ quantity: number, unit: string, ingredientName: string }`

---

## Comparison Matrix

| Criteria | OpenAI (gpt-4o-mini) | Anthropic (Claude Haiku 4.5) | Google (Gemini 2.5 Flash-Lite) |
|----------|---------------------|------------------------------|--------------------------------|
| **Input Pricing (per 1M tokens)** | $0.15 | $1.00 | $0.10 |
| **Output Pricing (per 1M tokens)** | $0.60 | $5.00 | $0.40 |
| **Structured Output Support** | ✅ Native JSON Schema (strict mode) | ✅ Native (GA for Haiku 4.5) | ✅ JSON Schema + Zod support |
| **Cloudflare Workers Compatible** | ✅ SDK works, streaming supported | ✅ AI Gateway integration | ✅ Works, some edge case issues reported |
| **Context Window** | 128K tokens | 200K tokens | 1M tokens |
| **Max Output Tokens** | 16K | 64K | Varies |
| **Latency Profile** | Standard tier balanced | 4-5x faster than Sonnet 4.5 | Low-latency optimized |
| **Batch Discount** | ✅ 50% off (24hr) | ✅ 50% off | ✅ 50% off |
| **Prompt Caching** | ✅ Available | ✅ Up to 90% savings | ✅ 90% savings on reads |

---

## Detailed Provider Analysis

### OpenAI (gpt-4o-mini)

**Strengths**:
- Lowest input pricing ($0.15/1M) tied with Gemini Flash-Lite
- Native structured output with `response_format: { type: "json_schema" }` and `strict: true`
- 100% guaranteed JSON adherence with strict mode
- Well-documented Cloudflare Workers integration
- SDK works directly with Workers (streaming example in CF docs)
- Priority tier available for 2x faster processing (2x cost)

**Weaknesses**:
- Smaller context window (128K) than competitors
- Some confusion around gpt-4.1 structured output support (not relevant for 4o-mini)

**Structured Output Details**:
- Use `response_format: { type: "json_schema", json_schema: {...} }` with `strict: true`
- Works with Chat Completions API
- Cloudflare Workers AI also supports this format

**Sources**:
- [OpenAI Structured Outputs Documentation](https://platform.openai.com/docs/guides/structured-outputs)
- [Cloudflare Workers OpenAI Streaming Example](https://developers.cloudflare.com/workers/examples/openai-sdk-streaming/)

---

### Anthropic (Claude Haiku 4.5)

**Strengths**:
- Highest coding performance in class (73.3% on SWE-bench, within 5% of Sonnet 4.5)
- 4-5x faster than Sonnet 4.5
- Sub-second response times (0.5s vs 2s typical)
- Largest practical context window (200K) among fast models
- 64K output tokens (highest)
- Strong Cloudflare partnership (AI Gateway, MCP servers, Sandbox integration)
- Extended thinking capability when needed

**Weaknesses**:
- Highest pricing ($1/$5 per 1M tokens)
- 6-8x more expensive than gpt-4o-mini for equivalent token usage

**Structured Output Details**:
- Now GA (not beta) with `output_config.format` parameter
- Works with tool use (function calling) as well
- Old beta header `structured-outputs-2025-11-13` still works during transition

**Sources**:
- [Anthropic Claude Haiku 4.5 Announcement](https://www.anthropic.com/news/claude-haiku-4-5)
- [Claude Structured Outputs Documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Cloudflare AI Gateway - Anthropic](https://developers.cloudflare.com/ai-gateway/usage/providers/anthropic/)

---

### Google (Gemini 2.5 Flash-Lite)

**Strengths**:
- Lowest overall pricing ($0.10 input / $0.40 output per 1M tokens)
- Largest context window (1M tokens)
- Lower latency than Gemini 2.0 Flash
- Native Zod support (matches our stack)
- Controllable "thinking budgets"
- Google Search grounding, code execution tools

**Weaknesses**:
- Some truncated response issues reported in Cloudflare Workers (edge case)
- Gemini 2.0 models retiring March 2026 (need to use 2.5)
- Some reports of unintended JSON responses when function calling enabled
- Less documented Cloudflare integration compared to OpenAI/Anthropic

**Structured Output Details**:
- Use `response_mime_type: 'application/json'` with `response_schema`
- Supports JSON Schema keywords: `anyOf`, `$ref`, property ordering (2.5 models)
- Firebase AI Logic integration available

**Sources**:
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini 2.5 Flash-Lite GA](https://developers.googleblog.com/en/gemini-25-flash-lite-is-now-stable-and-generally-available/)

---

## Cost Estimate for Ingredient Parsing

Assuming typical ingredient parsing request:
- Input: ~100 tokens (prompt + ingredient text like "2 cups all-purpose flour, sifted")
- Output: ~30 tokens (JSON response)

**Cost per 10,000 parses**:

| Provider | Input Cost | Output Cost | Total |
|----------|------------|-------------|-------|
| gpt-4o-mini | $0.0015 | $0.0018 | **$0.0033** |
| Claude Haiku 4.5 | $0.01 | $0.015 | **$0.025** |
| Gemini 2.5 Flash-Lite | $0.001 | $0.0012 | **$0.0022** |

All providers are extremely affordable for this use case. Even at 100,000 parses/month:
- Gemini: ~$0.02
- OpenAI: ~$0.03
- Claude: ~$0.25

---

## Cloudflare Workers Compatibility Summary

### All Three Work ✅

**OpenAI**:
- Official streaming example in CF docs
- SDK works with Workers
- OpenAI-compatible endpoints via Workers AI

**Anthropic**:
- AI Gateway integration documented
- OpenAI-compatible endpoint available through CF AI Gateway
- Strong partnership (MCP servers, Sandbox SDK)

**Google Gemini**:
- Works in Workers
- Some edge cases with truncated responses (rare)
- Less official CF documentation

---

## Recommendation Considerations

### For Speed + Reliability:
1. **Claude Haiku 4.5** - Fastest response times (4-5x faster than alternatives), highest coding benchmark scores, but highest cost
2. **gpt-4o-mini** - Best balance of cost/quality/reliability, excellent structured output support, well-documented CF integration
3. **Gemini 2.5 Flash-Lite** - Lowest cost, but less CF integration maturity, some edge case issues

### For Cost Optimization:
1. **Gemini 2.5 Flash-Lite** - Cheapest option
2. **gpt-4o-mini** - Slightly more expensive but more reliable
3. **Claude Haiku 4.5** - Premium option for when quality/speed matters most

### For Developer Experience:
1. **gpt-4o-mini** - Best documentation, most examples
2. **Claude Haiku 4.5** - Good docs, strong CF partnership
3. **Gemini 2.5 Flash-Lite** - Less CF-specific documentation

---

## Edge Cases for Ingredient Parsing

All providers need to handle:
- Fractions: "1/2 cup", "1 1/2 tbsp"
- Unicode fractions: "½ cup"
- No unit: "2 eggs", "3 cloves garlic"
- Compound ingredients: "extra virgin olive oil"
- Prep notes: "flour, sifted", "onion, diced"
- Ranges: "2-3 cups"
- Approximate: "about 1 cup", "pinch of salt"

The structured output capabilities of all three providers can handle these with proper prompting.

---

## Next Steps (Unit 0b)

Based on this research, Unit 0b should:
1. Make final provider recommendation
2. Document the decision rationale
3. Specify exact model ID to use
4. Draft the prompt template for ingredient parsing
5. Define Zod schema for parsed output

---

## Sources

- [OpenAI Structured Outputs Documentation](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI Pricing](https://platform.openai.com/docs/pricing)
- [Cloudflare Workers OpenAI Streaming Example](https://developers.cloudflare.com/workers/examples/openai-sdk-streaming/)
- [Anthropic Claude Haiku 4.5 Announcement](https://www.anthropic.com/news/claude-haiku-4-5)
- [Claude Structured Outputs Documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Cloudflare AI Gateway - Anthropic](https://developers.cloudflare.com/ai-gateway/usage/providers/anthropic/)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini 2.5 Flash-Lite GA](https://developers.googleblog.com/en/gemini-25-flash-lite-is-now-stable-and-generally-available/)
- [Cloudflare AI Gateway Unified API](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)
- [Cloudflare Building Agents with OpenAI](https://blog.cloudflare.com/building-agents-with-openai-and-cloudflares-agents-sdk/)
