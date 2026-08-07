import { createIcon } from '/src/utils/icons.js'
import { X, Sparkles, Loader, CheckCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ClipboardCheck } from 'lucide'
import { apiFetch } from '/src/utils/api.js'
import { aiErrorBox } from '/src/components/aiErrorBox.js'
import { getNutritionTargets } from '/src/utils/nutritionTargets.js'

const ALLERGENS = ['Glutine', 'Lattosio', 'Frutta secca', 'Uova', 'Pesce', 'Crostacei', 'Soia']

const MEAL_COUNTS = [
  { value: '3', desc: 'Pasti principali, adatto a chi ha poco tempo' },
  { value: '4', desc: 'Equilibrio tra pasti principali e spuntini' },
  { value: '5', desc: 'Spuntini frequenti per chi mangia poco a pasto' },
]

const WEEK_DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

function generateDietFlow({ onSaveDiet }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Genera dieta con AI'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  let step = 1
  const totalSteps = 4
  const answers = {}
  const allergens = new Set()
  let generatedDiet = null

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

  const stepsData = [
    { q: 'Qual è il tuo obiettivo?', key: 'goal', options: ['Dimagrire', 'Mantenimento', 'Massa muscolare'] },
    { q: 'Hai allergie o intolleranze?', key: 'allergens', options: ALLERGENS, multi: true },
    { q: 'Quali sono le tue preferenze alimentari?', key: 'preference', options: ['Onnivoro', 'Vegetariano', 'Vegano', 'Pescatariano'] },
    { q: 'Quanti pasti al giorno?', key: 'meals', custom: MEAL_COUNTS },
  ]

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

    if (s.multi) {
      opts.classList.add('gen-chips')
      s.options.forEach((opt) => {
        const chip = document.createElement('button')
        chip.className = 'gen-chip' + (allergens.has(opt) ? ' selected' : '')
        chip.textContent = opt
        chip.addEventListener('click', () => {
          if (allergens.has(opt)) allergens.delete(opt)
          else allergens.add(opt)
          chip.classList.toggle('selected')
        })
        opts.appendChild(chip)
      })
      stepContent.appendChild(opts)

      const otherGroup = document.createElement('div')
      otherGroup.className = 'input-group'
      otherGroup.innerHTML = '<label>Altro</label>'
      const otherInput = document.createElement('input')
      otherInput.type = 'text'
      otherInput.className = 'input'
      otherInput.placeholder = 'Specifica altre allergie'
      otherInput.addEventListener('input', () => { answers.otherAllergens = otherInput.value.trim() })
      otherGroup.appendChild(otherInput)
      stepContent.appendChild(otherGroup)
    } else if (s.custom) {
      s.custom.forEach((opt) => {
        const btn = document.createElement('button')
        btn.className = 'gen-option-btn' + (answers[s.key] === opt.value ? ' selected' : '')
        const val = document.createElement('strong')
        val.textContent = `${opt.value} pasti`
        btn.appendChild(val)
        const br = document.createElement('br')
        btn.appendChild(br)
        const desc = document.createElement('small')
        desc.className = 'gen-option-desc'
        desc.textContent = opt.desc
        btn.appendChild(desc)
        btn.addEventListener('click', () => {
          answers[s.key] = opt.value
          stepContent.querySelectorAll('.gen-option-btn').forEach((b) => b.classList.remove('selected'))
          btn.classList.add('selected')
        })
        opts.appendChild(btn)
      })
      stepContent.appendChild(opts)
    } else {
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
    }

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
      nextBtn.appendChild(createIcon(Sparkles, 16, 2))
      const nLabel = document.createElement('span')
      nLabel.textContent = 'Genera dieta'
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
    lt.textContent = "L'AI sta creando la tua dieta personalizzata..."
    loading.appendChild(lt)
    content.appendChild(loading)

    const allergenList = [...allergens]
    if (answers.otherAllergens) allergenList.push(answers.otherAllergens)

    apiFetch('/ai/generate-diet', {
      method: 'POST',
      body: JSON.stringify({
        goal: answers.goal || '',
        allergens: allergenList,
        preferences: answers.preference ? [answers.preference] : [],
        mealsPerDay: answers.meals || '3',
        dailyCalories: getNutritionTargets().calories || 2000,
      }),
    })
      .then((data) => {
        generatedDiet = data || { days: [] }
        loading.style.display = 'none'
        resultArea.style.display = 'block'
        renderPlan()
      })
      .catch((err) => {
        loading.style.display = 'none'
        resultArea.style.display = 'block'
        resultArea.appendChild(aiErrorBox({ message: err.message, onClose: close }))
      })
  }

  function renderPlan() {
    resultArea.innerHTML = ''

    const check = createIcon(CheckCircle, 28, 1.5)
    check.style.cssText = 'color:var(--accent);margin-bottom:var(--space-md)'
    resultArea.appendChild(check)

    const rTitle = document.createElement('h3')
    rTitle.className = 'gen-result-title'
    rTitle.textContent = 'Piano settimanale generato'
    resultArea.appendChild(rTitle)

    const days = generatedDiet.days || []
    if (!days.length) {
      resultArea.appendChild(aiErrorBox({ message: 'Nessun piano generato, riprova', onClose: close }))
      return
    }

    const planList = document.createElement('div')
    planList.className = 'diet-plan-list'

    days.forEach((day, i) => {
      const row = document.createElement('div')
      row.className = 'diet-plan-day'
      let open = i === 0

      const head = document.createElement('button')
      head.className = 'diet-plan-day-head'
      const dayName = document.createElement('span')
      dayName.className = 'diet-plan-day-name'
      dayName.textContent = WEEK_DAYS[(day.day || i + 1) - 1] || `Giorno ${day.day || i + 1}`
      head.appendChild(dayName)
      const totalKcal = (day.meals || []).reduce((acc, m) => acc + (Number(m.calories) || 0), 0)
      const dayMeta = document.createElement('span')
      dayMeta.className = 'diet-plan-day-meta'
      dayMeta.textContent = `${totalKcal} kcal`
      head.appendChild(dayMeta)
      head.appendChild(createIcon(open ? ChevronUp : ChevronDown, 14, 2))
      head.addEventListener('click', () => {
        open = !open
        bodyBody.style.display = open ? 'block' : 'none'
        head.replaceChild(open ? createIcon(ChevronUp, 14, 2) : createIcon(ChevronDown, 14, 2), head.lastChild)
      })
      row.appendChild(head)

      const bodyBody = document.createElement('div')
      bodyBody.className = 'diet-plan-day-body'
      bodyBody.style.display = open ? 'block' : 'none'
      ;(day.meals || []).forEach((m) => {
        const line = document.createElement('p')
        const items = (m.items || []).map((it) => `${it.name} (${it.quantityG}g)`).join(', ')
        line.textContent = `· ${m.name} — ${items || `${m.calories || 0} kcal`}`
        bodyBody.appendChild(line)
      })
      row.appendChild(bodyBody)

      planList.appendChild(row)
    })

    resultArea.appendChild(planList)
  }

  let savedPlan = false

  function savePlan() {
    if (savedPlan || !generatedDiet) return
    saveBtn.disabled = true
    saveLabel.textContent = 'Salvataggio...'
    apiFetch('/diet-plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Piano AI',
        source: 'ai',
        days: (generatedDiet && generatedDiet.days) || [],
      }),
    })
      .then(() => {
        savedPlan = true
        saveLabel.textContent = 'Piano salvato'
        saveBtn.classList.remove('btn-primary')
        saveBtn.classList.add('btn-success')
        saveBtn.replaceChild(createIcon(CheckCircle, 16, 2), saveBtn.firstChild)
      })
      .catch((err) => {
        saveBtn.disabled = false
        saveLabel.textContent = 'Errore, riprova'
        alert(err.message || 'Errore nel salvataggio del piano')
      })
  }

  renderStep()
  body.appendChild(content)
  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(ClipboardCheck, 16, 2))
  const saveLabel = document.createElement('span')
  saveLabel.textContent = 'Salva piano'
  saveBtn.appendChild(saveLabel)
  saveBtn.addEventListener('click', savePlan)
  footer.appendChild(saveBtn)
  const footerBtn = document.createElement('button')
  footerBtn.className = 'btn btn-outline btn-full'
  const cLabel = document.createElement('span')
  cLabel.textContent = 'Chiudi'
  footerBtn.appendChild(cLabel)
  footerBtn.addEventListener('click', close)
  footer.appendChild(footerBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

export { generateDietFlow }
