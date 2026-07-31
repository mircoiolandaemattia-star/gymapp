import { createIcon } from '/src/utils/icons.js'
import { Info, Crown } from 'lucide'
import { navigate } from '/src/utils/router.js'

function freeLimitBanner({ used, max, onClose }) {
  const wrap = document.createElement('div')
  wrap.className = 'free-limit'

  const iconBox = document.createElement('div')
  iconBox.className = 'free-limit-icon'
  iconBox.appendChild(createIcon(Info, 24, 2))
  wrap.appendChild(iconBox)

  const title = document.createElement('h4')
  title.className = 'free-limit-title'
  title.textContent = `Hai raggiunto il limite giornaliero di analisi foto (${used}/${max})`
  wrap.appendChild(title)

  const text = document.createElement('p')
  text.className = 'free-limit-text'
  text.textContent = 'Passa a Premium per foto illimitate'
  wrap.appendChild(text)

  const btn = document.createElement('button')
  btn.className = 'btn btn-primary'
  btn.appendChild(createIcon(Crown, 16, 2))
  const btnLabel = document.createElement('span')
  btnLabel.textContent = 'Passa a Premium'
  btn.appendChild(btnLabel)
  btn.addEventListener('click', () => {
    if (onClose) onClose()
    navigate('/profilo')
  })
  wrap.appendChild(btn)

  return wrap
}

export { freeLimitBanner }
