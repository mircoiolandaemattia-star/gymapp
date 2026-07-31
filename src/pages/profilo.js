import { createIcon } from '/src/utils/icons.js'
import { LogOut } from 'lucide'
import { navigate } from '/src/utils/router.js'
import { calculateCalories } from '/src/utils/calorieCalculator.js'
import { storage } from '/src/utils/storage.js'
import { logout as doLogout, getUser } from '/src/utils/auth.js'
import { profileData } from '/src/mock/profileData.js'
import { profileHeader } from '/src/components/profileHeader.js'
import { personalDataCard } from '/src/components/personalDataCard.js'
import { goalSelector } from '/src/components/goalSelector.js'
import { activityLevelSelector } from '/src/components/activityLevelSelector.js'
import { reminderCard } from '/src/components/reminderCard.js'
import { addReminderModal } from '/src/components/addReminderModal.js'
import { settingsCard } from '/src/components/settingsCard.js'
import { subscriptionCard } from '/src/components/subscriptionCard.js'
import { logoutConfirmModal } from '/src/components/logoutConfirmModal.js'

const KEYS = {
  theme: 'ft_theme',
  notifications: 'ft_notifications',
  reminders: 'ft_reminders',
  plan: 'ft_plan',
  profile: 'ft_profile',
}

let user = syncUser()
let goal = storage.get(KEYS.profile)?.goal || profileData.goal
let activity = storage.get(KEYS.profile)?.activity || profileData.activity
let reminders = (storage.get(KEYS.reminders) || profileData.reminders).map((r) => ({ ...r }))
let plan = loadPlan()
let notifications = storage.get(KEYS.notifications) !== false
let darkMode = storage.get(KEYS.theme) !== 'light'
let editingData = false
let currentSection = null

function syncUser() {
  const authUser = getUser()
  const saved = storage.get(KEYS.profile) || {}
  return {
    ...profileData.user,
    ...saved,
    name: authUser.name,
    email: authUser.email,
  }
}

function loadPlan() {
  const stored = storage.get(KEYS.plan)
  if (stored && stored.tier) return stored
  return { tier: 'free' }
}

function persistPlan() {
  storage.set(KEYS.plan, plan)
}

function persistReminders() {
  storage.set(KEYS.reminders, reminders)
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
  return Math.round(result.calories / 10) * 10
}

function applyTheme() {
  document.documentElement.classList.toggle('light', !darkMode)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', darkMode ? '#0f172a' : '#f1f5f9')
}

applyTheme()

function render() {
  const section = buildSection()
  if (currentSection && currentSection.isConnected) {
    currentSection.replaceWith(section)
  }
  currentSection = section
  return section
}

function buildSection() {
  const authUser = getUser()
  if (!user || authUser.email !== user.email) {
    user = syncUser()
  }
  const section = document.createElement('section')
  section.className = 'page profilo-page'

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

  section.appendChild(profileHeader({ name: user.name, email: user.email, plan }))

  section.appendChild(personalDataCard({
    data: user,
    editing: editingData,
    onEdit: () => {
      editingData = true
      render()
    },
    onSave: (data) => {
      user = { ...user, ...data }
      editingData = false
      render()
    },
    onCancel: () => {
      editingData = false
      render()
    },
  }))

  section.appendChild(goalSelector({
    active: goal,
    calories: computeCalories(),
    onChange: (v) => {
      goal = v
      render()
    },
  }))

  section.appendChild(activityLevelSelector({
    active: activity,
    onChange: (v) => {
      activity = v
      render()
    },
  }))

  section.appendChild(reminderCard({
    reminders,
    onAdd: () => openAddReminder(),
    onToggle: (id) => {
      const r = reminders.find((x) => x.id === id)
      if (r) {
        r.enabled = !r.enabled
        persistReminders()
        render()
      }
    },
    onRemove: (id) => {
      reminders = reminders.filter((x) => x.id !== id)
      persistReminders()
      render()
    },
  }))

  section.appendChild(settingsCard({
    darkMode,
    notifications,
    onToggleTheme: () => {
      darkMode = !darkMode
      storage.set(KEYS.theme, darkMode ? 'dark' : 'light')
      applyTheme()
      render()
    },
    onToggleNotifications: () => {
      notifications = !notifications
      storage.set(KEYS.notifications, notifications)
      render()
    },
    onLanguage: () => alert('Preferenza lingua (demo)'),
  }))

  section.appendChild(subscriptionCard({
    plan,
    onTrial: () => {
      plan = { tier: 'trial', trialEnd: new Date(Date.now() + 30 * 86400000).toISOString() }
      persistPlan()
      render()
    },
    onUpgrade: () => {
      plan = { tier: 'premium', renewDate: new Date(Date.now() + 365 * 86400000).toISOString() }
      persistPlan()
      render()
    },
    onCancel: () => {
      plan = { tier: 'free' }
      persistPlan()
      render()
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

  return section
}

function openAddReminder() {
  addReminderModal({
    onSave: (r) => {
      reminders = [...reminders, r]
      persistReminders()
      render()
    },
  })
}

export { render }
export default render
