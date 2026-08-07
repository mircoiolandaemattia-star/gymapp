import { storage } from '/src/utils/storage.js'
import { apiFetch } from '/src/utils/api.js'

const KEYS = {
  auth: 'ft_auth',
  firstAccess: 'ft_first_access',
  user: 'ft_user',
}

export const goalToApi = { dimagrire: 'lose', mantenere: 'maintain', massa: 'gain' }
export const activityToApi = {
  sedentario: 'sedentary',
  leggero: 'light',
  moderato: 'moderate',
  attivo: 'active',
  molto_attivo: 'very_active',
}
export const apiToGoal = Object.fromEntries(Object.entries(goalToApi).map(([k, v]) => [v, k]))
export const apiToActivity = Object.fromEntries(Object.entries(activityToApi).map(([k, v]) => [v, k]))
export const sexToApi = { M: 'male', F: 'female', O: 'other' }
export const apiToSex = { male: 'M', female: 'F', other: 'O' }

async function saveSession({ token, user }) {
  storage.set(KEYS.auth, true)
  storage.set(KEYS.user, user)
  if (token) storage.set('ft_token', token)
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  await saveSession(data)
  return data.user
}

export async function register(name, email, password) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  await saveSession(data)
  storage.set(KEYS.firstAccess, true)
  return data.user
}

export async function refreshUser() {
  const data = await apiFetch('/user/me')
  storage.set(KEYS.user, data.user)
  return data.user
}

export function logout() {
  storage.remove(KEYS.auth)
  storage.remove('ft_token')
  storage.remove(KEYS.user)
  window.location.href = '/login'
}

export function isAuthenticated() {
  return Boolean(storage.get('ft_token'))
}

export function isFirstAccess() {
  return storage.get(KEYS.firstAccess) !== false
}

export function completeOnboarding() {
  storage.set(KEYS.firstAccess, false)
}

export function setUser(user) {
  storage.set(KEYS.user, user)
}

export function getUser() {
  return storage.get(KEYS.user) || {}
}
