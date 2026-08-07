const OFF_API = 'https://world.openfoodfacts.org/api/v2/product'
const OFF_SEARCH = 'https://world.openfoodfacts.org/cgi/search.pl'
const UA =
  'FittrackMobile/1.0 (salute e fitness; contatto: dev@fittrack.local)'

function num(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return 0
  return Math.round(n * 10) / 10
}

async function fetchJson(url) {
  let lastErr
  for (let attempt = 0; attempt < 2; attempt++) {
    let response
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': UA } })
    } catch {
      lastErr = new Error('Servizio Open Food Facts non disponibile, riprova')
      lastErr.status = 502
      throw lastErr
    }
    try {
      return await response.json()
    } catch {
      lastErr = new Error('Risposta non valida da Open Food Facts')
      lastErr.status = 502
    }
    await new Promise((r) => setTimeout(r, 800))
  }
  throw lastErr
}

export async function getFoodByBarcode(req, res, next) {
  try {
    const { code } = req.params
    if (!code) return res.status(400).json({ error: 'Codice a barre mancante' })

    const url = `${OFF_API}/${encodeURIComponent(code)}.json`
    const data = await fetchJson(url)

    if (!data || data.status !== 1 || !data.product) {
      return res.status(404).json({ error: 'Prodotto non trovato su Open Food Facts' })
    }

    const product = data.product
    const n = product.nutriments || {}

    res.json({
      name: product.product_name || product.generic_name || `Prodotto ${code}`,
      caloriesPer100g: num(n['energy-kcal_100g']),
      proteinPer100g: num(n.proteins_100g),
      carbsPer100g: num(n.carbohydrates_100g),
      fatsPer100g: num(n.fat_100g),
    })
  } catch (err) {
    next(err)
  }
}

export async function searchFoods(req, res, next) {
  try {
    const q = String(req.query.q || '').trim()
    if (!q || q.length < 2) return res.status(400).json({ error: 'Termine di ricerca troppo corto' })

    const url = `${OFF_SEARCH}?search_terms=${encodeURIComponent(q)}&json=1&page_size=5`
    const data = await fetchJson(url)

    const products = Array.isArray(data.products) ? data.products : []

    const results = products
      .filter((p) => p.product_name)
      .map((p) => {
        const n = p.nutriments || {}
        return {
          name: p.product_name,
          brand: p.brands || null,
          caloriesPer100g: num(n['energy-kcal_100g']),
          proteinPer100g: num(n.proteins_100g),
          carbsPer100g: num(n.carbohydrates_100g),
          fatsPer100g: num(n.fat_100g),
        }
      })

    res.json({ results })
  } catch (err) {
    next(err)
  }
}
