import prisma from '../prisma.js'

export const FREE_PHOTO_LIMIT = 2
export const PHOTO_ACTION = 'photo_recognition'

function startOfDay() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function resolveTrialExpiry(user) {
  if (user.isPremium) return user
  if (user.isTrial && user.trialEndsAt && new Date(user.trialEndsAt) <= new Date()) {
    return prisma.user.update({ where: { id: user.id }, data: { isTrial: false } })
  }
  return user
}

export function isPremiumOrTrial(user) {
  if (user.isPremium) return true
  if (user.isTrial && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) return true
  return false
}

async function loadUser(req) {
  let user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    const err = new Error('Utente non trovato')
    err.status = 404
    throw err
  }
  return resolveTrialExpiry(user)
}

export async function checkPremiumAccess(req, res, next) {
  try {
    const user = await loadUser(req)
    if (!isPremiumOrTrial(user)) {
      return res.status(403).json({
        error: 'premium_required',
        message: 'Questa funzione è riservata agli utenti Premium',
      })
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

export async function checkDailyAiLimit(req, res, next) {
  try {
    const user = await loadUser(req)
    req.user = user
    if (isPremiumOrTrial(user)) return next()

    const today = startOfDay()
    const log = await prisma.aiUsageLog.findFirst({
      where: {
        userId: req.userId,
        actionType: PHOTO_ACTION,
        usedOn: { gte: today, lt: new Date(today.getTime() + 86400000) },
      },
    })
    const used = log?.count ?? 0

    if (used >= FREE_PHOTO_LIMIT) {
      return res.status(403).json({
        error: 'limit_reached',
        message: 'Hai raggiunto il limite giornaliero di 2 foto',
        remaining: 0,
      })
    }
    next()
  } catch (err) {
    next(err)
  }
}