import { createIcon } from '/src/utils/icons.js'

function button({ text, variant = 'primary', icon, iconSize = 16, onClick, className = '' }) {
  const btn = document.createElement('button')
  btn.className = `btn btn-${variant} ${className}`

  if (icon) {
    btn.appendChild(createIcon(icon, iconSize, 2))
  }

  const span = document.createElement('span')
  span.textContent = text
  btn.appendChild(span)

  if (onClick) {
    btn.addEventListener('click', onClick)
  }

  return btn
}

export { button }
