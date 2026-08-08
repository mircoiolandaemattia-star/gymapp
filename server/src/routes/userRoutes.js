import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import { getMe, updateMe, completeOnboarding, startTrial } from '../controllers/userController.js'

const router = Router()

router.use(authenticate)

router.get('/me', getMe)
router.put('/me', updateMe)
router.post('/start-trial', startTrial)
router.post('/onboarding', completeOnboarding)

export default router
