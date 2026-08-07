import { Router } from 'express'
import { getFoodByBarcode, searchFoods } from '../controllers/foodController.js'

const router = Router()

router.get('/search', searchFoods)
router.get('/barcode/:code', getFoodByBarcode)

export default router
