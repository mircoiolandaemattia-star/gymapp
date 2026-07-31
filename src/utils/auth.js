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
  if (
    String(email).trim().toLowerCase() === MOCK_USER.email &&
    String(password) === MOCK_USER.password
  ) {
    storage.set(KEYS.auth, true)
    storage.set(KEYS.firstAccess, true)
    storage.set(KEYS.user, { name: MOCK_USER.name, email: MOCK_USER.email })
    return true
  }
  return false
}

function register(name, email) {
  storage.set(KEYS.user, { name, email })
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
