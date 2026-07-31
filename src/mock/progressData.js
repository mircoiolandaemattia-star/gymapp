const today = new Date()

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

function dAgo(n) {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d
}

function dateLabel(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function dayNum(d) {
  return String(d.getDate())
}

function buildDaily(len, seed) {
  const out = []
  for (let i = 0; i < len; i++) {
    const wob = Math.round(Math.sin((i + seed) * 0.9) * 140 + Math.sin((i + seed) * 0.23) * 90 + 25)
    out.push({ label: dayNum(dAgo(len - 1 - i)), value: Math.max(1300, 2050 + wob) })
  }
  return out
}

export const progressData = {
  calorieTarget: 2200,
  goal: 'dimagrire',
  periods: {
    week: {
      weight: [79.2, 79.0, 78.8, 78.6, 78.4, 78.1, 77.8].map((v, i) => ({ label: dateLabel(dAgo(6 - i)), value: v })),
      calories: [1870, 2210, 1950, 2140, 1820, 2080, 1930].map((v, i) => ({ label: dayNum(dAgo(6 - i)), value: v })),
      stats: { streak: 7, sessions: 4, hours: 3.2 },
    },
    month: {
      weight: [80.4, 79.8, 79.1, 78.4, 77.8].map((v, i) => ({ label: dateLabel(dAgo(28 - i * 7)), value: v })),
      calories: buildDaily(30, 5),
      stats: { streak: 12, sessions: 16, hours: 13.8 },
    },
    quarter: {
      weight: [84.0, 83.3, 82.7, 82.0, 81.4, 80.8, 80.1, 79.5, 79.0, 78.6, 78.2, 78.0, 77.8].map((v, i) => ({
        label: dateLabel(dAgo(84 - i * 7)),
        value: v,
      })),
      calories: [2140, 2080, 2210, 1990, 2050, 2120, 1950, 2020, 2100, 1980, 2040, 1960, 2010].map((v, i) => ({
        label: dateLabel(dAgo(84 - i * 7)),
        value: v,
      })),
      stats: { streak: 12, sessions: 47, hours: 41.5 },
    },
  },
  photos: [
    { id: 'p1', date: '15 Lug', color: 'linear-gradient(135deg,#0f766e,#0f172a)' },
    { id: 'p2', date: '30 Giu', color: 'linear-gradient(135deg,#4338ca,#0f172a)' },
    { id: 'p3', date: '15 Giu', color: 'linear-gradient(135deg,#9a3412,#0f172a)' },
    { id: 'p4', date: '01 Giu', color: 'linear-gradient(135deg,#be123c,#0f172a)' },
  ],
  measurements: [
    { id: 'm1', date: '15 Lug', vita: 82, fianchi: 99, petto: 98, braccia: 33.5 },
    { id: 'm2', date: '01 Lug', vita: 83, fianchi: 100, petto: 97, braccia: 34 },
    { id: 'm3', date: '15 Giu', vita: 84, fianchi: 101, petto: 96, braccia: 34.5 },
  ],
}
