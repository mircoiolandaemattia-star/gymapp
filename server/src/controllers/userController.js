import prisma from '../prisma.js'

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_ADJUSTMENTS = {
  lose: -500,
  maintain: 0,
  gain: 300,
}

function sanitize(user) {
  const { passwordHash, ...safe } = user
  return safe
}

function computeDailyCalories({ gender, age, weightKg, heightCm, activityLevel, goal }) {
  if (!gender || !age || !weightKg || !heightCm) return null

  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  const factor = ACTIVITY_FACTORS[activityLevel] ?? ACTIVITY_FACTORS.moderate
  const adjustment = GOAL_ADJUSTMENTS[goal] ?? GOAL_ADJUSTMENTS.maintain

  return Math.round(bmr * factor + adjustment)
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'Utente non trovato' })
    res.json({ user: sanitize(user) })
  } catch (err) {
    next(err)
  }
}

export async function updateMe(req, res, next) {
  try {
    const {
      name,
      goal,
      age,
      weightKg,
      heightCm,
      gender,
      activityLevel,
      isPremium,
      isTrial,
      trialEndsAt,
    } = req.body

    const data = {
      name,
      goal,
      age: age != null ? Number(age) : undefined,
      weightKg: weightKg != null ? Number(weightKg) : undefined,
      heightCm: heightCm != null ? Number(heightCm) : undefined,
      gender,
      activityLevel,
      isPremium,
      isTrial,
      trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : undefined,
    }

    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])

    const current = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!current) return res.status(404).json({ error: 'Utente non trovato' })

    const merged = { ...current, ...data }

    if (data.age != null || data.weightKg != null || data.heightCm != null || data.gender || data.activityLevel || data.goal) {
      data.dailyCalories = computeDailyCalories({
        gender: merged.gender,
        age: merged.age,
        weightKg: merged.weightKg,
        heightCm: merged.heightCm,
        activityLevel: merged.activityLevel,
        goal: merged.goal,
      })
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    })

    res.json({ user: sanitize(user) })
  } catch (err) {
    next(err)
  }
}

export async function completeOnboarding(req, res, next) {
  try {
    const { goal, age, weightKg, heightCm, gender, activityLevel, acceptedDisclaimer } = req.body

    if (!goal || !age || !weightKg || !heightCm || !gender || !activityLevel) {
      return res.status(400).json({ error: 'Dati onboarding incompleti' })
    }

    const dailyCalories = computeDailyCalories({
      gender,
      age: Number(age),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      activityLevel,
      goal,
    })

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        goal,
        age: Number(age),
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        gender,
        activityLevel,
        acceptedDisclaimer: acceptedDisclaimer ?? true,
        dailyCalories,
      },
    })

    res.json({ user: sanitize(user), dailyCalories })
  } catch (err) {
    next(err)
  }
}
