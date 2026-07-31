export const profileData = {
  user: {
    name: 'Mario Rossi',
    email: 'mario@example.com',
    eta: 30,
    peso: 77.8,
    altezza: 178,
    sesso: 'M',
  },
  goal: 'dimagrire',
  activity: 'moderato',
  reminders: [
    { id: 'r1', time: '08:00', label: 'Pesata mattutina', enabled: true },
    { id: 'r2', time: '12:30', label: 'Pranzo', enabled: true },
    { id: 'r3', time: '18:30', label: 'Allenamento', enabled: true },
  ],
}

export const goalOptions = [
  { value: 'dimagrire', label: 'Dimagrire', desc: 'Deficit calorico' },
  { value: 'mantenere', label: 'Mantenere', desc: 'Equilibrio' },
  { value: 'massa', label: 'Mettere massa', desc: 'Surplus calorico' },
]

export const activityOptions = [
  { value: 'sedentario', label: 'Sedentario', factor: 1.2 },
  { value: 'leggero', label: 'Leggero', factor: 1.375 },
  { value: 'moderato', label: 'Moderato', factor: 1.55 },
  { value: 'attivo', label: 'Attivo', factor: 1.725 },
  { value: 'molto_attivo', label: 'Molto attivo', factor: 1.9 },
]
