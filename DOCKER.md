# FitTrack — Docker & ambienti

## Panoramica

FitTrack usa **due ambienti completamente separati**:

| Ambiente | Dove gira | Come si gestisce |
|----------|-----------|------------------|
| **Locale** | Docker Compose sul tuo computer (PostgreSQL + backend) | `docker-compose.local.yml` |
| **Produzione** | Railway + Supabase (deployato, cloud) | Nessun Docker Compose, gestito dalla piattaforma |

> ⚠️ **Non mescolare i due ambienti.** Il file locale punta a un PostgreSQL **locale**, la produzione usa Supabase. Non condividere `.env` tra i due.

---

## Ambiente locale

### Prerequisiti
- Docker + Docker Compose installati
- Un file `server/.env` creato da `server/.env.example` (vedi sezione Configurazione)

### Avvio
```bash
docker compose -f docker-compose.local.yml up -d
```

Oppure con lo script npm:
```bash
npm run docker:local:up
```

Questo avvia:
- `fittrack-db-local` — PostgreSQL 16 su porta `5432`
- `fittrack-backend-local` — API su porta `3000`

Il backend applica automaticamente le migrazioni Prisma all'avvio (`prisma migrate deploy`) e genera il client.

### Log
```bash
docker compose -f docker-compose.local.yml logs -f backend
```
o `npm run docker:local:logs`

### Stop
```bash
docker compose -f docker-compose.local.yml down
```
o `npm run docker:local:down`

### Reset completo (cancella i dati del DB locale)
```bash
docker compose -f docker-compose.local.yml down -v
```

---

## Frontend locale

Dopo aver avviato il backend, in un altro terminale:
```bash
npm run dev
```
L'app è su `http://localhost:5173` e parla con l'API su `http://localhost:3000/api`.

---

## Configurazione `.env`

### Struttura (sicuro da committare)
`server/.env.example` contiene tutte le variabili richieste **senza valori sensibili**:

```env
DATABASE_URL="postgresql://fittrack:fittrack@db:5432/fittrack?schema=public"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.6-flash"
```

Per lo sviluppo locale:
```bash
cp server/.env.example server/.env
```

### Variabili sensibili
- `server/.env` contiene i valori **reali** ed è già nel `.gitignore` — **non va mai committato**.
- Genera un `JWT_SECRET` tuo: `openssl rand -hex 32`
- `GEMINI_API_KEY` va ottenuta dal tuo account Google AI Studio.

---

## Produzione

**Non usa Docker Compose.** Il backend è deployato su Railway e il database è Supabase (hosting gestito).

- La `DATABASE_URL` di produzione punta all'istanza Supabase.
- `CORS_ORIGIN` di produzione è `https://fittrack.vercel.app`.
- Il deploy e le variabili d'ambiente si configurano direttamente sulla piattaforma, non qui.

---

## Script npm disponibili

```json
"docker:local:up":    "docker compose -f docker-compose.local.yml up -d",
"docker:local:down":  "docker compose -f docker-compose.local.yml down",
"docker:local:logs":  "docker compose -f docker-compose.local.yml logs -f backend"
```
