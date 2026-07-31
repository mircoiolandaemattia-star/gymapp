import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createServer } from 'node:https'
import { networkInterfaces } from 'node:os'
import { extname, join, normalize, sep } from 'node:path'

const root = process.cwd()
const distDir = join(root, 'dist')
const certsDir = join(root, '.certs')
const keyPath = join(certsDir, 'key.pem')
const certPath = join(certsDir, 'cert.pem')
const port = Number(process.env.PORT || process.argv.find((a) => /^\d+$/.test(a)) || 8443)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
}

function lanIps() {
  const out = []
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) out.push(net.address)
    }
  }
  return out
}

function buildIfNeeded() {
  if (existsSync(join(distDir, 'index.html'))) return
  console.log('[https] dist/ non trovata, eseguo npm run build...')
  execSync('npm run build', { stdio: 'inherit', cwd: root })
}

function ensureCert() {
  if (existsSync(keyPath) && existsSync(certPath)) return
  mkdirSync(certsDir, { recursive: true })
  const ips = lanIps()
  const san = ['DNS:localhost', ...ips.map((ip) => `IP:${ip}`)].join(',')
  console.log('[https] genero certificato self-signed per:', san)
  execSync(
    `openssl req -x509 -nodes -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 825 ` +
      `-subj "/CN=FitTrack" -addext "subjectAltName=${san}"`,
    { stdio: 'inherit', cwd: root },
  )
}

function serveFile(req, res, pathname) {
  const ext = extname(pathname)
  const filePath = normalize(join(distDir, pathname))
  if (!filePath.startsWith(distDir + sep)) {
    res.writeHead(403).end('Forbidden')
    return
  }
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404).end('Not found')
    return
  }
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  res.end(readFileSync(filePath))
}

function handler(req, res) {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, 'https://localhost').pathname)
  } catch {
    res.writeHead(400).end('Bad request')
    return
  }
  if (pathname === '/sw.js' || extname(pathname) === '') {
    const target = pathname === '/sw.js' ? '/sw.js' : '/index.html'
    return serveFile(req, res, target)
  }
  return serveFile(req, res, pathname)
}

buildIfNeeded()
ensureCert()

const server = createServer(
  { key: readFileSync(keyPath), cert: readFileSync(certPath) },
  handler,
)
server.listen(port, '0.0.0.0', () => {
  const urls = [...lanIps().map((ip) => `https://${ip}:${port}`), `https://localhost:${port}`]
  console.log('\n[FitTrack] server HTTPS attivo per test mobile:')
  for (const u of urls) console.log('  ' + u)
  console.log(`
Per usare il Service Worker da iPhone Safari serve fidarsi del certificato:
  1. Apri https://${lanIps()[0]}:${port} su iPhone, accetta l'avviso del certificato.
  2. Vai in Impostazioni > Generali > Info > Impostazioni di attendibilità certificati
     e attiva "piena fiducia" per il certificato "FitTrack".
  3. Ricarica l'app in Safari, poi "Aggiungi a Home" -> il SW funzionera' e l'app andra' offline.
Alternativa senza passi di fiducia: installa cloudflared e usa
  npx cloudflared tunnel --url http://localhost:4173
`)
})

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(0))
