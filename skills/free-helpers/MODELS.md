# What each free model is good for

Update this file when a "Research new model …" upgrade item is applied. Keep each entry short and give its source.
Last reviewed: 2026-10-30.

## What's live in the hub (tested 2026-10-30)
Keys added: AI Studio, Groq, NVIDIA NIM and OpenRouter. Cerebras needs a credit card and Mistral costs money, so both were skipped.

The user restricted each provider to one model:

| Alias | Model (hub id) | Provider | Speed | Notes |
|---|---|---|---|---|
| `fast` | `qwen3.8-27b` | Groq | ~2s | Clean answers. The default for bulk work; `auto` and `auto:smart` usually land here too |
| `ultra` | `nemotron-3-ultra-550b` | NVIDIA | ~2s | Big reasoning model. Its reasoning sometimes leaks into the answer, so strip it or ask for "answer only" |
| `code` | `poolside-laguna-s-2.1` | OpenRouter `:free` | ~2s | Coding model. About 50 requests/day on a zero-balance key |
| `gemini` | `gemini-flash` (→ gemini-flash-latest) | AI Studio | 50–60s | Slow, close to the hub's 60s upstream timeout, and only about 20 requests/day. Use it only where Gemini matters (SVG). On a timeout or 429, `helper ask` falls back to `auto` unless `--strict` |

- `helper code` with the `auto:smart` route fixed a real bug through Copilot in about 35s; the diff applied cleanly.
- No image or embedding models are available with these keys. Images go through `helper handoff` to Antigravity (Nano Banana).

## Gemini 3.8 Flash (alias `gemini`; AI Studio free key via FreeLLMAPI; also in Antigravity as Low/Medium/High)
- **Good at:**
  - Coding and agent benchmarks close to Claude Opus 5: DeepSWE v1.1 is 73.7% vs 74.0%, Terminal-Bench 2.1 is about 90%, and SWE-Bench Pro is 61.6%.
  - SVG and animated-SVG output: reviews rate it highly, and Google staff reportedly trained for it.
  - Long multi-step tasks for little money.
- **Weak at:**
  - Long terminal or computer-use work: Terminal-Bench 4.0 is 19% vs Opus 5's 52%, and OSWorld-2.0 is 59% vs 75%.
  - It hallucinates, uses a lot of tokens at high effort, and its output needs polish.
- **Free limits:**
  - AI Studio key: about 20 requests/day and 5/min for 3.8 Flash (check the AI Studio console). Save it for jobs where Gemini matters.
  - Antigravity's weekly quota is much bigger, but it is only reachable through a handoff.
- **Images:** Nano Banana (Gemini image) works in Antigravity, so use a handoff that asks it to generate images. The hub has no image model for the AI Studio free key (checked 2026-10-30).
- **Sources:** [DataCamp](https://www.datacamp.com/blog/gemini-3-8-flash-cyber), [Google Cloud guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-3-8-flash), [302.AI review](https://medium.com/@302.AI/gemini-3-8-flash-review-googles-smartest-flash-yet-eea96b31e076), [HN thread](https://news.ycombinator.com/item?id=49537553), [free-tier thread](https://discuss.ai.google.dev/t/gemini-3-8-flash-free-tier-20-rpd-is-too-limited-for-practical-evaluation/180609)

## Antigravity free plan (handoff only)
- **Models:** Gemini 3.8 Flash (low/medium/high), Claude Sonnet 4.6, Claude Opus 4.6 (thinking) and GPT-OSS 120B. One review says the Claude 4.6 models are free only until about Nov 2.
- **Quota:** resets weekly.
- **Use it for:** big jobs where a long agent run is fine, image generation, and a free extra Claude opinion.

## Provider limits
- **Groq:** fastest, about 30 requests/min.
- **NVIDIA NIM:** about 40 requests/min, with credits.
- **OpenRouter `:free`:** about 50 requests/day with no credit.
- **Not set up:**
  - Cerebras: needs a card.
  - Mistral: paid.
- **More capacity:** add a model or provider in the FreeLLMAPI dashboard, then update the aliases in `~/.claude/helpers/config.json`.
- **Sources:** [FreeLLMAPI catalogue](https://freellmapi.co/models.html), [awesome-freellm-apis](https://github.com/open-free-llm-api/awesome-freellm-apis), [toolhalla guide](https://toolhalla.ai/blog/best-free-ai-apis-2026)

## Rules of thumb
- **SVG, icons and animations:** ask Gemini first, then Claude reviews and fixes.
- **Bulk text work:** use `fast`. **Reasoning or review:** use `smart`.
- **Real code that matters:** Claude writes it. Helpers are for drafts, boilerplate and second opinions.
