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

export async function updateWorkoutPlan(req, res, next) {
  try {
    const { id } = req.params
    const { name, days } = req.body

    const plan = await prisma.workoutPlan.findFirst({ where: { id, userId: req.userId } })
    if (!plan) return res.status(404).json({ error: 'Allenamento non trovato' })

    const data = {}
    if (name) data.name = name
    if (Array.isArray(days)) {
      data.workoutDays = {
        deleteMany: {},
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
    }

    const updated = await prisma.workoutPlan.update({
      where: { id },
      data,
      include: {
        workoutDays: { orderBy: { dayOfWeek: 'asc' }, include: { exercises: { orderBy: { order: 'asc' } } } },
      },
    })

    res.json({ workoutPlan: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteWorkoutPlan(req, res, next) {
  try {
    const { id } = req.params

    const plan = await prisma.workoutPlan.findFirst({ where: { id, userId: req.userId } })
    if (!plan) return res.status(404).json({ error: 'Allenamento non trovato' })

    await prisma.workoutPlan.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
