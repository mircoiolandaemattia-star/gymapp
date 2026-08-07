import { Router } from 'express'
import authenticate from '../middleware/auth.js'
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from '../controllers/reminderController.js'

const router = Router()

router.use(authenticate)

router.get('/', listReminders)
router.post('/', createReminder)
router.patch('/:id', updateReminder)
router.delete('/:id', deleteReminder)

export default router
