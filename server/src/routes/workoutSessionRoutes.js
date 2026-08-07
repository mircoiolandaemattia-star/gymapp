import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import {
  createWorkoutSession,
  listWorkoutSessions,
} from '../controllers/workoutSessionController.js'

const router = Router()

router.use(authenticate)

router.post('/', createWorkoutSession)
router.get('/', listWorkoutSessions)

export default router
