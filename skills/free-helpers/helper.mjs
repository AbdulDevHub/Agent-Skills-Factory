// Hands jobs to free models through the FreeLLMAPI hub, behind a privacy guard. Data lives in ~/.claude/helpers.
//   helper ask [--model smart|fast|gemini|<id>] [--file f]... [--system s] [--out f] "prompt"   ("-" reads stdin)
//   helper code [--model <id>] [--gh] [--no-sandbox] "task"   Copilot CLI edits a throwaway worktree, prints the diff
//   helper code --list | --clean <id>
//   helper handoff [--file f]... [--inline] [--copy] "task"   prompt file for the user to paste into Antigravity
//   helper handoff --check <id>
//   helper models [--check [--force] [--quiet]]               list hub models / weekly new-model watch
//   helper guard <path|->...                                  dry-run the privacy guard
//   helper setkey [key]                                       save the hub's unified key (default: from clipboard)
//   helper status
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const HOME = homedir()
// HELPER_DATA / HELPER_INBOX / FREELLMAPI_URL override the defaults (used for testing).
const DATA = process.env.HELPER_DATA || join(HOME, '.claude', 'helpers')
const CONFIG = join(DATA, 'config.json')
const STATE = join(DATA, 'state.json')
const SNAPSHOT = join(DATA, 'models-snapshot.json')
const INBOX = process.env.HELPER_INBOX || join(HOME, '.claude', 'skills', 'upgrade', 'inbox.mjs')
const WEEK_MS = 7 * 24 * 3600 * 1000
const MARKER = '.no-free-helpers'

const DEFAULTS = {
  hubUrl: '', // empty = find the FreeLLMAPI desktop port, then 3001
  hubKey: '', // or FREELLMAPI_KEY
  hubApp: join(process.env.LOCALAPPDATA ?? '', 'Programs', 'FreeLLMAPI', 'FreeLLMAPI.exe'),
  aliases: { smart: 'auto:smart', fast: 'auto:fast', gemini: 'gemini-3.8-flash', embed: 'nomic-embed-text' },
  codeModel: 'auto:smart',
  maxPromptTokens: 100000,
  maxOutputTokens: 8000,
  watchFamilies: ['gemini', 'gpt-oss', 'deepseek', 'qwen', 'kimi', 'glm', 'llama', 'mistral', 'devstral', 'nemotron'],
}

const readJson = (file, fallback) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}
const writeJson = (file, value) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}
const userCfg = readJson(CONFIG, {})
const cfg = { ...DEFAULTS, ...userCfg, aliases: { ...DEFAULTS.aliases, ...userCfg.aliases } }
if (process.env.FREELLMAPI_URL) cfg.hubUrl = process.env.FREELLMAPI_URL
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)
const say = msg => console.error(`[helper] ${msg}`)
const fail = msg => {
  say(msg)
  process.exit(1)
}
const log = entry => {
  mkdirSync(DATA, { recursive: true })
  appendFileSync(join(DATA, 'log.jsonl'), `${JSON.stringify({ ts: new Date().toISOString(), cwd: process.cwd(), ...entry })}\n`)
}

// ---------- privacy guard ----------

const norm = p => resolve(p.replace(/^~(?=$|[\\/])/, HOME)).replace(/\\/g, '/').toLowerCase()
const globRe = g => g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')

const loadBlocklist = () => {
  const rules = { paths: [], names: [], texts: [] }
  const file = join(DATA, 'blocklist.txt')
  if (!existsSync(file)) return rules
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (line.startsWith('text:')) rules.texts.push(line.slice(5).trim().toLowerCase())
    else if (line.includes('/')) rules.paths.push([line, new RegExp(`^${globRe(norm(line))}(/|$)`)])
    else rules.names.push([line, new RegExp(`^${globRe(line.toLowerCase())}$`)])
  }
  return rules
}
const RULES = loadBlocklist()

// Names only: never echo the matched secret.
const SECRETS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['OpenAI/OpenRouter-style key', /\bsk-(?:or-v1-|proj-|ant-)?[A-Za-z0-9_-]{20,}/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Groq key', /\bgsk_[A-Za-z0-9]{20,}/],
  ['Cerebras key', /\bcsk-[A-Za-z0-9]{20,}/],
  ['NVIDIA key', /\bnvapi-[A-Za-z0-9_-]{20,}/],
  ['FreeLLMAPI key', /\bfreellmapi-[A-Za-z0-9_-]{16,}/],
  ['AWS key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['hard-coded secret', /\b(?:api[_-]?key|secret|token|passw(?:or)?d)\b\s*[:=]\s*['"][^'"\s]{12,}['"]/i],
]

const pathProblem = p => {
  const n = norm(p)
  for (const [entry, re] of RULES.paths) if (re.test(n)) return `under blocked path "${entry}"`
  const parts = n.split('/')
  for (const [entry, re] of RULES.names) if (parts.some(s => re.test(s))) return `name matches "${entry}"`
  let dir = existsSync(n) && statSync(n).isDirectory() ? n : dirname(n)
  for (;;) {
    if (existsSync(join(dir, MARKER))) return `${dir} has a ${MARKER} marker`
    const up = dirname(dir)
    if (up === dir) return null
    dir = up
  }
}
const textProblem = text => {
  for (const [name, re] of SECRETS) if (re.test(text)) return `looks like it contains a ${name}`
  const lower = text.toLowerCase()
  for (const t of RULES.texts) if (lower.includes(t)) return `contains blocked text "${t}"`
  return null
}

// Throws one error listing every problem, so Claude can fix them all at once.
const guard = ({ paths = [], texts = [] }) => {
  const problems = []
  for (const p of paths) {
    const why = pathProblem(p)
    if (why) problems.push(`${p}: ${why}`)
  }
  for (const [label, text] of texts) {
    const why = textProblem(text)
    if (why) problems.push(`${label}: ${why}`)
  }
  if (problems.length) throw new Error(`Blocked by the privacy guard:\n  - ${problems.join('\n  - ')}`)
}

const MAX_FILE = 200_000
const MAX_TOTAL = 600_000
const readFiles = files => {
  let total = 0
  return files.map(f => {
    const text = readFileSync(f, 'utf8')
    if (text.includes('\0')) throw new Error(`${f} looks binary`)
    if (text.length > MAX_FILE) throw new Error(`${f} is ${text.length} chars (max ${MAX_FILE}); split it`)
    total += text.length
    if (total > MAX_TOTAL) throw new Error(`files add up to more than ${MAX_TOTAL} chars; split the job`)
    return [f, text]
  })
}

// ---------- hub ----------

const reachable = async origin => {
  try {
    await fetch(`${origin}/v1/models`, { signal: AbortSignal.timeout(1500) })
    return true
  } catch {
    return false
  }
}
const findHub = async () => {
  if (cfg.hubUrl) return (await reachable(cfg.hubUrl.replace(/\/v1\/?$/, ''))) ? cfg.hubUrl.replace(/\/$/, '') : null
  const ports = [readJson(join(process.env.APPDATA ?? '', 'FreeLLMAPI', 'config.json'), {}).port, 31415, 3001]
  for (const port of new Set(ports.filter(Boolean))) {
    if (await reachable(`http://127.0.0.1:${port}`)) return `http://127.0.0.1:${port}/v1`
  }
  return null
}
const ensureHub = async () => {
  let base = await findHub()
  if (base) return base
  if (!existsSync(cfg.hubApp)) throw new Error(`FreeLLMAPI is not running and not installed at ${cfg.hubApp}`)
  say('starting FreeLLMAPI…')
  spawn(cfg.hubApp, [], { detached: true, stdio: 'ignore' }).unref()
  for (let i = 0; i < 30 && !base; i++) {
    await new Promise(r => setTimeout(r, 1000))
    base = await findHub()
  }
  if (!base) throw new Error('FreeLLMAPI did not come up within 30s')
  return base
}
const hubKey = () => {
  const key = process.env.FREELLMAPI_KEY || cfg.hubKey
  if (!key) throw new Error('No hub key yet. Click the FreeLLMAPI tray icon → Copy Key, then run: helper setkey')
  return key
}
const hubFetch = async (base, path, init = {}) => {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${hubKey()}`, 'content-type': 'application/json', ...init.headers },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`hub ${path} → ${res.status}: ${text.slice(0, 500)}`)
  return { json: JSON.parse(text), routed: res.headers.get('x-routed-via') }
}
const modelFor = name => cfg.aliases[name] ?? name

// ---------- args ----------

const parse = (argv, valueFlags) => {
  const flags = { file: [] }
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      rest.push(a)
      continue
    }
    const name = a.slice(2)
    if (!valueFlags.includes(name)) flags[name] = true
    else if (name === 'file') flags.file.push(argv[++i])
    else flags[name] = argv[++i]
  }
  return { flags, rest }
}
const promptFrom = rest => {
  const p = rest.join(' ')
  return p === '-' ? readFileSync(0, 'utf8') : p
}

// ---------- commands ----------

const ask = async argv => {
  const { flags, rest } = parse(argv, ['model', 'file', 'system', 'out', 'max-tokens'])
  const prompt = promptFrom(rest)
  if (!prompt.trim()) fail('usage: helper ask [--model m] [--file f]... "prompt"')
  const files = readFiles(flags.file)
  guard({
    paths: [process.cwd(), ...flags.file],
    texts: [['prompt', prompt], ['system', flags.system ?? ''], ...files],
  })
  const fileBlock = files.map(([f, t]) => `File: ${resolve(f)}\n\`\`\`\n${t}\n\`\`\``).join('\n\n')
  const messages = [
    ...(flags.system ? [{ role: 'system', content: flags.system }] : []),
    { role: 'user', content: fileBlock ? `${fileBlock}\n\n${prompt}` : prompt },
  ]
  const model = modelFor(flags.model ?? 'smart')
  const base = await ensureHub()
  const { json, routed } = await hubFetch(base, '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ model, messages, ...(flags['max-tokens'] ? { max_tokens: Number(flags['max-tokens']) } : {}) }),
  })
  const answer = json.choices?.[0]?.message?.content ?? ''
  const servedBy = routed ?? json.model ?? model
  if (flags.out) writeFileSync(flags.out, answer)
  else process.stdout.write(`${answer}\n`)
  say(`answered by ${servedBy}${flags.out ? ` → ${flags.out}` : ''}`)
  log({ cmd: 'ask', model, servedBy, files: flags.file.map(f => resolve(f)), inChars: JSON.stringify(messages).length, outChars: answer.length, task: prompt.slice(0, 80) })
}

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

const code = async argv => {
  const { flags, rest } = parse(argv, ['model', 'clean'])
  const metaDir = join(DATA, 'worktrees')
  if (flags.list) {
    for (const f of existsSync(metaDir) ? readdirSync(metaDir).filter(f => f.endsWith('.json')) : []) {
      const m = readJson(join(metaDir, f), {})
      if (m.cleanedMs) continue
      console.log(`${m.id}  ${m.model}  ${m.root}  ${m.task?.slice(0, 60)}`)
    }
    return
  }
  if (flags.clean) {
    const meta = readJson(join(metaDir, `${flags.clean}.json`), null)
    if (!meta) fail(`no worktree ${flags.clean}`)
    git(['worktree', 'remove', '--force', meta.wt], meta.root)
    git(['branch', '-D', meta.branch], meta.root)
    writeJson(join(metaDir, `${flags.clean}.json`), { ...meta, cleanedMs: Date.now() })
    say(`removed ${meta.wt}`)
    return
  }
  const task = promptFrom(rest)
  if (!task.trim()) fail('usage: helper code [--model m] [--gh] "task"')
  const root = git(['rev-parse', '--show-toplevel'], process.cwd())
  const tracked = git(['ls-files'], root).split('\n').filter(Boolean)
  const textsToScan = []
  for (const f of tracked) {
    const full = join(root, f)
    try {
      if (statSync(full).size > 512_000) continue
      const t = readFileSync(full, 'utf8')
      if (!t.includes('\0')) textsToScan.push([f, t])
    } catch {}
  }
  guard({ paths: [root, ...tracked.map(f => join(root, f))], texts: [['task', task], ...textsToScan] })

  const env = { ...process.env, COPILOT_AUTO_UPDATE: 'false' }
  for (const k of Object.keys(env)) {
    if (/KEY|TOKEN|SECRET|PASSW|CREDENTIAL/i.test(k) && !(flags.gh && /^(GH_|GITHUB_|COPILOT_GITHUB_)/.test(k))) delete env[k]
  }
  let model = flags.model ?? (flags.gh ? 'auto' : modelFor(cfg.codeModel))
  if (!flags.gh) {
    model = modelFor(model)
    Object.assign(env, {
      COPILOT_PROVIDER_BASE_URL: await ensureHub(),
      COPILOT_PROVIDER_API_KEY: hubKey(),
      COPILOT_MODEL: model,
      COPILOT_PROVIDER_MAX_PROMPT_TOKENS: String(cfg.maxPromptTokens),
      COPILOT_PROVIDER_MAX_OUTPUT_TOKENS: String(cfg.maxOutputTokens),
    })
  }
  const prompt = `${task}\n\nRules: work only inside this folder. Do not commit, push, or install anything globally. When done, reply with a short summary of what you changed, how you checked it, and anything left undone.`
  const args = ['-p', prompt, '--silent', '--allow-all-tools', '--no-auto-update', '--disable-client-telemetry',
    '--deny-tool', 'shell(git push)', '--deny-tool', 'shell(git commit)', '--deny-tool', 'shell(gh)',
    '--secret-env-vars', 'COPILOT_PROVIDER_API_KEY']
  if (!flags['no-sandbox']) args.push('--sandbox')
  if (flags.gh) args.push('--model', model)

  const id = `c-${stamp()}`
  const wt = join(metaDir, id)
  const branch = `helper/${id}`
  if (git(['status', '--porcelain'], root)) say('note: your uncommitted changes are not in the helper copy (it starts from HEAD)')
  git(['worktree', 'add', '-b', branch, wt, 'HEAD'], root)
  writeJson(join(metaDir, `${id}.json`), { id, root, wt, branch, model, gh: !!flags.gh, task, startedMs: Date.now() })
  say(`running Copilot CLI (${flags.gh ? `GitHub ${model}` : model}) in ${wt}…`)
  const run = spawnSync('copilot', args, { cwd: wt, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 })

  git(['add', '-A'], wt)
  const diff = execFileSync('git', ['diff', '--cached'], { cwd: wt, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const diffFile = join(metaDir, `${id}.diff`)
  writeFileSync(diffFile, diff)
  console.log(`## Copilot summary (exit ${run.status ?? run.signal ?? run.error?.message})\n${(run.stdout || '').trim()}`)
  if (run.status !== 0 && run.stderr) console.log(`\n## stderr\n${run.stderr.trim().slice(-3000)}`)
  console.log(`\n## Changes\n${git(['diff', '--cached', '--stat'], wt) || '(none)'}`)
  console.log(`\nDiff: ${diffFile}\nReview it, then apply in your tree with: git apply "${diffFile}"\nClean up with: helper code --clean ${id}`)
  log({ cmd: 'code', model, gh: !!flags.gh, id, root, exit: run.status, diffChars: diff.length, task: task.slice(0, 80) })
}

const handoff = async argv => {
  const { flags, rest } = parse(argv, ['file', 'check'])
  const dir = join(DATA, 'handoffs')
  if (flags.check) {
    const answer = join(dir, `${flags.check}.answer.md`)
    if (!existsSync(answer)) fail(`no answer yet at ${answer}`)
    process.stdout.write(readFileSync(answer, 'utf8'))
    return
  }
  const task = promptFrom(rest)
  if (!task.trim()) fail('usage: helper handoff [--file f]... [--inline] [--copy] "task"')
  const files = flags.inline ? readFiles(flags.file) : []
  guard({ paths: [process.cwd(), ...flags.file], texts: [['task', task], ...files] })
  const id = `h-${stamp()}`
  const file = join(dir, `${id}.md`)
  const answer = join(dir, `${id}.answer.md`).replace(/\\/g, '/')
  const fileList = flags.file.length
    ? `\n\nFiles to read:\n${flags.file.map(f => `- ${resolve(f).replace(/\\/g, '/')}`).join('\n')}`
    : ''
  const inline = files.map(([f, t]) => `\n\nFile: ${resolve(f)}\n\`\`\`\n${t}\n\`\`\``).join('')
  const prompt = `${task}${fileList}${inline}\n\nWhen you finish, write your full answer as Markdown to ${answer}. If you make images, save them next to it as ${id}-1.png, ${id}-2.png and so on, and list them in the answer. If you cannot write there, print the answer instead.`
  mkdirSync(dir, { recursive: true })
  writeFileSync(file, `<!-- For you, not part of the prompt:
1. Open Antigravity in ${process.cwd().replace(/\\/g, '/')}
2. Pick the best model in its list (newest Gemini, or a Claude model for hard reasoning while the free plan has one).
3. Paste everything below the line${flags.copy ? ' (it is already on your clipboard)' : ''}.
4. Tell Claude when the answer file exists. -->
---
${prompt}
`)
  if (flags.copy) spawnSync('powershell', ['-NoProfile', '-Command', 'Set-Clipboard -Value $input'], { input: prompt })
  console.log(`Handoff ${id}\nPrompt: ${file}\nAnswer expected at: ${answer}\nRead it later with: helper handoff --check ${id}`)
  log({ cmd: 'handoff', id, files: flags.file.map(f => resolve(f)), task: task.slice(0, 80) })
}

const version = id => (id.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] ?? '0').split('.').map(Number)
const cmpVersion = (a, b) => (a[0] - b[0]) || ((a[1] ?? 0) - (b[1] ?? 0))
const NOT_CHAT = /image|embed|tts|audio|live|vision-only|guard|rerank/i

const models = async argv => {
  const { flags } = parse(argv, [])
  if (!flags.check) {
    const base = await ensureHub()
    const { json } = await hubFetch(base, '/models')
    console.log(`Aliases: ${Object.entries(cfg.aliases).map(([k, v]) => `${k}=${v}`).join(', ')}\n`)
    console.log(json.data.map(m => m.id).sort().join('\n'))
    return
  }
  const quiet = msg => flags.quiet || say(msg)
  const state = readJson(STATE, {})
  if (!flags.force && Date.now() - (state.lastModelCheckMs ?? 0) < WEEK_MS) return quiet('checked less than a week ago')
  const base = await findHub()
  if (!base) return quiet('hub not running; will try next session')
  const ids = (await hubFetch(base, '/models')).json.data.map(m => m.id)
  const snap = readJson(SNAPSHOT, null)
  writeJson(SNAPSHOT, { savedMs: Date.now(), ids })
  writeJson(STATE, { ...state, lastModelCheckMs: Date.now() })
  if (!snap) return quiet(`baseline saved (${ids.length} models)`)

  const fresh = ids.filter(id => !snap.ids.includes(id) && !NOT_CHAT.test(id))
  const current = cfg.aliases.gemini
  const gemini = fresh.filter(id => /gemini-\d/.test(id) && cmpVersion(version(id), version(current)) >= 0 && !id.includes(current))
  const families = cfg.watchFamilies.filter(f => f !== 'gemini')
  const others = fresh.filter(id => !gemini.includes(id) && families.some(f => id.toLowerCase().includes(f))).slice(0, 8)
  const items = []
  if (gemini.length) {
    const best = [...gemini].sort((a, b) => cmpVersion(version(b), version(a)))[0].split('/').pop()
    items.push({
      kind: 'skill-tweak',
      title: `Research new model ${best}`.slice(0, 40),
      detail: `FreeLLMAPI now lists ${gemini.join(', ')} (current gemini alias: ${current}). Research what it is better at, update free-helpers MODELS.md and the gemini alias. Also check Antigravity's own model list.`.slice(0, 300),
      target: '~/.claude/skills/free-helpers/MODELS.md',
    })
  }
  if (others.length) {
    items.push({
      kind: 'skill-tweak',
      title: `Research ${others.length} new free model${others.length > 1 ? 's' : ''}`,
      detail: `New in FreeLLMAPI: ${others.join(', ')}. Check whether any beats the current smart/fast picks; update free-helpers MODELS.md and aliases.`.slice(0, 300),
      target: '~/.claude/skills/free-helpers/MODELS.md',
    })
  }
  if (items.length && existsSync(INBOX)) execFileSync(process.execPath, [INBOX, 'add', JSON.stringify(items), HOME], { stdio: 'ignore' })
  quiet(`${fresh.length} new models; ${items.length} inbox item(s)`)
}

const setkey = async argv => {
  const key = (argv[0] ?? execFileSync('powershell', ['-NoProfile', '-Command', 'Get-Clipboard'], { encoding: 'utf8' })).trim()
  if (!/^freellmapi-\S+$/.test(key)) fail('that does not look like a FreeLLMAPI key (freellmapi-…). Copy it from the tray icon first.')
  writeJson(CONFIG, { ...userCfg, hubKey: key })
  say(`saved to ${CONFIG}`)
}

const status = async () => {
  const base = await findHub()
  const logFile = join(DATA, 'log.jsonl')
  const lines = existsSync(logFile) ? readFileSync(logFile, 'utf8').split('\n').filter(Boolean) : []
  const week = lines.map(l => JSON.parse(l)).filter(e => Date.now() - Date.parse(e.ts) < WEEK_MS)
  console.log(`Hub: ${base ?? 'not running'}${existsSync(cfg.hubApp) ? '' : ' (app not installed)'}`)
  console.log(`Key: ${process.env.FREELLMAPI_KEY || cfg.hubKey ? 'set' : 'missing (helper setkey)'}`)
  console.log(`Aliases: ${Object.entries(cfg.aliases).map(([k, v]) => `${k}=${v}`).join(', ')}`)
  console.log(`Calls this week: ${week.length} (${['ask', 'code', 'handoff'].map(c => `${c} ${week.filter(e => e.cmd === c).length}`).join(', ')})`)
}

const guardCmd = async argv => {
  const texts = argv.includes('-') ? [['stdin', readFileSync(0, 'utf8')]] : []
  const paths = argv.filter(a => a !== '-')
  const fileTexts = paths.filter(p => existsSync(p) && statSync(p).isFile()).map(p => [p, readFileSync(p, 'utf8')])
  guard({ paths, texts: [...texts, ...fileTexts] })
  console.log('OK: nothing blocked')
}

const COMMANDS = { ask, code, handoff, models, setkey, status, guard: guardCmd }
const [cmd, ...argv] = process.argv.slice(2)
if (!COMMANDS[cmd]) fail('usage: helper ask|code|handoff|models|guard|setkey|status … (see the top of helper.mjs)')
COMMANDS[cmd](argv).catch(err => fail(err.message))
