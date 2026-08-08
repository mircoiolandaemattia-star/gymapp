import { createIcon } from '/src/utils/icons.js'
import { X, Camera, Loader, Save } from 'lucide'
import { freeLimitBanner } from '/src/components/freeLimitBanner.js'
import { aiErrorBox } from '/src/components/aiErrorBox.js'
import { apiFetch } from '/src/utils/api.js'
import { getUser } from '/src/utils/auth.js'
import { mealContext } from '/src/components/mealContext.js'

const PHOTO_LIMIT_FREE = 2

function photoLimit() {
  const u = getUser()
  return u.isPremium || u.isTrial ? Infinity : PHOTO_LIMIT_FREE
}

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
  header.appendChild(mealContext(mealName))
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

  const limit = photoLimit()
  let used = limit
  let imageData = null

  if (limit === Infinity) {
    used = 0
    showPick()
  } else {
    body.appendChild(createLoading())
    apiFetch('/ai-usage/today?action=photo_recognition')
      .then((data) => {
        used = data.count || 0
        body.innerHTML = ''
        if (used >= limit) {
          body.appendChild(freeLimitBanner({ used, max: limit, onClose: close }))
        } else {
          showPick()
        }
      })
      .catch(() => {
        body.innerHTML = ''
        showPick()
      })
  }

  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function createLoading() {
    const loading = document.createElement('div')
    loading.className = 'photo-loading'
    const sp = createIcon(Loader, 28, 2)
    sp.classList.add('spin')
    loading.appendChild(sp)
    const lt = document.createElement('p')
    lt.textContent = 'Verifica utilizzo giornaliero...'
    loading.appendChild(lt)
    return loading
  }

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
    hint.textContent = limit === Infinity ? 'Foto illimitate' : `Foto usate oggi: ${used}/${limit}`
    pick.appendChild(hint)

    body.appendChild(pick)
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      imageData = reader.result
      showPreview(file)
    }
    reader.readAsDataURL(file)
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

    apiFetch('/ai/recognize-meal', {
      method: 'POST',
      body: JSON.stringify({ description, image: imageData || null }),
    })
      .then((data) => {
        showResult(data)
      })
      .catch((err) => {
        body.innerHTML = ''
        if (/limite/i.test(err.message)) {
          body.appendChild(freeLimitBanner({ used, max: limit, onClose: close }))
        } else {
          body.appendChild(aiErrorBox({ message: err.message, onClose: close }))
        }
      })
  }

  function showResult(data) {
    body.innerHTML = ''

    const form = document.createElement('div')
    form.className = 'photo-result-form'

    const hint = document.createElement('p')
    hint.className = 'photo-result-hint'
    hint.textContent = 'Modifica i valori rilevati se necessario'
    form.appendChild(hint)

    const ingredients = document.createElement('div')
    ingredients.className = 'photo-ingredients'
    const ingTitle = document.createElement('p')
    ingTitle.className = 'photo-result-hint'
    ingTitle.textContent = 'Ingredienti rilevati'
    ingredients.appendChild(ingTitle)
    ;(data.items || []).forEach((it) => {
      const row = document.createElement('div')
      row.className = 'photo-ingredient-row'
      const nm = document.createElement('span')
      nm.textContent = it.name
      row.appendChild(nm)
      const qty = document.createElement('span')
      qty.textContent = `${it.quantityG}g`
      row.appendChild(qty)
      ingredients.appendChild(row)
    })
    form.appendChild(ingredients)

    const nameGroup = document.createElement('div')
    nameGroup.className = 'input-group'
    nameGroup.innerHTML = '<label>Nome pasto</label>'
    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.className = 'input'
    nameInput.value = data.name || 'Pasto analizzato'
    nameGroup.appendChild(nameInput)
    form.appendChild(nameGroup)

    const state = {
      cal: Number(data.calories) || 0,
      protein: Number(data.proteinG) || 0,
      carbs: Number(data.carbsG) || 0,
      fat: Number(data.fatsG) || 0,
    }

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
