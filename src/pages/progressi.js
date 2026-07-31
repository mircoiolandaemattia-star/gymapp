import { progressData } from '/src/mock/data.js'
import { createIcon } from '/src/utils/icons.js'
import { TrendingUp, Target, Calendar } from 'lucide'

function render() {
  const section = document.createElement('section')
  section.className = 'page progressi-page'

  const header = document.createElement('div')
  header.className = 'page-header'
  header.innerHTML = `
    <h1 class="page-title">Progressi</h1>
    <p class="page-subtitle">La tua evoluzione</p>
  `
  section.appendChild(header)

  const current = progressData.weight[progressData.weight.length - 1]
  const first = progressData.weight[0]
  const diff = (first.value - current.value).toFixed(1)

  const statsGrid = document.createElement('div')
  statsGrid.className = 'stats-grid'

  const s1 = document.createElement('div')
  s1.className = 'stat-card'
  s1.innerHTML = '<span class="stat-label">Peso attuale</span><span class="stat-value">' + current.value + ' kg</span>'
  statsGrid.appendChild(s1)

  const s2 = document.createElement('div')
  s2.className = 'stat-card'
  s2.innerHTML = '<span class="stat-label">Persi</span><span class="stat-value">' + diff + ' kg</span>'
  statsGrid.appendChild(s2)

  const s3 = document.createElement('div')
  s3.className = 'stat-card'
  s3.innerHTML = '<span class="stat-label">Sessioni/mese</span><span class="stat-value">' + progressData.sessions[progressData.sessions.length - 1] + '</span>'
  statsGrid.appendChild(s3)

  section.appendChild(statsGrid)

  const weightCard = document.createElement('div')
  weightCard.className = 'card'

  const wTitle = document.createElement('h3')
  wTitle.className = 'card-title'
  wTitle.textContent = 'Andamento Peso'
  weightCard.appendChild(wTitle)

  const bars = document.createElement('div')
  bars.className = 'chart-bars'

  const maxW = Math.max(...progressData.weight.map(x => x.value))
  progressData.weight.forEach((w) => {
    const pct = (w.value / maxW) * 100
    const col = document.createElement('div')
    col.className = 'bar-col'
    const bar = document.createElement('div')
    bar.className = 'bar'
    bar.style.height = pct + '%'
    col.appendChild(bar)
    const label = document.createElement('span')
    label.className = 'bar-label'
    label.textContent = String(w.value)
    col.appendChild(label)
    const date = document.createElement('span')
    date.className = 'bar-date'
    date.textContent = w.date.slice(5)
    col.appendChild(date)
    bars.appendChild(col)
  })

  weightCard.appendChild(bars)
  section.appendChild(weightCard)

  const goalsCard = document.createElement('div')
  goalsCard.className = 'card'
  const gTitle = document.createElement('h3')
  gTitle.className = 'card-title'
  gTitle.textContent = 'Obiettivi'
  goalsCard.appendChild(gTitle)

  const goals = [
    { label: 'Peso target 70kg', icon: Target, color: 'var(--accent)', pct: 70 },
    { label: 'Sessioni 20/mese', icon: Calendar, color: 'var(--info)', pct: 75 },
    { label: 'Forza: Panca 80kg', icon: TrendingUp, color: 'var(--warning)', pct: 60 },
  ]
  goals.forEach((g) => {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex;align-items:center;gap:var(--space-md);padding:var(--space-sm) 0'
    const svg = createIcon(g.icon, 18, 2)
    svg.style.color = g.color
    row.appendChild(svg)
    const txt = document.createElement('span')
    txt.style.cssText = 'flex:1;font-size:0.8125rem;color:var(--text-primary)'
    txt.textContent = g.label
    row.appendChild(txt)
    const pctSpan = document.createElement('span')
    pctSpan.style.cssText = 'font-size:0.75rem;font-weight:600;color:' + g.color
    pctSpan.textContent = g.pct + '%'
    row.appendChild(pctSpan)
    goalsCard.appendChild(row)
  })
  section.appendChild(goalsCard)

  return section
}

export { render }
export default render
