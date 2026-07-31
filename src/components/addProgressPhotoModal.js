import { createIcon } from '/src/utils/icons.js'
import { X, Camera, Save } from 'lucide'

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
const GRADIENTS = [
  'linear-gradient(135deg,#0f766e,#0f172a)',
  'linear-gradient(135deg,#4338ca,#0f172a)',
  'linear-gradient(135deg,#9a3412,#0f172a)',
  'linear-gradient(135deg,#be123c,#0f172a)',
  'linear-gradient(135deg,#1d4ed8,#0f172a)',
  'linear-gradient(135deg,#a16207,#0f172a)',
]

function todayLabel() {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function addProgressPhotoModal({ onSave }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Aggiungi foto progresso'
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

  let objectUrl = null

  showPick()

  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const sLabel = document.createElement('span')
  sLabel.textContent = 'Salva foto'
  saveBtn.appendChild(sLabel)
  saveBtn.disabled = true
  saveBtn.style.opacity = '0.5'
  saveBtn.addEventListener('click', () => {
    onSave({ img: objectUrl, date: todayLabel(), color: GRADIENTS[hashStr(objectUrl || 'x') % GRADIENTS.length] })
    close()
  })
  footer.appendChild(saveBtn)
  modal.appendChild(footer)

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
    text.textContent = 'Scatta o scegli una foto'
    pick.appendChild(text)

    const takeBtn = document.createElement('button')
    takeBtn.className = 'btn btn-primary'
    takeBtn.appendChild(createIcon(Camera, 16, 2))
    const tLabel = document.createElement('span')
    tLabel.textContent = 'Scegli foto'
    takeBtn.appendChild(tLabel)
    takeBtn.addEventListener('click', () => fileInput.click())
    pick.appendChild(takeBtn)

    body.appendChild(pick)
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]
    if (!file) return
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = URL.createObjectURL(file)

    body.innerHTML = ''

    const preview = document.createElement('div')
    preview.className = 'photo-preview'

    const img = document.createElement('img')
    img.className = 'photo-img'
    img.alt = 'Anteprima foto progresso'
    img.src = objectUrl
    preview.appendChild(img)

    const dateGroup = document.createElement('div')
    dateGroup.className = 'input-group'
    dateGroup.innerHTML = '<label>Data</label>'
    const dateInput = document.createElement('input')
    dateInput.type = 'text'
    dateInput.className = 'input'
    dateInput.value = todayLabel()
    dateInput.disabled = true
    dateGroup.appendChild(dateInput)
    preview.appendChild(dateGroup)

    body.appendChild(preview)

    saveBtn.disabled = false
    saveBtn.style.opacity = '1'
  })

  function close() {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    document.body.removeChild(overlay)
  }
}

export { addProgressPhotoModal }
