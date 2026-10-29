// Reads and updates the Upgrades inbox (~/.claude/toolbox/upgrades.json) that the Toolbox mod shows.
//   node inbox.mjs show u3 u7                     print those items as JSON
//   node inbox.mjs applied u3 "what was written where"
//   node inbox.mjs dropped u3 "why it is no longer needed"
//   node inbox.mjs add '<json array>' [project]  add items: [{kind,title,detail,target}]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const FILE = join(homedir(), '.claude', 'toolbox', 'upgrades.json')
const KINDS = ['rule', 'memory', 'permission', 'hook', 'skill', 'skill-tweak', 'agent', 'mod', 'escalate']

const load = () =>
  existsSync(FILE)
    ? JSON.parse(readFileSync(FILE, 'utf8'))
    : { version: 1, nextId: 1, lastScanMs: 0, scanned: {}, items: [] }

const save = inbox => {
  mkdirSync(dirname(FILE), { recursive: true })
  writeFileSync(FILE, `${JSON.stringify(inbox, null, 2)}\n`)
}

const [cmd, ...args] = process.argv.slice(2)
const inbox = load()

if (cmd === 'show') {
  const items = args.length ? inbox.items.filter(i => args.includes(i.id)) : inbox.items.filter(i => i.status === 'open')
  const missing = args.filter(id => !inbox.items.some(i => i.id === id))
  console.log(JSON.stringify(items, null, 2))
  if (missing.length) console.error(`Not in the inbox: ${missing.join(', ')}`)
} else if (cmd === 'applied' || cmd === 'dropped') {
  const [id, note = ''] = args
  const item = inbox.items.find(i => i.id === id)
  if (!item) throw new Error(`${id} is not in the inbox`)
  item.status = cmd
  if (cmd === 'applied') item.appliedMs = Date.now()
  item.appliedNote = note
  save(inbox)
  console.log(`${id} → ${cmd}`)
} else if (cmd === 'add') {
  const [json, project = process.cwd()] = args
  const now = Date.now()
  const added = []
  for (const s of JSON.parse(json)) {
    if (!KINDS.includes(s.kind) || !s.title || !s.detail) throw new Error(`bad item: ${JSON.stringify(s)}`)
    const id = `u${inbox.nextId++}`
    inbox.items.push({
      id,
      kind: s.kind,
      title: String(s.title).slice(0, 120),
      detail: String(s.detail),
      target: String(s.target ?? ''),
      project,
      sources: [`manual-${now}`],
      firstSeenMs: now,
      lastSeenMs: now,
      status: 'open',
    })
    added.push(id)
  }
  save(inbox)
  console.log(`Added ${added.join(', ') || 'nothing'}`)
} else {
  console.error('usage: node inbox.mjs show|applied|dropped|add ...')
  process.exit(1)
}
