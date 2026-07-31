const today = new Date()

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function dateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shortLabel(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export const macroTargets = {
  calories: 2200,
  protein: 180,
  carbs: 250,
  fat: 80,
}

export const photoLimit = 2
export let photoUsedToday = 0

export function usePhotoSlot() {
  photoUsedToday += 1
}

const CATALOG = {
  avena: { name: 'Fiocchi di avena', cal: 367, p: 13.5, c: 60, f: 7 },
  latte: { name: 'Latte scremato', cal: 34, p: 3.4, c: 5, f: 0.1 },
  mela: { name: 'Mela', cal: 52, p: 0.3, c: 14, f: 0.2 },
  mandorle: { name: 'Mandorle', cal: 579, p: 21, c: 22, f: 50 },
  whey: { name: 'Whey proteica', cal: 380, p: 80, c: 8, f: 5 },
  yogurt: { name: 'Yogurt greco 0%', cal: 59, p: 10, c: 3.6, f: 0.4 },
  petto: { name: 'Petto di pollo', cal: 110, p: 23, c: 0, f: 2 },
  riso: { name: 'Riso basmati', cal: 130, p: 2.7, c: 28, f: 0.3 },
  verdure: { name: 'Verdure grigliate', cal: 35, p: 2, c: 6, f: 0.5 },
  olio: { name: 'Olio d\'oliva', cal: 884, p: 0, c: 0, f: 100 },
  salmone: { name: 'Salmone', cal: 208, p: 20, c: 0, f: 13 },
  patate: { name: 'Patate al forno', cal: 77, p: 2, c: 17, f: 0.1 },
  bresaola: { name: 'Bresaola', cal: 150, p: 32, c: 0.5, f: 3 },
  quinoa: { name: 'Quinoa', cal: 120, p: 4.4, c: 21, f: 1.9 },
  frittata: { name: 'Frittata di albumi', cal: 90, p: 11, c: 1, f: 4.5 },
  pane: { name: 'Pane integrale', cal: 248, p: 8.5, c: 45, f: 2.5 },
  caffe: { name: 'Caffè espresso', cal: 2, p: 0.3, c: 0, f: 0 },
}

const MEAL_DEFS = [
  { id: 'colazione', name: 'Colazione', color: 'var(--warning)' },
  { id: 'pranzo', name: 'Pranzo', color: 'var(--error)' },
  { id: 'cena', name: 'Cena', color: 'var(--info)' },
  { id: 'snack', name: 'Snack', color: 'var(--accent)' },
]

const VARIANT_MEALS = [
  {
    colazione: { avena: 80, latte: 250, mela: 150 },
    pranzo: { petto: 150, riso: 200, verdure: 200, olio: 10 },
    cena: { salmone: 180, patate: 250, verdure: 150, olio: 5 },
    snack: { yogurt: 200, mandorle: 20, whey: 30 },
  },
  {
    colazione: { avena: 60, latte: 200, mandorle: 15 },
    pranzo: { bresaola: 120, quinoa: 180, verdure: 150 },
    cena: { petto: 180, patate: 300, verdure: 150 },
    snack: { yogurt: 150, mela: 150 },
  },
  {
    colazione: { frittata: 120, pane: 60, caffe: 1 },
    pranzo: { petto: 160, riso: 180, verdure: 150, olio: 8 },
    cena: { salmone: 200, patate: 200, verdure: 100 },
    snack: { yogurt: 200, mandorle: 15, whey: 30 },
  },
]

function buildFood(key, qty) {
  const per100 = CATALOG[key]
  const f = qty / 100
  return {
    name: per100.name,
    qty,
    cal: Math.round(per100.cal * f),
    protein: Math.round(per100.p * f * 10) / 10,
    carbs: Math.round(per100.c * f * 10) / 10,
    fat: Math.round(per100.f * f * 10) / 10,
  }
}

function buildDay(offset) {
  const d = addDays(today, offset)
  const variant = ((offset % 3) + 3) % 3
  const config = VARIANT_MEALS[variant]
  const meals = MEAL_DEFS.map((def) => {
    const foods = Object.entries(config[def.id]).map(([key, qty]) => buildFood(key, qty))
    return { ...def, foods }
  })
  return {
    date: dateStr(d),
    label: shortLabel(d),
    isToday: offset === 0,
    meals,
  }
}

export const dietDays = [-3, -2, -1, 0, 1, 2, 3].map(buildDay)

export const todayIndex = dietDays.findIndex((d) => d.isToday)

export const barcodeProducts = [
  { name: 'Yogurt Greco 0%', brand: 'Fage', per100: { cal: 59, p: 10, c: 3.6, f: 0.4 } },
  { name: 'Barretta proteica', brand: 'Dymatize', per100: { cal: 380, p: 40, c: 40, f: 9 } },
  { name: 'Pasta integrale', brand: 'Rummo', per100: { cal: 340, p: 13, c: 64, f: 2.5 } },
  { name: 'Tonno al naturale', brand: 'Rio Mare', per100: { cal: 116, p: 25.5, c: 0, f: 1 } },
  { name: 'Fette biscottate integrali', brand: 'Mulino Bianco', per100: { cal: 410, p: 11, c: 72, f: 7 } },
  { name: 'Hummus di ceci', brand: 'Alce Nero', per100: { cal: 166, p: 7.9, c: 14.3, f: 9.6 } },
]
