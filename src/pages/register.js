import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { Dumbbell, User, Mail, Lock, Loader, X } from 'lucide'
import { register as doRegister } from '/src/utils/auth.js'
import { authInput } from '/src/components/authInput.js'
import { passwordStrengthIndicator } from '/src/components/passwordStrengthIndicator.js'

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).+$/

const TERMS_TEXT =
  'Accettando i termini e le condizioni confermi di aver letto e compreso le informazioni sull’utilizzo di FitTrack. ' +
  'Le schede di allenamento e i piani alimentari generati hanno scopo puramente informativo e non sostituiscono il parere ' +
  'di un medico, nutrizionista o personal trainer certificato. Prima di iniziare qualsiasi programma, specialmente in caso ' +
  'di patologie pregresse, consulta un professionista qualificato. L’uso dell’app è a tuo rischio. I dati inseriti vengono ' +
  'salvati e trattati per personalizzare la tua esperienza.'

function showTermsModal() {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Termini e condizioni'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'
  const text = document.createElement('p')
  text.className = 'terms-text'
  text.textContent = TERMS_TEXT
  body.appendChild(text)
  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const okBtn = document.createElement('button')
  okBtn.className = 'btn btn-primary btn-full'
  okBtn.textContent = 'Ho capito'
  okBtn.addEventListener('click', () => {
    const checkbox = document.getElementById('reg-terms')
    if (checkbox) checkbox.checked = true
    checkbox.dispatchEvent(new Event('change'))
    close()
  })
  footer.appendChild(okBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

function render() {
  const section = document.createElement('section')
  section.className = 'page register-page'

  section.appendChild(authLogo())

  const form = document.createElement('form')
  form.className = 'auth-form'
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!submitBtn.disabled) submit()
  })

  const hTitle = document.createElement('h1')
  hTitle.className = 'auth-title'
  hTitle.textContent = 'Crea Account'
  form.appendChild(hTitle)
  const hSub = document.createElement('p')
  hSub.className = 'auth-subtitle'
  hSub.textContent = 'Inizia il tuo percorso'
  form.appendChild(hSub)

  const name = authInput({
    type: 'text',
    id: 'reg-name',
    label: 'Nome completo',
    placeholder: 'Mario Rossi',
    icon: User,
    autocomplete: 'name',
  })
  form.appendChild(name.el)

  const email = authInput({
    type: 'email',
    id: 'reg-email',
    label: 'Email',
    placeholder: 'mario@example.com',
    icon: Mail,
    autocomplete: 'email',
  })
  form.appendChild(email.el)

  const password = authInput({
    type: 'password',
    id: 'reg-password',
    label: 'Password',
    placeholder: 'Crea una password',
    icon: Lock,
    autocomplete: 'new-password',
  })
  form.appendChild(password.el)

  const strength = passwordStrengthIndicator()
  form.appendChild(strength.el)

  const confirm = authInput({
    type: 'password',
    id: 'reg-confirm',
    label: 'Conferma password',
    placeholder: 'Ripeti la password',
    icon: Lock,
    autocomplete: 'new-password',
  })
  form.appendChild(confirm.el)

  const termsRow = document.createElement('div')
  termsRow.className = 'auth-checkbox-row'
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'reg-terms'
  const termsLabel = document.createElement('label')
  termsLabel.setAttribute('for', 'reg-terms')
  termsLabel.innerHTML = 'Accetto i <a href="#" id="terms-link">termini e condizioni</a>'
  termsRow.appendChild(checkbox)
  termsRow.appendChild(termsLabel)
  form.appendChild(termsRow)

  termsRow.querySelector('#terms-link').addEventListener('click', (e) => {
    e.preventDefault()
    showTermsModal()
  })

  const submitBtn = document.createElement('button')
  submitBtn.type = 'submit'
  submitBtn.className = 'btn btn-primary btn-full'
  submitBtn.textContent = 'Registrati'
  submitBtn.disabled = true
  form.appendChild(submitBtn)

  const link = document.createElement('p')
  link.className = 'auth-link'
  link.innerHTML = 'Hai già un account? <a href="#" id="login-link">Accedi</a>'
  form.appendChild(link)

  const errorBox = document.createElement('div')
  errorBox.className = 'auth-error'
  errorBox.setAttribute('role', 'alert')
  errorBox.hidden = true
  form.appendChild(errorBox)

  form.querySelector('#login-link').addEventListener('click', (e) => {
    e.preventDefault()
    navigate('/login')
  })

  name.input.addEventListener('input', validate)
  email.input.addEventListener('input', () => {
    if (email.getValue().trim() && !EMAIL_RE.test(email.getValue().trim())) {
      email.setError('Inserisci un email valida')
    } else {
      email.setError()
    }
    validate()
  })
  password.input.addEventListener('input', () => {
    strength.update(password.getValue())
    if (password.getValue() && password.getValue().length < 8) {
      password.setError('Minimo 8 caratteri')
    } else if (password.getValue() && !PASSWORD_RE.test(password.getValue())) {
      password.setError('Servono almeno una lettera e un numero')
    } else {
      password.setError()
    }
    if (confirm.getValue() && confirm.getValue() !== password.getValue()) {
      confirm.setError('Le password non coincidono')
    } else {
      confirm.setError()
    }
    validate()
  })
  confirm.input.addEventListener('input', () => {
    if (confirm.getValue() && confirm.getValue() !== password.getValue()) {
      confirm.setError('Le password non coincidono')
    } else {
      confirm.setError()
    }
    validate()
  })
  checkbox.addEventListener('change', validate)

  function validate() {
    const valid =
      Boolean(name.getValue().trim()) &&
      EMAIL_RE.test(email.getValue().trim()) &&
      password.getValue().length >= 8 &&
      PASSWORD_RE.test(password.getValue()) &&
      confirm.getValue() === password.getValue() &&
      checkbox.checked
    submitBtn.disabled = !valid
  }

  function submit() {
    errorBox.textContent = ''
    errorBox.hidden = true
    submitBtn.disabled = true
    submitBtn.classList.add('btn-loading')
    submitBtn.appendChild(createIcon(Loader, 16, 2))

    doRegister(name.getValue().trim(), email.getValue().trim(), password.getValue())
      .then(() => {
        navigate('/onboarding')
      })
      .catch((err) => {
        errorBox.textContent = err.message || 'Registrazione non riuscita'
        errorBox.hidden = false
      })
      .finally(() => {
        submitBtn.disabled = false
        submitBtn.classList.remove('btn-loading')
        submitBtn.querySelector('svg')?.remove()
        validate()
      })
  }

  section.appendChild(form)
  return section
}

export { render }
export default render
