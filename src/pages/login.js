import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { Mail, Lock } from 'lucide'

function render() {
  const section = document.createElement('section')
  section.className = 'page login-page'

  const form = document.createElement('form')
  form.className = 'auth-form'
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    navigate('/')
  })

  form.innerHTML = `
    <h1 class="auth-title">Benvenuto</h1>
    <p class="auth-subtitle">Accedi a FitTrack</p>
  `

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
  submitBtn.textContent = 'Accedi'
  form.appendChild(submitBtn)

  const link = document.createElement('p')
  link.className = 'auth-link'
  link.innerHTML = 'Non hai un account? <a href="#" id="register-link">Registrati</a>'
  form.appendChild(link)

  form.querySelector('#register-link').addEventListener('click', (e) => {
    e.preventDefault()
    navigate('/register')
  })

  section.appendChild(form)
  return section
}

export { render }
export default render
