import { storage } from '/src/utils/storage.js'

const KEY = 'ft_recent_foods'
const MAX = 6

export function getRecentFoods() {
  const list = storage.get(KEY)
  return Array.isArray(list) ? list : []
}

export function addRecentFood(food) {
  const list = getRecentFoods()
  const clean = list.filter((f) => f.name !== food.name)
  clean.unshift({
    name: food.name,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatsPer100g: food.fatsPer100g,
    at: Date.now(),
  })
  storage.set(KEY, clean.slice(0, MAX))
}