// Add this line at the top to load your GEMINI_API_KEY from the .env file
require('dotenv').config();

const express = require('express');
const { GoogleGenAI } = require('@google/genai');

// --- 1. INITIALIZATION ---
// Check if the key is loaded
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL: GEMINI_API_KEY environment variable not set. Check your .env file.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();
const port = 5000; // IMPORTANT: We run the backend on a different port than React (usually 3000)

app.use(express.json()); // Middleware to parse JSON bodies

// --- 2. JSON SCHEMA DEFINITION --- (Same as before)
const TRIVIA_SCHEMA = {
  type: 'array',
  description: 'An array containing exactly 5 trivia question objects.',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      category: { type: 'string' },
      difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard', 'Challenge'] },
      question: { type: 'string' },
      answer: { type: 'string' },
      options: { type: 'array', items: { type: 'string' } }
    },
    required: ['id', 'category', 'difficulty', 'question', 'answer', 'options']
  }
};

// --- 3. ADAPTIVE LOGIC HELPER FUNCTION --- (Same as before)
function getAdaptiveDifficultyInstruction(lastRoundScore) {
    const totalQuestionsPerRound = 5;
    if (lastRoundScore === null) {
        return "For this initial set, generate a mixed difficulty: 2 Easy, 2 Medium, and 1 Hard question. Ensure all 5 keywords are covered if possible.";
    }
    const scoreRatio = lastRoundScore / totalQuestionsPerRound;
    if (scoreRatio <= 0.4) { 
        return `The user scored ${lastRoundScore} out of 5. Generate 3 Easy, 2 Medium, and 0 Hard questions.`;
    } else if (scoreRatio <= 0.8) {
        return `The user scored ${lastRoundScore} out of 5. Generate 1 Easy, 3 Medium, and 1 Hard question.`;
    } else {
        return `The user scored ${lastRoundScore} out of 5. Generate 1 Medium, 3 Hard, and 1 Challenge question.`;
    }
}


// --- 4. API ENDPOINT (The Core Logic) ---
app.post('/api/generateTrivia', async (req, res) => {
    const { keywords, lastRoundScore } = req.body;
    
    if (!keywords) {
        return res.status(400).json({ error: 'Keywords are required.' });
    }

    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const difficultyInstruction = getAdaptiveDifficultyInstruction(lastRoundScore);

    const systemPrompt = `You are a Trivia Question Generator.
    1. You MUST generate exactly 10 questions based on the following keywords: ${keywordList.join(', ')}.
    2. Your output MUST strictly adhere to the provided JSON Schema.
    3. Adapt the question difficulty based on this feedback: ${difficultyInstruction}`;

    // try {
    //     const response = await ai.models.generateContent({
    //         model: 'gemini-2.5-flash',
    //         contents: systemPrompt,
    //         config: {
    //             responseMimeType: 'application/json',
    //             responseSchema: TRIVIA_SCHEMA,
    //         },
    //     });

    //     const triviaJson = JSON.parse(response.text);
    //     res.json(triviaJson);
    // } catch (error) {
    //     console.error('Gemini API Error:', error);
    //     res.status(500).json({ error: 'Failed to generate trivia questions from the LLM.' });
    // }

    // Add this line at the top to load your GEMINI_API_KEY from the .env file
require('dotenv').config();

const express = require('express');
const { GoogleGenAI } = require('@google/genai');

// --- 1. INITIALIZATION ---
// Check if the key is loaded
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL: GEMINI_API_KEY environment variable not set. Check your .env file.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();
const port = 5000; // IMPORTANT: We run the backend on a different port than React (usually 3000)

app.use(express.json()); // Middleware to parse JSON bodies

// --- 2. JSON SCHEMA DEFINITION --- (Same as before)
const TRIVIA_SCHEMA = {
  type: 'array',
  description: 'An array containing exactly 5 trivia question objects.',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      category: { type: 'string' },
      difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard', 'Challenge'] },
      question: { type: 'string' },
      answer: { type: 'string' },
      options: { type: 'array', items: { type: 'string' } }
    },
    required: ['id', 'category', 'difficulty', 'question', 'answer', 'options']
  }
};

// --- 3. ADAPTIVE LOGIC HELPER FUNCTION --- (Same as before)
function getAdaptiveDifficultyInstruction(lastRoundScore) {
    const totalQuestionsPerRound = 5;
    if (lastRoundScore === null) {
        return "For this initial set, generate a mixed difficulty: 2 Easy, 2 Medium, and 1 Hard question. Ensure all 5 keywords are covered if possible.";
    }
    const scoreRatio = lastRoundScore / totalQuestionsPerRound;
    if (scoreRatio <= 0.4) { 
        return `The user scored ${lastRoundScore} out of 10. Generate 3 Easy, 2 Medium, and 0 Hard questions.`;
    } else if (scoreRatio <= 0.8) {
        return `The user scored ${lastRoundScore} out of 10. Generate 1 Easy, 3 Medium, and 1 Hard question.`;
    } else {
        return `The user scored ${lastRoundScore} out of 10. Generate 1 Medium, 3 Hard, and 1 Challenge question.`;
    }
}


// --- 4. API ENDPOINT (The Core Logic) ---
app.post('/api/generateTrivia', async (req, res) => {
    const { keywords, lastRoundScore } = req.body;
    
    if (!keywords) {
        return res.status(400).json({ error: 'Keywords are required.' });
    }

    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const difficultyInstruction = getAdaptiveDifficultyInstruction(lastRoundScore);

    const systemPrompt = `You are a Trivia Question Generator.
    1. You MUST generate exactly 10 questions based on the following keywords: ${keywordList.join(', ')}.
    2. Your output MUST strictly adhere to the provided JSON Schema.
    3. Adapt the question difficulty based on this feedback: ${difficultyInstruction}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: TRIVIA_SCHEMA,
            },
        });

        const triviaJson = JSON.parse(response.text);
        res.json(triviaJson);
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate trivia questions from the LLM.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Trivia Backend listening at http://localhost:${port}`);
});
});

// Start the server
app.listen(port, () => {
    console.log(`Trivia Backend listening at http://localhost:${port}`);
});