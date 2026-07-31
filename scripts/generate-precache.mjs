import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const distDir = join(root, 'dist')

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
    } else {
      out.push('/' + relative(distDir, full))
    }
  }
  return out
}

const all = walk(distDir)
const assets = all.filter((p) => !['/sw.js', '/precache.json'].includes(p))
if (!assets.includes('/index.html')) assets.push('/index.html')
if (!assets.includes('/')) assets.push('/')
const version = Date.now()

const template = readFileSync(join(root, 'public', 'sw.js'), 'utf8')
const sw = template
  .replace('__PRECACHE_URLS__', JSON.stringify(assets))
  .replace('__VERSION__', String(version))

writeFileSync(join(distDir, 'sw.js'), sw)
console.log(`[sw] ${assets.length} asset precachati -> dist/sw.js (fittrack-${version})`)
