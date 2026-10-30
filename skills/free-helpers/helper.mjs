// Hands jobs to free models through the FreeLLMAPI hub, behind a privacy guard. Data lives in ~/.claude/helpers.
//   helper ask [--model smart|fast|gemini|<id>] [--file f]... [--system s] [--out f] "prompt"   ("-" reads stdin)
//   helper code [--model <id>] [--gh] "task"     Copilot CLI edits a history-free copy of HEAD (file tools only), prints a diff
//   helper code --list | --clean <id>
//   helper handoff [--file f]... [--inline] [--copy] "task"   prompt file for the user to paste into Antigravity
//   helper handoff --check <id>
//   helper models [--check [--force] [--quiet]]               list hub models / weekly new-model watch
//   helper guard <path|->...                                  dry-run the privacy guard
//   helper setkey [key]                                       save the hub's unified key (default: from clipboard)
//   helper status
// A lone "--" ends the flags, so a prompt may start with "--".
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import {
  appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync,
} from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'

const HOME = homedir()
const TESTING = process.env.HELPER_TEST === '1'
// HELPER_DATA / HELPER_INBOX override the defaults only when HELPER_TEST=1. The blocklist never moves.
const DATA = (TESTING && process.env.HELPER_DATA) || join(HOME, '.claude', 'helpers')
const BLOCKLIST = join(HOME, '.claude', 'helpers', 'blocklist.txt')
const CONFIG = join(DATA, 'config.json')
const STATE = join(DATA, 'state.json')
const SNAPSHOT = join(DATA, 'models-snapshot.json')
const INBOX = (TESTING && process.env.HELPER_INBOX) || join(HOME, '.claude', 'skills', 'upgrade', 'inbox.mjs')
const RUNS = join(DATA, 'runs')
const WEEK_MS = 7 * 24 * 3600 * 1000
const MARKER = '.no-free-helpers'

const DEFAULTS = {
  hubUrl: '', // empty = the FreeLLMAPI desktop port (its config.json, else 31415)
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

// "~/x" and Git Bash's "/c/x" both become real Windows paths.
const fixPath = p => {
  const home = p.replace(/^~(?=$|[\\/])/, HOME)
  return process.platform === 'win32' ? home.replace(/^\/([a-zA-Z])(?=\/|$)/, '$1:') : home
}
const norm = p => resolve(fixPath(p)).replace(/\\/g, '/').toLowerCase()
// * and [abc] classes work; everything else is literal.
const globRe = g => g.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '[^/]*')

// Missing blocklist = guard refuses everything (fails closed).
const loadBlocklist = () => {
  if (!existsSync(BLOCKLIST)) return null
  const rules = { paths: [], names: [], allow: [], texts: [] }
  for (const raw of readFileSync(BLOCKLIST, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (line.startsWith('text:')) rules.texts.push(line.slice(5).trim().toLowerCase())
    else if (line.startsWith('!')) rules.allow.push(new RegExp(`^${globRe(line.slice(1).toLowerCase())}$`))
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
  ['credentials in a URL', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s/@]{6,}@/i],
  ['hard-coded secret', /\b(?:api[_-]?key|secret|token|passw(?:or)?d)\b\s*[:=]\s*['"][^'"\s]{12,}['"]/i],
  ['.env-style secret', /^\s*(?:export\s+)?[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD)[A-Z0-9_]*\s*=\s*[^\s'"$]{12,}\s*$/m],
]

// Windows aliases that open a file under another spelling: trailing dot/space, streams (a:b), 8.3 names (PROGRA~1).
const oddSegment = s => /[. ]$/.test(s) || /~\d/.test(s) || s.includes(':')

const pathProblem = p => {
  const variants = [norm(p)]
  try {
    variants.push(realpathSync.native(resolve(fixPath(p))).replace(/\\/g, '/').toLowerCase())
  } catch {}
  for (const n of new Set(variants)) {
    if (n.startsWith('//')) return 'network or \\\\?\\ paths are not allowed'
    for (const [entry, re] of RULES.paths) if (re.test(n)) return `under blocked path "${entry}"`
    const parts = n.split('/')
    if (parts.slice(1).some(s => s && oddSegment(s))) return 'unusual Windows path spelling'
    for (const [entry, re] of RULES.names) {
      if (parts.some(s => re.test(s) && !RULES.allow.some(a => a.test(s)))) return `name matches "${entry}"`
    }
    let dir = existsSync(n) && statSync(n).isDirectory() ? n : dirname(n)
    for (;;) {
      if (existsSync(join(dir, MARKER))) return `${dir} has a ${MARKER} marker`
      const up = dirname(dir)
      if (up === dir) break
      dir = up
    }
  }
  return null
}
const textProblem = text => {
  for (const [name, re] of SECRETS) if (re.test(text)) return `looks like it contains a ${name}`
  const lower = text.toLowerCase()
  for (const t of RULES.texts) if (lower.includes(t)) return `contains blocked text "${t}"`
  return null
}

// Throws one error listing every problem, so Claude can fix them all at once.
const guard = ({ paths = [], texts = [] }) => {
  if (!RULES) throw new Error(`Blocked: ${BLOCKLIST} is missing, so the privacy guard refuses everything`)
  const problems = []
  for (const p of paths) {
    const why = pathProblem(p)
    if (why) problems.push(`${p}: ${why}`)
  }
  for (const [label, text] of texts) {
    const why = textProblem(text)
    if (why) problems.push(`${label}: ${why}`)
  }
  if (problems.length) throw new Error(`Blocked by the privacy guard:\n  - ${problems.slice(0, 20).join('\n  - ')}${problems.length > 20 ? `\n  - …and ${problems.length - 20} more` : ''}`)
}

const MAX_FILE = 200_000
const MAX_TOTAL = 600_000
const readFiles = files => {
  let total = 0
  return files.map(f => {
    if (statSync(fixPath(f)).isDirectory()) throw new Error(`${f} is a folder; pass files one by one`)
    const text = readFileSync(fixPath(f), 'utf8')
    if (text.includes('\0')) throw new Error(`${f} looks binary`)
    if (text.length > MAX_FILE) throw new Error(`${f} is ${text.length} chars (max ${MAX_FILE}); split it`)
    total += text.length
    if (total > MAX_TOTAL) throw new Error(`files add up to more than ${MAX_TOTAL} chars; split the job`)
    return [f, text]
  })
}

// ---------- hub ----------

const anyKey = () => process.env.FREELLMAPI_KEY || cfg.hubKey
// Only a real OpenAI-style /models answer counts, so the key never goes to some other local server.
const isHub = async base => {
  try {
    const key = anyKey()
    const res = await fetch(`${base}/models`, {
      headers: key ? { authorization: `Bearer ${key}` } : {},
      signal: AbortSignal.timeout(2000),
    })
    if (!key) return res.status === 401
    return res.ok && Array.isArray((await res.json()).data)
  } catch {
    return false
  }
}
const findHub = async () => {
  if (cfg.hubUrl) {
    const base = cfg.hubUrl.replace(/\/$/, '')
    return (await isHub(base)) ? base : null
  }
  const ports = [readJson(join(process.env.APPDATA ?? '', 'FreeLLMAPI', 'config.json'), {}).port, 31415]
  for (const port of new Set(ports.filter(Boolean))) {
    const base = `http://127.0.0.1:${port}/v1`
    if (await isHub(base)) return base
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
  if (!base) throw new Error('FreeLLMAPI did not answer within 30s (is the key right? helper setkey)')
  return base
}
const hubKey = () => {
  const key = anyKey()
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
    if (a === '--') {
      rest.push(...argv.slice(i + 1))
      break
    }
    if (!a.startsWith('--')) {
      rest.push(a)
      continue
    }
    const name = a.slice(2)
    if (!valueFlags.includes(name)) {
      flags[name] = true
      continue
    }
    const value = argv[++i]
    if (value === undefined) fail(`--${name} needs a value`)
    if (name === 'file') flags.file.push(value)
    else flags[name] = value
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
  guard({ paths: [process.cwd(), ...flags.file] })
  const files = readFiles(flags.file)
  guard({ texts: [['prompt', prompt], ['system', flags.system ?? ''], ...files] })
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

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }).trim()
const walk = (dir, base = dir) => readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const full = join(dir, e.name)
  if (e.isDirectory()) return e.name === '.git' ? [] : walk(full, base)
  return [relative(base, full)]
})
const SCAN_LIMIT = 5_000_000
// Copilot's own add-on servers (browser, GitHub) would give it a way around the folder limit.
const copilotMcpNames = () => {
  const home = process.env.COPILOT_HOME || join(HOME, '.copilot')
  const j = readJson(join(home, 'mcp-config.json'), {})
  return Object.keys(j.mcpServers ?? j)
}
const removeRun = dir => rmSync(dir, { recursive: true, force: true, maxRetries: 3 })

const code = async argv => {
  const { flags, rest } = parse(argv, ['model', 'clean'])
  if (flags.list) {
    for (const f of existsSync(RUNS) ? readdirSync(RUNS).filter(f => f.endsWith('.json')) : []) {
      const m = readJson(join(RUNS, f), {})
      if (m.cleanedMs) continue
      if (Date.now() - m.startedMs > WEEK_MS) {
        removeRun(m.dir)
        writeJson(join(RUNS, f), { ...m, cleanedMs: Date.now() })
        continue
      }
      console.log(`${m.id}  ${m.model}  ${m.root}  ${m.task?.slice(0, 60)}`)
    }
    return
  }
  if (flags.clean) {
    const metaFile = join(RUNS, `${flags.clean}.json`)
    const meta = readJson(metaFile, null)
    if (!meta) fail(`no run ${flags.clean}`)
    removeRun(meta.dir)
    writeJson(metaFile, { ...meta, cleanedMs: Date.now() })
    say(`removed ${meta.dir}`)
    return
  }
  const task = promptFrom(rest)
  if (!task.trim()) fail('usage: helper code [--model m] [--gh] "task"')
  if (task.length > 20_000) fail('task is over 20,000 chars; put the details in a file in the repo and point to it')
  const root = git(['rev-parse', '--show-toplevel'], process.cwd())
  guard({ paths: [root], texts: [['task', task]] })

  // A plain copy of HEAD with a fresh git repo: no history, remotes or .git/config for the helper to read.
  const id = `c-${stamp()}-${randomBytes(2).toString('hex')}`
  const dir = join(RUNS, id)
  mkdirSync(dir, { recursive: true })
  let run
  let diff
  try {
    const tar = join(tmpdir(), `${id}.tar`)
    git(['archive', '-o', tar, 'HEAD'], root)
    // Windows' own tar: Git Bash's GNU tar reads "C:" as a remote host.
    const tarExe = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
    execFileSync(existsSync(tarExe) ? tarExe : 'tar', ['-xf', tar, '-C', dir])
    rmSync(tar, { force: true })

    const files = walk(dir)
    const texts = []
    const tooBig = []
    for (const f of files) {
      const full = join(dir, f)
      if (statSync(full).size > SCAN_LIMIT) {
        tooBig.push(f)
        continue
      }
      const t = readFileSync(full, 'utf8')
      if (!t.slice(0, 8000).includes('\0')) texts.push([f, t])
    }
    if (tooBig.length) throw new Error(`files too big to scan: ${tooBig.slice(0, 5).join(', ')}`)
    guard({ paths: files.map(f => join(root, f)), texts })

    const quiet = { cwd: dir, stdio: 'ignore' }
    execFileSync('git', ['init', '-q'], quiet)
    execFileSync('git', ['add', '-A'], quiet)
    execFileSync('git', ['-c', 'user.name=helper', '-c', 'user.email=helper@localhost', 'commit', '-q', '--no-verify', '-m', 'base'], quiet)

    const env = { ...process.env, COPILOT_AUTO_UPDATE: 'false' }
    for (const k of Object.keys(env)) {
      if (/KEY|TOKEN|SECRET|PASSW|CREDENTIAL/i.test(k) && !(flags.gh && /^(GH_|GITHUB_|COPILOT_GITHUB_)/.test(k))) delete env[k]
    }
    let model = flags.model ?? (flags.gh ? 'auto' : cfg.codeModel)
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
    // No shell and no web: Copilot's file tools are limited to this folder, so it cannot read the rest of the disk.
    const prompt = `${task}\n\nRules: you can only read and edit files in this folder; there is no shell. Do not try to run tests or commands. When done, reply with a short summary of what you changed and anything left undone.`
    const args = ['-p', prompt, '--silent', '--allow-all-tools', '--deny-tool', 'shell', '--deny-tool', 'url',
      '--disallow-temp-dir', '--disable-builtin-mcps', ...copilotMcpNames().flatMap(n => ['--disable-mcp-server', n]),
      '--no-auto-update', '--disable-client-telemetry', '--secret-env-vars', 'COPILOT_PROVIDER_API_KEY']
    if (flags.gh) args.push('--model', model)
    writeJson(join(RUNS, `${id}.json`), { id, root, dir, model, gh: !!flags.gh, task, startedMs: Date.now() })
    if (git(['status', '--porcelain'], root)) say('note: your uncommitted changes are not in the helper copy (it starts from HEAD)')
    say(`running Copilot CLI (${flags.gh ? `GitHub ${model}` : model}) in ${dir}…`)
    run = spawnSync('copilot', args, { cwd: dir, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 })
    execFileSync('git', ['add', '-A'], quiet)
    diff = git(['diff', '--cached', '--binary'], dir)
    run.model = model
  } catch (err) {
    removeRun(dir)
    throw err
  }
  const diffFile = join(RUNS, `${id}.diff`)
  writeFileSync(diffFile, diff ? `${diff}\n` : '')
  console.log(`## Copilot summary (exit ${run.status ?? run.signal ?? run.error?.message})\n${(run.stdout || '').trim()}`)
  if (run.status !== 0 && run.stderr) console.log(`\n## stderr\n${run.stderr.trim().slice(-3000)}`)
  console.log(`\n## Changes\n${git(['diff', '--cached', '--stat'], dir) || '(none)'}`)
  console.log(`\nDiff: ${diffFile}\nReview it, then apply in your tree with: git apply "${diffFile}"\nClean up with: helper code --clean ${id}`)
  log({ cmd: 'code', model: run.model, gh: !!flags.gh, id, root, exit: run.status, diffChars: diff.length, task: task.slice(0, 80) })
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
  guard({ paths: [process.cwd(), ...flags.file] })
  // Always scan the files: Antigravity reads them even when they are only listed.
  const files = readFiles(flags.file)
  guard({ texts: [['task', task], ...files] })
  const id = `h-${stamp()}-${randomBytes(2).toString('hex')}`
  const file = join(dir, `${id}.md`)
  const answer = join(dir, `${id}.answer.md`).replace(/\\/g, '/')
  const fileList = flags.file.length
    ? `\n\nFiles to read:\n${flags.file.map(f => `- ${resolve(f).replace(/\\/g, '/')}`).join('\n')}`
    : ''
  const inline = flags.inline ? files.map(([f, t]) => `\n\nFile: ${resolve(f)}\n\`\`\`\n${t}\n\`\`\``).join('') : ''
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
  if (flags.copy) {
    // Through a UTF-8 file: piping into PowerShell garbles non-ASCII text.
    const tmp = join(tmpdir(), `${id}.txt`)
    writeFileSync(tmp, prompt)
    spawnSync('powershell', ['-NoProfile', '-Command', `Get-Content -Raw -Encoding UTF8 '${tmp}' | Set-Clipboard`])
    rmSync(tmp, { force: true })
  }
  console.log(`Handoff ${id}\nPrompt: ${file}\nAnswer expected at: ${answer}\nRead it later with: helper handoff --check ${id}`)
  log({ cmd: 'handoff', id, files: flags.file.map(f => resolve(f)), task: task.slice(0, 80) })
}

const version = id => (id.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] ?? '0').split('.').map(Number)
const cmpVersion = (a, b) => (a[0] - b[0]) || ((a[1] ?? 0) - (b[1] ?? 0))
const NOT_CHAT = /image|embed|tts|audio|live|vision-only|guard|rerank/i

const checkModels = async flags => {
  const quiet = msg => flags.quiet || say(msg)
  const state = readJson(STATE, {})
  if (!flags.force && Date.now() - (state.lastModelCheckMs ?? 0) < WEEK_MS) return quiet('checked less than a week ago')
  const base = await findHub()
  if (!base) return quiet('hub not running; will try next session')
  const ids = (await hubFetch(base, '/models')).json.data.map(m => m.id)
  const snap = readJson(SNAPSHOT, null)
  const saveSnapshot = () => {
    writeJson(SNAPSHOT, { savedMs: Date.now(), ids })
    writeJson(STATE, { ...state, lastModelCheckMs: Date.now() })
  }
  if (!snap) {
    saveSnapshot()
    return quiet(`baseline saved (${ids.length} models)`)
  }
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
  // Snapshot only after the inbox has the items, so a failed add is retried next week.
  if (items.length) execFileSync(process.execPath, [INBOX, 'add', JSON.stringify(items), HOME], { stdio: 'pipe' })
  saveSnapshot()
  quiet(`${fresh.length} new models; ${items.length} inbox item(s)`)
}

const models = async argv => {
  const { flags } = parse(argv, [])
  if (flags.check) {
    try {
      await checkModels(flags)
    } catch (err) {
      if (!flags.quiet) throw err
    }
    return
  }
  const base = await ensureHub()
  const { json } = await hubFetch(base, '/models')
  console.log(`Aliases: ${Object.entries(cfg.aliases).map(([k, v]) => `${k}=${v}`).join(', ')}\n`)
  console.log(json.data.map(m => m.id).sort().join('\n'))
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
  const week = lines.map(l => readJsonLine(l)).filter(e => e && Date.now() - Date.parse(e.ts) < WEEK_MS)
  console.log(`Hub: ${base ?? 'not running'}${existsSync(cfg.hubApp) ? '' : ' (app not installed)'}`)
  console.log(`Key: ${anyKey() ? 'set' : 'missing (helper setkey)'}`)
  console.log(`Guard: ${RULES ? 'on' : `MISSING ${BLOCKLIST}`}`)
  console.log(`Aliases: ${Object.entries(cfg.aliases).map(([k, v]) => `${k}=${v}`).join(', ')}`)
  console.log(`Calls this week: ${week.length} (${['ask', 'code', 'handoff'].map(c => `${c} ${week.filter(e => e.cmd === c).length}`).join(', ')})`)
}
const readJsonLine = line => {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
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
