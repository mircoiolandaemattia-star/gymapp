import { createIcon } from '/src/utils/icons.js'
import { X, Pencil, ChevronDown, ChevronUp } from 'lucide'
import { dietPlanEditor } from '/src/components/dietPlanEditor.js'

const WEEK_DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

function dietPlanViewer({ plan, onSaved } = {}) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Piano settimanale'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const days = []
  for (let i = 0; i < 7; i++) days.push({ index: i, meals: [], open: i === 0 })
  ;(plan && plan.planMeals ? plan.planMeals : []).forEach((m) => {
    const day = days[m.dayIndex] || days[0]
    if (m) {
      day.meals.push({
        name: m.type || 'Pasto',
        calories: Number(m.calories) || 0,
        items: (m.items || []).map((it) => ({
          name: it.name || '',
          quantityG: Number(it.quantityG) || 0,
        })),
      })
    }
  })

  const dayWrap = document.createElement('div')
  dayWrap.className = 'diet-plan-list'
  body.appendChild(dayWrap)

  days.forEach((day) => {
    const block = document.createElement('div')
    block.className = 'diet-plan-day'

    const head = document.createElement('button')
    head.className = 'diet-plan-day-head'
    head.type = 'button'
    const headIcon = createIcon(day.open ? ChevronUp : ChevronDown, 14, 2)
    head.appendChild(headIcon)
    const dayName = document.createElement('span')
    dayName.className = 'diet-plan-day-name'
    dayName.textContent = WEEK_DAYS[day.index]
    head.appendChild(dayName)
    const totalKcal = day.meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0)
    const dayMeta = document.createElement('span')
    dayMeta.className = 'diet-plan-day-meta'
    dayMeta.textContent = `${day.meals.length} pasti · ${totalKcal} kcal`
    head.appendChild(dayMeta)
    head.addEventListener('click', () => {
      day.open = !day.open
      const old = block.querySelector('.diet-plan-day-body')
      if (old) block.removeChild(old)
      head.replaceChild(createIcon(day.open ? ChevronUp : ChevronDown, 14, 2), block.querySelector('.diet-plan-day-head svg'))
      const total = day.meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0)
      dayMeta.textContent = `${day.meals.length} pasti · ${total} kcal`
      block.appendChild(buildBody(day))
    })
    block.appendChild(head)

    block.appendChild(buildBody(day))

    dayWrap.appendChild(block)
  })

  function buildBody(day) {
    const container = document.createElement('div')
    container.className = 'diet-plan-day-body'
    container.style.display = day.open ? 'block' : 'none'

    if (!day.meals.length) {
      const none = document.createElement('p')
      none.className = 'diet-plan-viewer-none'
      none.textContent = 'Nessun pasto pianificato.'
      container.appendChild(none)
      return container
    }

    day.meals.forEach((m, mi) => {
      container.appendChild(buildMealRow(m))
      if (mi < day.meals.length - 1) {
        const sep = document.createElement('div')
        sep.style.cssText = 'height:1px;background:var(--border);margin:10px 0'
        container.appendChild(sep)
      }
    })

    return container
  }

  function buildMealRow(m) {
    const box = document.createElement('div')
    box.className = 'diet-plan-viewer-meal'

    const top = document.createElement('div')
    top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:var(--space-sm)'
    const name = document.createElement('strong')
    name.textContent = m.name
    top.appendChild(name)
    const kcal = document.createElement('span')
    kcal.className = 'diet-plan-viewer-kcal'
    kcal.textContent = `${m.calories} kcal`
    top.appendChild(kcal)
    box.appendChild(top)

    if (m.items.length) {
      const list = document.createElement('ul')
      list.className = 'diet-plan-viewer-items'
      m.items.forEach((it) => {
        const li = document.createElement('li')
        li.textContent = `${it.name}${it.quantityG ? ` (${it.quantityG}g)` : ''}`
        list.appendChild(li)
      })
      box.appendChild(list)
    }

    return box
  }

  body.appendChild(dayWrap)
  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const editBtn = document.createElement('button')
  editBtn.className = 'btn btn-primary btn-full'
  editBtn.appendChild(createIcon(Pencil, 16, 2))
  const editLabel = document.createElement('span')
  editLabel.textContent = 'Modifica'
  editBtn.appendChild(editLabel)
  editBtn.addEventListener('click', () => {
    close()
    dietPlanEditor({ plan, onSaved })
  })
  footer.appendChild(editBtn)
  const closeFooterBtn = document.createElement('button')
  closeFooterBtn.className = 'btn btn-outline btn-full'
  const cLabel = document.createElement('span')
  cLabel.textContent = 'Chiudi'
  closeFooterBtn.appendChild(cLabel)
  closeFooterBtn.addEventListener('click', close)
  footer.appendChild(closeFooterBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    if (overlay.parentNode) document.body.removeChild(overlay)
  }
}

export { dietPlanViewer }