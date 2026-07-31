function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function strengthMeta(score) {
  if (score <= 2) return { color: 'var(--error)', label: 'Debole' }
  if (score === 3) return { color: 'var(--warning)', label: 'Media' }
  return { color: 'var(--accent)', label: 'Forte' }
}

function passwordStrengthIndicator() {
  const wrap = document.createElement('div')
  wrap.className = 'pw-strength'
  wrap.style.display = 'none'

  const bars = document.createElement('div')
  bars.className = 'pw-strength-bars'
  const segments = [0, 1, 2, 3].map(() => {
    const s = document.createElement('span')
    s.className = 'pw-strength-seg'
    bars.appendChild(s)
    return s
  })

  const label = document.createElement('span')
  label.className = 'pw-strength-label'

  wrap.appendChild(bars)
  wrap.appendChild(label)

  function update(password) {
    if (!password) {
      wrap.style.display = 'none'
      segments.forEach((s) => {
        s.style.background = ''
      })
      return
    }
    wrap.style.display = 'flex'
    const score = passwordStrength(password)
    const meta = strengthMeta(score)
    const filled = Math.min(4, Math.ceil((score / 5) * 4))
    segments.forEach((s, i) => {
      s.style.background = i < filled ? meta.color : ''
    })
    label.textContent = meta.label
    label.style.color = meta.color
  }

  return { el: wrap, update }
}

export { passwordStrengthIndicator, passwordStrength }
