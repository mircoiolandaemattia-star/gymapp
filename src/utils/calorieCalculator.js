const ACTIVITY_MULTIPLIERS = {
  sedentario: 1.2,
  leggero: 1.375,
  moderato: 1.55,
  attivo: 1.725,
  molto_attivo: 1.9,
}

const GOAL_ADJUSTMENT = {
  dimagrire: -400,
  mantenere: 0,
  mantenimento: 0,
  massa: 300,
}

const MACRO_SPLIT = [
  { key: 'protein', label: 'Proteine', pct: 30, kcalPerGram: 4 },
  { key: 'carbs', label: 'Carboidrati', pct: 45, kcalPerGram: 4 },
  { key: 'fats', label: 'Grassi', pct: 25, kcalPerGram: 9 },
]

function calculateBmr({ sex, weightKg, heightCm, age }) {
  const weight = Number(weightKg)
  const height = Number(heightCm)
  const years = Number(age)
  if (sex === 'F') {
    return 447.6 + 9.2 * weight + 3.1 * height - 4.3 * years
  }
  return 88.36 + 13.4 * weight + 4.8 * height - 5.7 * years
}

function calculateMacros(calories) {
  const macros = {}
  MACRO_SPLIT.forEach((m) => {
    macros[m.key] = {
      label: m.label,
      pct: m.pct,
      grams: Math.round((calories * m.pct) / 100 / m.kcalPerGram),
    }
  })
  return macros
}

function calculateCalories({ sex, weightKg, heightCm, age, activity, goal }) {
  const bmr = calculateBmr({ sex, weightKg, heightCm, age })
  const factor = ACTIVITY_MULTIPLIERS[activity] || 1.55
  const tdee = bmr * factor
  const adjustment = GOAL_ADJUSTMENT[goal] ?? 0
  const calories = Math.round(tdee + adjustment)
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    factor,
    adjustment,
    calories,
    macros: calculateMacros(calories),
  }
}

export { calculateCalories, calculateBmr, calculateMacros, ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENT, MACRO_SPLIT }
