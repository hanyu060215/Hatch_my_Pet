require("dotenv").config()

const express = require("express")
const { GoogleGenAI } = require("@google/genai")

if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL: GEMINI_API_KEY environment variable not set. Check your .env file.")
    process.exit(1)
}

const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1beta'
})
function normalizeModelName(name) {
    if (!name) return null
    return name.startsWith("models/") ? name : `models/${name}`
}

const PRIMARY_MODEL = normalizeModelName(process.env.GEMINI_MODEL) || "models/gemini-2.0-flash"
const FALLBACK_MODEL = normalizeModelName(process.env.GEMINI_FALLBACK_MODEL) || "models/gemini-2.0-flash-lite"
const modelName = PRIMARY_MODEL
const app = express()
const port = process.env.PORT || 5001

app.use(express.json())

function getAdaptiveDifficultyInstruction(lastRoundScore) {
    const totalQuestionsPerRound = 5
    if (lastRoundScore === null || typeof lastRoundScore === "undefined") {
        return "For this initial set, generate a mixed difficulty: 2 Easy, 2 Medium, and 1 Hard question. Ensure all 5 keywords are covered if possible."
    }
    const scoreRatio = lastRoundScore / totalQuestionsPerRound
    if (scoreRatio <= 0.4) {
        return `The user scored ${lastRoundScore} out of 5. Generate 3 Easy, 2 Medium, and 0 Hard questions.`
    }
    if (scoreRatio <= 0.8) {
        return `The user scored ${lastRoundScore} out of 5. Generate 1 Easy, 3 Medium, and 1 Hard question.`
    }
    return `The user scored ${lastRoundScore} out of 5. Generate 1 Medium, 3 Hard, and 1 Challenge question.`
}

async function generateTriviaFromModel(modelId, prompt) {
    const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
    })

    const rawPayload = typeof response.text === "function" ? await response.text() : response.text
    const cleanedPayload = typeof rawPayload === "string"
        ? rawPayload.replace(/```json\s*/gi, "").replace(/```/g, "").trim()
        : rawPayload

    const triviaJson = typeof cleanedPayload === "string" ? JSON.parse(cleanedPayload) : cleanedPayload

    if (!Array.isArray(triviaJson)) {
        const formatError = new Error("AI response was not an array")
        formatError.status = 502
        throw formatError
    }

    if (triviaJson.length !== 5) {
        const countError = new Error("AI did not return exactly 5 questions")
        countError.status = 502
        throw countError
    }

    return triviaJson
}

app.post("/api/generateTrivia", async (req, res) => {
    const { keywords, lastRoundScore } = req.body

    if (!keywords) {
        return res.status(400).json({ error: "Keywords are required." })
    }

    const keywordList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0)

    const difficultyInstruction = getAdaptiveDifficultyInstruction(lastRoundScore)

    const systemPrompt = `You are a Trivia Question Generator. Generate exactly 5 trivia questions based on these keywords: ${keywordList.join(", ")}.

${difficultyInstruction}

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "id": "unique_id",
    "category": "category_name",
    "difficulty": "Easy|Medium|Hard|Challenge",
    "question": "question text",
    "answer": "correct answer",
    "options": ["option1", "option2", "option3", "option4"]
  }
]

The "answer" field must match one of the values in the "options" array exactly.`

    try {
        const triviaJson = await generateTriviaFromModel(modelName, systemPrompt)
        return res.json(triviaJson)
    } catch (error) {
        let status = error?.status || error?.response?.status || 500
        let message = error?.message || "Failed to generate trivia questions from the LLM."
        console.error("Gemini API Error:", status, message, error)

        const shouldAttemptFallback = (status === 404 || status === 403) && FALLBACK_MODEL && FALLBACK_MODEL !== modelName
        if (shouldAttemptFallback) {
            try {
                const fallbackJson = await generateTriviaFromModel(FALLBACK_MODEL, systemPrompt)
                console.warn(`Primary model ${modelName} unavailable. Served fallback model ${FALLBACK_MODEL}.`)
                return res.json(fallbackJson)
            } catch (fallbackError) {
                status = fallbackError?.status || fallbackError?.response?.status || 500
                message = fallbackError?.message || message
                console.error(`Fallback model ${FALLBACK_MODEL} failed`, fallbackError)
            }
        }

        if (status === 403 || status === 404) {
            return res.status(502).json({ error: `AI model denied the request. Configure GEMINI_MODEL to a model available to your key (current: ${modelName}).` })
        }

        return res.status(500).json({ error: message })
    }
})

app.listen(port, () => {
    console.log(`Trivia Backend listening at http://localhost:${port}`)
})