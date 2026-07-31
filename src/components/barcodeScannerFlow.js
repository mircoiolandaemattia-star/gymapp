import { createIcon } from '/src/utils/icons.js'
import { X, ScanLine, Save } from 'lucide'
import { barcodeProducts } from '/src/mock/dietData.js'

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

  function showScan() {
    body.innerHTML = ''

    const scan = document.createElement('div')
    scan.className = 'barcode-scan'

    const iconBox = document.createElement('div')
    iconBox.className = 'photo-pick-icon'
    iconBox.appendChild(createIcon(ScanLine, 32, 1.5))
    scan.appendChild(iconBox)

    const text = document.createElement('p')
    text.className = 'photo-pick-text'
    text.textContent = 'Simula la scansione di un prodotto'
    scan.appendChild(text)

    const scanBtn = document.createElement('button')
    scanBtn.className = 'btn btn-primary'
    scanBtn.appendChild(createIcon(ScanLine, 16, 2))
    const sLabel = document.createElement('span')
    sLabel.textContent = 'Simula scansione'
    scanBtn.appendChild(sLabel)
    scanBtn.addEventListener('click', () => {
      product = barcodeProducts[Math.floor(Math.random() * barcodeProducts.length)]
      qty = 100
      showProduct()
    })
    scan.appendChild(scanBtn)

    body.appendChild(scan)
  }

  function showProduct() {
    body.innerHTML = ''

    const box = document.createElement('div')
    box.className = 'card barcode-product'

    const pName = document.createElement('h3')
    pName.className = 'barcode-product-name'
    pName.textContent = product.name
    box.appendChild(pName)
    const pBrand = document.createElement('span')
    pBrand.className = 'barcode-product-brand'
    pBrand.textContent = product.brand
    box.appendChild(pBrand)

    const per100 = document.createElement('p')
    per100.className = 'barcode-per100'
    per100.textContent = `Valori per 100g: ${product.per100.cal} kcal · ${product.per100.p}g proteine · ${product.per100.c}g carboidrati · ${product.per100.f}g grassi`
    box.appendChild(per100)

    box.appendChild(document.createElement('div'))

    const qtyGroup = document.createElement('div')
    qtyGroup.className = 'input-group'
    qtyGroup.innerHTML = '<label for="bqty">Quantità consumata (g)</label>'
    const qtyInput = document.createElement('input')
    qtyInput.type = 'number'
    qtyInput.id = 'bqty'
    qtyInput.className = 'input'
    qtyInput.value = String(qty)
    qtyInput.addEventListener('input', () => { qty = Number(qtyInput.value) || 0 })
    qtyGroup.appendChild(qtyInput)
    box.appendChild(qtyGroup)

    const computedRow = document.createElement('div')
    computedRow.className = 'barcode-computed'
    const label = document.createElement('span')
    label.textContent = 'Totale'
    computedRow.appendChild(label)
    const computed = document.createElement('div')
    computed.className = 'barcode-computed-values'
    computed.id = 'computed-values'
    computedRow.appendChild(computed)
    box.appendChild(computedRow)

    body.appendChild(box)

    function updateComputed() {
      const f = qty / 100
      const vals = [
        { k: 'Calorie', v: `${Math.round(product.per100.cal * f)} kcal` },
        { k: 'Proteine', v: `${(product.per100.p * f).toFixed(1)}g` },
        { k: 'Carboidrati', v: `${(product.per100.c * f).toFixed(1)}g` },
        { k: 'Grassi', v: `${(product.per100.f * f).toFixed(1)}g` },
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
        name: product.name,
        qty,
        cal: Math.round(product.per100.cal * f),
        protein: Math.round(product.per100.p * f * 10) / 10,
        carbs: Math.round(product.per100.c * f * 10) / 10,
        fat: Math.round(product.per100.f * f * 10) / 10,
      })
      close()
    })
    body.appendChild(confirmBtn)
  }

  showScan()
  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

export { barcodeScannerFlow }
