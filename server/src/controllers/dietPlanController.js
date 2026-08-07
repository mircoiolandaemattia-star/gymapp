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
