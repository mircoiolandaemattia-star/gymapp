function card({ title, subtitle, content, className = '' }) {
  const el = document.createElement('div')
  el.className = `card ${className}`

  if (title) {
    const h3 = document.createElement('h3')
    h3.className = 'card-title'
    h3.textContent = title
    el.appendChild(h3)
  }

  if (subtitle) {
    const p = document.createElement('p')
    p.className = 'card-subtitle'
    p.textContent = subtitle
    el.appendChild(p)
  }

  if (content) {
    const div = document.createElement('div')
    div.className = 'card-content'
    if (typeof content === 'string') {
      div.innerHTML = content
    } else if (content instanceof HTMLElement) {
      div.appendChild(content)
    }
    el.appendChild(div)
  }

  return el
}

export { card }
