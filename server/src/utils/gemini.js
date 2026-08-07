import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function normalizeInlineFile(file) {
  if (!file) return null
  const { mimeType, data } = file
  if (!mimeType || !data) return null
  const base64 = data.includes('base64,') ? data.split('base64,')[1] : data
  return { inlineData: { mimeType, data: base64 } }
}

async function generateText(prompt, files = []) {
  const parts = [{ text: prompt }]
  for (const file of files) {
    const inline = normalizeInlineFile(file)
    if (inline) parts.push(inline)
  }

  const model = genAI.getGenerativeModel({ model: MODEL })
  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
  })

  const text = result.response.text()
  if (!text || !text.trim()) throw new Error('Gemini non ha restituito contenuto')
  return text
}

function markNetwork(err) {
  if (!err) return err
  if (err.aiNetwork) return err
  if (!err.status && !err.statusCode && (err instanceof TypeError || !err.code)) {
    err.aiNetwork = true
  }
  return err
}

function extractJson(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1))
    } catch {
      /* fall through */
    }
  }
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

export async function generateContent(prompt, files = [], { json = false, retries = 2 } = {}) {
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    let p = prompt
    if (json && attempt > 0) {
      p = `Rispondi SOLO con JSON valido. Nessun testo aggiuntivo, nessun blocco di codice, nessun prefisso o backtick.\n\n${prompt}`
    }

    try {
      const text = await generateText(p, files)
      if (json) {
        const parsed = extractJson(text)
        if (parsed !== null) return parsed
        lastError = new Error('Gemini non ha restituito JSON valido')
      } else {
        return text
      }
    } catch (err) {
      lastError = markNetwork(err)
    }

    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)))
    }
  }

  throw lastError || new Error('Impossibile generare contenuto')
}