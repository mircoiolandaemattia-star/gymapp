import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import {
  createMeal,
  listMealsByDate,
  getMealsSummary,
  updateFoodItem,
  deleteFoodItem,
} from '../controllers/mealController.js'

const router = Router()

router.use(authenticate)

router.get('/summary', getMealsSummary)
router.post('/', createMeal)
router.get('/', listMealsByDate)
router.patch('/:mealId/foods/:foodId', updateFoodItem)
router.delete('/:mealId/foods/:foodId', deleteFoodItem)

export default router
