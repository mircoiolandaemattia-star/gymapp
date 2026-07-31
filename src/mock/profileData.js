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

export const SEX_OPTIONS = [
  { value: 'M', label: 'Maschio' },
  { value: 'F', label: 'Femmina' },
  { value: 'O', label: 'Altro' },
]

export const goalOptions = [
  { value: 'dimagrire', label: 'Dimagrire', desc: 'Riduci il grasso corporeo mantenendo la massa muscolare' },
  { value: 'mantenere', label: 'Mantenimento', desc: 'Resta in forma mantenendo il tuo peso attuale' },
  { value: 'massa', label: 'Massa muscolare', desc: 'Aumenta la massa muscolare con un surplus calorico' },
]

export const activityOptions = [
  { value: 'sedentario', label: 'Sedentario', desc: 'Poco o nessun esercizio fisico', factor: 1.2 },
  { value: 'leggero', label: 'Leggermente attivo', desc: 'Ti alleni 1-3 volte a settimana', factor: 1.375 },
  { value: 'moderato', label: 'Moderatamente attivo', desc: 'Ti alleni 3-5 volte a settimana', factor: 1.55 },
  { value: 'attivo', label: 'Molto attivo', desc: 'Ti alleni 6-7 volte a settimana o svolgi un lavoro fisico', factor: 1.725 },
]
