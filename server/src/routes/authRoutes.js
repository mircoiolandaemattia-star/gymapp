import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { register, login } from '../controllers/authController.js'
import { loginRateLimiter } from '../middleware/rateLimit.js'

const router = Router()

export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).+$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const msg = errors.array()[0].msg
    return res.status(400).json({ error: msg })
  }
  next()
}

const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome troppo corto'),
  body('email').isEmail().withMessage('Email non valida'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La password deve avere almeno 8 caratteri')
    .matches(PASSWORD_RE)
    .withMessage('La password deve contenere almeno una lettera e un numero'),
]

const loginRules = [
  body('email').isEmail().withMessage('Email non valida'),
  body('password').notEmpty().withMessage('Password obbligatoria'),
]

router.post('/register', registerRules, validate, register)
router.post('/login', loginRateLimiter, loginRules, validate, login)

export default router