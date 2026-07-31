function addNode(node, parent) {
  if (!node) return
  const [tag, attrs, ...children] = node
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [key, val] of Object.entries(attrs || {})) {
    el.setAttribute(key, val)
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.textContent = child
    } else {
      addNode(child, el)
    }
  }
  parent.appendChild(el)
}

function createIcon(iconDef, size = 24, strokeWidth = 2) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', String(strokeWidth))
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')

  for (const node of iconDef) {
    addNode(node, svg)
  }

  return svg
}

export { createIcon }
