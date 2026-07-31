import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { completeOnboarding, getUser } from '/src/utils/auth.js'
import { storage } from '/src/utils/storage.js'
import { calculateCalories } from '/src/utils/calorieCalculator.js'
import { onboardingProgressBar } from '/src/components/onboardingProgressBar.js'
import { goalOptions, activityOptions, SEX_OPTIONS } from '/src/mock/profileData.js'
import {
  Dumbbell,
  Flame,
  Scale,
  User,
  Hash,
  Ruler,
  Weight,
  ShieldAlert,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide'

const TOTAL_STEPS = 5

const GOAL_ICONS = {
  dimagrire: Flame,
  mantenere: Scale,
  massa: Dumbbell,
}

const LEGAL_TEXT =
  'Le schede di allenamento e i piani alimentari generati dall’intelligenza artificiale hanno scopo puramente informativo e non sostituiscono il parere di un medico, nutrizionista o personal trainer certificato. Prima di iniziare qualsiasi programma di allenamento o alimentare, specialmente se hai patologie pregresse, consulta un professionista qualificato. L’utilizzo dell’app è a tuo rischio e l’azienda non è responsabile per infortuni o problemi di salute derivanti dal suo utilizzo.'

let step = 0
let currentSection = null

const data = {
  name: getUser().name || '',
  eta: '',
  sesso: '',
  peso: '',
  altezza: '',
  goal: '',
  activity: '',
  terms: false,
}

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function render() {
  const section = buildSection()
  if (currentSection && currentSection.isConnected) {
    currentSection.replaceWith(section)
  }
  currentSection = section
  try { window.scrollTo({ top: 0 }) } catch { /* non-critical */ }
  return section
}

function buildSection() {
  const section = document.createElement('section')
  section.className = 'page onboarding-page'

  const shell = document.createElement('div')
  shell.className = 'onb-shell'

  shell.appendChild(onboardingProgressBar({ current: step, total: TOTAL_STEPS }))

  const body = document.createElement('div')
  body.className = 'onb-body'
  body.appendChild(buildStep())

  const error = el('p', 'onb-error')
  error.setAttribute('role', 'alert')
  body.appendChild(error)

  shell.appendChild(body)
  shell.appendChild(buildFooter())
  section.appendChild(shell)
  return section
}

function buildStep() {
  switch (step) {
    case 0:
      return buildPersonalStep()
    case 1:
      return buildGoalStep()
    case 2:
      return buildActivityStep()
    case 3:
      return buildDisclaimerStep()
    default:
      return buildSummaryStep()
  }
}

function stepHeader(title, subtitle) {
  const wrap = document.createElement('div')
  wrap.className = 'onb-step-header'
  const h = el('h2', 'onb-step-title', title)
  const p = el('p', 'onb-step-subtitle', subtitle)
  wrap.appendChild(h)
  wrap.appendChild(p)
  return wrap
}

function inputGroup({ id, label, type, placeholder, icon, value, min, max, inputmode, onInput }) {
  const group = document.createElement('div')
  group.className = 'input-group onb-input'

  const lbl = document.createElement('label')
  lbl.setAttribute('for', id)
  lbl.textContent = label
  group.appendChild(lbl)

  const wrap = document.createElement('div')
  wrap.className = 'onb-input-wrap'

  const iconEl = createIcon(icon, 18, 2)
  iconEl.setAttribute('class', 'onb-input-icon')
  wrap.appendChild(iconEl)

  const input = document.createElement('input')
  input.type = type
  input.id = id
  input.className = 'input'
  input.placeholder = placeholder
  input.value = value
  input.setAttribute('autocomplete', 'off')
  if (min !== undefined) input.min = String(min)
  if (max !== undefined) input.max = String(max)
  if (inputmode) input.setAttribute('inputmode', inputmode)
  input.addEventListener('input', onInput)
  wrap.appendChild(input)

  group.appendChild(wrap)
  return group
}

function buildPersonalStep() {
  const frag = document.createDocumentFragment()
  frag.appendChild(stepHeader('Parlaci di te', 'Inserisci i tuoi dati per calcolare il tuo fabbisogno calorico'))

  frag.appendChild(inputGroup({
    id: 'onb-name',
    label: 'Nome',
    type: 'text',
    placeholder: 'Nome e cognome',
    icon: User,
    value: data.name,
    onInput: (e) => { data.name = e.target.value },
  }))

  frag.appendChild(inputGroup({
    id: 'onb-age',
    label: 'Età',
    type: 'number',
    placeholder: 'Es. 28',
    icon: Hash,
    value: data.eta,
    min: 14,
    max: 100,
    inputmode: 'numeric',
    onInput: (e) => { data.eta = e.target.value },
  }))

  const sexLabel = el('span', 'onb-field-label', 'Sesso')
  frag.appendChild(sexLabel)

  const sexRow = document.createElement('div')
  sexRow.className = 'onb-sex-row'
  SEX_OPTIONS.forEach((o) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'onb-sex-btn' + (data.sesso === o.value ? ' selected' : '')
    btn.setAttribute('aria-pressed', String(data.sesso === o.value))
    btn.textContent = o.label
    btn.addEventListener('click', () => {
      data.sesso = o.value
      render()
    })
    sexRow.appendChild(btn)
  })
  frag.appendChild(sexRow)

  const grid = document.createElement('div')
  grid.className = 'onb-field-grid'
  grid.appendChild(inputGroup({
    id: 'onb-weight',
    label: 'Peso (kg)',
    type: 'number',
    placeholder: '70',
    icon: Weight,
    value: data.peso,
    min: 30,
    max: 300,
    inputmode: 'decimal',
    onInput: (e) => { data.peso = e.target.value },
  }))
  grid.appendChild(inputGroup({
    id: 'onb-height',
    label: 'Altezza (cm)',
    type: 'number',
    placeholder: '175',
    icon: Ruler,
    value: data.altezza,
    min: 100,
    max: 250,
    inputmode: 'numeric',
    onInput: (e) => { data.altezza = e.target.value },
  }))
  frag.appendChild(grid)

  return frag
}

function selectableCard({ icon, label, desc, selected, onClick }) {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = 'onb-card' + (selected ? ' selected' : '')
  card.setAttribute('aria-pressed', String(selected))
  card.addEventListener('click', onClick)

  if (icon) {
    const iconWrap = el('div', 'onb-card-icon')
    iconWrap.appendChild(createIcon(icon, 22, 2))
    card.appendChild(iconWrap)
  }

  const textWrap = document.createElement('div')
  textWrap.className = 'onb-card-text'
  textWrap.appendChild(el('span', 'onb-card-label', label))
  textWrap.appendChild(el('span', 'onb-card-desc', desc))
  card.appendChild(textWrap)

  const check = el('span', 'onb-card-check')
  check.appendChild(createIcon(Check, 16, 2.5))
  card.appendChild(check)

  return card
}

function buildGoalStep() {
  const frag = document.createDocumentFragment()
  frag.appendChild(stepHeader('Qual è il tuo obiettivo?', 'Seleziona l’obiettivo principale del tuo percorso'))
  const list = el('div', 'onb-card-list')
  goalOptions.forEach((g) => {
    list.appendChild(selectableCard({
      icon: GOAL_ICONS[g.value],
      label: g.label,
      desc: g.desc,
      selected: data.goal === g.value,
      onClick: () => {
        data.goal = g.value
        render()
      },
    }))
  })
  frag.appendChild(list)
  return frag
}

function buildActivityStep() {
  const frag = document.createDocumentFragment()
  frag.appendChild(stepHeader('Quanto sei attivo?', 'Indica quanto sport svolgi nella tua settimana tipo'))
  const list = el('div', 'onb-card-list')
  activityOptions.forEach((a) => {
    list.appendChild(selectableCard({
      label: a.label,
      desc: a.desc,
      selected: data.activity === a.value,
      onClick: () => {
        data.activity = a.value
        render()
      },
    }))
  })
  frag.appendChild(list)
  return frag
}

function buildDisclaimerStep() {
  const frag = document.createDocumentFragment()
  frag.appendChild(stepHeader('Prima di iniziare', 'Informazioni importanti sull’utilizzo dell’app'))

  const box = el('div', 'onb-disclaimer')
  const iconWrap = el('div', 'onb-disclaimer-icon')
  iconWrap.appendChild(createIcon(ShieldAlert, 24, 2))
  box.appendChild(iconWrap)
  box.appendChild(el('p', 'onb-disclaimer-text', LEGAL_TEXT))
  frag.appendChild(box)

  const checkRow = document.createElement('label')
  checkRow.className = 'onb-checkbox-row'
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'onb-terms'
  checkbox.checked = data.terms
  checkbox.addEventListener('change', (e) => {
    data.terms = e.target.checked
    render()
  })
  checkRow.appendChild(checkbox)
  checkRow.appendChild(el('span', null, 'Ho letto e accetto le condizioni d’uso'))
  frag.appendChild(checkRow)

  return frag
}

function buildSummaryStep() {
  const frag = document.createDocumentFragment()
  frag.appendChild(stepHeader('Tutto pronto!', 'Ecco il tuo fabbisogno calorico giornaliero'))

  const result = calculateCalories({
    sex: data.sesso,
    weightKg: Number(data.peso),
    heightCm: Number(data.altezza),
    age: Number(data.eta),
    activity: data.activity,
    goal: data.goal,
  })

  const ringWrap = el('div', 'onb-ring')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const size = 168
  const stroke = 10
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`)

  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  bgCircle.setAttribute('cx', String(size / 2))
  bgCircle.setAttribute('cy', String(size / 2))
  bgCircle.setAttribute('r', String(radius))
  bgCircle.setAttribute('fill', 'none')
  bgCircle.setAttribute('stroke', '#334155')
  bgCircle.setAttribute('stroke-width', String(stroke))
  svg.appendChild(bgCircle)

  const progCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  progCircle.setAttribute('cx', String(size / 2))
  progCircle.setAttribute('cy', String(size / 2))
  progCircle.setAttribute('r', String(radius))
  progCircle.setAttribute('fill', 'none')
  progCircle.setAttribute('stroke', '#34D399')
  progCircle.setAttribute('stroke-width', String(stroke))
  progCircle.setAttribute('stroke-linecap', 'round')
  progCircle.setAttribute('stroke-dasharray', String(circ))
  progCircle.setAttribute('stroke-dashoffset', '0')
  progCircle.setAttribute('transform', `rotate(-90 ${size / 2} ${size / 2})`)
  svg.appendChild(progCircle)
  ringWrap.appendChild(svg)

  const center = el('div', 'onb-ring-center')
  center.appendChild(el('span', 'onb-ring-value', String(result.calories)))
  center.appendChild(el('span', 'onb-ring-unit', 'kcal/giorno'))
  ringWrap.appendChild(center)
  frag.appendChild(ringWrap)

  const meta = el('div', 'onb-meta')
  const rows = [
    ['Fabbisogno basale (BMR)', `${result.bmr} kcal`],
    ['Dispendio attività', `${result.tdee} kcal`],
    ['Aggiustamento obiettivo', `${result.adjustment >= 0 ? '+' : ''}${result.adjustment} kcal`],
  ]
  rows.forEach(([label, value]) => {
    const row = el('div', 'onb-meta-row')
    row.appendChild(el('span', 'onb-meta-label', label))
    row.appendChild(el('span', 'onb-meta-value', value))
    meta.appendChild(row)
  })
  frag.appendChild(meta)

  const macroCard = el('div', 'onb-macro-card')
  macroCard.appendChild(el('h3', 'onb-macro-title', 'Suddivisione macronutrienti'))

  const stack = el('div', 'onb-macro-stack')
  const stackColors = ['var(--accent)', 'var(--info)', 'var(--warning)']
  Object.values(result.macros).forEach((m, i) => {
    const seg = document.createElement('div')
    seg.className = 'onb-macro-seg'
    seg.style.width = `${m.pct}%`
    seg.style.background = stackColors[i]
    seg.setAttribute('title', `${m.label} ${m.pct}%`)
    stack.appendChild(seg)
  })
  macroCard.appendChild(stack)

  const legend = el('div', 'onb-macro-legend')
  Object.values(result.macros).forEach((m, i) => {
    const item = el('div', 'onb-macro-item')
    const dot = el('span', 'onb-macro-dot')
    dot.style.background = stackColors[i]
    item.appendChild(dot)
    item.appendChild(el('span', 'onb-macro-label', m.label))
    item.appendChild(el('span', 'onb-macro-pct', `${m.pct}%`))
    item.appendChild(el('span', 'onb-macro-grams', `${m.grams} g`))
    legend.appendChild(item)
  })
  macroCard.appendChild(legend)
  frag.appendChild(macroCard)

  return frag
}

function validateStep() {
  if (step === 0) {
    const name = data.name.trim()
    const age = Number(data.eta)
    const weight = Number(String(data.peso).replace(',', '.'))
    const height = Number(String(data.altezza).replace(',', '.'))
    if (!name) return 'Inserisci il tuo nome per continuare'
    if (!data.eta || !(age >= 14 && age <= 100)) return 'Inserisci un’età valida (14-100 anni)'
    if (!data.sesso) return 'Seleziona il sesso per continuare'
    if (!data.peso || !(weight >= 30 && weight <= 300)) return 'Inserisci un peso valido (30-300 kg)'
    if (!data.altezza || !(height >= 100 && height <= 250)) return 'Inserisci un’altezza valida (100-250 cm)'
  }
  if (step === 1 && !data.goal) return 'Seleziona un obiettivo per continuare'
  if (step === 2 && !data.activity) return 'Seleziona il tuo livello di attività'
  if (step === 3 && !data.terms) return 'Devi accettare le condizioni d’uso per continuare'
  return null
}

function buildFooter() {
  const footer = document.createElement('div')
  footer.className = 'onb-footer'

  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'btn btn-outline onb-back'
  if (step === 0) {
    back.style.visibility = 'hidden'
  }
  back.appendChild(createIcon(ChevronLeft, 18, 2))
  back.appendChild(el('span', null, 'Indietro'))
  back.addEventListener('click', () => {
    if (step > 0) {
      step--
      render()
    }
  })
  footer.appendChild(back)

  const next = document.createElement('button')
  next.type = 'button'
  next.className = 'btn btn-primary onb-next'
  if (step === TOTAL_STEPS - 1) {
    next.appendChild(el('span', null, 'Inizia'))
    next.appendChild(createIcon(Check, 18, 2))
  } else {
    next.appendChild(el('span', null, 'Avanti'))
    next.appendChild(createIcon(ChevronRight, 18, 2))
  }
  next.addEventListener('click', handleNext)
  syncNextState(next)
  footer.appendChild(next)

  return footer
}

function syncNextState(next) {
  next.disabled =
    (step === 1 && !data.goal) ||
    (step === 2 && !data.activity) ||
    (step === 3 && !data.terms)
}

function handleNext() {
  const error = validateStep()
  const errEl = currentSection.querySelector('.onb-error')
  if (errEl) errEl.textContent = error || ''
  if (error) return

  if (step < TOTAL_STEPS - 1) {
    step++
    render()
  } else {
    saveAndStart()
  }
}

function saveAndStart() {
  const result = calculateCalories({
    sex: data.sesso,
    weightKg: Number(data.peso),
    heightCm: Number(data.altezza),
    age: Number(data.eta),
    activity: data.activity,
    goal: data.goal,
  })

  storage.set('ft_profile', {
    name: data.name.trim(),
    eta: Number(data.eta),
    sesso: data.sesso,
    peso: Number(data.peso),
    altezza: Number(data.altezza),
    goal: data.goal,
    activity: data.activity,
    calories: result.calories,
    macros: result.macros,
    updatedAt: new Date().toISOString(),
  })

  completeOnboarding()
  navigate('/')
}

export { render }
export default render
