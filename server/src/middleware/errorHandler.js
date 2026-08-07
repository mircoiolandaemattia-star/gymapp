export default function errorHandler(err, req, res, next) {
  console.error(err)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Risorsa già esistente' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Risorsa non trovata' })
  }
  if (err.aiNetwork) {
    return res.status(502).json({ error: 'Servizio AI non disponibile, riprova più tardi' })
  }
  res.status(err.status || 500).json({ error: err.message || 'Errore interno del server' })
}
