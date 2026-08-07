import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import { createMeal, listMealsByDate, getMealsSummary } from '../controllers/mealController.js'

const router = Router()

router.use(authenticate)

router.get('/summary', getMealsSummary)
router.post('/', createMeal)
router.get('/', listMealsByDate)

export default router
