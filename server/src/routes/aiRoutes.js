import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import { checkPremiumAccess, checkDailyAiLimit } from '../middleware/premium.js'
import { recognizeMeal, generateWorkout, generateDiet, parseFile } from '../controllers/aiController.js'

const router = Router()

router.use(authenticate)

router.post('/recognize-meal', checkDailyAiLimit, recognizeMeal)
router.post('/generate-workout', checkPremiumAccess, generateWorkout)
router.post('/generate-diet', checkPremiumAccess, generateDiet)
router.post('/parse-file', checkPremiumAccess, parseFile)

export default router