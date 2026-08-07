import prisma from '../prisma.js'

export async function logAiUsage(req, res, next) {
  try {
    const { actionType, count } = req.body

    if (!actionType) return res.status(400).json({ error: 'actionType è obbligatorio' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.aiUsageLog.findFirst({
      where: {
        userId: req.userId,
        actionType,
        usedOn: { gte: today, lt: new Date(today.getTime() + 86400000) },
      },
    })

    if (existing) {
      const updated = await prisma.aiUsageLog.update({
        where: { id: existing.id },
        data: { count: existing.count + (count ?? 1) },
      })
      return res.json({ aiUsage: updated })
    }

    const created = await prisma.aiUsageLog.create({
      data: {
        userId: req.userId,
        actionType,
        usedOn: today,
        count: count ?? 1,
      },
    })

    res.status(201).json({ aiUsage: created })
  } catch (err) {
    next(err)
  }
}

export async function getAiUsageToday(req, res, next) {
  try {
    const { action } = req.query
    if (!action) return res.status(400).json({ error: 'Parametro action obbligatorio' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const log = await prisma.aiUsageLog.findFirst({
      where: {
        userId: req.userId,
        actionType: action,
        usedOn: { gte: today, lt: new Date(today.getTime() + 86400000) },
      },
    })

    res.json({ actionType: action, count: log?.count ?? 0, date: today })
  } catch (err) {
    next(err)
  }
}
