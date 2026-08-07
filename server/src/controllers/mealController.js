import prisma from '../prisma.js'

function parseDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export async function createMeal(req, res, next) {
  try {
    const { dietPlanId, type, date, totalCalories, foodItems } = req.body

    if (!date) return res.status(400).json({ error: 'date è obbligatorio' })

    const parsedDate = parseDate(date)
    if (!parsedDate) return res.status(400).json({ error: 'date non valida' })

    let resolvedDietPlanId = dietPlanId ?? null
    if (!resolvedDietPlanId) {
      const current = await prisma.dietPlan.findFirst({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      })
      resolvedDietPlanId = current?.id ?? null
    }

    const meal = await prisma.meal.create({
      data: {
        dietPlanId: resolvedDietPlanId,
        userId: req.userId,
        type: type ?? null,
        date: parsedDate,
        totalCalories: totalCalories != null ? Number(totalCalories) : null,
        foodItems: foodItems?.length
          ? {
              create: foodItems.map((item) => ({
                name: item.name,
                quantityG: item.quantityG != null ? Number(item.quantityG) : null,
                calories: item.calories != null ? Number(item.calories) : null,
                proteinG: item.proteinG != null ? Number(item.proteinG) : null,
                carbsG: item.carbsG != null ? Number(item.carbsG) : null,
                fatsG: item.fatsG != null ? Number(item.fatsG) : null,
                source: item.source ?? null,
                barcode: item.barcode ?? null,
              })),
            }
          : undefined,
      },
      include: { foodItems: true },
    })

    res.status(201).json({ meal })
  } catch (err) {
    next(err)
  }
}

export async function listMealsByDate(req, res, next) {
  try {
    const { date } = req.query

    if (!date) return res.status(400).json({ error: 'Parametro date obbligatorio' })

    const parsedDate = parseDate(date)
    if (!parsedDate) return res.status(400).json({ error: 'date non valida' })

    const start = new Date(parsedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(parsedDate)
    end.setHours(23, 59, 59, 999)

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
      include: { foodItems: true },
    })

    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories ?? 0
        acc.protein += meal.foodItems.reduce((s, f) => s + (f.proteinG ?? 0), 0)
        acc.carbs += meal.foodItems.reduce((s, f) => s + (f.carbsG ?? 0), 0)
        acc.fats += meal.foodItems.reduce((s, f) => s + (f.fatsG ?? 0), 0)
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    res.json({ date: date, meals, totals })
  } catch (err) {
    next(err)
  }
}

export async function getMealsSummary(req, res, next) {
  try {
    const { from, to } = req.query
    if (!from || !to) return res.status(400).json({ error: 'Parametri from e to obbligatori' })

    const fromDate = parseDate(from)
    const toDate = parseDate(to)
    if (!fromDate || !toDate) return res.status(400).json({ error: 'date non valide' })

    const start = new Date(fromDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(toDate)
    end.setHours(23, 59, 59, 999)

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId,
        date: { gte: start, lte: end },
      },
      select: { date: true, totalCalories: true },
    })

    const byDay = {}
    meals.forEach((m) => {
      const key = m.date.toISOString().slice(0, 10)
      byDay[key] = (byDay[key] ?? 0) + (m.totalCalories ?? 0)
    })

    const days = []
    const cursor = new Date(start)
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10)
      days.push({ date: key, calories: byDay[key] ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }

    res.json({ days })
  } catch (err) {
    next(err)
  }
}
