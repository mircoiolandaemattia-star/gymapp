import { createIcon } from '/src/utils/icons.js'
import { TrendingDown, TrendingUp, Scale } from 'lucide'
import { apiFetch } from '/src/utils/api.js'
import { getUser } from '/src/utils/auth.js'
import { getNutritionTargets } from '/src/utils/nutritionTargets.js'
import { periodSelector } from '/src/components/periodSelector.js'
import { weightChart } from '/src/components/weightChart.js'
import { calorieChart } from '/src/components/calorieChart.js'
import { workoutStatsGrid } from '/src/components/workoutStatsGrid.js'
import { progressPhotoGrid } from '/src/components/progressPhotoGrid.js'
import { measurementsList } from '/src/components/measurementsList.js'
import { addProgressPhotoModal } from '/src/components/addProgressPhotoModal.js'
import { addMeasurementModal } from '/src/components/addMeasurementModal.js'
import { loadingEl, errorEl } from '/src/utils/ui.js'

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

const PERIOD_DAYS = { week: 7, month: 30, quarter: 90 }

let section = null
let activePeriod = 'week'
let photos = []
let measurements = []
let sessions = []
let calorieDays = []
let user = {}
let loaded = false
let loading = false
let loadError = null

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDaysIso(iso, offset) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shortLabel(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function dayNum(iso) {
  return String(new Date(iso).getDate())
}

function periodRange() {
  const to = todayIso()
  const from = addDaysIso(to, -(PERIOD_DAYS[activePeriod] - 1))
  return { from, to }
}

function inRange(iso) {
  const { from, to } = periodRange()
  const key = new Date(iso).toISOString().slice(0, 10)
  return key >= from && key <= to
}

function render() {
  if (!section) {
    section = document.createElement('section')
    section.className = 'page progressi-page'
  }
  refresh()
  return section
}

function refresh() {
  if (!section) return
  if (!loaded && !loading) {
    load()
  } else {
    paint()
  }
}

async function load() {
  if (loading) return
  const sec = section
  if (!sec) return
  loading = true
  loadError = null
  paint()
  try {
    const [mData, sData, uData] = await Promise.all([
      apiFetch('/body-measurements'),
      apiFetch('/workout-sessions'),
      apiFetch('/user/me'),
    ])
    measurements = mData.measurements || []
    sessions = sData.workoutSessions || []
    user = uData.user || {}
    const range = periodRange()
    const sumData = await apiFetch(`/meals/summary?from=${range.from}&to=${range.to}`)
    calorieDays = sumData.days || []
    loaded = true
  } catch (err) {
    loadError = err.message
  }
  loading = false
  if (section === sec) paint()
}

function paint() {
  if (!section) return
  section.innerHTML = ''

  const header = document.createElement('div')
  header.className = 'page-header'
  const hTitle = document.createElement('h1')
  hTitle.className = 'page-title'
  hTitle.textContent = 'Progressi'
  header.appendChild(hTitle)
  const hSub = document.createElement('p')
  hSub.className = 'page-subtitle'
  hSub.textContent = 'La tua evoluzione'
  header.appendChild(hSub)
  section.appendChild(header)

  section.appendChild(periodSelector({
    active: activePeriod,
    onChange: (p) => {
      activePeriod = p
      loaded = false
      refresh()
    },
  }))

  if (!loaded) {
    section.appendChild(loadingEl('Caricamento progressi...'))
    return
  }

  if (loadError) {
    const errCard = errorEl(loadError)
    errCard.retry.addEventListener('click', () => {
      loaded = false
      refresh()
    })
    section.appendChild(errCard.el)
  }

  const { from } = periodRange()
  const rangeStart = new Date(from + 'T00:00:00')

  const periodMeasures = measurements
    .filter((m) => m.weightKg != null && new Date(m.measuredAt) >= rangeStart)
    .slice()
    .reverse()
    .map((m) => ({ label: shortLabel(m.measuredAt), value: m.weightKg }))

  section.appendChild(buildWeightCard(periodMeasures, rangeStart))
  section.appendChild(buildCalorieCard())
  section.appendChild(buildStatsCard(rangeStart))
  section.appendChild(progressPhotoGrid({ photos, onAdd: openPhotoModal }))
  section.appendChild(buildMeasurementsCard())
}

function buildWeightCard(weights, rangeStart) {
  const card = document.createElement('div')
  card.className = 'card'
  const wTitle = document.createElement('h3')
  wTitle.className = 'card-title'
  wTitle.textContent = 'Andamento peso'
  card.appendChild(wTitle)

  if (weights.length === 0) {
    const available = measurements.some((m) => m.weightKg != null)
    const empty = document.createElement('button')
    empty.className = 'photo-empty'
    empty.appendChild(createIcon(Scale, 36, 1.5))
    const text = document.createElement('span')
    text.textContent = available
      ? 'Nessuna misurazione nel periodo'
      : 'Aggiungi la prima misurazione'
    empty.appendChild(text)
    empty.addEventListener('click', openMeasureModal)
    card.appendChild(empty)
    return card
  }

  const last = weights[weights.length - 1]
  const first = weights[0]
  const diff = Math.round((last.value - first.value) * 10) / 10
  const isLoss = diff < 0
  const goal = user.goal || getUser().goal
  const good = goal === 'lose' ? isLoss : !isLoss

  const currentRow = document.createElement('div')
  currentRow.className = 'weight-current-row'

  const currentWrap = document.createElement('div')
  const currentLabel = document.createElement('span')
  currentLabel.className = 'weight-current-label'
  currentLabel.textContent = 'Peso attuale'
  currentWrap.appendChild(currentLabel)
  const currentValue = document.createElement('span')
  currentValue.className = 'weight-current-value'
  currentValue.textContent = `${last.value} kg`
  currentWrap.appendChild(currentValue)
  currentRow.appendChild(currentWrap)

  const deltaWrap = document.createElement('div')
  deltaWrap.className = 'weight-delta' + (good ? ' good' : ' bad')
  const deltaRow = document.createElement('div')
  deltaRow.className = 'weight-delta-row'
  deltaRow.appendChild(createIcon(isLoss ? TrendingDown : TrendingUp, 16, 2))
  const deltaText = document.createElement('span')
  deltaText.textContent = `${diff > 0 ? '+' : ''}${diff} kg`
  deltaRow.appendChild(deltaText)
  deltaWrap.appendChild(deltaRow)
  const deltaNote = document.createElement('span')
  deltaNote.className = 'weight-delta-note'
  deltaNote.textContent = 'dall\'inizio del periodo'
  deltaWrap.appendChild(deltaNote)
  currentRow.appendChild(deltaWrap)

  card.appendChild(currentRow)
  card.appendChild(weightChart({ data: weights }))
  return card
}

function buildCalorieCard() {
  const card = document.createElement('div')
  card.className = 'card'
  const cTitle = document.createElement('h3')
  cTitle.className = 'card-title'
  cTitle.textContent = 'Calorie giornaliere'
  card.appendChild(cTitle)

  const data = calorieDays.map((d) => ({ label: dayNum(d.date), value: d.calories }))
  const target = getNutritionTargets().calories

  const hasValues = calorieDays.some((d) => d.calories > 0)
  if (!hasValues) {
    const empty = document.createElement('p')
    empty.className = 'page-subtitle'
    empty.textContent = 'Nessun pasto registrato nel periodo. Aggiungi pasti dalla pagina Dieta.'
    card.appendChild(empty)
    return card
  }

  const avg = Math.round(data.reduce((acc, c) => acc + c.value, 0) / data.length)
  const avgSpan = document.createElement('p')
  avgSpan.className = 'cal-media'
  avgSpan.textContent = `Media: ${avg} kcal`
  card.appendChild(avgSpan)

  card.appendChild(calorieChart({ data, target }))
  return card
}

function buildStatsCard(rangeStart) {
  const periodSessions = sessions.filter((s) => new Date(s.startedAt) >= rangeStart)
  const sessionsCount = periodSessions.length
  const hours = Math.round((periodSessions.reduce((a, s) => a + (s.durationMinutes || 0), 0) / 60) * 10) / 10

  const dateSet = new Set()
  periodSessions.forEach((s) => dateSet.add(new Date(s.startedAt).toISOString().slice(0, 10)))

  let streak = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (d >= rangeStart && dateSet.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  return workoutStatsGrid({ streak, sessions: sessionsCount, hours })
}

function buildMeasurementsCard() {
  const mapped = measurements.map((m) => ({
    id: m.id,
    date: shortLabel(m.measuredAt),
    vita: m.waistCm,
    fianchi: m.hipsCm,
    petto: m.chestCm,
    braccia: m.armsCm,
  }))
  return measurementsList({ measurements: mapped, onAdd: openMeasureModal })
}

function openPhotoModal() {
  addProgressPhotoModal({
    onSave: (photo) => {
      photos.unshift({ id: 'p' + Date.now(), ...photo })
      paint()
    },
  })
}

function openMeasureModal() {
  addMeasurementModal({
    current: measurements[0],
    onSave: async (m) => {
      try {
        await apiFetch('/body-measurements', {
          method: 'POST',
          body: JSON.stringify({
            weightKg: Number(m.peso),
            waistCm: m.vita ? Number(m.vita) : null,
            hipsCm: m.fianchi ? Number(m.fianchi) : null,
            chestCm: m.petto ? Number(m.petto) : null,
            armsCm: m.braccia ? Number(m.braccia) : null,
          }),
        })
        loaded = false
        refresh()
      } catch (err) {
        alert(err.message || 'Errore nel salvataggio della misurazione')
      }
    },
  })
}

export { render }
export default render