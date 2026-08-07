import { createIcon } from '/src/utils/icons.js'
import { Info, Crown } from 'lucide'
import { navigate } from '/src/utils/router.js'

function aiErrorBox({ message, onClose }) {
  const isPremium = /premium|riservata/i.test(message)
  const isLimit = /limite/i.test(message)

  const wrap = document.createElement('div')
  wrap.className = 'free-limit'

  const iconBox = document.createElement('div')
  iconBox.className = 'free-limit-icon'
  iconBox.appendChild(createIcon(isPremium ? Crown : Info, 24, 2))
  wrap.appendChild(iconBox)

  const title = document.createElement('h4')
  title.className = 'free-limit-title'
  title.textContent = isPremium ? 'Funzione riservata ai Premium' : isLimit ? 'Limite giornaliero raggiunto' : 'Errore'
  wrap.appendChild(title)

  const text = document.createElement('p')
  text.className = 'free-limit-text'
  text.textContent = message
  wrap.appendChild(text)

  const btn = document.createElement('button')
  btn.className = 'btn btn-primary'
  btn.appendChild(createIcon(Crown, 16, 2))
  const btnLabel = document.createElement('span')
  btnLabel.textContent = isPremium || isLimit ? 'Vai al Profilo' : 'Riprova'
  btn.appendChild(btnLabel)
  btn.addEventListener('click', () => {
    if (onClose) onClose()
    navigate('/profilo')
  })
  wrap.appendChild(btn)

  return wrap
}

export { aiErrorBox }
