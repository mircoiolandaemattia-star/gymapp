import { createIcon } from '/src/utils/icons.js'
import { X, CheckCircle, SkipForward, Play, Flag, Timer } from 'lucide'
import { workoutSchedules } from '/src/mock/workoutData.js'
import { navigate } from '/src/utils/router.js'

function render() {
  const path = window.location.pathname
  const dayId = path.split('/').pop()
  const day = workoutSchedules.find((d) => d.id === dayId)
  if (!day) {
    const section = document.createElement('section')
    section.className = 'page'
    const h2 = document.createElement('h2')
    h2.textContent = 'Allenamento non trovato'
    section.appendChild(h2)
    return section
  }

  const section = document.createElement('section')
  section.className = 'page active-workout-page'

  const header = document.createElement('div')
  header.className = 'active-header'

  const left = document.createElement('div')
  const hTitle = document.createElement('h1')
  hTitle.className = 'active-title'
  hTitle.textContent = day.name
  left.appendChild(hTitle)
  header.appendChild(left)

  const closeBtn = document.createElement('button')
  closeBtn.className = 'active-close-btn'
  closeBtn.appendChild(createIcon(X, 22, 2))
  closeBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler uscire? I progressi non salvati andranno persi.')) {
      navigate('/scheda')
    }
  })
  header.appendChild(closeBtn)

  section.appendChild(header)

  const totalExercises = day.exercises.length
  let currentExIndex = 0
  const seriesCompleted = day.exercises.map(() => [])
  const startTime = Date.now()
  let restTimerId = null

  function renderExercise() {
    const existing = section.querySelector('.active-exercise-area')
    if (existing) section.removeChild(existing)

    const area = document.createElement('div')
    area.className = 'active-exercise-area'

    const progress = document.createElement('div')
    progress.className = 'active-progress'
    const progText = document.createElement('span')
    progText.className = 'active-progress-text'
    progText.textContent = `Esercizio ${currentExIndex + 1} di ${totalExercises}`
    progress.appendChild(progText)
    const progBar = document.createElement('div')
    progBar.className = 'active-progress-bar'
    const progFill = document.createElement('div')
    progFill.className = 'active-progress-fill'
    progFill.style.width = `${((currentExIndex + 1) / totalExercises) * 100}%`
    progBar.appendChild(progFill)
    progress.appendChild(progBar)
    area.appendChild(progress)

    const ex = day.exercises[currentExIndex]

    const exCard = document.createElement('div')
    exCard.className = 'card'

    const exName = document.createElement('h2')
    exName.className = 'active-ex-name'
    exName.textContent = ex.name
    exCard.appendChild(exName)

    const seriesTitle = document.createElement('p')
    seriesTitle.className = 'active-series-title'
    seriesTitle.textContent = 'Serie'
    exCard.appendChild(seriesTitle)

    const completedCount = seriesCompleted[currentExIndex] ? seriesCompleted[currentExIndex].filter(Boolean).length : 0

    for (let i = 0; i < ex.sets; i++) {
      const row = document.createElement('div')
      row.className = 'active-set-row'
      const isCompleted = seriesCompleted[currentExIndex] && seriesCompleted[currentExIndex][i]

      const setNum = document.createElement('span')
      setNum.className = 'active-set-num'
      setNum.textContent = `Serie ${i + 1}`
      row.appendChild(setNum)

      const weightInput = document.createElement('input')
      weightInput.type = 'number'
      weightInput.className = 'input input-sm input-num'
      weightInput.value = String(ex.weight)
      weightInput.style.width = '70px'
      weightInput.disabled = isCompleted
      if (isCompleted) weightInput.style.opacity = '0.5'
      const kgLabel = document.createElement('span')
      kgLabel.className = 'input-suffix'
      kgLabel.textContent = 'kg'
      row.appendChild(weightInput)
      row.appendChild(kgLabel)

      const repsInput = document.createElement('input')
      repsInput.type = 'number'
      repsInput.className = 'input input-sm input-num'
      repsInput.value = String(ex.reps)
      repsInput.style.width = '60px'
      repsInput.disabled = isCompleted
      if (isCompleted) repsInput.style.opacity = '0.5'
      row.appendChild(repsInput)

      const doneBtn = document.createElement('button')
      doneBtn.className = 'active-done-btn' + (isCompleted ? ' done' : '')
      const doneIcon = isCompleted ? createIcon(CheckCircle, 20, 2) : createIcon(CheckCircle, 20, 2)
      doneBtn.appendChild(doneIcon)
      if (!isCompleted) {
        doneBtn.addEventListener('click', () => {
          if (!seriesCompleted[currentExIndex]) seriesCompleted[currentExIndex] = []
          seriesCompleted[currentExIndex][i] = true

          const allDone = seriesCompleted[currentExIndex].filter(Boolean).length === ex.sets
          if (allDone) {
            startRestTimer(area, exCard)
          }
          renderExercise()
        })
      }
      row.appendChild(doneBtn)

      exCard.appendChild(row)
    }

    area.appendChild(exCard)

    const allComplete = seriesCompleted[currentExIndex] && seriesCompleted[currentExIndex].filter(Boolean).length === ex.sets

    const navRow = document.createElement('div')
    navRow.className = 'active-nav-row'

    if (currentExIndex < totalExercises - 1) {
      const nextBtn = document.createElement('button')
      nextBtn.className = 'btn btn-primary btn-full'
      nextBtn.appendChild(createIcon(Play, 16, 2))
      const nLabel = document.createElement('span')
      nLabel.textContent = allComplete ? 'Esercizio successivo' : 'Salta esercizio'
      nextBtn.appendChild(nLabel)
      nextBtn.addEventListener('click', () => {
        if (restTimerId) { clearInterval(restTimerId); restTimerId = null }
        currentExIndex++
        renderExercise()
      })
      navRow.appendChild(nextBtn)
    } else {
      const endBtn = document.createElement('button')
      endBtn.className = 'btn btn-primary btn-full'
      endBtn.appendChild(createIcon(Flag, 16, 2))
      const eLabel = document.createElement('span')
      eLabel.textContent = 'Termina allenamento'
      endBtn.appendChild(eLabel)
      endBtn.addEventListener('click', () => {
        if (restTimerId) { clearInterval(restTimerId); restTimerId = null }
        const elapsed = Math.round((Date.now() - startTime) / 60000)
        const calories = Math.round(elapsed * 7)

        const session = {
          id: Date.now(),
          name: day.name,
          type: day.type,
          date: new Date().toISOString(),
          duration: elapsed,
          calories,
        }
        const stored = JSON.parse(localStorage.getItem('fittrack_history') || '[]')
        stored.unshift(session)
        localStorage.setItem('fittrack_history', JSON.stringify(stored.slice(0, 50)))

        const confirmMsg = document.createElement('div')
        confirmMsg.className = 'active-completed'
        const cIcon = createIcon(CheckCircle, 40, 1.5)
        cIcon.style.cssText = 'color:var(--accent);margin-bottom:var(--space-md)'
        confirmMsg.appendChild(cIcon)
        const cTitle = document.createElement('h2')
        cTitle.textContent = 'Allenamento completato!'
        confirmMsg.appendChild(cTitle)
        const cDetail = document.createElement('p')
        cDetail.textContent = `${elapsed} min · ${calories} kcal bruciate`
        confirmMsg.appendChild(cDetail)
        const cBtn = document.createElement('button')
        cBtn.className = 'btn btn-primary'
        cBtn.textContent = 'Torna alla scheda'
        cBtn.addEventListener('click', () => navigate('/scheda'))
        confirmMsg.appendChild(cBtn)

        section.querySelectorAll('.active-exercise-area, .active-header').forEach((el) => el.style.display = 'none')
        section.appendChild(confirmMsg)
      })
      navRow.appendChild(endBtn)
    }

    area.appendChild(navRow)
    section.appendChild(area)
  }

  function startRestTimer(area, exCard) {
    if (restTimerId) { clearInterval(restTimerId); restTimerId = null }

    const existingTimer = area.querySelector('.active-rest-timer')
    if (existingTimer) existingTimer.remove()

    const timerCard = document.createElement('div')
    timerCard.className = 'card active-rest-timer'

    const timerLabel = document.createElement('p')
    timerLabel.className = 'active-rest-label'
    timerLabel.textContent = 'Recupero'
    timerCard.appendChild(timerLabel)

    let remaining = 90
    const timerDisplay = document.createElement('div')
    timerDisplay.className = 'active-rest-display'
    timerDisplay.textContent = '1:30'
    timerCard.appendChild(timerDisplay)

    const skipBtn = document.createElement('button')
    skipBtn.className = 'btn btn-outline'
    skipBtn.appendChild(createIcon(SkipForward, 16, 2))
    const skipLabel = document.createElement('span')
    skipLabel.textContent = 'Salta riposo'
    skipBtn.appendChild(skipLabel)
    skipBtn.addEventListener('click', () => {
      if (restTimerId) { clearInterval(restTimerId); restTimerId = null }
      timerCard.remove()
    })
    timerCard.appendChild(skipBtn)

    exCard.after(timerCard)

    restTimerId = setInterval(() => {
      remaining--
      const mins = Math.floor(remaining / 60)
      const secs = remaining % 60
      timerDisplay.textContent = `${mins}:${String(secs).padStart(2, '0')}`
      if (remaining <= 0) {
        clearInterval(restTimerId)
        restTimerId = null
        timerCard.remove()
      }
    }, 1000)
  }

  renderExercise()

  return section
}

export { render }
export default render
