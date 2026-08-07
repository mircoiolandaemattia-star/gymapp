import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import {
  listWorkoutPlans,
  createWorkoutPlan,
} from '../controllers/workoutPlanController.js'

const router = Router()

router.use(authenticate)

router.get('/', listWorkoutPlans)
router.post('/', createWorkoutPlan)

export default router
