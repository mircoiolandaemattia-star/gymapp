import { getUser } from '/src/utils/auth.js'

export const FREE_PHOTO_LIMIT = 2

export function hasPremiumAccess(u = getUser()) {
  return Boolean(u.isPremium) || (Boolean(u.isTrial) && u.trialEndsAt && new Date(u.trialEndsAt) > new Date())
}

export function hasUsedTrial(u = getUser()) {
  return Boolean(u.isPremium) || Boolean(u.trialEndsAt)
}

export function planStatus(u = getUser()) {
  if (u.isPremium) return 'premium'
  if (u.isTrial && u.trialEndsAt && new Date(u.trialEndsAt) > new Date()) return 'trial'
  return u.trialEndsAt ? 'trial_used' : 'free'
}