import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import {
  getCurrentDietPlan,
  getActiveDietPlan,
  saveDietPlan,
} from '../controllers/dietPlanController.js'

const router = Router()

router.use(authenticate)

router.get('/', getCurrentDietPlan)
router.get('/active', getActiveDietPlan)
router.post('/', saveDietPlan)

export default router