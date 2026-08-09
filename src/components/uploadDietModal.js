import { createIcon } from '/src/utils/icons.js'
import { X, Upload, FileText, Loader, CheckCircle, ClipboardCheck } from 'lucide'
import { apiFetch } from '/src/utils/api.js'
import { aiErrorBox } from '/src/components/aiErrorBox.js'

function uploadDietModal({ onSaved } = {}) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Carica dieta esistente'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
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

  let parsedDiet = null
  let processing = false

  function processFile(file) {
    processing = true
    modal.style.pointerEvents = 'none'
    saveBtn.disabled = true
    saveBtn.classList.add('btn-loading')
    const busyLoader = createIcon(Loader, 16, 2)
    busyLoader.classList.add('upload-busy-loader')
    saveBtn.appendChild(busyLoader)
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

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = await apiFetch('/ai/parse-file', {
          method: 'POST',
          body: JSON.stringify({
            type: 'diet',
            mimeType: file.type || 'application/pdf',
            fileBase64: reader.result,
          }),
        })
        parsedDiet = data || { days: [] }
        finishProcessing()
        previewArea.style.display = 'none'
        resultArea.style.display = 'block'
        showResult()
      } catch (err) {
        finishProcessing()
        previewArea.style.display = 'none'
        resultArea.style.display = 'block'
        resultArea.appendChild(aiErrorBox({ message: err.message, onClose: close }))
      }
    }
    reader.readAsDataURL(file)
  }

  function finishProcessing() {
    processing = false
    modal.style.pointerEvents = ''
    saveBtn.disabled = false
    saveBtn.classList.remove('btn-loading')
    saveBtn.querySelector('.upload-busy-loader')?.remove()
  }

  function showResult() {
    resultArea.innerHTML = ''

    const check = createIcon(CheckCircle, 24, 1.5)
    check.style.cssText = 'color:var(--accent)'
    resultArea.appendChild(check)
    const successText = document.createElement('p')
    successText.className = 'upload-success-text'
    successText.textContent = 'Dieta importata'
    resultArea.appendChild(successText)

    const days = parsedDiet.days || []
    const mealCount = days.reduce((acc, d) => acc + (d.meals || []).length, 0)
    const summary = document.createElement('p')
    summary.className = 'upload-summary'
    summary.textContent = `${days.length} giorni, ${mealCount} pasti rilevati`
    resultArea.appendChild(summary)

    if (!days.length) return

    const planList = document.createElement('div')
    planList.className = 'diet-plan-list'
    days.forEach((day, i) => {
      const row = document.createElement('div')
      row.className = 'diet-plan-day'
      const open = i === 0
      const head = document.createElement('button')
      head.className = 'diet-plan-day-head'
      const dayName = document.createElement('span')
      dayName.className = 'diet-plan-day-name'
      dayName.textContent = `Giorno ${day.day || i + 1}`
      head.appendChild(dayName)
      const totalKcal = (day.meals || []).reduce((acc, m) => acc + (Number(m.calories) || 0), 0)
      const dayMeta = document.createElement('span')
      dayMeta.className = 'diet-plan-day-meta'
      dayMeta.textContent = `${totalKcal} kcal`
      head.appendChild(dayMeta)
      row.appendChild(head)

      const bodyBody = document.createElement('div')
      bodyBody.className = 'diet-plan-day-body'
      bodyBody.style.display = open ? 'block' : 'none'
      head.addEventListener('click', () => {
        bodyBody.style.display = bodyBody.style.display === 'none' ? 'block' : 'none'
      })
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

  body.appendChild(dropZone)
  body.appendChild(previewArea)
  body.appendChild(resultArea)

  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(ClipboardCheck, 16, 2))
  const saveLabel = document.createElement('span')
  saveLabel.textContent = 'Salva piano'
  saveBtn.appendChild(saveLabel)
  let savedPlan = false
  saveBtn.addEventListener('click', () => {
    if (savedPlan || !parsedDiet) return
    saveBtn.disabled = true
    saveLabel.textContent = 'Salvataggio...'
    apiFetch('/diet-plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Piano importato',
        source: 'import',
        days: (parsedDiet && parsedDiet.days) || [],
      }),
    })
      .then(() => {
        savedPlan = true
        saveLabel.textContent = 'Piano salvato'
        saveBtn.classList.remove('btn-primary')
        saveBtn.classList.add('btn-success')
        saveBtn.replaceChild(createIcon(CheckCircle, 16, 2), saveBtn.firstChild)
        if (onSaved) onSaved()
      })
      .catch((err) => {
        saveBtn.disabled = false
        saveLabel.textContent = 'Errore, riprova'
        alert(err.message || 'Errore nel salvataggio del piano')
      })
  })
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

export { uploadDietModal }
