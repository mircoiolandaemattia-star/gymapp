import { readdirSync, writeFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const distDir = join(process.cwd(), 'dist')

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
const manifest = {
  version: Date.now(),
  assets,
}

writeFileSync(join(distDir, 'precache.json'), JSON.stringify(manifest))
console.log(`[precache] ${assets.length} file -> dist/precache.json`)
