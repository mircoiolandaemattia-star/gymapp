import { storage } from '/src/utils/storage.js'
import { calculateCalories, calculateMacros } from '/src/utils/calorieCalculator.js'
import { getUser, apiToGoal, apiToActivity, apiToSex } from '/src/utils/auth.js'

function computeFromProfile(p) {
  return calculateCalories({
    sex: p.sesso,
    weightKg: Number(p.peso),
    heightCm: Number(p.altezza),
    age: Number(p.eta),
    activity: p.activity || 'moderato',
    goal: p.goal || 'mantenere',
  })
}

function getNutritionTargets() {
  const user = getUser()
  const saved = storage.get('ft_profile') || {}

  let calories = null
  let macros = null

  if (user && user.dailyCalories) {
    calories = user.dailyCalories
    macros = calculateMacros(user.dailyCalories)
  } else if (saved.calories && saved.macros && saved.macros.protein) {
    calories = saved.calories
    macros = saved.macros
  } else {
    const profile = {
      ...(user || {}),
      sesso: apiToSex[user.gender] || 'M',
      peso: user.weightKg,
      altezza: user.heightCm,
      eta: user.age,
      activity: apiToActivity[user.activityLevel],
      goal: apiToGoal[user.goal],
    }
    const result = computeFromProfile({ ...profile })
    calories = result.calories
    macros = result.macros
  }

  return {
    calories,
    protein: macros.protein.grams,
    carbs: macros.carbs.grams,
    fats: macros.fats.grams,
  }
}

export { getNutritionTargets, computeFromProfile }
