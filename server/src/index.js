import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import workoutPlanRoutes from './routes/workoutPlanRoutes.js'
import workoutSessionRoutes from './routes/workoutSessionRoutes.js'
import dietPlanRoutes from './routes/dietPlanRoutes.js'
import mealRoutes from './routes/mealRoutes.js'
import bodyMeasurementRoutes from './routes/bodyMeasurementRoutes.js'
import reminderRoutes from './routes/reminderRoutes.js'
import aiUsageRoutes from './routes/aiUsageRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import foodRoutes from './routes/foodRoutes.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,https://fittrack.vercel.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
    credentials: true,
  })
)

app.use(helmet())

app.use(express.json({ limit: '15mb' }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/workout-plans', workoutPlanRoutes)
app.use('/api/workout-sessions', workoutSessionRoutes)
app.use('/api/diet-plans', dietPlanRoutes)
app.use('/api/meals', mealRoutes)
app.use('/api/body-measurements', bodyMeasurementRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/ai-usage', aiUsageRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/food', foodRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fittrack API in ascolto sulla porta ${PORT}`)
})
