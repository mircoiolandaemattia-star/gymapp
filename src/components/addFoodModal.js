import { createIcon } from '/src/utils/icons.js'
import { X, Camera, ScanBarcode, Pencil } from 'lucide'
import { photoRecognitionFlow } from '/src/components/photoRecognitionFlow.js'
import { barcodeScannerFlow } from '/src/components/barcodeScannerFlow.js'
import { manualFoodForm } from '/src/components/manualFoodForm.js'

function addFoodModal({ mealName, onFoodAdded }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = `Aggiungi a ${mealName}`
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const options = [
    { icon: Camera, label: 'Scatta foto', desc: 'Analizza il pasto con l\'AI', flow: photoRecognitionFlow },
    { icon: ScanBarcode, label: 'Scansiona codice a barre', desc: 'Cerca un prodotto dal codice', flow: barcodeScannerFlow },
    { icon: Pencil, label: 'Inserimento manuale', desc: 'Inserisci i valori a mano', flow: manualFoodForm },
  ]

  options.forEach((opt) => {
    const item = document.createElement('button')
    item.className = 'action-sheet-item add-option'
    const iconWrap = document.createElement('div')
    iconWrap.className = 'action-sheet-icon'
    iconWrap.appendChild(createIcon(opt.icon, 20, 2))
    item.appendChild(iconWrap)
    const info = document.createElement('div')
    info.className = 'action-sheet-info'
    const lbl = document.createElement('span')
    lbl.className = 'action-sheet-label'
    lbl.textContent = opt.label
    info.appendChild(lbl)
    const dsc = document.createElement('span')
    dsc.className = 'action-sheet-desc'
    dsc.textContent = opt.desc
    info.appendChild(dsc)
    item.appendChild(info)
    item.addEventListener('click', () => {
      opt.flow({
        mealName,
        onFoodAdded: (food) => {
          close()
          onFoodAdded(food)
        },
      })
    })
    body.appendChild(item)
  })

  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

export { addFoodModal }
