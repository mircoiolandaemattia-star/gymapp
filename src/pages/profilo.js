import { createIcon } from '/src/utils/icons.js'
import { LogOut } from 'lucide'
import { navigate } from '/src/utils/router.js'
import { calculateCalories } from '/src/utils/calorieCalculator.js'
import { storage } from '/src/utils/storage.js'
import {
  logout as doLogout,
  getUser,
  refreshUser,
  setUser,
  apiToGoal,
  apiToActivity,
  apiToSex,
  goalToApi,
  activityToApi,
  sexToApi,
} from '/src/utils/auth.js'
import { apiFetch } from '/src/utils/api.js'
import { profileHeader } from '/src/components/profileHeader.js'
import { personalDataCard } from '/src/components/personalDataCard.js'
import { goalSelector } from '/src/components/goalSelector.js'
import { activityLevelSelector } from '/src/components/activityLevelSelector.js'
import { reminderCard } from '/src/components/reminderCard.js'
import { addReminderModal } from '/src/components/addReminderModal.js'
import { settingsCard } from '/src/components/settingsCard.js'
import { subscriptionCard } from '/src/components/subscriptionCard.js'
import { logoutConfirmModal } from '/src/components/logoutConfirmModal.js'
import { loadingEl, errorEl } from '/src/utils/ui.js'

const KEYS = {
  theme: 'ft_theme',
  notifications: 'ft_notifications',
  plan: 'ft_plan',
  profile: 'ft_profile',
}

let section = null
let user = {}
let goal = 'mantenere'
let activity = 'moderato'
let reminders = []
let notifications = storage.get(KEYS.notifications) !== false
let darkMode = storage.get(KEYS.theme) !== 'light'
let editingData = false
let loaded = false
let loading = false
let loadError = null

function userToProfile(u) {
  return {
    name: u.name,
    email: u.email,
    eta: u.age,
    peso: u.weightKg,
    altezza: u.heightCm,
    sesso: apiToSex[u.gender] || 'M',
    dailyCalories: u.dailyCalories,
  }
}

function syncUser() {
  const saved = storage.get(KEYS.profile) || {}
  const u = getUser()
  const mapped = userToProfile(u)
  return {
    name: mapped.name || saved.name || '',
    email: mapped.email || saved.email || '',
    eta: mapped.eta ?? saved.eta ?? 30,
    peso: mapped.peso ?? saved.peso ?? 70,
    altezza: mapped.altezza ?? saved.altezza ?? 170,
    sesso: mapped.sesso || saved.sesso || 'M',
    dailyCalories: mapped.dailyCalories,
  }
}

function loadPlan() {
  const u = getUser()
  if (u.isPremium) return { tier: 'premium' }
  if (u.isTrial && u.trialEndsAt && new Date(u.trialEndsAt) > new Date()) {
    return { tier: 'trial', trialEnd: u.trialEndsAt }
  }
  return { tier: 'free', hasTrial: Boolean(u.trialEndsAt) }
}

function syncGoalActivity() {
  const u = getUser()
  goal = apiToGoal[u.goal] || storage.get(KEYS.profile)?.goal || 'mantenere'
  activity = apiToActivity[u.activityLevel] || storage.get(KEYS.profile)?.activity || 'moderato'
}

function computeCalories() {
  const result = calculateCalories({
    sex: user.sesso,
    weightKg: Number(user.peso),
    heightCm: Number(user.altezza),
    age: Number(user.eta),
    activity,
    goal,
  })
  return Math.round(result.calories)
}

function persistNutrition() {
  const result = calculateCalories({
    sex: user.sesso,
    weightKg: Number(user.peso),
    heightCm: Number(user.altezza),
    age: Number(user.eta),
    activity,
    goal,
  })
  storage.set(KEYS.profile, {
    ...(storage.get(KEYS.profile) || {}),
    name: user.name,
    eta: Number(user.eta),
    sesso: user.sesso,
    peso: Number(user.peso),
    altezza: Number(user.altezza),
    goal,
    activity,
    calories: Math.round(result.calories),
    macros: result.macros,
    updatedAt: new Date().toISOString(),
  })
}

function applyTheme() {
  document.documentElement.classList.toggle('light', !darkMode)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', darkMode ? '#0f172a' : '#f1f5f9')
}

applyTheme()

function render() {
  if (!section) {
    section = document.createElement('section')
    section.className = 'page profilo-page'
  }
  refresh()
  return section
}

function refresh() {
  if (!section) return
  if (!loaded && !loading) {
    load()
  } else {
    paint()
  }
}

async function load() {
  if (loading) return
  const sec = section
  if (!sec) return
  loading = true
  loadError = null
  paint()
  try {
    await refreshUser()
    const rData = await apiFetch('/reminders')
    reminders = (rData.reminders || []).map(mapApiReminder)
    loaded = true
  } catch (err) {
    loadError = err.message
  }
  loading = false
  if (section === sec) paint()
}

function mapApiReminder(r) {
  const iso = new Date(r.time)
  const time = String(r.time).slice(11, 16)
  return {
    id: r.id,
    time: time || `${String(iso.getHours()).padStart(2, '0')}:${String(iso.getMinutes()).padStart(2, '0')}`,
    label: r.message || 'Promemoria',
    enabled: r.isActive,
  }
}

function paint() {
  if (!section) return
  section.innerHTML = ''

  user = syncUser()
  syncGoalActivity()

  const header = document.createElement('div')
  header.className = 'page-header'
  const hTitle = document.createElement('h1')
  hTitle.className = 'page-title'
  hTitle.textContent = 'Profilo'
  header.appendChild(hTitle)
  const hSub = document.createElement('p')
  hSub.className = 'page-subtitle'
  hSub.textContent = 'Le tue impostazioni'
  header.appendChild(hSub)
  section.appendChild(header)

  if (!loaded) {
    section.appendChild(loadingEl('Caricamento profilo...'))
    return
  }

  if (loadError) {
    const errCard = errorEl(loadError)
    errCard.retry.addEventListener('click', () => {
      loaded = false
      refresh()
    })
    section.appendChild(errCard.el)
  }

  section.appendChild(profileHeader({ name: user.name, email: user.email, plan: loadPlan() }))

  section.appendChild(personalDataCard({
    data: user,
    editing: editingData,
    onEdit: () => {
      editingData = true
      paint()
    },
    onSave: async (data) => {
      try {
        const res = await apiFetch('/user/me', {
          method: 'PUT',
          body: JSON.stringify({
            age: Number(data.eta),
            weightKg: Number(data.peso),
            heightCm: Number(data.altezza),
            gender: sexToApi[data.sesso] || 'male',
          }),
        })
        setUser(res.user)
        await refreshUser()
        user = { ...user, ...data, dailyCalories: res.user.dailyCalories }
        editingData = false
        persistNutrition()
        paint()
      } catch (err) {
        alert(err.message || 'Errore nel salvataggio dei dati')
      }
    },
    onCancel: () => {
      editingData = false
      paint()
    },
  }))

  section.appendChild(goalSelector({
    active: goal,
    calories: user.dailyCalories || computeCalories(),
    onChange: async (v) => {
      goal = v
      try {
        const res = await apiFetch('/user/me', {
          method: 'PUT',
          body: JSON.stringify({ goal: goalToApi[v] || 'maintain' }),
        })
        setUser(res.user)
        await refreshUser()
      } catch (err) {
        alert(err.message || 'Errore nel salvataggio dell\'obiettivo')
      }
      persistNutrition()
      paint()
    },
  }))

  section.appendChild(activityLevelSelector({
    active: activity,
    onChange: async (v) => {
      activity = v
      try {
        const res = await apiFetch('/user/me', {
          method: 'PUT',
          body: JSON.stringify({ activityLevel: activityToApi[v] || 'moderate' }),
        })
        setUser(res.user)
        await refreshUser()
      } catch (err) {
        alert(err.message || 'Errore nel salvataggio del livello di attività')
      }
      persistNutrition()
      paint()
    },
  }))

  section.appendChild(reminderCard({
    reminders,
    onAdd: () => openAddReminder(),
    onToggle: async (id) => {
      const r = reminders.find((x) => x.id === id)
      if (!r) return
      try {
        await apiFetch(`/reminders/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive: !r.enabled }),
        })
        r.enabled = !r.enabled
        paint()
      } catch (err) {
        alert(err.message || 'Errore nell\'aggiornamento del promemoria')
      }
    },
    onRemove: async (id) => {
      try {
        await apiFetch(`/reminders/${id}`, { method: 'DELETE' })
        reminders = reminders.filter((x) => x.id !== id)
        paint()
      } catch (err) {
        alert(err.message || 'Errore nell\'eliminazione del promemoria')
      }
    },
  }))

  section.appendChild(settingsCard({
    darkMode,
    notifications,
    onToggleTheme: () => {
      darkMode = !darkMode
      storage.set(KEYS.theme, darkMode ? 'dark' : 'light')
      applyTheme()
      paint()
    },
    onToggleNotifications: () => {
      notifications = !notifications
      storage.set(KEYS.notifications, notifications)
      paint()
    },
    onLanguage: () => alert('Preferenza lingua (demo)'),
  }))

  section.appendChild(subscriptionCard({
    plan: loadPlan(),
    onTrial: async () => {
      try {
        const res = await apiFetch('/user/start-trial', { method: 'POST' })
        setUser(res.user)
        await refreshUser()
        paint()
      } catch (err) {
        alert(err.message || 'Errore nell\'avvio della prova gratuita')
      }
    },
    onUpgrade: async () => {
      try {
        const res = await apiFetch('/user/me', {
          method: 'PUT',
          body: JSON.stringify({ isPremium: true }),
        })
        setUser(res.user)
        await refreshUser()
        paint()
      } catch (err) {
        alert(err.message || 'Errore nel passaggio a Premium')
      }
    },
    onCancel: async () => {
      const current = getUser()
      const body = current.isPremium ? { isPremium: false } : { isTrial: false }
      try {
        const res = await apiFetch('/user/me', {
          method: 'PUT',
          body: JSON.stringify(body),
        })
        setUser(res.user)
        await refreshUser()
        paint()
      } catch (err) {
        alert(err.message || 'Errore nella modifica dell\'abbonamento')
      }
    },
  }))

  const logoutBtn = document.createElement('button')
  logoutBtn.className = 'btn btn-error btn-full logout-btn'
  logoutBtn.appendChild(createIcon(LogOut, 18, 2))
  const logSpan = document.createElement('span')
  logSpan.textContent = 'Esci'
  logoutBtn.appendChild(logSpan)
  logoutBtn.addEventListener('click', () => {
    logoutConfirmModal({
      onConfirm: () => {
        doLogout()
        navigate('/login')
      },
    })
  })
  section.appendChild(logoutBtn)
}

function openAddReminder() {
  addReminderModal({
    onSave: async (r) => {
      try {
        const res = await apiFetch('/reminders', {
          method: 'POST',
          body: JSON.stringify({
            type: 'custom',
            time: r.time,
            message: r.label,
            daysOfWeek: [],
            isActive: true,
          }),
        })
        reminders = [...reminders, mapApiReminder(res.reminder)]
        paint()
      } catch (err) {
        alert(err.message || 'Errore nella creazione del promemoria')
      }
    },
  })
}

export { render }
export default render