# Setup and config reference

## FreeLLMAPI (the hub)
- **Install:** the Windows installer from https://github.com/tashfeenahmed/freellmapi/releases/latest (`FreeLLMAPI-Setup-<ver>.exe`). It runs from the tray, with no password.
- **Data:** `%APPDATA%\FreeLLMAPI\`, which holds `freeapi.db` (encrypted keys), `config.json` (the port) and `logs\freeapi.log`.
- **Address:** `helper` finds the port automatically: first the port in `config.json`, then 31415, then 3001. You can pin it with `hubUrl` in `~/.claude/helpers/config.json`.
- **Provider keys:** the user adds them in the dashboard (tray → Open Dashboard → Keys). Keys never go through chat.
  - AI Studio: https://aistudio.google.com/apikey
  - OpenRouter: the free key only
  - Groq: https://console.groq.com/keys
  - Cerebras: https://cloud.cerebras.ai
  - NVIDIA: https://build.nvidia.com
  - Mistral: https://console.mistral.ai
- **Unified key:** tray → Copy Key, then `helper setkey`, which reads the key from the clipboard.
- **Routing:**
  - Set the fallback chain on the dashboard's Models page.
  - Per request, `model` can be `auto`, `auto:fast`, `auto:smart`, `auto:<profile>` or a model ID.
  - The `X-Routed-Via` header shows which model actually answered.
- **Terminal key management:** `npx freellmapi keys add|list|remove|test <platform>` (needs a dashboard token).
- **Ollama as a provider:** on the Keys page, choose Custom provider and point it at `http://localhost:11434/v1`. Leave it off on this laptop.

## Copilot CLI (the coding harness)
- **Version:** 1.0.105, installed through the VS Code shim. Update with `copilot update`.
- **Custom provider (BYOK), used by `helper code`:**
  - Set `COPILOT_PROVIDER_BASE_URL=<hub>/v1`, `COPILOT_PROVIDER_API_KEY=<unified key>` and `COPILOT_MODEL=<id>`.
  - Optionally set `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` and `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS`.
  - Full reference: `copilot help providers`.
- **Running it without prompts:** `copilot -p "<task>" --silent --allow-all-tools --sandbox`.
  - Add `--deny-tool 'shell(git push)'` to block pushes; denies always win over allows.
  - Permission rules: `copilot help permissions`. Sandboxing: `copilot help sandbox`.
- **GitHub's own models:** omit the provider settings and pass `--model <name>`. This spends the student plan's AI credits; check with `/usage` or `/model` in an interactive `copilot` session.
- **Config:** `copilot config --list` and `copilot help config`.

## Antigravity (agy): the user runs it, never Claude
- **Version:** 1.1.22.
- **Commands:**
  - `agy models` lists the models.
  - `agy --model <id>` picks one.
  - `agy --mode plan` plans only.
  - `agy -p "<prompt>" --output-format json` runs headless, for the user's own scripts.
- **Rules:** Google's FAQ says wrapping `agy` inside third-party coding agents is not supported, and that using Claude Code with an Antigravity login can get the account suspended. For a third-party agent, Google recommends an AI Studio or Gemini Enterprise key instead.
- **What Claude does instead:** `helper handoff` writes a prompt for the user to paste.

## Ollama
- **Version:** 0.32.13. Models: gemma4:e4b, gemma4:e2b-it-qat, qwen2.5-coder:7b, nomic-embed-text.
- **On this laptop:** use embeddings only (`nomic-embed-text`). Start it with `ollama serve`; the API is `http://localhost:11434/v1`.
- **On the MacBook later:**
  - Pull a strong coding model.
  - Add it to the FreeLLMAPI fallback chain (or point `COPILOT_PROVIDER_BASE_URL` at Ollama directly).
  - Remove the "Ollama off" note from `SKILL.md`.

## Files
- **Code:** `~/.claude/skills/free-helpers/helper.mjs`. The launchers are `~/.local/bin/helper` (bash) and `helper.cmd` (PowerShell/cmd).
- **Data:** `~/.claude/helpers/`:
  - `config.json` (key, aliases)
  - `blocklist.txt`
  - `log.jsonl`
  - `handoffs/`
  - `worktrees/`
  - `models-snapshot.json` and `state.json`
- **Weekly model watch:** the SessionStart hook in `~/.claude/settings.json` runs `helper models --check --quiet`.
