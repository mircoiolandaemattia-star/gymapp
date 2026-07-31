import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { User, Mail, Lock } from 'lucide'

function render() {
  const section = document.createElement('section')
  section.className = 'page register-page'

  const form = document.createElement('form')
  form.className = 'auth-form'
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    navigate('/onboarding')
  })

  form.innerHTML = `
    <h1 class="auth-title">Crea Account</h1>
    <p class="auth-subtitle">Inizia il tuo percorso</p>
  `

  const nameGroup = document.createElement('div')
  nameGroup.className = 'input-group'
  nameGroup.innerHTML = '<label for="name">Nome</label>'
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.id = 'name'
  nameInput.className = 'input'
  nameInput.placeholder = 'Mario'
  nameInput.required = true
  const nameWrap = document.createElement('div')
  nameWrap.style.cssText = 'position:relative'
  const userIcon = createIcon(User, 18, 2)
  userIcon.style.cssText = 'position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none'
  nameInput.style.paddingLeft = '40px'
  nameWrap.appendChild(userIcon)
  nameWrap.appendChild(nameInput)
  nameGroup.appendChild(nameWrap)
  form.appendChild(nameGroup)

  const emailGroup = document.createElement('div')
  emailGroup.className = 'input-group'
  emailGroup.innerHTML = '<label for="email">Email</label>'
  const emailInput = document.createElement('input')
  emailInput.type = 'email'
  emailInput.id = 'email'
  emailInput.className = 'input'
  emailInput.placeholder = 'mario@email.com'
  emailInput.required = true
  const emailWrap = document.createElement('div')
  emailWrap.style.cssText = 'position:relative'
  const emailIcon = createIcon(Mail, 18, 2)
  emailIcon.style.cssText = 'position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none'
  emailInput.style.paddingLeft = '40px'
  emailWrap.appendChild(emailIcon)
  emailWrap.appendChild(emailInput)
  emailGroup.appendChild(emailWrap)
  form.appendChild(emailGroup)

  const passGroup = document.createElement('div')
  passGroup.className = 'input-group'
  passGroup.innerHTML = '<label for="password">Password</label>'
  const passInput = document.createElement('input')
  passInput.type = 'password'
  passInput.id = 'password'
  passInput.className = 'input'
  passInput.placeholder = 'password'
  passInput.required = true
  const passWrap = document.createElement('div')
  passWrap.style.cssText = 'position:relative'
  const lockIcon = createIcon(Lock, 18, 2)
  lockIcon.style.cssText = 'position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none'
  passInput.style.paddingLeft = '40px'
  passWrap.appendChild(lockIcon)
  passWrap.appendChild(passInput)
  passGroup.appendChild(passWrap)
  form.appendChild(passGroup)

  const submitBtn = document.createElement('button')
  submitBtn.type = 'submit'
  submitBtn.className = 'btn btn-primary btn-full'
  submitBtn.textContent = 'Registrati'
  form.appendChild(submitBtn)

  const link = document.createElement('p')
  link.className = 'auth-link'
  link.innerHTML = 'Hai già un account? <a href="#" id="login-link">Accedi</a>'
  form.appendChild(link)

  form.querySelector('#login-link').addEventListener('click', (e) => {
    e.preventDefault()
    navigate('/login')
  })

  section.appendChild(form)
  return section
}

export { render }
export default render
