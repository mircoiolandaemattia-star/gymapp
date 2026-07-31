import { createIcon } from '/src/utils/icons.js'
import { X, Upload, FileText, CheckCircle, Loader, Save } from 'lucide'

function uploadWorkoutModal(onClose) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal() })

  const modal = document.createElement('div')
  modal.className = 'modal'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Carica scheda esistente'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', closeModal)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const dropZone = document.createElement('div')
  dropZone.className = 'upload-zone'

  const dzContent = document.createElement('div')
  dzContent.className = 'upload-zone-content'

  const dzIcon = createIcon(Upload, 32, 1.5)
  dzIcon.style.cssText = 'color:var(--text-muted)'
  dzContent.appendChild(dzIcon)

  const dzText = document.createElement('p')
  dzText.className = 'upload-zone-text'
  dzText.textContent = 'Trascina qui il file o clicca per selezionare'
  dzContent.appendChild(dzText)

  const dzSub = document.createElement('p')
  dzSub.className = 'upload-zone-sub'
  dzSub.textContent = 'Supporta immagini e PDF'
  dzContent.appendChild(dzSub)

  dropZone.appendChild(dzContent)

  const hiddenInput = document.createElement('input')
  hiddenInput.type = 'file'
  hiddenInput.accept = 'image/*,.pdf'
  hiddenInput.style.display = 'none'
  dropZone.appendChild(hiddenInput)

  const previewArea = document.createElement('div')
  previewArea.className = 'upload-preview'
  previewArea.style.display = 'none'

  const resultArea = document.createElement('div')
  resultArea.className = 'upload-result'
  resultArea.style.display = 'none'

  dropZone.addEventListener('click', () => hiddenInput.click())

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.style.borderColor = 'var(--accent)'
  })
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = ''
  })
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.style.borderColor = ''
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  })

  hiddenInput.addEventListener('change', () => {
    const file = hiddenInput.files[0]
    if (file) processFile(file)
  })

  function processFile(file) {
    dzContent.style.display = 'none'
    previewArea.style.display = 'flex'

    const fileIcon = createIcon(FileText, 24, 1.5)
    fileIcon.style.cssText = 'color:var(--info)'
    previewArea.appendChild(fileIcon)
    const fileName = document.createElement('span')
    fileName.className = 'upload-file-name'
    fileName.textContent = file.name
    previewArea.appendChild(fileName)

    const spinnerArea = document.createElement('div')
    spinnerArea.className = 'upload-spinner'
    const spIcon = createIcon(Loader, 20, 2)
    spIcon.classList.add('spin')
    spinnerArea.appendChild(spIcon)
    const spText = document.createElement('span')
    spText.textContent = 'Elaborazione in corso...'
    spinnerArea.appendChild(spText)
    previewArea.appendChild(spinnerArea)

    setTimeout(() => {
      previewArea.style.display = 'none'
      resultArea.style.display = 'block'

      const check = createIcon(CheckCircle, 24, 1.5)
      check.style.cssText = 'color:var(--accent)'
      resultArea.innerHTML = ''
      resultArea.appendChild(check)
      const successText = document.createElement('p')
      successText.className = 'upload-success-text'
      successText.textContent = 'Scheda importata con successo'
      resultArea.appendChild(successText)
      const summary = document.createElement('p')
      summary.className = 'upload-summary'
      summary.textContent = '3 giorni, 12 esercizi rilevati'
      resultArea.appendChild(summary)
    }, 2000)
  }

  body.appendChild(dropZone)
  body.appendChild(previewArea)
  body.appendChild(resultArea)

  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const confirmBtn = document.createElement('button')
  confirmBtn.className = 'btn btn-primary btn-full'
  confirmBtn.appendChild(createIcon(Save, 16, 2))
  const confLabel = document.createElement('span')
  confLabel.textContent = 'Conferma e salva'
  confirmBtn.appendChild(confLabel)
  confirmBtn.addEventListener('click', () => {
    closeModal()
  })
  footer.appendChild(confirmBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function closeModal() {
    document.body.removeChild(overlay)
    if (onClose) onClose()
  }
}

export { uploadWorkoutModal }
