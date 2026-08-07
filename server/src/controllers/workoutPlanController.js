import prisma from '../prisma.js'

export async function listWorkoutPlans(req, res, next) {
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        workoutDays: {
          orderBy: { dayOfWeek: 'asc' },
          include: { exercises: { orderBy: { order: 'asc' } } },
        },
      },
    })
    res.json({ workoutPlans: plans })
  } catch (err) {
    next(err)
  }
}

export async function createWorkoutPlan(req, res, next) {
  try {
    const { name, source, days } = req.body

    if (!name) return res.status(400).json({ error: 'name è obbligatorio' })

    const plan = await prisma.workoutPlan.create({
      data: {
        userId: req.userId,
        name,
        source: source ?? null,
        workoutDays: days?.length
          ? {
              create: days.map((day, i) => ({
                dayOfWeek: day.dayOfWeek ?? i + 1,
                name: day.name ?? null,
                muscleGroups: day.muscleGroups ?? null,
                isRestDay: day.isRestDay ?? false,
                exercises: day.exercises?.length
                  ? {
                      create: day.exercises.map((ex, j) => ({
                        name: ex.name,
                        sets: ex.sets ?? 0,
                        reps: ex.reps ?? 0,
                        weightKg: ex.weightKg != null ? Number(ex.weightKg) : null,
                        order: ex.order ?? j + 1,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        workoutDays: { include: { exercises: true } },
      },
    })

    res.status(201).json({ workoutPlan: plan })
  } catch (err) {
    next(err)
  }
}
