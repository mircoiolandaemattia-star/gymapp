function onboardingProgressBar({ current, total }) {
  const wrap = document.createElement('div')
  wrap.className = 'onb-progress'

  const bar = document.createElement('div')
  bar.className = 'onb-progress-bar'
  bar.setAttribute('role', 'progressbar')
  bar.setAttribute('aria-valuemin', '0')
  bar.setAttribute('aria-valuemax', String(total))
  bar.setAttribute('aria-valuenow', String(current + 1))
  bar.setAttribute('aria-label', `Passo ${current + 1} di ${total}`)

  for (let i = 0; i < total; i++) {
    const seg = document.createElement('div')
    seg.className = 'onb-progress-seg' + (i <= current ? ' active' : '')
    bar.appendChild(seg)
  }
  wrap.appendChild(bar)

  const label = document.createElement('span')
  label.className = 'onb-progress-label'
  label.textContent = `Passo ${current + 1} di ${total}`
  wrap.appendChild(label)

  return wrap
}

export { onboardingProgressBar }
