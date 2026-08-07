import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import { logAiUsage, getAiUsageToday } from '../controllers/aiUsageController.js'

const router = Router()

router.use(authenticate)

router.post('/', logAiUsage)
router.get('/today', getAiUsageToday)

export default router
