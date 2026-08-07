import { storage } from '/src/utils/storage.js'

export const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000/api'

const TOKEN_KEY = 'ft_token'

export function getToken() {
  return storage.get(TOKEN_KEY)
}

export function setToken(token) {
  storage.set(TOKEN_KEY, token)
}

function clearAuth() {
  storage.remove('ft_token')
  storage.remove('ft_auth')
  storage.remove('ft_user')
}

function isAuthPath() {
  const path = window.location.pathname
  return path === '/login' || path === '/register'
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  } catch {
    throw new Error('Impossibile connettersi al server, verifica la connessione')
  }

  if (res.status === 401) {
    let data = null
    try {
      const text = await res.text()
      data = text ? JSON.parse(text) : null
    } catch {
      /* ignore */
    }
    if (token && !isAuthPath()) {
      clearAuth()
      window.location.href = '/login'
    }
    throw new Error((data && data.error) || 'Non autorizzato')
  }

  if (res.status === 204) return null

  let data = null
  try {
    const text = await res.text()
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Errore (${res.status})`)
  }

  return data
}
