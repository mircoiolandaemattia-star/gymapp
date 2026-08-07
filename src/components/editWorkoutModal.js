import { createIcon } from '/src/utils/icons.js'
import { X, Plus, Trash2, ArrowUp, ArrowDown, Save, Loader } from 'lucide'
import { updateWorkoutPlan, deleteWorkoutPlan } from '/src/utils/workoutApi.js'
import { apiDayToName } from '/src/utils/workoutApi.js'

function editWorkoutModal({ plan, day, onSaved } = {}) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Modifica allenamento'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', closeModal)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const nameGroup = document.createElement('div')
  nameGroup.className = 'input-group'
  nameGroup.innerHTML = '<label for="edit-w-name">Nome allenamento</label>'
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.id = 'edit-w-name'
  nameInput.className = 'input'
  nameInput.value = day.name || plan.name || 'Allenamento'
  nameGroup.appendChild(nameInput)
  body.appendChild(nameGroup)

  const dayHint = document.createElement('p')
  dayHint.className = 'edit-w-day-hint'
  dayHint.textContent = apiDayToName(day.dayOfWeek) || ''
  body.appendChild(dayHint)

  const exSection = document.createElement('div')
  exSection.className = 'input-group'
  const exTitle = document.createElement('label')
  exTitle.textContent = 'Esercizi'
  exSection.appendChild(exTitle)

  const exList = document.createElement('div')
  exList.className = 'modal-ex-list'

  const exercises = (day.exercises || []).map((ex) => ({
    id: ex.id || Date.now() + Math.random(),
    name: ex.name || '',
    sets: ex.sets ?? 3,
    reps: ex.reps ?? 10,
    weight: ex.weightKg ?? 0,
  }))

  function addExercise(name) {
    exercises.push({ id: Date.now() + Math.random(), name: name || '', sets: 3, reps: 10, weight: 20 })
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
  footer.style.cssText = 'display:flex;flex-direction:column;gap:var(--space-sm)'

  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const saveLabel = document.createElement('span')
  saveLabel.textContent = 'Salva modifiche'
  saveBtn.appendChild(saveLabel)
  saveBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim() || 'Allenamento'
    const days = (plan.workoutDays || []).map((d) => {
      if (d.id === day.id) {
        return {
          dayOfWeek: d.dayOfWeek,
          name,
          muscleGroups: d.muscleGroups || '',
          isRestDay: d.isRestDay || false,
          exercises: exercises
            .filter((e) => e.name.trim())
            .map((e, i) => ({
              name: e.name.trim(),
              sets: Number(e.sets) || 0,
              reps: Number(e.reps) || 0,
              weightKg: Number(e.weight) || 0,
              order: i + 1,
            })),
        }
      }
      return {
        dayOfWeek: d.dayOfWeek,
        name: d.name,
        muscleGroups: d.muscleGroups || '',
        isRestDay: d.isRestDay || false,
        exercises: (d.exercises || []).map((ex, i) => ({
          name: ex.name,
          sets: ex.sets ?? 0,
          reps: ex.reps ?? 0,
          weightKg: ex.weightKg ?? 0,
          order: i + 1,
        })),
      }
    })

    saveBtn.disabled = true
    saveBtn.classList.add('btn-loading')
    saveBtn.appendChild(createIcon(Loader, 16, 2))

    try {
      await updateWorkoutPlan(plan.id, { name, days })
      closeModal()
      if (onSaved) onSaved()
    } catch (err) {
      alert(err.message || 'Errore nel salvataggio delle modifiche')
      saveBtn.disabled = false
      saveBtn.classList.remove('btn-loading')
      saveBtn.querySelector('svg')?.remove()
    }
  })
  footer.appendChild(saveBtn)

  const deleteBtn = document.createElement('button')
  deleteBtn.className = 'btn btn-error btn-full'
  deleteBtn.appendChild(createIcon(Trash2, 16, 2))
  const delLabel = document.createElement('span')
  delLabel.textContent = 'Elimina allenamento'
  deleteBtn.appendChild(delLabel)
  deleteBtn.addEventListener('click', () => {
    confirmDeletePlan()
  })
  footer.appendChild(deleteBtn)

  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  renderExercises()

  function confirmDeletePlan() {
    const overlay2 = document.createElement('div')
    overlay2.className = 'modal-overlay'
    overlay2.addEventListener('click', (e) => { if (e.target === overlay2) close2() })

    const modal2 = document.createElement('div')
    modal2.className = 'modal'
    modal2.style.cssText = 'max-width:380px;align-self:center;border-radius:var(--radius-xl)'

    const header2 = document.createElement('div')
    header2.className = 'modal-header'
    const hTitle2 = document.createElement('h2')
    hTitle2.className = 'modal-title'
    hTitle2.textContent = 'Elimina allenamento'
    header2.appendChild(hTitle2)
    const closeBtn2 = document.createElement('button')
    closeBtn2.className = 'modal-close'
    closeBtn2.appendChild(createIcon(X, 20, 2))
    closeBtn2.addEventListener('click', close2)
    header2.appendChild(closeBtn2)
    modal2.appendChild(header2)

    const body2 = document.createElement('div')
    body2.className = 'modal-body'
    body2.style.cssText = 'display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--space-sm)'
    const iconBox = document.createElement('div')
    iconBox.className = 'plan-icon'
    iconBox.style.cssText = 'color:var(--error);background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.3)'
    iconBox.appendChild(createIcon(Trash2, 24, 2))
    body2.appendChild(iconBox)
    const text = document.createElement('p')
    text.style.cssText = 'font-size:0.875rem;color:var(--text-secondary)'
    text.textContent = `Eliminare definitivamente l'allenamento "${plan.name || nameInput.value || 'Allenamento'}"? Tutti i giorni ed esercizi verranno rimossi.`
    body2.appendChild(text)
    modal2.appendChild(body2)

    const footer2 = document.createElement('div')
    footer2.className = 'modal-footer'
    footer2.style.cssText = 'display:flex;gap:var(--space-sm)'
    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'btn btn-outline'
    cancelBtn.style.cssText = 'flex:1'
    cancelBtn.textContent = 'Annulla'
    cancelBtn.addEventListener('click', close2)
    footer2.appendChild(cancelBtn)
    const confirmBtn = document.createElement('button')
    confirmBtn.className = 'btn btn-error'
    confirmBtn.style.cssText = 'flex:1'
    confirmBtn.textContent = 'Elimina'
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true
      try {
        await deleteWorkoutPlan(plan.id)
        close2()
        closeModal()
        if (onSaved) onSaved()
      } catch (err) {
        alert(err.message || 'Errore nell\'eliminazione')
        confirmBtn.disabled = false
      }
    })
    footer2.appendChild(confirmBtn)
    modal2.appendChild(footer2)

    overlay2.appendChild(modal2)
    document.body.appendChild(overlay2)

    function close2() {
      document.body.removeChild(overlay2)
    }
  }

  function closeModal() {
    document.body.removeChild(overlay)
  }
}

export { editWorkoutModal }