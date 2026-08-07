import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import {
  listBodyMeasurements,
  createBodyMeasurement,
} from '../controllers/bodyMeasurementController.js'

const router = Router()

router.use(authenticate)

router.get('/', listBodyMeasurements)
router.post('/', createBodyMeasurement)

export default router
