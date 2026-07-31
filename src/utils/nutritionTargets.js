import { storage } from '/src/utils/storage.js'
import { calculateCalories } from '/src/utils/calorieCalculator.js'
import { profileData } from '/src/mock/profileData.js'

function computeFromProfile(p) {
  return calculateCalories({
    sex: p.sesso,
    weightKg: Number(p.peso),
    heightCm: Number(p.altezza),
    age: Number(p.eta),
    activity: p.activity || profileData.activity,
    goal: p.goal || profileData.goal,
  })
}

function getNutritionTargets() {
  const saved = storage.get('ft_profile') || {}
  const hasReal = Boolean(saved.calories && saved.macros && saved.macros.protein)
  const result = hasReal
    ? { calories: saved.calories, macros: saved.macros }
    : computeFromProfile({ ...profileData.user, ...saved })

  return {
    calories: result.calories,
    protein: result.macros.protein.grams,
    carbs: result.macros.carbs.grams,
    fats: result.macros.fats.grams,
  }
}

export { getNutritionTargets, computeFromProfile }
