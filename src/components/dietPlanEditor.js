import { createIcon } from '/src/utils/icons.js'
import { X, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide'
import { apiFetch } from '/src/utils/api.js'

const WEEK_DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

function dietPlanEditor({ plan, onSaved } = {}) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Modifica piano'
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

  function render() {
    dayWrap.innerHTML = ''

    days.forEach((day) => {
      const block = document.createElement('div')
      block.className = 'diet-plan-day'

      const head = document.createElement('button')
      head.className = 'diet-plan-day-head'
      head.type = 'button'
      head.appendChild(createIcon(day.open ? ChevronUp : ChevronDown, 14, 2))
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
        render()
      })
      block.appendChild(head)

      if (day.open) {
        const container = document.createElement('div')
        container.className = 'diet-plan-day-body'
        container.style.display = 'block'

        day.meals.forEach((meal, mi) => {
          container.appendChild(buildMealEditor(day, mi))
          if (mi < day.meals.length - 1) {
            const sep = document.createElement('div')
            sep.style.cssText = 'height:1px;background:var(--border);margin:10px 0'
            container.appendChild(sep)
          }
        })

        const addMealBtn = document.createElement('button')
        addMealBtn.className = 'btn btn-outline btn-full'
        addMealBtn.style.marginTop = 'var(--space-sm)'
        addMealBtn.appendChild(createIcon(Plus, 16, 2))
        const amLabel = document.createElement('span')
        amLabel.textContent = 'Aggiungi pasto'
        addMealBtn.appendChild(amLabel)
        addMealBtn.addEventListener('click', () => {
          day.meals.push({ name: '', calories: 0, items: [] })
          render()
        })
        container.appendChild(addMealBtn)

        block.appendChild(container)
      }

      dayWrap.appendChild(block)
    })
  }

  function buildMealEditor(day, mi) {
    const meal = day.meals[mi]

    const box = document.createElement('div')
    box.style.cssText =
      'background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;margin-top:10px'

    const nameGroup = document.createElement('div')
    nameGroup.className = 'input-group'
    nameGroup.innerHTML = '<label>Nome pasto</label>'
    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.className = 'input'
    nameInput.value = meal.name
    nameInput.placeholder = 'es. Colazione'
    nameInput.addEventListener('input', () => { meal.name = nameInput.value })
    nameGroup.appendChild(nameInput)
    box.appendChild(nameGroup)

    const kcalGroup = document.createElement('div')
    kcalGroup.className = 'input-group'
    kcalGroup.innerHTML = '<label>Calorie (kcal)</label>'
    const kcalInput = document.createElement('input')
    kcalInput.type = 'number'
    kcalInput.className = 'input'
    kcalInput.value = String(meal.calories)
    kcalInput.addEventListener('input', () => { meal.calories = Number(kcalInput.value) || 0; refreshMeta(day) })
    kcalGroup.appendChild(kcalInput)
    box.appendChild(kcalGroup)

    const itemsLabel = document.createElement('p')
    itemsLabel.textContent = 'Alimenti'
    itemsLabel.className = 'diet-plan-day-name'
    itemsLabel.style.marginTop = 'var(--space-sm)'
    box.appendChild(itemsLabel)

    meal.items.forEach((item, ii) => {
      const row = document.createElement('div')
      row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:6px'

      const nameIt = document.createElement('input')
      nameIt.type = 'text'
      nameIt.className = 'input'
      nameIt.style.flex = '1'
      nameIt.placeholder = 'Alimento'
      nameIt.value = item.name
      nameIt.addEventListener('input', () => { item.name = nameIt.value })

      const qtyIt = document.createElement('input')
      qtyIt.type = 'number'
      qtyIt.className = 'input'
      qtyIt.style.width = '72px'
      qtyIt.placeholder = 'g'
      qtyIt.value = item.quantityG ? String(item.quantityG) : ''
      qtyIt.addEventListener('input', () => { item.quantityG = Number(qtyIt.value) || 0 })

      const delBtn = document.createElement('button')
      delBtn.type = 'button'
      delBtn.className = 'btn btn-outline'
      delBtn.style.padding = '8px'
      delBtn.appendChild(createIcon(Trash2, 16, 2))
      delBtn.addEventListener('click', () => {
        meal.items.splice(ii, 1)
        render()
      })

      row.appendChild(nameIt)
      row.appendChild(qtyIt)
      row.appendChild(delBtn)
      box.appendChild(row)
    })

    const addItemBtn = document.createElement('button')
    addItemBtn.type = 'button'
    addItemBtn.className = 'btn btn-outline btn-full'
    addItemBtn.style.marginTop = 'var(--space-sm)'
    addItemBtn.appendChild(createIcon(Plus, 16, 2))
    const aiLabel = document.createElement('span')
    aiLabel.textContent = 'Aggiungi alimento'
    addItemBtn.appendChild(aiLabel)
    addItemBtn.addEventListener('click', () => {
      meal.items.push({ name: '', quantityG: 0 })
      render()
    })
    box.appendChild(addItemBtn)

    const removeMealBtn = document.createElement('button')
    removeMealBtn.type = 'button'
    removeMealBtn.className = 'btn btn-outline btn-full'
    removeMealBtn.style.marginTop = 'var(--space-sm)'
    removeMealBtn.style.color = 'var(--error)'
    removeMealBtn.appendChild(createIcon(Trash2, 16, 2))
    const rmLabel = document.createElement('span')
    rmLabel.textContent = 'Elimina pasto'
    removeMealBtn.appendChild(rmLabel)
    removeMealBtn.addEventListener('click', () => {
      day.meals.splice(mi, 1)
      render()
    })
    box.appendChild(removeMealBtn)

    return box
  }

  function refreshMeta(day) {
    const blocks = dayWrap.querySelectorAll('.diet-plan-day')
    const idx = day.index
    const target = blocks[idx]
    if (target) {
      const meta = target.querySelector('.diet-plan-day-meta')
      if (meta) {
        const totalKcal = day.meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0)
        meta.textContent = `${day.meals.length} pasti · ${totalKcal} kcal`
      }
    }
  }

  render()

  body.appendChild(dayWrap)
  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const saveLabel = document.createElement('span')
  saveLabel.textContent = 'Salva modifiche'
  saveBtn.appendChild(saveLabel)
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true
    saveBtn.classList.add('btn-loading')
    const payload = days
      .map((d) => ({
        day: d.index + 1,
        meals: d.meals
          .map((m) => ({
            name: m.name.trim() || 'Pasto',
            calories: Math.round(Number(m.calories) || 0),
            items: m.items
              .filter((it) => it.name.trim())
              .map((it) => ({ name: it.name.trim(), quantityG: Number(it.quantityG) || 0 })),
          }))
          .filter((m) => m.items.length || m.calories),
      }))
      .filter((d) => d.meals.length)
    try {
      await apiFetch('/diet-plans', {
        method: 'POST',
        body: JSON.stringify({
          name: plan?.name || 'Piano personale',
          source: plan?.source || 'ai',
          days: payload.length ? payload : days.map((d) => ({ day: d.index + 1, meals: [] })),
        }),
      })
      if (onSaved) onSaved()
      close()
    } catch (err) {
      alert(err.message || 'Errore nel salvataggio delle modifiche')
      saveBtn.disabled = false
      saveBtn.classList.remove('btn-loading')
      saveBtn.querySelector('svg:last-of-type')?.remove()
    }
  })
  footer.appendChild(saveBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    if (overlay.parentNode) document.body.removeChild(overlay)
  }
}

export { dietPlanEditor }