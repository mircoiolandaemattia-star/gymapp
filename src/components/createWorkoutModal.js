import { createIcon } from '/src/utils/icons.js'
import { X, Plus, Trash2, ArrowUp, ArrowDown, Save, Loader } from 'lucide'
import { predefinedExercises } from '/src/mock/workoutData.js'
import { saveWorkoutPlan } from '/src/utils/workoutApi.js'

const DAY_NUM = {
  Lunedì: 1, Martedì: 2, Mercoledì: 3, Giovedì: 4, Venerdì: 5, Sabato: 6, Domenica: 7,
}

function createWorkoutModal({ onSaved } = {}) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Crea scheda manualmente'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', closeModal)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const dayGroup = document.createElement('div')
  dayGroup.className = 'input-group'
  dayGroup.innerHTML = '<label>Giorno della settimana</label>'
  const daySelect = document.createElement('select')
  daySelect.className = 'input input-select'
  ;['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].forEach((d) => {
    const opt = document.createElement('option')
    opt.value = d
    opt.textContent = d
    daySelect.appendChild(opt)
  })
  dayGroup.appendChild(daySelect)
  body.appendChild(dayGroup)

  const typeGroup = document.createElement('div')
  typeGroup.className = 'input-group'
  typeGroup.innerHTML = '<label>Tipo</label>'
  const typeSelect = document.createElement('select')
  typeSelect.className = 'input input-select'
  ;['Forza', 'Cardio', 'Full Body'].forEach((t) => {
    const opt = document.createElement('option')
    opt.value = t
    opt.textContent = t
    typeSelect.appendChild(opt)
  })
  typeGroup.appendChild(typeSelect)
  body.appendChild(typeGroup)

  const nameGroup = document.createElement('div')
  nameGroup.className = 'input-group'
  nameGroup.innerHTML = '<label for="wname">Nome allenamento</label>'
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.id = 'wname'
  nameInput.className = 'input'
  nameInput.placeholder = 'es. Push Day'
  nameGroup.appendChild(nameInput)
  body.appendChild(nameGroup)

  const exSection = document.createElement('div')
  exSection.className = 'input-group'
  const exTitle = document.createElement('label')
  exTitle.textContent = 'Esercizi'
  exSection.appendChild(exTitle)

  const exList = document.createElement('div')
  exList.className = 'modal-ex-list'

  const exercises = []

  function addExercise(name) {
    const ex = { id: Date.now() + Math.random(), name: name || '', sets: 3, reps: 10, weight: 20 }
    exercises.push(ex)
    renderExercises()
  }

  function removeExercise(id) {
    const idx = exercises.findIndex((e) => e.id === id)
    if (idx !== -1) exercises.splice(idx, 1)
    renderExercises()
  }

  function moveExercise(id, dir) {
    const idx = exercises.findIndex((e) => e.id === id)
    if (idx === -1) return
    const target = idx + dir
    if (target < 0 || target >= exercises.length) return
    ;[exercises[idx], exercises[target]] = [exercises[target], exercises[idx]]
    renderExercises()
  }

  function renderExercises() {
    exList.innerHTML = ''
    exercises.forEach((ex, i) => {
      const row = document.createElement('div')
      row.className = 'modal-ex-row'

      const num = document.createElement('span')
      num.className = 'modal-ex-row-num'
      num.textContent = String(i + 1)
      row.appendChild(num)

      const fields = document.createElement('div')
      fields.className = 'modal-ex-fields'

      const nameField = document.createElement('input')
      nameField.type = 'text'
      nameField.className = 'input input-sm'
      nameField.placeholder = 'Nome esercizio'
      nameField.value = ex.name
      nameField.addEventListener('input', () => { ex.name = nameField.value })
      fields.appendChild(nameField)

      const numRow = document.createElement('div')
      numRow.className = 'modal-ex-num-row'

      const setsInp = document.createElement('input')
      setsInp.type = 'number'
      setsInp.className = 'input input-sm input-num'
      setsInp.value = String(ex.sets)
      setsInp.setAttribute('aria-label', 'Serie')
      const setsLabel = document.createElement('span')
      setsLabel.className = 'input-suffix'
      setsLabel.textContent = 'x'
      setsInp.addEventListener('input', () => { ex.sets = Number(setsInp.value) || 0 })
      numRow.appendChild(setsInp)
      numRow.appendChild(setsLabel)

      const repsInp = document.createElement('input')
      repsInp.type = 'number'
      repsInp.className = 'input input-sm input-num'
      repsInp.value = String(ex.reps)
      repsInp.setAttribute('aria-label', 'Ripetizioni')
      repsInp.addEventListener('input', () => { ex.reps = Number(repsInp.value) || 0 })
      numRow.appendChild(repsInp)

      const pesoInp = document.createElement('input')
      pesoInp.type = 'number'
      pesoInp.className = 'input input-sm input-num'
      pesoInp.value = String(ex.weight)
      pesoInp.setAttribute('aria-label', 'Peso kg')
      const kgLabel = document.createElement('span')
      kgLabel.className = 'input-suffix'
      kgLabel.textContent = 'kg'
      pesoInp.addEventListener('input', () => { ex.weight = Number(pesoInp.value) || 0 })
      numRow.appendChild(pesoInp)
      numRow.appendChild(kgLabel)

      fields.appendChild(numRow)
      row.appendChild(fields)

      const actions = document.createElement('div')
      actions.className = 'modal-ex-actions'
      const upBtn = document.createElement('button')
      upBtn.className = 'btn-icon-sm'
      upBtn.appendChild(createIcon(ArrowUp, 14, 2))
      upBtn.addEventListener('click', () => moveExercise(ex.id, -1))
      if (i === 0) upBtn.style.opacity = '0.3'
      actions.appendChild(upBtn)
      const downBtn = document.createElement('button')
      downBtn.className = 'btn-icon-sm'
      downBtn.appendChild(createIcon(ArrowDown, 14, 2))
      downBtn.addEventListener('click', () => moveExercise(ex.id, 1))
      if (i === exercises.length - 1) downBtn.style.opacity = '0.3'
      actions.appendChild(downBtn)
      const delBtn = document.createElement('button')
      delBtn.className = 'btn-icon-sm btn-icon-danger'
      delBtn.appendChild(createIcon(Trash2, 14, 2))
      delBtn.addEventListener('click', () => removeExercise(ex.id))
      actions.appendChild(delBtn)
      row.appendChild(actions)

      exList.appendChild(row)
    })
  }

  exSection.appendChild(exList)

  const addBtn = document.createElement('button')
  addBtn.className = 'btn btn-outline btn-full'
  addBtn.style.marginTop = 'var(--space-sm)'
  addBtn.appendChild(createIcon(Plus, 14, 2))
  const addLabel = document.createElement('span')
  addLabel.textContent = 'Aggiungi esercizio'
  addBtn.appendChild(addLabel)
  addBtn.addEventListener('click', () => addExercise(''))
  exSection.appendChild(addBtn)

  body.appendChild(exSection)

  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const saveLabel = document.createElement('span')
  saveLabel.textContent = 'Salva scheda'
  saveBtn.appendChild(saveLabel)
  saveBtn.addEventListener('click', async () => {
    const day = daySelect.value
    const type = typeSelect.value.toUpperCase()
    const name = nameInput.value || 'Allenamento'

    saveBtn.disabled = true
    saveBtn.classList.add('btn-loading')
    saveBtn.appendChild(createIcon(Loader, 16, 2))

    try {
      await saveWorkoutPlan({
        name,
        source: 'manual',
        days: [
          {
            dayOfWeek: DAY_NUM[day] || 1,
            name: `${day} - ${name}`,
            muscleGroups: '',
            isRestDay: false,
            exercises: exercises
              .filter((e) => e.name.trim())
              .map((e, i) => ({
                name: e.name.trim(),
                sets: Number(e.sets) || 0,
                reps: Number(e.reps) || 0,
                weightKg: Number(e.weight) || 0,
                order: i + 1,
              })),
          },
        ],
      })
      closeModal()
      if (onSaved) onSaved()
    } catch (err) {
      alert(err.message || 'Errore nel salvataggio della scheda')
      saveBtn.disabled = false
      saveBtn.classList.remove('btn-loading')
      saveBtn.querySelector('svg')?.remove()
    }
  })
  footer.appendChild(saveBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  addExercise('')

  function closeModal() {
    document.body.removeChild(overlay)
  }
}

export { createWorkoutModal }
