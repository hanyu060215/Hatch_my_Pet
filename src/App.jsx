import { useCallback, useEffect, useRef, useState } from "react"
import Timer from "./Timer.jsx"
import ProgressBar from "./Progress_bar.jsx"
import TriviaBar from "./Trivia_bar.jsx"
import generateTriviaQuestions from "./questions.json"
import "./App.css"
import "./Trivia_bar.css"

const GAME_STATES = {
  idle: "idle",
  playing: "playing",
  ended: "ended",
}

const DIFFICULTY_LABELS = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
  4: "Challenge",
}

const FALLBACK_QUESTIONS = Array.isArray(generateTriviaQuestions)
  ? generateTriviaQuestions.map((item, index) => {
      const options = Array.isArray(item.options) ? item.options : []
      const answerIndex = typeof item.correct_index === "number" ? item.correct_index : 0
      return {
        id: String(item.id ?? index),
        category: item.category ?? "General",
        difficulty:
          typeof item.difficulty === "string"
            ? item.difficulty
            : DIFFICULTY_LABELS[item.difficulty] ?? "Medium",
        question: item.question ?? "",
        options,
        answer: options[answerIndex] ?? "",
      }
    })
  : []

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
const DEFAULT_KEYWORDS = "space, animals, math"

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.idle)
  const [gameRound, setGameRound] = useState(0)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [isCorrect, setIsCorrect] = useState(null)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questionError, setQuestionError] = useState("")
  const [correctCount, setCorrectCount] = useState(0)
  const [endMessage, setEndMessage] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [keywordInput, setKeywordInput] = useState("")
  const [keywordError, setKeywordError] = useState("")
  const audioRef = useRef(null)
  const generatedAudioRef = useRef(null)

  const isPlaying = gameState === GAME_STATES.playing
  const isGameOver = gameState === GAME_STATES.ended
  const currentQuestion = isPlaying ? questions[currentQuestionIndex] ?? null : null
  const hasAnswered = Boolean(selectedOption)
  const hasMoreQuestions = currentQuestionIndex < questions.length - 1
  const totalQuestions = Math.max(questions.length || generateTriviaQuestions.length || 0, 1)

  const resetAnswerState = useCallback(() => {
    setSelectedOption("")
    setIsCorrect(null)
  }, [])

 
  const fetchQuestions = useCallback(async (keywordString = DEFAULT_KEYWORDS, lastScore = 0) => {
    setIsLoadingQuestions(true)
    setQuestionError("")
    try {
      const response = await fetch(`${API_BASE_URL}/api/generateTrivia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywordString?.trim().length ? keywordString.trim() : DEFAULT_KEYWORDS,
          lastRoundScore: typeof lastScore === "number" ? lastScore : 0,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error || "Failed to fetch trivia questions"
        throw new Error(message)
      }

      const aiQuestions = await response.json()

      if (!Array.isArray(aiQuestions)) throw new Error("Invalid trivia data received")

      setQuestions(aiQuestions)
      setCurrentQuestionIndex(0)
      resetAnswerState()
      setCorrectCount(0)
    } catch (error) {
      console.error("AI trivia fetch failed", error)
      if (FALLBACK_QUESTIONS.length > 0) {
        setQuestions(FALLBACK_QUESTIONS)
        setCurrentQuestionIndex(0)
        resetAnswerState()
        setCorrectCount(0)
        setQuestionError("Live AI trivia unavailable — using offline deck.")
      } else {
        setQuestionError(error.message ?? "Could not load trivia")
      }
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [resetAnswerState])

  const stopGeneratedAudio = useCallback(() => {
    const instance = generatedAudioRef.current
    if (!instance) return
    try {
      instance.osc.stop()
      instance.ctx.close()
    } catch (error) {
      console.error("Unable to stop generated audio", error)
    }
    generatedAudioRef.current = null
  }, [])

  const startGeneratedAudio = useCallback(() => {
    if (generatedAudioRef.current) return
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = 432
      gain.gain.value = 0.08
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      generatedAudioRef.current = { ctx, osc, gain }
    } catch (error) {
      console.error("Unable to start generated audio", error)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isMuted) {
      audio.pause()
      audio.currentTime = 0
      stopGeneratedAudio()
      return
    }
    if (gameState === GAME_STATES.playing) {
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => {})
      }
      stopGeneratedAudio()
    }
  }, [isMuted, gameState, stopGeneratedAudio])

  useEffect(() => () => {
    stopGeneratedAudio()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [stopGeneratedAudio])


  const handleOptionSelect = (option) => {
    if (!isPlaying || !currentQuestion || hasAnswered || isLoadingQuestions) return
    setSelectedOption(option)
    const answeredCorrectly = option === currentQuestion.answer
    setIsCorrect(answeredCorrectly)
    if (answeredCorrectly) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const endGame = useCallback(
    (message = "Great run! Game over.") => {
      setGameState(GAME_STATES.ended)
      setEndMessage(message)
      resetAnswerState()
      setKeywordInput("")
      try {
        const audio = audioRef.current
        if (audio) audio.pause()
      } catch (e) {
  console.warn("Failed to pause audio:", e);
}
      // stop generated audio if active
      try {
        stopGeneratedAudio()
      } catch (e) {
  console.warn("Failed to pause audio:", e);
}
    },
    [resetAnswerState, stopGeneratedAudio]
  )

  const beginGame = useCallback(async (keywordString) => {
    const lastScoreSnapshot = correctCount
    setGameState(GAME_STATES.playing)
    setEndMessage("")
    setGameRound((prev) => prev + 1)
    setQuestions([])
    setCurrentQuestionIndex(0)
    resetAnswerState()
    await fetchQuestions(keywordString, lastScoreSnapshot)
    // Try to play background audio once the round starts
    try {
      const audio = audioRef.current
      if (audio) {
        const url = audio.src
        try {
          const resp = await fetch(url, { method: "HEAD" })
          if (resp.ok && !isMuted) {
            const p = audio.play()
            if (p && typeof p.then === "function") p.catch(() => {})
            try {
              stopGeneratedAudio()
            } catch (err) {}
          } else if (resp.ok && isMuted) {
            try {
              stopGeneratedAudio()
            } catch (err) {}
          } else {
            try {
              startGeneratedAudio()
            } catch (err) {}
          }
        } catch (err) {
          try {
            startGeneratedAudio()
          } catch (err2) {}
        }
      } else {
        try {
          startGeneratedAudio()
        } catch (err) {}
      }
    } catch (err) {}
  }, [correctCount, fetchQuestions, isMuted, resetAnswerState, startGeneratedAudio, stopGeneratedAudio])

  const handleStart = async (event) => {
    if (isPlaying) return
    if (event) event.preventDefault()

    const sanitized = keywordInput
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0)

    if (sanitized.length === 0) {
      setKeywordError("Enter at least one keyword in the Trivia Menu.")
      return
    }
    if (sanitized.length > 3) {
      setKeywordError("Please limit yourself to 3 keywords.")
      return
    }

    setKeywordError("")
    const keywordString = sanitized.join(", ")
    await beginGame(keywordString)
  }

  const handleNextQuestion = () => {
    if (!hasAnswered) return
    if (hasMoreQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1)
      resetAnswerState()
    } else {
      endGame("Mission complete! You finished every question.")
    }
  }

  const handleManualEndGame = () => {
    endGame("Nice work! You wrapped up this round.")
  }

  const toggleMute = () => {
    setIsMuted((v) => !v)
  }

  const handleTimeExpired = () => {
    if (!isPlaying) return
    endGame("Time's up! Thanks for playing.")
  }

  const startButtonLabel = isPlaying ? "Timer running" : isGameOver ? "Play again" : "Start"

  const shouldShowTrivia = isPlaying && currentQuestion

  const petStageImage = (() => {
    if (correctCount >= 5) return "/lv4.png"
    if (correctCount >= 4) return "/lv3.png"
    if (correctCount >= 3) return "/lv2.png"
    if (correctCount >= 2) return "/egg5.png"
    if (correctCount >= 1) return "/egg3.png"
    return "/egg1.png"
  })()

  const keywordMenu = (
    <div className="keyword-menu">
      <p className="keyword-menu-title">Trivia Menu</p>
      <p className="keyword-subtext">Type 1-3 keywords (comma separated) to set the topic.</p>
      <form className="keyword-inline-form" onSubmit={handleStart}>
        <textarea
          value={keywordInput}
          onChange={(event) => {
            setKeywordInput(event.target.value)
            setKeywordError("")
          }}
          placeholder="e.g., volcanoes, jazz, robots"
          rows={3}
          disabled={isPlaying}
        />
        {keywordError && <p className="keyword-error">{keywordError}</p>}
        <button type="submit" className="keyword-submit" disabled={isPlaying}>
          Lock In Topic
        </button>
      </form>
    </div>
  )

  return (
    <div className="app-shell" style={{ "--pet-bg-image": `url(${petStageImage})` }}>
      <div className="screen-content">
        <div className="hud">
          <ProgressBar score={correctCount} maxScore={totalQuestions} />
          <button
            className="audio-toggle-btn"
            aria-label={isMuted ? "Unmute background music" : "Mute background music"}
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              // Speaker with mute slash
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 9v6h4l5 4V5l-5 4H7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            ) : (
              // Speaker / sound waves
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 9v6h4l5 4V5l-5 4H7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M16.5 8.5c.9.9 1.5 2.2 1.5 3.5s-.6 2.6-1.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <Timer key={gameRound} duration={60} isActive={isPlaying} onComplete={handleTimeExpired} />
        </div>

        <button className="start-button" onClick={handleStart} disabled={isPlaying}>
          {startButtonLabel}
        </button>

      </div>
        <audio ref={audioRef} src="/test.mp3" preload="auto" />


      {shouldShowTrivia ? (
        <TriviaBar
          question={currentQuestion}
          loading={isLoadingQuestions}
          error={questionError}
          onSelectOption={handleOptionSelect}
          selectedOption={selectedOption}
          isCorrect={isCorrect}
          hasAnswered={hasAnswered}
          hasMoreQuestions={hasMoreQuestions}
          onNext={handleNextQuestion}
          onEndGame={handleManualEndGame}
        />
      ) : (
        <div className="trivia-placeholder">
          <p className="placeholder-eyebrow">
            {isGameOver ? "Game over" : isPlaying ? "Preparing trivia" : "Trivia challenge"}
          </p>
          {isGameOver ? (
            <>
              <p className="placeholder-body">{endMessage}</p>
              <p className="placeholder-subtext">Score: {correctCount}/{totalQuestions}</p>
              {keywordMenu}
            </>
          ) : isPlaying ? (
            <>
              <p className="placeholder-body">
                {questionError ? "We hit a glitch fetching your question." : "Summoning your first cosmic question…"}
              </p>
              {questionError && (
                <button className="placeholder-action" onClick={fetchQuestions} disabled={isLoadingQuestions}>
                  {isLoadingQuestions ? "Retrying…" : "Try again"}
                </button>
              )}
            </>
          ) : (
            keywordMenu
          )}
        </div>
      )}
    </div>
  )
}

export default App