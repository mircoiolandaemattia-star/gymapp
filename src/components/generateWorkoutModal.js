import { createIcon } from '/src/utils/icons.js'
import { X, Wand2, Loader, CheckCircle, ChevronLeft, ChevronRight, Save } from 'lucide'
import { saveWorkoutPlan } from '/src/utils/workoutApi.js'

const DAY_NUM = {
  Lunedì: 1, Martedì: 2, Mercoledì: 3, Giovedì: 4, Venerdì: 5, Sabato: 6, Domenica: 7,
}

function generateWorkoutModal({ onSaved } = {}) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Genera con AI'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', closeModal)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  let step = 1
  const totalSteps = 4
  const answers = {}
  let generatedDays = []

  const stepsData = [
    {
      q: 'Qual è il tuo obiettivo?',
      options: ['Dimagrire', 'Mantenimento', 'Massa muscolare'],
      key: 'goal',
    },
    {
      q: 'Qual è il tuo livello?',
      options: ['Principiante', 'Intermedio', 'Avanzato'],
      key: 'level',
    },
    {
      q: 'Quanti giorni puoi allenarti a settimana?',
      options: ['2 giorni', '3 giorni', '4 giorni', '5 giorni', '6 giorni'],
      key: 'days',
    },
    {
      q: 'Che attrezzatura hai a disposizione?',
      options: ['Palestra completa', 'Manubri e panca', 'Corpo libero'],
      key: 'equipment',
    },
  ]

  const content = document.createElement('div')
  content.className = 'gen-content'

  const stepIndicator = document.createElement('div')
  stepIndicator.className = 'gen-steps'
  content.appendChild(stepIndicator)

  const stepContent = document.createElement('div')
  stepContent.className = 'gen-step-content'
  content.appendChild(stepContent)

  const navRow = document.createElement('div')
  navRow.className = 'gen-nav'
  content.appendChild(navRow)

  const resultArea = document.createElement('div')
  resultArea.className = 'gen-result'
  resultArea.style.display = 'none'
  content.appendChild(resultArea)

  function renderStep() {
    stepIndicator.innerHTML = ''
    for (let i = 1; i <= totalSteps; i++) {
      const dot = document.createElement('span')
      dot.className = 'gen-step-dot' + (i === step ? ' active' : '') + (i < step ? ' done' : '')
      dot.textContent = String(i)
      stepIndicator.appendChild(dot)
      if (i < totalSteps) {
        const line = document.createElement('span')
        line.className = 'gen-step-line' + (i < step ? ' done' : '')
        stepIndicator.appendChild(line)
      }
    }

    const s = stepsData[step - 1]
    stepContent.innerHTML = ''
    const q = document.createElement('h3')
    q.className = 'gen-question'
    q.textContent = s.q
    stepContent.appendChild(q)

    const opts = document.createElement('div')
    opts.className = 'gen-options'
    s.options.forEach((opt) => {
      const btn = document.createElement('button')
      btn.className = 'gen-option-btn' + (answers[s.key] === opt ? ' selected' : '')
      btn.textContent = opt
      btn.addEventListener('click', () => {
        answers[s.key] = opt
        stepContent.querySelectorAll('.gen-option-btn').forEach((b) => b.classList.remove('selected'))
        btn.classList.add('selected')
      })
      opts.appendChild(btn)
    })
    stepContent.appendChild(opts)

    navRow.innerHTML = ''
    if (step > 1) {
      const prevBtn = document.createElement('button')
      prevBtn.className = 'btn btn-outline'
      prevBtn.appendChild(createIcon(ChevronLeft, 16, 2))
      const pLabel = document.createElement('span')
      pLabel.textContent = 'Indietro'
      prevBtn.appendChild(pLabel)
      prevBtn.addEventListener('click', () => { step--; renderStep() })
      navRow.appendChild(prevBtn)
    }
    const nextBtn = document.createElement('button')
    nextBtn.className = 'btn btn-primary'
    if (step === totalSteps) {
      nextBtn.appendChild(createIcon(Wand2, 16, 2))
      const nLabel = document.createElement('span')
      nLabel.textContent = 'Genera'
      nextBtn.appendChild(nLabel)
      nextBtn.addEventListener('click', startGeneration)
    } else {
      const nLabel = document.createElement('span')
      nLabel.textContent = 'Avanti'
      nextBtn.appendChild(nLabel)
      nextBtn.appendChild(createIcon(ChevronRight, 16, 2))
      nextBtn.addEventListener('click', () => { step++; renderStep() })
    }
    navRow.appendChild(nextBtn)
  }

  function startGeneration() {
    stepContent.style.display = 'none'
    navRow.style.display = 'none'
    stepIndicator.style.display = 'none'

    const loading = document.createElement('div')
    loading.className = 'gen-loading'
    const sp = createIcon(Loader, 28, 2)
    sp.classList.add('spin')
    loading.appendChild(sp)
    const lt = document.createElement('p')
    lt.textContent = "L'AI sta creando la tua scheda..."
    loading.appendChild(lt)
    content.appendChild(loading)

    setTimeout(() => {
      loading.style.display = 'none'
      resultArea.style.display = 'block'

      const check = createIcon(CheckCircle, 28, 1.5)
      check.style.cssText = 'color:var(--accent);margin-bottom:var(--space-md)'
      resultArea.appendChild(check)

      const rTitle = document.createElement('h3')
      rTitle.className = 'gen-result-title'
      rTitle.textContent = 'Scheda generata'
      resultArea.appendChild(rTitle)

      const mockDays = [
        { day: 'Lunedì', ex: 5 },
        { day: 'Mercoledì', ex: 4 },
        { day: 'Venerdì', ex: 4 },
      ]
      generatedDays = mockDays.map((d) => ({
        dayOfWeek: DAY_NUM[d.day] || 1,
        name: d.day,
        exercises: Array.from({ length: d.ex }, (_, i) => ({
          name: `Esercizio ${i + 1}`,
          sets: 3,
          reps: 10,
          weightKg: 20,
          order: i + 1,
        })),
      }))
      mockDays.forEach((d) => {
        const rRow = document.createElement('div')
        rRow.className = 'gen-result-day'
        rRow.innerHTML = `<strong>${d.day}</strong> — ${d.ex} esercizi`
        resultArea.appendChild(rRow)
      })
    }, 2500)
  }

  renderStep()
  body.appendChild(content)
  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const sLabel = document.createElement('span')
  sLabel.textContent = 'Salva scheda'
  saveBtn.appendChild(sLabel)
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true
    saveBtn.classList.add('btn-loading')
    saveBtn.appendChild(createIcon(Loader, 16, 2))
    try {
      await saveWorkoutPlan({
        name: 'Scheda generata con AI',
        source: 'ai',
        days: generatedDays,
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

  function closeModal() {
    document.body.removeChild(overlay)
  }
}

export { generateWorkoutModal }
