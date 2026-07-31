import { storage } from '/src/utils/storage.js'

const KEYS = {
  auth: 'ft_auth',
  firstAccess: 'ft_first_access',
  user: 'ft_user',
}

const MOCK_USER = {
  name: 'Mario Rossi',
  email: 'mario@example.com',
  password: 'mario123',
}

function login(email, password) {
  const stored = storage.get(KEYS.user)
  const match = [stored, MOCK_USER].filter(Boolean).find((u) => {
    return (
      String(email).trim().toLowerCase() === String(u.email).toLowerCase() &&
      String(password) === String(u.password)
    )
  })
  if (match) {
    storage.set(KEYS.auth, true)
    storage.set(KEYS.firstAccess, true)
    storage.set(KEYS.user, { name: match.name, email: match.email, password: match.password })
    return true
  }
  return false
}

function register(name, email, password) {
  storage.set(KEYS.user, { name, email, password })
  storage.set(KEYS.auth, true)
  storage.set(KEYS.firstAccess, true)
  return true
}

function logout() {
  storage.remove(KEYS.auth)
}

function isAuthenticated() {
  return storage.get(KEYS.auth) === true
}

function isFirstAccess() {
  return storage.get(KEYS.firstAccess) !== false
}

function completeOnboarding() {
  storage.set(KEYS.firstAccess, false)
}

function getUser() {
  return storage.get(KEYS.user) || { name: MOCK_USER.name, email: MOCK_USER.email }
}

export { login, register, logout, isAuthenticated, isFirstAccess, completeOnboarding, getUser }
