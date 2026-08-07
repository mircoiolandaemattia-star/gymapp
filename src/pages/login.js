import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { Dumbbell, Mail, Lock, Loader } from 'lucide'
import { login as doLogin } from '/src/utils/auth.js'
import { authInput } from '/src/components/authInput.js'

function authLogo() {
  const logo = document.createElement('div')
  logo.className = 'auth-logo'
  const iconBox = document.createElement('div')
  iconBox.className = 'auth-logo-icon'
  iconBox.appendChild(createIcon(Dumbbell, 26, 1.5))
  logo.appendChild(iconBox)
  const name = document.createElement('span')
  name.className = 'auth-logo-name'
  name.textContent = 'FitTrack'
  logo.appendChild(name)
  return logo
}

function render() {
  const section = document.createElement('section')
  section.className = 'page login-page'

  section.appendChild(authLogo())

  const form = document.createElement('form')
  form.className = 'auth-form'
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    submit()
  })

  const hTitle = document.createElement('h1')
  hTitle.className = 'auth-title'
  hTitle.textContent = 'Bentornato'
  form.appendChild(hTitle)
  const hSub = document.createElement('p')
  hSub.className = 'auth-subtitle'
  hSub.textContent = 'Accedi a FitTrack'
  form.appendChild(hSub)

  const email = authInput({
    type: 'email',
    id: 'login-email',
    label: 'Email',
    placeholder: 'mario@example.com',
    icon: Mail,
    autocomplete: 'email',
  })
  form.appendChild(email.el)

  const password = authInput({
    type: 'password',
    id: 'login-password',
    label: 'Password',
    placeholder: '••••••••',
    icon: Lock,
    autocomplete: 'current-password',
  })
  form.appendChild(password.el)

  const forgotRow = document.createElement('div')
  forgotRow.className = 'auth-forgot-row'
  const forgotBtn = document.createElement('button')
  forgotBtn.type = 'button'
  forgotBtn.className = 'auth-forgot'
  forgotBtn.textContent = 'Password dimenticata?'
  forgotBtn.addEventListener('click', () => alert('Reset password (demo)'))
  forgotRow.appendChild(forgotBtn)
  form.appendChild(forgotRow)

  const errorBox = document.createElement('div')
  errorBox.className = 'auth-error'
  errorBox.setAttribute('role', 'alert')
  errorBox.hidden = true
  form.appendChild(errorBox)

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

  function submit() {
    email.setError()
    password.setError()
    errorBox.textContent = ''
    errorBox.hidden = true

    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true
    btn.classList.add('btn-loading')
    btn.appendChild(createIcon(Loader, 16, 2))

    doLogin(email.getValue(), password.getValue())
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        email.setError()
        password.setError()
        errorBox.textContent = err.message || 'Email o password errati'
        errorBox.hidden = false
      })
      .finally(() => {
        btn.disabled = false
        btn.classList.remove('btn-loading')
        btn.querySelector('svg')?.remove()
      })
  }

  section.appendChild(form)
  return section
}

export { render }
export default render
