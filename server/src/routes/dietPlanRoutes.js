import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import { getCurrentDietPlan } from '../controllers/dietPlanController.js'

const router = Router()

router.use(authenticate)

router.get('/', getCurrentDietPlan)

export default router
