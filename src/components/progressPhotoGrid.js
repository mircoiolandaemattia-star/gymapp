import { createIcon } from '/src/utils/icons.js'
import { Plus, Camera } from 'lucide'

function progressPhotoGrid({ photos, onAdd }) {
  const card = document.createElement('div')
  card.className = 'card'

  const header = document.createElement('div')
  header.className = 'section-header'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Foto progressi'
  header.appendChild(title)
  const addBtn = document.createElement('button')
  addBtn.className = 'card-add-btn photo-add-btn'
  addBtn.setAttribute('aria-label', 'Aggiungi foto progresso')
  addBtn.appendChild(createIcon(Plus, 16, 2))
  addBtn.addEventListener('click', onAdd)
  header.appendChild(addBtn)
  card.appendChild(header)

  if (photos.length === 0) {
    const empty = document.createElement('button')
    empty.className = 'photo-empty'
    empty.appendChild(createIcon(Camera, 36, 1.5))
    const text = document.createElement('span')
    text.textContent = 'Aggiungi la tua prima foto'
    empty.appendChild(text)
    empty.addEventListener('click', onAdd)
    card.appendChild(empty)
    return card
  }

  const grid = document.createElement('div')
  grid.className = 'photo-grid'

  photos.forEach((p) => {
    const item = document.createElement('div')
    item.className = 'photo-item'

    if (p.img) {
      const img = document.createElement('img')
      img.className = 'photo-img'
      img.alt = 'Foto progresso del ' + p.date
      img.src = p.img
      item.appendChild(img)
    } else {
      const ph = document.createElement('div')
      ph.className = 'photo-placeholder'
      ph.style.background = p.color
      ph.appendChild(createIcon(Camera, 28, 1.5))
      item.appendChild(ph)
    }

    const date = document.createElement('span')
    date.className = 'photo-date'
    date.textContent = p.date
    item.appendChild(date)

    grid.appendChild(item)
  })

  card.appendChild(grid)
  return card
}

export { progressPhotoGrid }
