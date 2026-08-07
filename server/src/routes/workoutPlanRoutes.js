import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import {
  listWorkoutPlans,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from '../controllers/workoutPlanController.js'

const router = Router()

router.use(authenticate)

router.get('/', listWorkoutPlans)
router.post('/', createWorkoutPlan)
router.put('/:id', updateWorkoutPlan)
router.delete('/:id', deleteWorkoutPlan)

export default router
