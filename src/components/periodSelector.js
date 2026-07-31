const PERIODS = [
  { value: 'week', label: 'Settimana' },
  { value: 'month', label: 'Mese' },
  { value: 'quarter', label: '3 Mesi' },
]

function periodSelector({ active, onChange }) {
  const wrap = document.createElement('div')
  wrap.className = 'period-tabs'
  wrap.setAttribute('role', 'tablist')

  PERIODS.forEach((p) => {
    const btn = document.createElement('button')
    btn.className = 'period-tab' + (active === p.value ? ' active' : '')
    btn.setAttribute('role', 'tab')
    btn.setAttribute('aria-selected', String(active === p.value))
    btn.textContent = p.label
    btn.addEventListener('click', () => onChange(p.value))
    wrap.appendChild(btn)
  })

  return wrap
}

export { periodSelector }
