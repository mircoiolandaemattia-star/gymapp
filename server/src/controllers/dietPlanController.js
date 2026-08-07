import prisma from '../prisma.js'

export async function getCurrentDietPlan(req, res, next) {
  try {
    const dietPlan = await prisma.dietPlan.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        meals: {
          orderBy: { date: 'desc' },
          include: { foodItems: true },
        },
      },
    })

    if (!dietPlan) return res.status(404).json({ error: 'Nessuna dieta trovata' })

    res.json({ dietPlan })
  } catch (err) {
    next(err)
  }
}

export async function getActiveDietPlan(req, res, next) {
  try {
    const dietPlan = await prisma.dietPlan.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { planMeals: { orderBy: { dayIndex: 'asc' } } },
    })

    if (!dietPlan) return res.status(404).json({ error: 'Nessun piano salvato' })

    res.json({
      dietPlan: {
        id: dietPlan.id,
        name: dietPlan.name,
        source: dietPlan.source,
        planMeals: dietPlan.planMeals.map((m) => ({
          dayIndex: m.dayIndex,
          type: m.type,
          calories: m.calories,
          items: JSON.parse(m.itemsJson || '[]'),
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function saveDietPlan(req, res, next) {
  try {
    const { name = 'Piano personale', source, days } = req.body || {}
    if (!Array.isArray(days)) {
      return res.status(400).json({ error: 'Piano non valido: giorni mancanti' })
    }

    const saved = await prisma.$transaction(async (tx) => {
      // Una sola dieta attiva per utente: sostituisci
      await tx.dietPlan.deleteMany({ where: { userId: req.userId } })

      const plan = await tx.dietPlan.create({
        data: { userId: req.userId, name, source },
      })

      const rows = []
      days.forEach((day, i) => {
        const dayIndex = Number(day && day.day) ? Number(day.day) - 1 : i
        ;(day.meals || []).forEach((m) => {
          const items = Array.isArray(m.items) ? m.items : []
          rows.push({
            dietPlanId: plan.id,
            dayIndex,
            type: m.name || null,
            calories: Math.round(Number(m.calories) || 0),
            itemsJson: JSON.stringify(
              items.map((it) => ({
                name: it.name || 'Alimento',
                quantityG: Number(it.quantityG) || 0,
              }))
            ),
          })
        })
      })

      if (rows.length) await tx.dietPlanMeal.createMany({ data: rows })

      return plan
    })

    res.status(201).json({ dietPlan: { id: saved.id, name: saved.name, source: saved.source } })
  } catch (err) {
    next(err)
  }
}