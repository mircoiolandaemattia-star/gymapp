import { createIcon } from '/src/utils/icons.js'
import { Plus, Dumbbell } from 'lucide'
import { workoutSchedules, workoutHistory } from '/src/mock/workoutData.js'
import { workoutDayCard } from '/src/components/workoutDayCard.js'
import { workoutHistoryList } from '/src/components/workoutHistoryList.js'
import { createWorkoutModal } from '/src/components/createWorkoutModal.js'
import { uploadWorkoutModal } from '/src/components/uploadWorkoutModal.js'
import { generateWorkoutModal } from '/src/components/generateWorkoutModal.js'

function render() {
  const section = document.createElement('section')
  section.className = 'page scheda-page'

  const header = document.createElement('div')
  header.className = 'scheda-header'

  const left = document.createElement('div')
  const hTitle = document.createElement('h1')
  hTitle.className = 'page-title'
  hTitle.textContent = 'Scheda'
  left.appendChild(hTitle)
  const hSub = document.createElement('p')
  hSub.className = 'page-subtitle'
  hSub.textContent = 'I tuoi allenamenti'
  left.appendChild(hSub)
  header.appendChild(left)

  const addBtn = document.createElement('button')
  addBtn.className = 'scheda-add-btn'
  addBtn.setAttribute('aria-label', 'Nuova scheda')
  addBtn.appendChild(createIcon(Plus, 22, 2))
  addBtn.addEventListener('click', showCreateOptions)
  header.appendChild(addBtn)

  section.appendChild(header)

  const schedulesTitle = document.createElement('h2')
  schedulesTitle.className = 'section-title'
  schedulesTitle.textContent = 'Le mie schede'
  section.appendChild(schedulesTitle)

  const list = document.createElement('div')
  list.className = 'workout-schedule-list'
  workoutSchedules.forEach((day) => {
    list.appendChild(workoutDayCard(day))
  })
  section.appendChild(list)

  const historySection = workoutHistoryList(workoutHistory)
  historySection.className = 'history-section'
  section.appendChild(historySection)

  return section
}

function showCreateOptions() {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const sheet = document.createElement('div')
  sheet.className = 'action-sheet'

  const handle = document.createElement('div')
  handle.className = 'action-sheet-handle'
  sheet.appendChild(handle)

  const sTitle = document.createElement('h3')
  sTitle.className = 'action-sheet-title'
  sTitle.textContent = 'Nuova scheda'
  sheet.appendChild(sTitle)

  const options = [
    { icon: Plus, label: 'Crea manualmente', desc: 'Crea la tua scheda da zero', action: () => { close(); createWorkoutModal() } },
    { icon: Dumbbell, label: 'Carica scheda esistente', desc: 'Importa da file immagine o PDF', action: () => { close(); uploadWorkoutModal() } },
    { icon: Plus, label: 'Genera con AI', desc: 'Lascia che l\'AI crei la scheda per te', action: () => { close(); generateWorkoutModal() } },
  ]

  options.forEach((opt) => {
    const item = document.createElement('button')
    item.className = 'action-sheet-item'
    const iconWrap = document.createElement('div')
    iconWrap.className = 'action-sheet-icon'
    iconWrap.appendChild(createIcon(opt.icon, 20, 2))
    item.appendChild(iconWrap)
    const info = document.createElement('div')
    info.className = 'action-sheet-info'
    const lbl = document.createElement('span')
    lbl.className = 'action-sheet-label'
    lbl.textContent = opt.label
    info.appendChild(lbl)
    const dsc = document.createElement('span')
    dsc.className = 'action-sheet-desc'
    dsc.textContent = opt.desc
    info.appendChild(dsc)
    item.appendChild(info)
    item.addEventListener('click', opt.action)
    sheet.appendChild(item)
  })

  overlay.appendChild(sheet)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

export { render }
export default render
