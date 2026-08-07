import prisma from '../prisma.js'

export async function listBodyMeasurements(req, res, next) {
  try {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId: req.userId },
      orderBy: { measuredAt: 'desc' },
    })
    res.json({ measurements })
  } catch (err) {
    next(err)
  }
}

export async function createBodyMeasurement(req, res, next) {
  try {
    const { weightKg, waistCm, chestCm, armsCm, hipsCm, measuredAt } = req.body

    if (weightKg == null && !measuredAt) {
      return res.status(400).json({ error: 'weightKg e measuredAt sono obbligatori' })
    }

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        userId: req.userId,
        weightKg: weightKg != null ? Number(weightKg) : null,
        waistCm: waistCm != null ? Number(waistCm) : null,
        chestCm: chestCm != null ? Number(chestCm) : null,
        armsCm: armsCm != null ? Number(armsCm) : null,
        hipsCm: hipsCm != null ? Number(hipsCm) : null,
        measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
      },
    })

    res.status(201).json({ measurement })
  } catch (err) {
    next(err)
  }
}
