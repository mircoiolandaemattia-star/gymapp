import { createIcon } from '/src/utils/icons.js'
import { User, Crown } from 'lucide'

const BADGES = {
  free: { cls: 'plan-free', label: 'Free' },
  trial: { cls: 'plan-trial', label: 'Trial' },
  premium: { cls: 'plan-premium', label: 'Premium' },
}

function profileHeader({ name, email, plan }) {
  const card = document.createElement('div')
  card.className = 'card profile-header-card'

  const avatar = document.createElement('div')
  avatar.className = 'profile-avatar'
  avatar.appendChild(createIcon(User, 24, 1.5))
  card.appendChild(avatar)

  const info = document.createElement('div')
  info.className = 'profile-header-info'
  const hName = document.createElement('h2')
  hName.className = 'profile-header-name'
  hName.textContent = name
  info.appendChild(hName)
  const hEmail = document.createElement('p')
  hEmail.className = 'profile-header-email'
  hEmail.textContent = email
  info.appendChild(hEmail)
  card.appendChild(info)

  const badge = BADGES[plan.tier] || BADGES.free
  const badgeEl = document.createElement('span')
  badgeEl.className = 'plan-badge ' + badge.cls
  if (plan.tier === 'premium') badgeEl.appendChild(createIcon(Crown, 12, 2))
  const bLabel = document.createElement('span')
  bLabel.textContent = badge.label
  badgeEl.appendChild(bLabel)
  card.appendChild(badgeEl)

  return card
}

export { profileHeader }
