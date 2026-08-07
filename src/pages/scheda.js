import { createIcon } from '/src/utils/icons.js'
import { Plus, Dumbbell, Trash2, X } from 'lucide'
import { navigate } from '/src/utils/router.js'
import { fetchWorkoutPlans, fetchWorkoutSessions, deleteWorkoutPlan, toDayCard, toHistoryItem } from '/src/utils/workoutApi.js'
import { workoutDayCard } from '/src/components/workoutDayCard.js'
import { workoutHistoryList } from '/src/components/workoutHistoryList.js'
import { createWorkoutModal } from '/src/components/createWorkoutModal.js'
import { uploadWorkoutModal } from '/src/components/uploadWorkoutModal.js'
import { generateWorkoutModal } from '/src/components/generateWorkoutModal.js'
import { editWorkoutModal } from '/src/components/editWorkoutModal.js'
import { loadingEl, errorEl } from '/src/utils/ui.js'

function render() {
  const section = document.createElement('section')
  section.className = 'page scheda-page'

  section.appendChild(buildHeader())

  const loader = loadingEl('Caricamento allenamenti...')
  section.appendChild(loader)

  load(section, loader)

  return section
}

function buildHeader() {
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

  return header
}

async function load(section, loader) {
  try {
    const [plansData, sessionsData] = await Promise.all([fetchWorkoutPlans(), fetchWorkoutSessions()])
    renderContent(section, plansData, sessionsData)
  } catch (err) {
    section.removeChild(loader)
    const errCard = errorEl(err.message)
    errCard.retry.addEventListener('click', () => { window.location.reload() })
    section.appendChild(errCard.el)
  }
}

function renderContent(section, plans, sessions) {
  section.querySelector('.page-loading')?.remove()

  const schedulesTitle = document.createElement('h2')
  schedulesTitle.className = 'section-title'
  schedulesTitle.textContent = 'I miei allenamenti'
  section.appendChild(schedulesTitle)

  const list = document.createElement('div')
  list.className = 'workout-schedule-list'

  const allDays = plans.flatMap((plan) => plan.workoutDays.map((day) => ({ plan, day })))

  if (!allDays.length) {
    const empty = document.createElement('div')
    empty.className = 'card scheda-empty'
    empty.textContent = 'Nessun allenamento ancora. Crea il tuo primo allenamento!'
    list.appendChild(empty)
  } else {
    allDays.forEach(({ plan, day }) => {
      const card = toDayCard(day, plan.name)
      list.appendChild(
        workoutDayCard(card, {
          onEdit: () => openEditWorkout(plan, day),
          onDelete: () => confirmDeletePlan(plan),
        })
      )
    })
  }
  section.appendChild(list)

  const history = sessions.map(toHistoryItem)
  if (history.length) {
    const historySection = workoutHistoryList(history)
    historySection.className = 'history-section'
    section.appendChild(historySection)
  }
}

function openEditWorkout(plan, day) {
  editWorkoutModal({ plan, day, onSaved: reload })
}

function confirmDeletePlan(plan) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal'
  modal.style.cssText = 'max-width:380px;align-self:center;border-radius:var(--radius-xl)'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Elimina allenamento'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'
  body.style.cssText = 'display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--space-sm)'
  const iconBox = document.createElement('div')
  iconBox.className = 'plan-icon'
  iconBox.style.cssText = 'color:var(--error);background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.3)'
  iconBox.appendChild(createIcon(Trash2, 24, 2))
  body.appendChild(iconBox)
  const text = document.createElement('p')
  text.style.cssText = 'font-size:0.875rem;color:var(--text-secondary)'
  text.textContent = `Eliminare definitivamente l'allenamento "${plan.name}"? Tutti i giorni ed esercizi verranno rimossi.`
  body.appendChild(text)
  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  footer.style.cssText = 'display:flex;gap:var(--space-sm)'
  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'btn btn-outline'
  cancelBtn.style.cssText = 'flex:1'
  cancelBtn.textContent = 'Annulla'
  cancelBtn.addEventListener('click', close)
  footer.appendChild(cancelBtn)
  const confirmBtn = document.createElement('button')
  confirmBtn.className = 'btn btn-error'
  confirmBtn.style.cssText = 'flex:1'
  confirmBtn.textContent = 'Elimina'
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true
    try {
      await deleteWorkoutPlan(plan.id)
      close()
      reload()
    } catch (err) {
      alert(err.message || 'Errore nell\'eliminazione')
      confirmBtn.disabled = false
    }
  })
  footer.appendChild(confirmBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
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
    { icon: Plus, label: 'Crea manualmente', desc: 'Crea la tua scheda da zero', action: () => { close(); createWorkoutModal({ onSaved: reload }) } },
    { icon: Dumbbell, label: 'Carica scheda esistente', desc: 'Importa da file immagine o PDF', action: () => { close(); uploadWorkoutModal({ onSaved: reload }) } },
    { icon: Plus, label: 'Genera con AI', desc: 'Lascia che l\'AI crei la scheda per te', action: () => { close(); generateWorkoutModal({ onSaved: reload }) } },
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

function reload() {
  navigate('/scheda')
}

export { render }
export default render
