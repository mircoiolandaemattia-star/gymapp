import prisma from '../prisma.js'

export async function listReminders(req, res, next) {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.userId },
      orderBy: { time: 'asc' },
    })
    res.json({ reminders })
  } catch (err) {
    next(err)
  }
}

export async function createReminder(req, res, next) {
  try {
    const { type, daysOfWeek, time, message, isActive } = req.body

    if (!time) return res.status(400).json({ error: 'time è obbligatorio' })

    const reminder = await prisma.reminder.create({
      data: {
        userId: req.userId,
        type: type ?? null,
        daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek.join(',') : (daysOfWeek ?? null),
        time: new Date(`1970-01-01T${time}`),
        message: message ?? null,
        isActive: isActive ?? true,
      },
    })

    res.status(201).json({ reminder })
  } catch (err) {
    next(err)
  }
}

export async function updateReminder(req, res, next) {
  try {
    const { id } = req.params
    const { isActive, message, time } = req.body

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId: req.userId },
    })

    if (!reminder) return res.status(404).json({ error: 'Reminder non trovato' })

    const data = {
      isActive: isActive != null ? Boolean(isActive) : undefined,
      message: message != null ? message : undefined,
      time: time ? new Date(`1970-01-01T${time}`) : undefined,
    }
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])

    const updated = await prisma.reminder.update({
      where: { id },
      data,
    })

    res.json({ reminder: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteReminder(req, res, next) {
  try {
    const { id } = req.params

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId: req.userId },
    })

    if (!reminder) return res.status(404).json({ error: 'Reminder non trovato' })

    await prisma.reminder.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
