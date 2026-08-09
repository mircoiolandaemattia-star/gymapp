import prisma from '../prisma.js'
import { generateContent } from '../utils/gemini.js'
import { PHOTO_ACTION } from '../middleware/premium.js'

function startOfDay() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

async function incrementUsage(userId, actionType) {
  const today = startOfDay()
  const existing = await prisma.aiUsageLog.findFirst({
    where: {
      userId,
      actionType,
      usedOn: { gte: today, lt: new Date(today.getTime() + 86400000) },
    },
  })

  if (existing) {
    return prisma.aiUsageLog.update({
      where: { id: existing.id },
      data: { count: existing.count + 1 },
    })
  }

  return prisma.aiUsageLog.create({
    data: { userId, actionType, usedOn: today, count: 1 },
  })
}

function imageFile(image, mimeType) {
  if (!image) return null
  if (image.startsWith('data:')) {
    const match = image.match(/^data:([^;]+);base64,(.*)$/s)
    if (match) return { mimeType: match[1], data: match[2] }
  }
  return { mimeType: mimeType || 'image/jpeg', data: image }
}

function toInt(value, fallback = 0) {
  const n = Number(value)
  if (!Number.isNaN(n)) return Math.round(n)
  const parsed = String(value).match(/\d+/)
  return parsed ? Number(parsed[0]) : fallback
}

function normalizeWorkoutDays(days) {
  if (!Array.isArray(days)) return []
  return days.map((day, i) => ({
    dayOfWeek: toInt(day.dayOfWeek, (i % 7) + 1),
    name: day.name || `Allenamento ${i + 1}`,
    muscleGroups: day.muscleGroups || null,
exercises: Array.isArray(day.exercises)
      ? day.exercises.map((ex, j) => ({
          name: ex.name || `Esercizio ${j + 1}`,
          sets: toInt(ex.sets, 3),
          reps: toInt(ex.reps, 10),
          weightKg: ex.weightKg != null ? Number(ex.weightKg) : null,
          order: toInt(ex.order, j + 1),
        }))
      : [],
  }))
}

export async function recognizeMeal(req, res, next) {
  try {
    const { description, image, mimeType } = req.body

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'La descrizione del pasto è obbligatoria' })
    }

    const prompt = `Analizza la foto di un pasto insieme alla descrizione fornita dall'utente: "${description}". 
Usa la descrizione fornita dall'utente per identificare esattamente quali ingredienti sono presenti nel piatto (es. distinguere il pollo dal tacchino, riconoscere i condimenti menzionati come olio d'oliva o burro).
Usa invece l'analisi visiva della foto per stimare le quantità in grammi di ciascun ingrediente, basandoti su porzioni standard e sul confronto visivo con piatto/posate visibili nella foto.
Ogni ingrediente menzionato nella descrizione deve comparire in "items". Rispondi SOLO con un oggetto JSON valido nel formato:
{"name":"nome del pasto","calories":numero totale kcal,"proteinG":grammi proteine,"carbsG":grammi carboidrati,"fatsG":grammi grassi,"items":[{"name":"ingrediente","quantityG":grammi}]}`

    const files = imageFile(image, mimeType) ? [imageFile(image, mimeType)] : []
    const result = await generateContent(prompt, files, { json: true })

    await incrementUsage(req.userId, PHOTO_ACTION)

    res.json({
      name: result.name || description,
      calories: Math.round(Number(result.calories) || 0),
      proteinG: Math.round(Number(result.proteinG) || 0),
      carbsG: Math.round(Number(result.carbsG) || 0),
      fatsG: Math.round(Number(result.fatsG) || 0),
      items: Array.isArray(result.items) ? result.items : [],
    })
  } catch (err) {
    next(err)
  }
}

export async function generateWorkout(req, res, next) {
  try {
    const { goal, level, days, equipment } = req.body

    const prompt = `Genera una scheda di allenamento settimanale per il fitness. Parametri:
- Obiettivo: ${goal || 'non specificato'}
- Livello: ${level || 'Principiante'}
- Giorni di allenamento a settimana: ${days || 3}
- Attrezzatura disponibile: ${equipment || 'Palestra completa'}

Per ogni giorno includi nome, gruppo muscolare e lista di esercizi con serie, ripetizioni e peso consigliato adeguato al livello. Rispondi SOLO con un array JSON valido di giorni nel formato:
[{"dayOfWeek":1-7,"name":"nome del giorno","muscleGroups":"gruppi muscolari","exercises":[{"name":"esercizio","sets":numero serie,"reps":"ripetizioni o schema","weightKg":peso consigliato,"order":ordine}]}]`

    const result = await generateContent(prompt, [], { json: true })

    res.json({ days: normalizeWorkoutDays(Array.isArray(result) ? result : result.days) })
  } catch (err) {
    next(err)
  }
}

export async function generateDiet(req, res, next) {
  try {
    const { goal, allergens, preferences, mealsPerDay, dailyCalories } = req.body

    const prompt = `Genera un piano alimentare settimanale bilanciato. Parametri:
- Obiettivo: ${goal || 'non specificato'}
- Allergie/intolleranze: ${Array.isArray(allergens) && allergens.length ? allergens.join(', ') : 'nessuna'}
- Preferenze alimentari: ${Array.isArray(preferences) && preferences.length ? preferences.join(', ') : 'nessuna'}
- Pasti al giorno: ${mealsPerDay || 3}
- Fabbisogno calorico giornaliero: ${dailyCalories || '2000'} kcal

Per ogni giorno elenca i pasti (colazione, pranzo, cena, eventuali spuntini) con alimenti, calorie e macro bilanciati entro il fabbisogno calorico giornaliero, rispettando allergie e preferenze. Rispondi SOLO con un oggetto JSON valido nel formato:
{"days":[{"day":1-7,"meals":[{"name":"nome pasto","calories":kcal,"proteinG":g,"carbsG":g,"fatsG":g,"items":[{"name":"alimento","quantityG":g}]}]}]}`

    const result = await generateContent(prompt, [], { json: true })

    res.json(result && Array.isArray(result.days) ? result : { days: [] })
  } catch (err) {
    next(err)
  }
}

export async function parseFile(req, res, next) {
  try {
    const { fileBase64, mimeType, type } = req.body

    if (!fileBase64) return res.status(400).json({ error: 'File mancante' })
    if (type !== 'workout' && type !== 'diet') {
      return res.status(400).json({ error: 'Tipo non valido: usa "workout" o "diet"' })
    }

    const structure =
      type === 'workout'
        ? `[{"dayOfWeek":1-7,"name":"nome del giorno","muscleGroups":"gruppi muscolari","exercises":[{"name":"esercizio","sets":numero serie,"reps":"ripetizioni","weightKg":peso,"order":ordine}]}]`
        : `{"days":[{"day":1-7,"meals":[{"name":"nome pasto","calories":kcal,"proteinG":g,"carbsG":g,"fatsG":g,"items":[{"name":"alimento","quantityG":g}]}]}]}`

    const prompt = `Leggi il documento allegato (${mimeType || 'immagine o PDF'}) che contiene un piano di ${
      type === 'workout' ? 'allenamento (scheda fitness)' : 'alimentazione (dieta)'
    }. Estrai tutti i dati strutturati. Rispondi SOLO con il JSON valido nel formato:
${structure}`

    const files = imageFile(fileBase64, mimeType) ? [imageFile(fileBase64, mimeType)] : []
    const result = await generateContent(prompt, files, { json: true })

    if (type === 'workout') {
      res.json({ days: normalizeWorkoutDays(Array.isArray(result) ? result : result.days) })
    } else {
      res.json(result && Array.isArray(result.days) ? result : { days: [] })
    }
  } catch (err) {
    next(err)
  }
}
