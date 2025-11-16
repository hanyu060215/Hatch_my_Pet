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

  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const oscillatorRef = useRef(null)
  const generatedAudioActive = useRef(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.volume = 0.35
    audio.muted = isMuted
    // also reflect mute to generated audio gain if active
    try {
      const g = oscillatorRef.current?.gain
      if (g) g.gain.value = isMuted ? 0 : 0.02
    } catch (e) {}
  }, [isMuted])

  const startGeneratedAudio = () => {
    if (generatedAudioActive.current) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 220
      gain.gain.value = 0.02
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      oscillatorRef.current = { osc, gain }
      generatedAudioActive.current = true
      if (isMuted) gain.gain.value = 0
    } catch (e) {
      // WebAudio not available, ignore
    }
  }

  const stopGeneratedAudio = () => {
    try {
      if (!generatedAudioActive.current) return
      const { osc, gain } = oscillatorRef.current || {}
      if (osc) {
        try { osc.stop() } catch (e) {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close() } catch (e) {}
      }
    } finally {
      oscillatorRef.current = null
      audioContextRef.current = null
      generatedAudioActive.current = false
    }
  }

  /**
   * If you prefer to bundle the audio with the app (instead of placing it in `public/`),
   * you can import it from `src/assets` and use it as the audio src:
   *
   * Example (uncomment and add a file at `src/assets/background.mp3`):
   *
   * // import bg from './assets/background.mp3'
   * // and then set <audio ref={audioRef} src={bg} preload="auto" />
   *
   * Note: importing will make Vite include the audio in the bundle and the path
   * will be handled automatically. If you add the file later, update this file
   * to import it and remove the `/background.mp3` public fallback.
   */

  const fetchQuestions = useCallback(async () => {
    setIsLoadingQuestions(true)
    setQuestionError("")
    try {
      const aiQuestions = Array.isArray(generateTriviaQuestions)
        ? [...generateTriviaQuestions]
        : []
      setQuestions(aiQuestions)
      setCurrentQuestionIndex(0)
      resetAnswerState()
      setCorrectCount(0)
    } catch (error) {
      setQuestionError(error.message ?? "Could not load trivia")
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [resetAnswerState])

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
      try {
        const audio = audioRef.current
        if (audio) audio.pause()
      } catch (e) {}
      // stop generated audio if active
      try { stopGeneratedAudio() } catch (e) {}
    },
    [resetAnswerState]
  )

  const handleStart = async () => {
    if (isPlaying) return
    setGameState(GAME_STATES.playing)
    setEndMessage("")
    setGameRound((prev) => prev + 1)
    setQuestions([])
    setCurrentQuestionIndex(0)
    resetAnswerState()
    setCorrectCount(0)
    fetchQuestions()
    // Try to play background audio (user gesture from Start button)
    try {
      const audio = audioRef.current
      if (audio) {
        const url = audio.src
        // Check if the audio file exists on the server. Use HEAD to avoid downloading the body.
        try {
          const resp = await fetch(url, { method: "HEAD" })
          if (resp.ok && !isMuted) {
            const p = audio.play()
            if (p && typeof p.then === "function") p.catch(() => {})
            try { stopGeneratedAudio() } catch (e) {}
          } else if (resp.ok && isMuted) {
            // file exists but muted: ensure generated audio is stopped
            try { stopGeneratedAudio() } catch (e) {}
          } else {
            // file missing or server returned error -> use generated fallback
            try { startGeneratedAudio() } catch (e) {}
          }
        } catch (e) {
          // network error or CORS -> fallback to generated audio
          try { startGeneratedAudio() } catch (e) {}
        }
      } else {
        try { startGeneratedAudio() } catch (e) {}
      }
    } catch (e) {}
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
        <audio ref={audioRef} src="/background.mp3" preload="auto" />


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
              <p className="placeholder-subtext">Press Play again to launch another round.</p>
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
            <p className="placeholder-body">Tap Start to reveal your first cosmic question.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App