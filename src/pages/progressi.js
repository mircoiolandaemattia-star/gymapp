import { createIcon } from '/src/utils/icons.js'
import { TrendingDown, TrendingUp } from 'lucide'
import { progressData } from '/src/mock/progressData.js'
import { periodSelector } from '/src/components/periodSelector.js'
import { weightChart } from '/src/components/weightChart.js'
import { calorieChart } from '/src/components/calorieChart.js'
import { workoutStatsGrid } from '/src/components/workoutStatsGrid.js'
import { progressPhotoGrid } from '/src/components/progressPhotoGrid.js'
import { measurementsList } from '/src/components/measurementsList.js'
import { addProgressPhotoModal } from '/src/components/addProgressPhotoModal.js'
import { addMeasurementModal } from '/src/components/addMeasurementModal.js'

let activePeriod = 'week'
let photos = progressData.photos.map((p) => ({ ...p }))
let measurements = progressData.measurements.map((m) => ({ ...m }))
let currentSection = null

function render() {
  const section = buildSection()
  if (currentSection && currentSection.isConnected) {
    currentSection.replaceWith(section)
  }
  currentSection = section
  return section
}

function buildSection() {
  const section = document.createElement('section')
  section.className = 'page progressi-page'

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
    onChange: (p) => { activePeriod = p; render() },
  }))

  const data = progressData.periods[activePeriod]
  const weights = data.weight
  const calories = data.calories

  const weightCard = document.createElement('div')
  weightCard.className = 'card'
  const wTitle = document.createElement('h3')
  wTitle.className = 'card-title'
  wTitle.textContent = 'Andamento peso'
  weightCard.appendChild(wTitle)

  const last = weights[weights.length - 1]
  const first = weights[0]
  const diff = Math.round((last.value - first.value) * 10) / 10
  const isLoss = diff < 0
  const good = progressData.goal === 'dimagrire' ? isLoss : !isLoss

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

  weightCard.appendChild(currentRow)
  weightCard.appendChild(weightChart({ data: weights }))
  section.appendChild(weightCard)

  const calCard = document.createElement('div')
  calCard.className = 'card'
  const cTitle = document.createElement('h3')
  cTitle.className = 'card-title'
  cTitle.textContent = 'Calorie giornaliere'
  calCard.appendChild(cTitle)

  const avg = Math.round(calories.reduce((acc, c) => acc + c.value, 0) / calories.length)
  const avgSpan = document.createElement('p')
  avgSpan.className = 'cal-media'
  avgSpan.textContent = `Media: ${avg} kcal`
  calCard.appendChild(avgSpan)

  calCard.appendChild(calorieChart({ data: calories, target: progressData.calorieTarget }))
  section.appendChild(calCard)

  section.appendChild(workoutStatsGrid(data.stats))

  section.appendChild(progressPhotoGrid({ photos, onAdd: openPhotoModal }))

  section.appendChild(measurementsList({ measurements, onAdd: openMeasureModal }))

  return section
}

function openPhotoModal() {
  addProgressPhotoModal({
    onSave: (photo) => {
      photos.unshift({ id: 'p' + Date.now(), ...photo })
      render()
    },
  })
}

function openMeasureModal() {
  addMeasurementModal({
    current: measurements[0],
    onSave: (m) => {
      measurements.unshift({ id: 'm' + Date.now(), ...m })
      render()
    },
  })
}

export { render }
export default render
