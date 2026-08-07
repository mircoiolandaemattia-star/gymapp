import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import { recognizeMeal, generateWorkout, generateDiet, parseFile } from '../controllers/aiController.js'

const router = Router()

router.use(authenticate)

router.post('/recognize-meal', recognizeMeal)
router.post('/generate-workout', generateWorkout)
router.post('/generate-diet', generateDiet)
router.post('/parse-file', parseFile)

export default router