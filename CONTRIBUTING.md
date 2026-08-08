# Flusso di lavoro

## Sviluppo locale

1. Crea un branch: `git checkout -b nome-feature`
2. Avvia l'ambiente locale: `npm run docker:local:up`
3. Sviluppa e testa tutto in locale (database Docker separato da produzione)
4. Quando sei sicuro che funzioni, fai commit e push sul branch
5. Fai il merge su `main` SOLO quando la feature è testata e stabile

## Produzione

- `main` è collegato automaticamente a:
  - Vercel (frontend)
  - Railway (backend)
- Il database di produzione è su Supabase, separato da quello locale
- NON pushare mai codice non testato direttamente su `main`
- NON modificare mai manualmente i dati su Supabase produzione durante i test, usa sempre il database Docker locale

## Comandi Docker locali

```bash
npm run docker:local:up      # avvia db + backend locale
npm run docker:local:down    # ferma i container
npm run docker:local:reset   # distrugge e ricrea i container (reset dati locali)
npm run docker:local:logs    # log del backend locale
```

## Variabili d'ambiente

- Copia `server/.env.example` in `server/.env` e compila i valori per lo sviluppo locale
- In locale `DATABASE_URL` DEVE puntare al database Docker: `postgresql://fittrack:fittrack@db:5432/fittrack?schema=public`
- `server/.env` è nel `.gitignore`: non committarlo mai
- `server/.env.example` va invece commitato come guida (senza valori sensibili)