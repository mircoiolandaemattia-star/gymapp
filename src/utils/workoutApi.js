import { apiFetch } from '/src/utils/api.js'

export async function fetchWorkoutPlans() {
  const data = await apiFetch('/workout-plans')
  return data.workoutPlans || []
}

export async function saveWorkoutPlan(payload) {
  const data = await apiFetch('/workout-plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.workoutPlan
}

export async function fetchWorkoutSessions() {
  const data = await apiFetch('/workout-sessions')
  return data.workoutSessions || []
}

export async function saveWorkoutSession(payload) {
  const data = await apiFetch('/workout-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.workoutSession
}

export function apiDayToName(dayOfWeek) {
  const names = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
  return names[dayOfWeek] || ''
}

export function estimateDuration(day) {
  const totalSets = (day.exercises || []).reduce((acc, ex) => acc + (ex.sets || 0), 0)
  return Math.max(20, totalSets * 3)
}

export function toDayCard(day, planName) {
  const muscles = String(day.muscleGroups || '')
    .split(',')
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean)

  return {
    id: day.id,
    type: day.isRestDay ? 'RIPOSO' : 'FORZA',
    duration: estimateDuration(day),
    name: day.name || planName || 'Allenamento',
    muscles: muscles.length ? muscles : (day.isRestDay ? ['RIPOSO'] : ['FORZA']),
    exercises: (day.exercises || []).map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weightKg ?? 0,
    })),
  }
}

export function toHistoryItem(session) {
  const started = session.startedAt ? new Date(session.startedAt) : null
  const now = new Date()
  let when = '—'
  if (started) {
    const diffDays = Math.floor((now.setHours(0, 0, 0, 0) - new Date(started).setHours(0, 0, 0, 0)) / 86400000)
    if (diffDays === 0) when = 'Oggi'
    else if (diffDays === 1) when = 'Ieri'
    else if (diffDays < 7) when = `${diffDays} giorni fa`
    else when = `${Math.floor(diffDays / 7)} sett fa`
  }

  return {
    id: session.id,
    name: session.plan?.name || 'Allenamento',
    type: 'FORZA',
    typeColor: 'var(--accent)',
    when,
    duration: session.durationMinutes ? `${session.durationMinutes} min` : '—',
    calories: session.caloriesBurned ?? 0,
  }
}
