import { createIcon } from '/src/utils/icons.js'
import { User } from 'lucide'
import { homeData } from '/src/mock/homeData.js'
import { getUser } from '/src/utils/auth.js'
import { getNutritionTargets } from '/src/utils/nutritionTargets.js'
import { calorieRing } from '/src/components/calorieRing.js'
import { workoutTodayCard } from '/src/components/workoutTodayCard.js'
import { quickStats } from '/src/components/quickStats.js'
import { mealsSummaryCard } from '/src/components/mealsSummaryCard.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buongiorno'
  if (h < 17) return 'Buon pomeriggio'
  return 'Buonasera'
}

function firstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || fullName
}

function render() {
  const section = document.createElement('section')
  section.className = 'page home-page'

  const header = document.createElement('div')
  header.className = 'home-header'

  const left = document.createElement('div')
  left.className = 'home-header-left'
  const greet = document.createElement('span')
  greet.className = 'home-greeting'
  greet.textContent = `${greeting()}, ${firstName(getUser().name)}`
  left.appendChild(greet)
  const date = document.createElement('span')
  date.className = 'home-date'
  date.textContent = homeData.todayDate
  left.appendChild(date)
  header.appendChild(left)

  const userBtn = document.createElement('button')
  userBtn.className = 'home-user-btn'
  userBtn.setAttribute('aria-label', 'Profilo')
  userBtn.appendChild(createIcon(User, 22, 2))
  header.appendChild(userBtn)

  section.appendChild(header)
  const targets = getNutritionTargets()
  section.appendChild(calorieRing({ consumed: homeData.calories.consumed, target: targets.calories }))
  section.appendChild(workoutTodayCard(homeData.workout))
  section.appendChild(quickStats(homeData.quickStats))
  section.appendChild(mealsSummaryCard(homeData.meals))

  return section
}

export { render }
export default render
