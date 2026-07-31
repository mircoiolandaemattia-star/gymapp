import { createIcon } from '/src/utils/icons.js'
import { X, Camera, Loader, Save } from 'lucide'
import { photoLimit, photoUsedToday, usePhotoSlot } from '/src/mock/dietData.js'
import { freeLimitBanner } from '/src/components/freeLimitBanner.js'

function photoRecognitionFlow({ mealName, onFoodAdded }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Scatta foto'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.setAttribute('capture', 'environment')
  fileInput.style.display = 'none'
  body.appendChild(fileInput)

  if (photoUsedToday >= photoLimit) {
    body.appendChild(freeLimitBanner({ used: photoUsedToday, max: photoLimit, onClose: close }))
  } else {
    showPick()
  }

  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function showPick() {
    body.innerHTML = ''

    const pick = document.createElement('div')
    pick.className = 'photo-pick'

    const iconBox = document.createElement('div')
    iconBox.className = 'photo-pick-icon'
    iconBox.appendChild(createIcon(Camera, 32, 1.5))
    pick.appendChild(iconBox)

    const text = document.createElement('p')
    text.className = 'photo-pick-text'
    text.textContent = 'Inquadra il tuo pasto'
    pick.appendChild(text)

    const takeBtn = document.createElement('button')
    takeBtn.className = 'btn btn-primary'
    takeBtn.appendChild(createIcon(Camera, 16, 2))
    const takeLabel = document.createElement('span')
    takeLabel.textContent = 'Scatta foto'
    takeBtn.appendChild(takeLabel)
    takeBtn.addEventListener('click', () => fileInput.click())
    pick.appendChild(takeBtn)

    const hint = document.createElement('p')
    hint.className = 'photo-limit-hint'
    hint.textContent = `Foto usate oggi: ${photoUsedToday}/${photoLimit}`
    pick.appendChild(hint)

    body.appendChild(pick)
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]
    if (file) showPreview(file)
  })

  function showPreview(file) {
    body.innerHTML = ''

    const preview = document.createElement('div')
    preview.className = 'photo-preview'

    const img = document.createElement('img')
    img.className = 'photo-img'
    img.alt = 'Anteprima del pasto'
    img.src = URL.createObjectURL(file)
    preview.appendChild(img)

    const group = document.createElement('div')
    group.className = 'input-group'
    group.innerHTML = '<label>Descrivi il pasto</label>'
    const desc = document.createElement('textarea')
    desc.className = 'input textarea'
    desc.placeholder = 'Descrivi cosa hai mangiato (es. petto di pollo con riso e verdure)'
    desc.setAttribute('rows', '3')
    group.appendChild(desc)
    preview.appendChild(group)

    const analyzeBtn = document.createElement('button')
    analyzeBtn.className = 'btn btn-primary btn-full'
    analyzeBtn.appendChild(createIcon(Camera, 16, 2))
    const aLabel = document.createElement('span')
    aLabel.textContent = 'Analizza con AI'
    analyzeBtn.appendChild(aLabel)
    analyzeBtn.disabled = true
    analyzeBtn.style.opacity = '0.5'
    desc.addEventListener('input', () => {
      const hasText = desc.value.trim().length > 0
      analyzeBtn.disabled = !hasText
      analyzeBtn.style.opacity = hasText ? '1' : '0.5'
    })
    analyzeBtn.addEventListener('click', () => showAnalyzing(desc.value.trim()))
    preview.appendChild(analyzeBtn)

    body.appendChild(preview)
  }

  function showAnalyzing(description) {
    body.innerHTML = ''

    const loading = document.createElement('div')
    loading.className = 'photo-loading'
    const sp = createIcon(Loader, 28, 2)
    sp.classList.add('spin')
    loading.appendChild(sp)
    const lt = document.createElement('p')
    lt.textContent = "L'AI sta analizzando il pasto..."
    loading.appendChild(lt)
    body.appendChild(loading)

    setTimeout(() => {
      showResult(description)
    }, 2000)
  }

  function showResult(description) {
    body.innerHTML = ''

    const form = document.createElement('div')
    form.className = 'photo-result-form'

    const hint = document.createElement('p')
    hint.className = 'photo-result-hint'
    hint.textContent = 'Modifica i valori rilevati se necessario'
    form.appendChild(hint)

    const nameGroup = document.createElement('div')
    nameGroup.className = 'input-group'
    nameGroup.innerHTML = '<label>Nome pasto</label>'
    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.className = 'input'
    nameInput.value = description || 'Pasto analizzato'
    nameGroup.appendChild(nameInput)
    form.appendChild(nameGroup)

    const state = { cal: 480, protein: 32, carbs: 55, fat: 12 }

    const grid = document.createElement('div')
    grid.className = 'macro-input-grid'
    const fields = [
      { key: 'cal', label: 'Calorie (kcal)', suffix: '' },
      { key: 'protein', label: 'Proteine (g)', suffix: 'g' },
      { key: 'carbs', label: 'Carboidrati (g)', suffix: 'g' },
      { key: 'fat', label: 'Grassi (g)', suffix: 'g' },
    ]
    const inputs = {}
    fields.forEach((f) => {
      const g = document.createElement('div')
      g.className = 'input-group'
      g.innerHTML = `<label>${f.label}</label>`
      const inp = document.createElement('input')
      inp.type = 'number'
      inp.className = 'input input-sm'
      inp.value = String(state[f.key])
      inp.addEventListener('input', () => { state[f.key] = Number(inp.value) || 0 })
      g.appendChild(inp)
      grid.appendChild(g)
      inputs[f.key] = inp
    })
    form.appendChild(grid)

    const confirmBtn = document.createElement('button')
    confirmBtn.className = 'btn btn-primary btn-full'
    confirmBtn.appendChild(createIcon(Save, 16, 2))
    const cLabel = document.createElement('span')
    cLabel.textContent = 'Conferma e aggiungi'
    confirmBtn.appendChild(cLabel)
    confirmBtn.addEventListener('click', () => {
      usePhotoSlot()
      onFoodAdded({
        name: nameInput.value.trim() || 'Pasto analizzato',
        qtyLabel: '1 porzione',
        cal: state.cal,
        protein: state.protein,
        carbs: state.carbs,
        fat: state.fat,
      })
      close()
    })
    form.appendChild(confirmBtn)

    body.appendChild(form)
  }

  function close() {
    document.body.removeChild(overlay)
  }
}

export { photoRecognitionFlow }
