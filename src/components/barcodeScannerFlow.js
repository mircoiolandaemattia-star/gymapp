import { createIcon } from '/src/utils/icons.js'
import { X, ScanLine, Save, AlertTriangle, Keyboard } from 'lucide'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { apiFetch } from '/src/utils/api.js'
import { manualFoodForm } from '/src/components/manualFoodForm.js'

function barcodeScannerFlow({ mealName, onFoodAdded }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Scansiona codice a barre'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  let product = null
  let qty = 100
  let scanner = null
  let scanning = false

  function stopScanner() {
    if (scanner && scanning) {
      scanning = false
      scanner.stop().catch(() => {})
    }
  }

  function showScanning() {
    body.innerHTML = ''

    const id = `bc-scanner_${Math.random().toString(36).slice(2, 8)}`
    const region = document.createElement('div')
    region.id = id
    region.className = 'barcode-scanner-region'
    body.appendChild(region)

    const guide = document.createElement('div')
    guide.className = 'barcode-guide'
    region.appendChild(guide)

    const hint = document.createElement('p')
    hint.className = 'photo-pick-text'
    hint.textContent = 'Centra un codice a barre nel riquadro'
    body.appendChild(hint)

    const manualBtn = document.createElement('button')
    manualBtn.className = 'btn btn-outline btn-full'
    manualBtn.style.marginTop = 'var(--space-sm)'
    manualBtn.appendChild(createIcon(Keyboard, 16, 2))
    const mLab = document.createElement('span')
    mLab.textContent = 'Inserisci codice a mano'
    manualBtn.appendChild(mLab)
    manualBtn.addEventListener('click', showManualEntry)
    body.appendChild(manualBtn)

    scanner = new Html5Qrcode(id, { verbose: false })
    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 140 },
          aspectRatio: 1.6,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.ITF,
          ],
        },
        (decodedText) => {
          stopScanner()
          handleCode(decodedText)
        },
        () => {}
      )
      .catch(() => {
        region.remove()
        showCameraError()
      })
  }

  function showCameraError() {
    body.innerHTML = ''
    body.appendChild(
      errBox(
        'Fotocamera non disponibile',
        'Non è stato possibile attivare la fotocamera. Puoi cercare il prodotto inserendo il codice a barre manualmente.',
        showManualEntry,
        'Inserisci codice a mano'
      )
    )
  }

  function showManualEntry() {
    stopScanner()
    body.innerHTML = ''

    const group = document.createElement('div')
    group.className = 'input-group'
    group.innerHTML = '<label for="bc-code">Codice a barre</label>'
    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'bc-code'
    input.className = 'input'
    input.placeholder = 'es. 3017620422003'
    input.inputMode = 'numeric'
    group.appendChild(input)
    body.appendChild(group)

    const goBtn = document.createElement('button')
    goBtn.className = 'btn btn-primary btn-full'
    goBtn.appendChild(createIcon(ScanLine, 16, 2))
    const gLabel = document.createElement('span')
    gLabel.textContent = 'Cerca prodotto'
    goBtn.appendChild(gLabel)
    goBtn.addEventListener('click', () => {
      const code = input.value.trim()
      if (!code) return
      body.innerHTML = ''
      handleCode(code)
    })
    body.appendChild(goBtn)
  }

  function errBox(title, text, action, actionLabel) {
    const wrap = document.createElement('div')
    wrap.className = 'bc-error'
    const icon = createIcon(AlertTriangle, 28, 1.5)
    wrap.appendChild(icon)
    const t = document.createElement('h4')
    t.textContent = title
    wrap.appendChild(t)
    const p = document.createElement('p')
    p.textContent = text
    wrap.appendChild(p)
    if (action) {
      const btn = document.createElement('button')
      btn.className = 'btn btn-primary btn-full'
      const l = document.createElement('span')
      l.textContent = actionLabel || 'OK'
      btn.appendChild(l)
      btn.addEventListener('click', action)
      wrap.appendChild(btn)
    }
    return wrap
  }

  async function handleCode(code) {
    stopScanner()
    body.innerHTML = ''

    const loading = document.createElement('div')
    loading.className = 'photo-loading'
    const sp = createIcon(ScanLine, 26, 2)
    sp.classList.add('spin')
    loading.appendChild(sp)
    const lt = document.createElement('p')
    lt.textContent = 'Ricerca prodotto...'
    loading.appendChild(lt)
    body.appendChild(loading)

    try {
      const data = await apiFetch(`/food/barcode/${encodeURIComponent(code)}`)
      loading.remove()
      showProduct(data, code)
    } catch (err) {
      loading.remove()
      if (/non trovato/i.test(err.message)) {
        body.appendChild(
          errBox(
            'Prodotto non trovato',
            'Prodotto non trovato, prova con inserimento manuale.',
            () => {
              close()
              manualFoodForm({ mealName, onFoodAdded })
            },
            'Inserimento manuale'
          )
        )
      } else {
        body.appendChild(errBox(err.message, 'Verifica la connessione e riprova.', showScanning, 'Riprova'))
      }
    }
  }

  function showProduct(data, code) {
    body.innerHTML = ''

    const box = document.createElement('div')
    box.className = 'card barcode-product'

    const pName = document.createElement('h3')
    pName.className = 'barcode-product-name'
    pName.textContent = data.name
    box.appendChild(pName)

    const per100 = document.createElement('p')
    per100.className = 'barcode-per100'
    per100.textContent = `Valori per 100g: ${data.caloriesPer100g} kcal · ${data.proteinPer100g}g proteine · ${data.carbsPer100g}g carboidrati · ${data.fatsPer100g}g grassi`
    box.appendChild(per100)

    const qtyGroup = document.createElement('div')
    qtyGroup.className = 'input-group'
    qtyGroup.innerHTML = '<label for="bc-qty">Quantità consumata (g)</label>'
    const qtyInput = document.createElement('input')
    qtyInput.type = 'number'
    qtyInput.id = 'bc-qty'
    qtyInput.className = 'input'
    qtyInput.value = String(qty)
    qtyGroup.appendChild(qtyInput)
    box.appendChild(qtyGroup)

    const computedRow = document.createElement('div')
    computedRow.className = 'barcode-computed'
    const label = document.createElement('span')
    label.textContent = 'Totale'
    computedRow.appendChild(label)
    const computed = document.createElement('div')
    computed.className = 'barcode-computed-values'
    computedRow.appendChild(computed)
    box.appendChild(computedRow)

    body.appendChild(box)

    function updateComputed() {
      const f = (Number(qtyInput.value) || 0) / 100
      qty = (Number(qtyInput.value) || 0)
      const vals = [
        { k: 'Calorie', v: `${Math.round(data.caloriesPer100g * f)} kcal` },
        { k: 'Proteine', v: `${(data.proteinPer100g * f).toFixed(1)}g` },
        { k: 'Carboidrati', v: `${(data.carbsPer100g * f).toFixed(1)}g` },
        { k: 'Grassi', v: `${(data.fatsPer100g * f).toFixed(1)}g` },
      ]
      computed.innerHTML = ''
      vals.forEach((v) => {
        const chip = document.createElement('span')
        chip.className = 'barcode-computed-chip'
        chip.textContent = `${v.k}: ${v.v}`
        computed.appendChild(chip)
      })
    }
    updateComputed()
    qtyInput.addEventListener('input', updateComputed)

    const confirmBtn = document.createElement('button')
    confirmBtn.className = 'btn btn-primary btn-full'
    confirmBtn.style.marginTop = 'var(--space-md)'
    confirmBtn.appendChild(createIcon(Save, 16, 2))
    const cLabel = document.createElement('span')
    cLabel.textContent = 'Conferma e aggiungi'
    confirmBtn.appendChild(cLabel)
    confirmBtn.addEventListener('click', () => {
      const f = qty / 100
      onFoodAdded({
        name: data.name,
        qty,
        cal: Math.round(data.caloriesPer100g * f),
        protein: Math.round(data.proteinPer100g * f * 10) / 10,
        carbs: Math.round(data.carbsPer100g * f * 10) / 10,
        fat: Math.round(data.fatsPer100g * f * 10) / 10,
        source: 'barcode',
        barcode: code,
      })
      close()
    })
    body.appendChild(confirmBtn)
  }

  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)
  showScanning()

  function close() {
    stopScanner()
    if (overlay.parentNode) document.body.removeChild(overlay)
  }
}

export { barcodeScannerFlow }