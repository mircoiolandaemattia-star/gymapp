import { createIcon } from '/src/utils/icons.js'
import { User } from 'lucide'
import { getUser, refreshUser } from '/src/utils/auth.js'
import { apiFetch } from '/src/utils/api.js'
import { navigate } from '/src/utils/router.js'
import { getNutritionTargets } from '/src/utils/nutritionTargets.js'
import { calorieRing } from '/src/components/calorieRing.js'
import { workoutTodayCard } from '/src/components/workoutTodayCard.js'
import { quickStats } from '/src/components/quickStats.js'
import { mealsSummaryCard } from '/src/components/mealsSummaryCard.js'
import { loadingEl, errorEl } from '/src/utils/ui.js'

const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

const MEAL_META = {
  colazione: { name: 'Colazione', icon: 'coffee', color: 'var(--warning)' },
  pranzo: { name: 'Pranzo', icon: 'beef', color: 'var(--error)' },
  cena: { name: 'Cena', icon: 'beef', color: 'var(--info)' },
  snack: { name: 'Snack', icon: 'cookie', color: 'var(--accent)' },
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function apiDayOfWeek() {
  return ((new Date().getDay() + 6) % 7) + 1
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buongiorno'
  if (h < 17) return 'Buon pomeriggio'
  return 'Buonasera'
}

function firstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || fullName
}

function todayWorkout(plans) {
  const dayNum = apiDayOfWeek()
  for (const plan of plans || []) {
    for (const day of plan.workoutDays || []) {
      if (day.dayOfWeek === dayNum && !day.isRestDay) return day
    }
  }
  return null
}

function estimateDuration(day) {
  const totalSets = (day.exercises || []).reduce((acc, ex) => acc + (ex.sets || 0), 0)
  return Math.max(20, totalSets * 3)
}

function computeQuickStats(sessions) {
  const totalSessions = sessions.length

  const dates = sessions.map((s) => (s.startedAt ? s.startedAt.slice(0, 10) : null)).filter(Boolean)
  const set = new Set(dates)

  const today = new Date()
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  let streak = 0
  const cursor = new Date(today)
  if (!set.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (set.has(iso(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  let minutesThisWeek = 0
  sessions.forEach((s) => {
    if (s.startedAt && new Date(s.startedAt) >= weekAgo) {
      minutesThisWeek += s.durationMinutes || 0
    }
  })

  return {
    streak,
    hoursThisWeek: Math.round((minutesThisWeek / 60) * 10) / 10,
    totalSessions,
  }
}

function render() {
  const section = document.createElement('section')
  section.className = 'page home-page'

  section.appendChild(loadingEl('Caricamento dati...'))
  load(section)

  return section
}

async function load(section) {
  try {
    const [user, mealsData, plansData, sessionsData] = await Promise.all([
      refreshUser(),
      apiFetch(`/meals?date=${todayIso()}`),
      apiFetch('/workout-plans'),
      apiFetch('/workout-sessions'),
    ])

    renderContent(section, {
      user,
      meals: mealsData.meals || [],
      consumed: mealsData.totals?.calories || 0,
      plans: plansData.workoutPlans || [],
      sessions: sessionsData.workoutSessions || [],
    })
  } catch (err) {
    section.innerHTML = ''
    const errCard = errorEl(err.message)
    errCard.retry.addEventListener('click', () => {
      section.innerHTML = ''
      section.appendChild(loadingEl('Caricamento dati...'))
      load(section)
    })
    section.appendChild(errCard.el)
  }
}

function renderContent(section, { user, meals, consumed, plans, sessions }) {
  section.innerHTML = ''

  const header = document.createElement('div')
  header.className = 'home-header'

  const left = document.createElement('div')
  left.className = 'home-header-left'
  const greet = document.createElement('span')
  greet.className = 'home-greeting'
  greet.textContent = `${greeting()}, ${firstName(user.name)}`
  left.appendChild(greet)
  const date = document.createElement('span')
  date.className = 'home-date'
  const now = new Date()
  date.textContent = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`
  left.appendChild(date)
  header.appendChild(left)

  const userBtn = document.createElement('button')
  userBtn.className = 'home-user-btn'
  userBtn.setAttribute('aria-label', 'Profilo')
  userBtn.appendChild(createIcon(User, 22, 2))
  userBtn.addEventListener('click', () => navigate('/profilo'))
  header.appendChild(userBtn)

  section.appendChild(header)

  const targets = getNutritionTargets()
  section.appendChild(calorieRing({ consumed, target: targets.calories }))

  const day = todayWorkout(plans)
  section.appendChild(
    workoutTodayCard({
      type: day ? 'FORZA' : 'RIPOSO',
      duration: day ? estimateDuration(day) : 0,
      name: day ? (day.name || 'Allenamento') : 'Nessun allenamento oggi',
      exercisesCount: day ? (day.exercises || []).length : 0,
      isRest: !day,
      onStart: day ? () => navigate(`/scheda/allenamento/${day.id}`) : null,
    })
  )

  section.appendChild(quickStats(computeQuickStats(sessions)))

  section.appendChild(
    mealsSummaryCard(
      meals.map((m) => {
        const meta = MEAL_META[m.type] || { name: 'Pasto', icon: 'beef', color: 'var(--text-muted)' }
        return {
          name: meta.name,
          icon: meta.icon,
          calories: m.totalCalories || 0,
          foods: (m.foodItems || []).length,
          time: '',
          color: meta.color,
        }
      })
    )
  )
}

export { render }
export default render
