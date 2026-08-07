import prisma from '../prisma.js'

export async function createWorkoutSession(req, res, next) {
  try {
    const { planId, dayId, startedAt, endedAt, durationMinutes, caloriesBurned } = req.body

    if (!startedAt) return res.status(400).json({ error: 'startedAt è obbligatorio' })

    const session = await prisma.workoutSession.create({
      data: {
        userId: req.userId,
        planId: planId ?? null,
        dayId: dayId ?? null,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : null,
        durationMinutes: durationMinutes != null ? Number(durationMinutes) : null,
        caloriesBurned: caloriesBurned != null ? Number(caloriesBurned) : null,
      },
    })

    res.status(201).json({ workoutSession: session })
  } catch (err) {
    next(err)
  }
}

export async function listWorkoutSessions(req, res, next) {
  try {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: req.userId },
      orderBy: { startedAt: 'desc' },
      include: {
        plan: { select: { id: true, name: true } },
        day: { select: { id: true, name: true, dayOfWeek: true } },
      },
    })
    res.json({ workoutSessions: sessions })
  } catch (err) {
    next(err)
  }
}
