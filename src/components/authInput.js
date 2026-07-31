import { createIcon } from '/src/utils/icons.js'
import { Eye, EyeOff } from 'lucide'

function authInput({ type, id, label, placeholder, icon, autocomplete }) {
  const group = document.createElement('div')
  group.className = 'input-group auth-input'

  const lbl = document.createElement('label')
  lbl.setAttribute('for', id)
  lbl.textContent = label
  group.appendChild(lbl)

  const wrap = document.createElement('div')
  wrap.className = 'auth-input-wrap'

  const input = document.createElement('input')
  input.type = type
  input.id = id
  input.className = 'input'
  input.placeholder = placeholder
  if (autocomplete) input.autocomplete = autocomplete

  const leftIcon = createIcon(icon, 18, 2)
  leftIcon.setAttribute('class', 'auth-input-icon')
  wrap.appendChild(leftIcon)
  wrap.appendChild(input)

  if (type === 'password') {
    const eyeBtn = document.createElement('button')
    eyeBtn.type = 'button'
    eyeBtn.className = 'password-eye-btn'
    eyeBtn.setAttribute('aria-label', 'Mostra password')
    eyeBtn.appendChild(createIcon(Eye, 18, 2))
    eyeBtn.addEventListener('click', () => {
      const show = input.type === 'password'
      input.type = show ? 'text' : 'password'
      eyeBtn.innerHTML = ''
      eyeBtn.appendChild(createIcon(show ? EyeOff : Eye, 18, 2))
      eyeBtn.setAttribute('aria-label', show ? 'Nascondi password' : 'Mostra password')
      input.focus()
    })
    wrap.appendChild(eyeBtn)
    input.classList.add('input-with-eye')
  }

  const errorMsg = document.createElement('p')
  errorMsg.className = 'auth-input-error'
  errorMsg.setAttribute('role', 'alert')
  group.appendChild(wrap)
  group.appendChild(errorMsg)

  input.addEventListener('input', () => setError())

  function setError(msg) {
    if (msg) {
      group.classList.add('has-error')
      errorMsg.textContent = msg
    } else {
      group.classList.remove('has-error')
      errorMsg.textContent = ''
    }
  }

  return {
    el: group,
    input,
    setError,
    getValue: () => input.value,
  }
}

export { authInput }
