const today = new Date()
const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

export const homeData = {
  userName: 'Mario',
  todayDate: `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]}`,
  calories: {
    consumed: 2150,
    target: 2500,
  },
  workout: {
    type: 'FORZA',
    duration: 60,
    name: 'Push Day - Petto/Schiena/Spalle',
    exercisesCount: 5,
  },
  quickStats: {
    streak: 7,
    hoursThisWeek: 4.2,
    totalSessions: 87,
  },
  meals: [
    { id: 1, name: 'Colazione', icon: 'coffee', calories: 520, foods: 2, time: '07:30', color: 'var(--warning)' },
    { id: 2, name: 'Spuntino', icon: 'cookie', calories: 200, foods: 1, time: '10:00', color: 'var(--accent)' },
    { id: 3, name: 'Pranzo', icon: 'beef', calories: 680, foods: 4, time: '13:00', color: 'var(--error)' },
    { id: 4, name: 'Pre-workout', icon: 'zap', calories: 250, foods: 2, time: '16:30', color: 'var(--warning)' },
    { id: 5, name: 'Cena', icon: 'beef', calories: 500, foods: 3, time: '20:00', color: 'var(--info)' },
  ],
}
